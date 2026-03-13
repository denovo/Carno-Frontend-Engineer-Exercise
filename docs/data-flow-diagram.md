# Data Flow Diagrams

Two sequence diagrams for the most interview-relevant flows in the codebase.

---

## 1. `moveTask` — Optimistic Update with Rollback

This flow is the most architecturally interesting in the codebase. It illustrates optimistic state management, effect coordination, and rollback — three patterns that require careful sequencing to avoid race conditions.

**Why the reducer handles `moveTask` synchronously**

The reducer applies the column change immediately when `moveTask` is dispatched — before the API call completes. This means the user sees the task move with zero latency. The effect runs asynchronously afterward as an eventual-consistency check, not as the primary state writer.

**The `previousColumnId` design**

`moveTask` carries `{ taskId, previousColumnId, newColumnId }`. The `previousColumnId` is captured at dispatch time, when the component knows the current state of the task. On `moveTaskFailure`, the reducer uses it to revert: `taskAdapter.updateOne({ id: taskId, changes: { columnId: previousColumnId } })`. The effect never queries the store for the old column. If it did, there would be a read-after-write window: between the optimistic write and the effect's store query, a concurrent action could have changed the task's column, and the rollback would use stale data. The payload approach eliminates that window.

**The `moveTaskSuccess` no-op**

The reducer handles `moveTaskSuccess` with `on(moveTaskSuccess, (state) => state)` — it returns the state unchanged. The optimistic state is already correct. The event exists to signal "the server confirmed" for DevTools inspection, audit logging, or analytics without requiring any state change.

**Test seam**

The URL parameter `?failNextMove=1` sets `TaskMockService.shouldFail = true` directly. No DI override is needed because the service is `providedIn: 'root'` — the same singleton instance is shared between the app and the Playwright test's page context. The E2E rollback test uses this seam to trigger a controlled failure.

```mermaid
sequenceDiagram
    participant U as User (select box)
    participant C as BoardPageComponent
    participant S as NgRx Store
    participant R as task.reducer
    participant E as TaskEffects
    participant M as TaskMockService

    U->>C: column select change
    C->>S: dispatch moveTask({ taskId, newColumnId, previousColumnId })
    S->>R: moveTask action
    R-->>S: state update (task.columnId = newColumnId) IMMEDIATELY
    S-->>C: selectSignal() emits — task moves visually
    S->>E: moveTask$ effect picks up action
    E->>M: moveTask(taskId, newColumnId)
    alt success
        M-->>E: Observable completes
        E->>S: dispatch moveTaskSuccess({ taskId })
        Note over R: no-op (state already correct)
    else failure
        M-->>E: throwError()
        E->>S: dispatch moveTaskFailure({ taskId, previousColumnId })
        S->>R: moveTaskFailure action
        R-->>S: state rollback (task.columnId = previousColumnId)
        S-->>C: selectSignal() emits — task moves back
    end
```

---

## 2. `addTask` — Straightforward Effect (No Optimistic Update)

`addTask` does not use optimistic state because the server assigns `id`, `createdAt`, and `updatedAt`. The client cannot construct a valid `Task` without those fields, so the reducer waits for `addTaskSuccess` before adding the task to the entity store.

This is the contrast case: when the client lacks the data needed to construct the full entity, pessimistic (server-authoritative) state is the correct approach.

```mermaid
sequenceDiagram
    participant U as User (task form)
    participant C as BoardPageComponent
    participant S as NgRx Store
    participant R as task.reducer
    participant E as TaskEffects
    participant M as TaskMockService

    U->>C: submit task form
    C->>S: dispatch addTask({ task: Omit<Task, id|createdAt|updatedAt> })
    S->>E: addTask$ effect picks up action
    E->>M: addTask(partialTask)
    alt success
        M-->>E: full Task (with id and timestamps)
        E->>S: dispatch addTaskSuccess({ task })
        S->>R: addTaskSuccess action
        R-->>S: taskAdapter.addOne(task, state)
        S-->>C: selectSignal() emits — task appears in column
    else failure
        M-->>E: throwError()
        E->>S: dispatch addTaskFailure({ error })
        S->>R: addTaskFailure action
        R-->>S: state.error = error string
    end
```
