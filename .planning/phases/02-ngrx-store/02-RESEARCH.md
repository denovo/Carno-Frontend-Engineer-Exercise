# Phase 2: NGRX Store - Research

**Researched:** 2026-03-11
**Domain:** NGRX 21 (store, entity, effects), Angular 21 standalone DI, optimistic update with rollback, factory selectors, Vitest testing patterns
**Confidence:** HIGH (core NGRX APIs verified from official docs and authoritative secondary sources; Vitest/NGRX compatibility issue verified from the NGRX issue tracker)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| NGR-01 | Action `loadTasks` — load tasks for a board | Covered: `createAction` + `props<{ boardId: string }>()` pattern; command/event naming |
| NGR-02 | Action `addTask` — add a new task | Covered: `createAction` + `props<{ task: Task }>()` pattern |
| NGR-03 | Action `moveTask` — move task between columns (optimistic update) | Covered: optimistic pattern — action carries `previousColumnId` for rollback |
| NGR-04 | Action `updateTask` — update task details | Covered: `createAction` + `props<{ update: Update<Task> }>()` using NGRX entity `Update<T>` type |
| NGR-05 | Action `removeTask` — remove a task | Covered: `createAction` + `props<{ taskId: string }>()` |
| NGR-06 | Parameterized selector `selectTasksByColumn(columnId)` | Covered: factory selector pattern (NOT deprecated props-based selector) |
| NGR-07 | Selector `selectCountByPriority` returning count breakdown by priority | Covered: `createSelector` + `adapter.getSelectors().selectAll` projection |
| NGR-08 | Selector `selectCompletionRate` calculating % in final column | Covered: `createSelector` composing selectAll + board columns |
| NGR-09 | Optimistic update for `moveTask` — immediate state update, rollback on server error | Covered: reducer updates `columnId` immediately; `moveTaskFailure` carries `previousColumnId` for revert |
| NGR-10 | Rollback stores previous `columnId` in action payload for reducer revert | Covered: `moveTask` action carries `previousColumnId`; `moveTaskFailure` re-dispatches that value back to reducer |
| NGR-11 | Entity adapter (`@ngrx/entity`) for normalised task storage | Covered: `createEntityAdapter<Task>`, `EntityState<Task>`, adapter CRUD methods |
| NGR-12 | At least one effect with proper error handling (`catchError` + failure action) | Covered: `createEffect` + `concatMap` + `catchError(() => of(moveTaskFailure(...)))` inside the pipe |
| NGR-13 | Command vs event action naming (`moveTask` → `moveTaskSuccess` / `moveTaskFailure`) | Covered: canonical NGRX naming convention documented |
| NGR-14 | Local mock service with RxJS `delay()` and configurable failure | Covered: `@Injectable` service returning `Observable<void>` using `of(undefined).pipe(delay(...))` or `throwError(...)` |
</phase_requirements>

---

## Summary

NGRX 21 (version 21.0.1, matching Angular 21) uses the same mature creator-function API that has been stable since NGRX 8. The `createAction` / `createReducer` / `on()` / `createSelector` / `createEffect` surface area has not changed in years. What HAS changed — and is relevant to this phase — is the Angular 21 standalone DI model: the store is wired via `provideStore()`, `provideEffects()`, and `provideStoreDevtools()` in `app.config.ts`, not via `StoreModule.forRoot()`.

The optimistic update pattern for `moveTask` is clean and well-established: the `moveTask` action payload includes `previousColumnId` so the reducer can immediately update `columnId`, and if `moveTaskFailure` is dispatched, the reducer reverts `columnId` back to `previousColumnId`. No separate undo library is needed; the `@ngrx/entity` adapter's `updateOne` handles both directions.

There is one confirmed compatibility issue to design around: `provideMockActions` does not work reliably with Vitest when `inject(Actions)` is declared *after* the `createEffect()` field in an effect class. The fix is deterministic: always declare injected dependencies before effect definitions. For effect testing, the non-TestBed approach (instantiating effects manually with `ActionsSubject`) is also a clean alternative that avoids the issue entirely and is preferred by authoritative sources.

**Primary recommendation:** Use `createFeature` for the tasks feature state. It produces the feature reducer, feature key, and auto-generated property selectors from a single declaration. Layer `createSelector` calls on top for derived selectors (`selectTasksByColumn`, `selectCountByPriority`, `selectCompletionRate`). Wire everything into `app.config.ts` using `provideStore`, `provideEffects`, and `provideStoreDevtools`.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@ngrx/store` | 21.0.1 | Core store, actions, reducers, selectors | Already installed in Phase 1 |
| `@ngrx/effects` | 21.0.1 | Side effects (API calls, optimistic logic) | Already installed in Phase 1 |
| `@ngrx/entity` | 21.0.1 | Entity adapter for normalised task collection | Already installed in Phase 1 |
| `@ngrx/store-devtools` | 21.0.1 | Redux DevTools integration | Already installed in Phase 1 |
| `rxjs` | ~7.8.0 | Operators: `delay`, `switchMap`, `concatMap`, `catchError`, `of`, `throwError` | Already present; Angular dependency |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@angular/core` `inject()` | 21.2.0 | DI for effects without constructor injection | Use in effect classes — declare injected tokens before `createEffect()` fields |
| `vitest` (via `@angular/build`) | 4.0.8 | Unit testing reducers, selectors, effects | Angular CLI native; no separate config needed |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `createFeature` | `createFeatureSelector` + manual selectors | `createFeature` eliminates boilerplate for property selectors; prefer it |
| Factory selectors (`selectTasksByColumn = (id) => createSelector(...)`) | Old `props`-based selectors (`createSelector(..., props)`) | Props-based selectors are deprecated since NGRX 11. Use factory selectors. |
| Class-based effects | Functional effects (`{ functional: true }`) | Both are valid in NGRX 21. Class-based is more common in tutorials and slightly easier to test with `provideMockActions`; use class-based for this project |
| `concatMap` in moveTask effect | `switchMap` | For mutations (move, add, update, remove), use `concatMap` — it queues requests and prevents race conditions. `switchMap` is correct only for cancellable reads. |

**Installation:** All packages are already installed from Phase 1. No new installs needed for Phase 2.

---

## Architecture Patterns

### Recommended Store Structure

```
src/app/core/
  store/
    actions/
      task.actions.ts         # All task action creators
    reducers/
      task.reducer.ts         # createFeature with EntityAdapter
    selectors/
      task.selectors.ts       # Derived selectors (column filter, counts, rate)
    effects/
      task.effects.ts         # createEffect with concatMap + catchError
    index.ts                  # Barrel: re-exports all store symbols

  services/
    task-mock.service.ts      # @Injectable mock with RxJS delay + configurable failure
    task-mock.service.spec.ts # Basic tests confirming delay and failure paths
```

### Pattern 1: Action Naming — Command / Event Convention (NGR-13)

**What:** Commands are verb-noun camelCase (what to do). Events are verb-noun + Success/Failure (what happened).
**When to use:** Always. This naming makes the Redux DevTools timeline readable.

```typescript
// Source: NGRX official docs + requirements NGR-13

// Commands (dispatched by components or other effects)
loadTasks         // NGR-01: triggers board load
addTask           // NGR-02: create new task
moveTask          // NGR-03: move between columns (optimistic)
updateTask        // NGR-04: edit task fields
removeTask        // NGR-05: delete task

// Events (dispatched by effects after API response)
loadTasksSuccess
loadTasksFailure
addTaskSuccess
addTaskFailure
moveTaskSuccess
moveTaskFailure   // carries previousColumnId for rollback
updateTaskSuccess
updateTaskFailure
removeTaskSuccess
removeTaskFailure
```

### Pattern 2: Actions File

```typescript
// src/app/core/store/actions/task.actions.ts
import { createAction, props } from "@ngrx/store";
import { Update } from "@ngrx/entity";
import { Task } from "@app/shared/models";

export const loadTasks = createAction(
  "[Board Page] Load Tasks",
  props<{ boardId: string }>()
);

export const loadTasksSuccess = createAction(
  "[Task API] Load Tasks Success",
  props<{ tasks: Task[] }>()
);

export const loadTasksFailure = createAction(
  "[Task API] Load Tasks Failure",
  props<{ error: string }>()
);

export const addTask = createAction(
  "[Task Form] Add Task",
  props<{ task: Omit<Task, "id" | "createdAt" | "updatedAt"> }>()
);

export const addTaskSuccess = createAction(
  "[Task API] Add Task Success",
  props<{ task: Task }>()
);

export const addTaskFailure = createAction(
  "[Task API] Add Task Failure",
  props<{ error: string }>()
);

// moveTask carries previousColumnId for optimistic rollback (NGR-10)
export const moveTask = createAction(
  "[Task Card] Move Task",
  props<{ taskId: string; previousColumnId: string; newColumnId: string }>()
);

export const moveTaskSuccess = createAction(
  "[Task API] Move Task Success",
  props<{ taskId: string }>()
);

export const moveTaskFailure = createAction(
  "[Task API] Move Task Failure",
  props<{ taskId: string; previousColumnId: string; error: string }>()
);

export const updateTask = createAction(
  "[Task Form] Update Task",
  props<{ update: Update<Task> }>()
);

export const updateTaskSuccess = createAction(
  "[Task API] Update Task Success",
  props<{ update: Update<Task> }>()
);

export const updateTaskFailure = createAction(
  "[Task API] Update Task Failure",
  props<{ error: string }>()
);

export const removeTask = createAction(
  "[Task Card] Remove Task",
  props<{ taskId: string }>()
);

export const removeTaskSuccess = createAction(
  "[Task API] Remove Task Success",
  props<{ taskId: string }>()
);

export const removeTaskFailure = createAction(
  "[Task API] Remove Task Failure",
  props<{ error: string }>()
);
```

**Source:** NGRX official patterns + requirements NGR-01 through NGR-05, NGR-10, NGR-13

### Pattern 3: Reducer with createFeature + EntityAdapter (NGR-11)

**What:** `createFeature` wraps the entity adapter state and generates property selectors automatically. The `on()` handlers use adapter methods instead of spread-and-map.
**Why:** Eliminates ~30 lines of boilerplate selector definitions. The feature key ties the state to the Redux DevTools slice name.

```typescript
// src/app/core/store/reducers/task.reducer.ts
import { createEntityAdapter, EntityAdapter, EntityState } from "@ngrx/entity";
import { createFeature, createReducer, on } from "@ngrx/store";
import { Task } from "@app/shared/models";
import * as TaskActions from "../actions/task.actions";

export interface TaskState extends EntityState<Task> {
  loading: boolean;
  error: string | null;
}

export const taskAdapter: EntityAdapter<Task> = createEntityAdapter<Task>({
  selectId: (task: Task) => task.id,
  // Optional: sortComparer to keep tasks in creation order
  sortComparer: (a: Task, b: Task) =>
    a.createdAt.getTime() - b.createdAt.getTime(),
});

export const initialState: TaskState = taskAdapter.getInitialState({
  loading: false,
  error: null,
});

export const tasksFeature = createFeature({
  name: "tasks",
  reducer: createReducer(
    initialState,

    on(TaskActions.loadTasks, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),

    on(TaskActions.loadTasksSuccess, (state, { tasks }) =>
      taskAdapter.setAll(tasks, { ...state, loading: false })
    ),

    on(TaskActions.loadTasksFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),

    on(TaskActions.addTaskSuccess, (state, { task }) =>
      taskAdapter.addOne(task, state)
    ),

    // Optimistic move: update columnId immediately (NGR-09)
    on(TaskActions.moveTask, (state, { taskId, newColumnId }) =>
      taskAdapter.updateOne(
        { id: taskId, changes: { columnId: newColumnId } },
        state
      )
    ),

    // Rollback: revert to previousColumnId on failure (NGR-10)
    on(TaskActions.moveTaskFailure, (state, { taskId, previousColumnId }) =>
      taskAdapter.updateOne(
        { id: taskId, changes: { columnId: previousColumnId } },
        state
      )
    ),

    on(TaskActions.updateTaskSuccess, (state, { update }) =>
      taskAdapter.updateOne(update, state)
    ),

    on(TaskActions.removeTaskSuccess, (state, { taskId }) =>
      taskAdapter.removeOne(taskId, state)
    )
  ),
});

export const {
  name: tasksFeatureKey,
  reducer: tasksReducer,
  selectTasksState,
  selectIds,
  selectEntities,
  selectLoading,
  selectError,
} = tasksFeature;
```

**Note:** `createFeature` auto-generates `selectLoading`, `selectError`, `selectTasksState` (the feature root selector). Entity-specific selectors (`selectAll`, `selectEntities`) come from `adapter.getSelectors()` and are layered in `task.selectors.ts`.

### Pattern 4: Derived Selectors (NGR-06, NGR-07, NGR-08)

```typescript
// src/app/core/store/selectors/task.selectors.ts
import { createSelector } from "@ngrx/store";
import { Priority } from "@app/shared/models";
import { taskAdapter, selectTasksState } from "../reducers/task.reducer";

// Entity adapter selectors — use the feature root selector
const { selectAll: selectAllTasks, selectEntities: selectTaskEntities } =
  taskAdapter.getSelectors(selectTasksState);

export { selectAllTasks };

// NGR-06: Factory selector — returns a new memoized selector per columnId.
// NOTE: each invocation creates a new selector instance (memoization per-instance,
// not global). This is acceptable for column-scoped rendering.
export const selectTasksByColumn = (columnId: string) =>
  createSelector(selectAllTasks, (tasks) =>
    tasks.filter((task) => task.columnId === columnId)
  );

// NGR-07: selectCountByPriority — returns { LOW: n, MEDIUM: n, HIGH: n, CRITICAL: n }
export const selectCountByPriority = createSelector(selectAllTasks, (tasks) => {
  const counts: Record<Priority, number> = {
    [Priority.Low]: 0,
    [Priority.Medium]: 0,
    [Priority.High]: 0,
    [Priority.Critical]: 0,
  };
  for (const task of tasks) {
    counts[task.priority]++;
  }
  return counts;
});

// NGR-08: selectCompletionRate — % of tasks in the final column.
// Requires knowing which columnId is "Done". Two approaches:
//
// Option A (RECOMMENDED): Store the "doneColumnId" as a constant in a
//   board-seed file (e.g., DONE_COLUMN_ID = 'col-done'). This is clean
//   because the board is static in v1. Use a hardcoded constant.
//
// Option B: Add a `doneColumnId` field to the store state and derive from it.
//   Overkill for a single-board v1 app.
//
// Use Option A. Define DONE_COLUMN_ID in core/constants.ts (alongside
// OVERDUE_THRESHOLD_DAYS). Then:
export const selectCompletionRate = (doneColumnId: string) =>
  createSelector(selectAllTasks, (tasks) => {
    if (tasks.length === 0) return 0;
    const done = tasks.filter((t) => t.columnId === doneColumnId).length;
    return Math.round((done / tasks.length) * 100);
  });
```

**Important design decision for selectCompletionRate:** Since the board is static in v1, the `doneColumnId` is a known constant. Making it a factory selector (taking `doneColumnId` as a parameter) keeps the selector pure and testable. The planner should decide whether to add `DONE_COLUMN_ID` to `core/constants.ts` or derive it from board state — see Open Questions.

### Pattern 5: Effect with Optimistic Update and Error Handling (NGR-12)

**Critical rule:** `catchError` MUST be inside the `concatMap` pipe (not after it). If placed after `concatMap`, a single error terminates the entire effect stream permanently.

```typescript
// src/app/core/store/effects/task.effects.ts
import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { concatMap, map, catchError } from "rxjs/operators";
import { of } from "rxjs";
import { TaskMockService } from "@app/core/services/task-mock.service";
import * as TaskActions from "../actions/task.actions";

@Injectable()
export class TaskEffects {
  // CRITICAL FOR VITEST: declare inject() fields BEFORE createEffect() fields
  // See: https://github.com/ngrx/platform/issues/4708
  private readonly actions$ = inject(Actions);
  private readonly taskService = inject(TaskMockService);

  moveTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.moveTask),
      concatMap(({ taskId, previousColumnId, newColumnId }) =>
        this.taskService.moveTask(taskId, newColumnId).pipe(
          map(() => TaskActions.moveTaskSuccess({ taskId })),
          catchError((err: unknown) =>
            of(
              TaskActions.moveTaskFailure({
                taskId,
                previousColumnId,
                error: err instanceof Error ? err.message : "Move failed",
              })
            )
          )
        )
      )
    )
  );

  loadTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.loadTasks),
      concatMap(({ boardId }) =>
        this.taskService.loadTasks(boardId).pipe(
          map((tasks) => TaskActions.loadTasksSuccess({ tasks })),
          catchError((err: unknown) =>
            of(
              TaskActions.loadTasksFailure({
                error: err instanceof Error ? err.message : "Load failed",
              })
            )
          )
        )
      )
    )
  );
}
```

### Pattern 6: Mock Service with RxJS delay (NGR-14)

```typescript
// src/app/core/services/task-mock.service.ts
import { Injectable } from "@angular/core";
import { Observable, of, throwError } from "rxjs";
import { delay } from "rxjs/operators";
import { Task } from "@app/shared/models";
import { MOCK_BOARD } from "./mock-data";

@Injectable({ providedIn: "root" })
export class TaskMockService {
  /** Set to true in tests to simulate server failure */
  shouldFail = false;

  /** Simulated network latency in ms */
  private readonly latencyMs = 400;

  loadTasks(boardId: string): Observable<Task[]> {
    if (this.shouldFail) {
      return throwError(() => new Error("Server error")).pipe(
        delay(this.latencyMs)
      );
    }
    return of(MOCK_BOARD.tasks).pipe(delay(this.latencyMs));
  }

  moveTask(taskId: string, newColumnId: string): Observable<void> {
    if (this.shouldFail) {
      return throwError(() => new Error("Move failed")).pipe(
        delay(this.latencyMs)
      );
    }
    return of(undefined).pipe(delay(this.latencyMs));
  }

  addTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Observable<Task> {
    if (this.shouldFail) {
      return throwError(() => new Error("Add failed")).pipe(
        delay(this.latencyMs)
      );
    }
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return of(newTask).pipe(delay(this.latencyMs));
  }

  updateTask(update: { id: string; changes: Partial<Task> }): Observable<void> {
    if (this.shouldFail) {
      return throwError(() => new Error("Update failed")).pipe(
        delay(this.latencyMs)
      );
    }
    return of(undefined).pipe(delay(this.latencyMs));
  }

  removeTask(taskId: string): Observable<void> {
    if (this.shouldFail) {
      return throwError(() => new Error("Remove failed")).pipe(
        delay(this.latencyMs)
      );
    }
    return of(undefined).pipe(delay(this.latencyMs));
  }
}
```

**Note on mock data file:** Create `src/app/core/services/mock-data.ts` with a `MOCK_BOARD` constant containing seed Board, Column[], and Task[] data. This seed data must use the 3-column layout (Todo/In Progress/Done) and supply 4-6 tasks across priorities for meaningful selector tests.

### Pattern 7: app.config.ts Store Wiring

```typescript
// src/app/app.config.ts (update from Phase 1)
import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideStore } from "@ngrx/store";
import { provideEffects } from "@ngrx/effects";
import { provideStoreDevtools } from "@ngrx/store-devtools";
import { routes } from "./app.routes";
import { tasksReducer, tasksFeatureKey } from "@app/core/store/reducers/task.reducer";
import { TaskEffects } from "@app/core/store/effects/task.effects";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideStore({ [tasksFeatureKey]: tasksReducer }),
    provideEffects([TaskEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
    }),
  ],
};
```

### Pattern 8: Testing Reducers (Pure Function Tests)

Reducers require NO TestBed — they are pure functions. Call with state and action, assert output.

```typescript
// src/app/core/store/reducers/task.reducer.spec.ts
import { describe, it, expect } from "vitest";
import { tasksFeature, initialState, taskAdapter } from "./task.reducer";
import * as TaskActions from "../actions/task.actions";
import { Priority, Task } from "@app/shared/models";

const { reducer } = tasksFeature;

const mockTask: Task = {
  id: "task-1",
  title: "Test Task",
  columnId: "col-todo",
  priority: Priority.Medium,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

describe("tasksReducer", () => {
  it("should return initial state for unknown action", () => {
    const state = reducer(undefined, { type: "@@INIT" } as any);
    expect(state).toEqual(initialState);
  });

  it("moveTask updates columnId optimistically", () => {
    const stateWithTask = taskAdapter.addOne(mockTask, initialState);
    const action = TaskActions.moveTask({
      taskId: "task-1",
      previousColumnId: "col-todo",
      newColumnId: "col-in-progress",
    });
    const newState = reducer(stateWithTask, action);
    expect(newState.entities["task-1"]?.columnId).toBe("col-in-progress");
  });

  it("moveTaskFailure rolls back to previousColumnId", () => {
    const stateWithTask = taskAdapter.addOne(
      { ...mockTask, columnId: "col-in-progress" },
      initialState
    );
    const action = TaskActions.moveTaskFailure({
      taskId: "task-1",
      previousColumnId: "col-todo",
      error: "Server error",
    });
    const newState = reducer(stateWithTask, action);
    expect(newState.entities["task-1"]?.columnId).toBe("col-todo");
  });
});
```

### Pattern 9: Testing Selectors (Projector Method)

Selectors with logic are tested via `.projector()` — no need to build full store state.

```typescript
// src/app/core/store/selectors/task.selectors.spec.ts
import { describe, it, expect } from "vitest";
import { selectTasksByColumn, selectCountByPriority, selectCompletionRate } from "./task.selectors";
import { Priority, Task } from "@app/shared/models";

const tasks: Task[] = [
  { id: "1", title: "T1", columnId: "col-todo", priority: Priority.High, createdAt: new Date(), updatedAt: new Date() },
  { id: "2", title: "T2", columnId: "col-todo", priority: Priority.Medium, createdAt: new Date(), updatedAt: new Date() },
  { id: "3", title: "T3", columnId: "col-done", priority: Priority.High, createdAt: new Date(), updatedAt: new Date() },
];

describe("selectTasksByColumn", () => {
  it("filters tasks by columnId", () => {
    const selector = selectTasksByColumn("col-todo");
    const result = selector.projector(tasks);
    expect(result).toHaveLength(2);
    expect(result.every((t) => t.columnId === "col-todo")).toBe(true);
  });
});

describe("selectCountByPriority", () => {
  it("counts tasks per priority", () => {
    const result = selectCountByPriority.projector(tasks);
    expect(result[Priority.High]).toBe(2);
    expect(result[Priority.Medium]).toBe(1);
    expect(result[Priority.Low]).toBe(0);
  });
});

describe("selectCompletionRate", () => {
  it("returns percentage of tasks in done column", () => {
    const selector = selectCompletionRate("col-done");
    const result = selector.projector(tasks);
    expect(result).toBe(33); // 1 of 3 = 33%
  });

  it("returns 0 when no tasks", () => {
    const selector = selectCompletionRate("col-done");
    const result = selector.projector([]);
    expect(result).toBe(0);
  });
});
```

### Pattern 10: Testing Effects (Vitest-Safe Approach)

Use `ActionsSubject` directly to avoid the `provideMockActions` Vitest issue.

```typescript
// src/app/core/store/effects/task.effects.spec.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Actions } from "@ngrx/effects";
import { provideMockActions } from "@ngrx/effects/testing";
import { ReplaySubject } from "rxjs";
import { TaskEffects } from "./task.effects";
import { TaskMockService } from "@app/core/services/task-mock.service";
import * as TaskActions from "../actions/task.actions";

describe("TaskEffects", () => {
  let effects: TaskEffects;
  let actions$: ReplaySubject<any>;
  let taskService: TaskMockService;

  beforeEach(() => {
    actions$ = new ReplaySubject(1);
    taskService = new TaskMockService();

    TestBed.configureTestingModule({
      providers: [
        TaskEffects,
        provideMockActions(() => actions$),
        { provide: TaskMockService, useValue: taskService },
      ],
    });

    effects = TestBed.inject(TaskEffects);
  });

  it("moveTask$ dispatches moveTaskFailure when service fails", async () => {
    taskService.shouldFail = true;
    actions$.next(
      TaskActions.moveTask({
        taskId: "task-1",
        previousColumnId: "col-todo",
        newColumnId: "col-done",
      })
    );

    // Use firstValueFrom to avoid subscribe callback testing anti-pattern
    const { firstValueFrom } = await import("rxjs");
    const result = await firstValueFrom(effects.moveTask$);
    expect(result.type).toBe(TaskActions.moveTaskFailure.type);
    expect((result as any).previousColumnId).toBe("col-todo");
  });
});
```

**Note on `delay` in tests:** The mock service's `latencyMs = 400` will make effect tests slow. For effect testing, either: (a) set `latencyMs = 0` in the test via `taskService.latencyMs = 0`, or (b) expose a `latencyMs` constructor parameter defaulting to 0. Prefer approach (b) for cleaner test/production separation.

### Anti-Patterns to Avoid

- **`catchError` after `concatMap` (not inside it):** The entire effect stream dies on first error. Always place `catchError` inside the inner `pipe()`.
- **`switchMap` for mutation effects:** `moveTask` / `addTask` / `updateTask` / `removeTask` must use `concatMap`. Only use `switchMap` for reads where the latest value wins (e.g., search typeahead).
- **`inject(Actions)` declared after `createEffect()`:** Causes circular DI in Vitest. Always declare injected dependencies as the first class fields.
- **`props`-based parameterized selectors:** Deprecated since NGRX 11. Use factory functions (`const sel = (id: string) => createSelector(...)`).
- **Storing derived state in the store:** `selectTasksByColumn` should be a selector, not a store property. Keep the store minimal — only the `Task[]` collection (via EntityState), `loading`, and `error`.
- **`Date` objects in `initialState` stubs:** When building test state, use `new Date()` — not ISO strings. `createdAt` and `updatedAt` are `Date` types per Phase 1 MDL-03.
- **`NgModule` registration for store:** This is a standalone Angular 21 app. Never use `StoreModule.forRoot()` or `EffectsModule.forRoot()`. Use `provideStore()` and `provideEffects()` in `app.config.ts`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Normalised entity storage | `Record<string, Task>` with manual CRUD | `@ngrx/entity` `EntityAdapter` | adapter handles `ids[]` + `entities` dict; `updateOne`, `removeOne`, `setAll` are O(1) and battle-tested |
| Update type for partial entity changes | `{ id: string; patch: Partial<Task> }` custom interface | `Update<Task>` from `@ngrx/entity` | `Update<T>` is the standard interface; required by `adapter.updateOne()` |
| Selector for all tasks | `Object.values(state.entities)` in components | `adapter.getSelectors(featureSelector).selectAll` | Handles undefined entities, empty states correctly |
| Optimistic rollback tracking | Custom undo stack | Store `previousColumnId` in the `moveTask` action payload | Simple, zero extra state, fully typed |
| Mock network latency | Custom timer/interval | `rxjs/operators delay()` on an `of()` observable | One-liner; well-tested; test-overridable |

**Key insight:** `@ngrx/entity` and `createFeature` together eliminate ~100 lines of boilerplate that is easy to get wrong (off-by-one in ID arrays, selector memoization, feature key typos). Resist the urge to write a simple `switch` reducer when the entity adapter is already installed.

---

## Common Pitfalls

### Pitfall 1: catchError Outside the Inner Pipe

**What goes wrong:** Placing `catchError` after the flattening operator (e.g., after `concatMap` at the outer pipe level) causes the effect observable to complete on the first error. All subsequent actions are silently ignored.

**Why it happens:** It looks natural to chain operators, but `catchError` at the outer level replaces the entire action stream with the error observable.

**How to avoid:** Place `catchError` inside the function passed to `concatMap` (the inner `pipe`):
```typescript
concatMap(action =>
  this.service.doSomething(action).pipe(    // ← inner pipe
    map(result => successAction({ result })),
    catchError(err => of(failureAction({ err })))  // ← MUST be here
  )
)
```

**Warning signs:** Effect works for the first failure but never fires again afterward.

### Pitfall 2: inject() Declaration Order in Effect Classes (Vitest)

**What goes wrong:** NGRX issue #4708 — in a Vitest environment, if `inject(Actions)` is declared AFTER a `createEffect()` field, the effect cannot read the actions stream. Tests fail with "Cannot read properties of undefined (reading 'pipe')" or circular DI errors.

**Why it happens:** Vitest's class field initialization order differs subtly from standard Angular TestBed. `createEffect()` executes during instantiation and accesses `this.actions$`, which is `undefined` if not yet initialized.

**How to avoid:** Always declare all `inject()` fields at the TOP of the effect class, before any `createEffect()` definitions:
```typescript
@Injectable()
export class TaskEffects {
  private readonly actions$ = inject(Actions);    // FIRST
  private readonly taskService = inject(TaskMockService);  // SECOND

  moveTask$ = createEffect(() => this.actions$.pipe(...));  // AFTER
}
```

**Warning signs:** Tests pass in isolation but fail when run together, or "circular dependency in DI" errors appear only in Vitest.

### Pitfall 3: switchMap for Mutation Effects

**What goes wrong:** Using `switchMap` for `moveTask`, `addTask`, or `removeTask` causes rapid consecutive actions to cancel in-flight requests. A user clicking "move" twice quickly will have the first move silently cancelled.

**Why it happens:** `switchMap` cancels the previous inner observable when a new action arrives. This is the desired behavior for "cancel stale search" but wrong for mutations.

**How to avoid:** Use `concatMap` for all mutation effects. Use `switchMap` only for read/query effects where the latest request is all that matters.

| Operator | When to Use |
|----------|-------------|
| `concatMap` | Mutations (move, add, update, remove) — queues, preserves all |
| `switchMap` | Search, autocomplete — only latest matters |
| `exhaustMap` | Login, submit form — ignore rapid repeats during in-flight |
| `mergeMap` | Independent parallel operations |

### Pitfall 4: selectCompletionRate Requires "Done" Column Identity

**What goes wrong:** `selectCompletionRate` needs to know which column is the "final" column (Done). If this is hardcoded in the selector file as a magic string, it is untestable and brittle.

**Why it happens:** Single-board v1 apps tempt inline constant definitions.

**How to avoid:** Add `DONE_COLUMN_ID = 'col-done'` to `src/app/core/constants.ts` (alongside `OVERDUE_THRESHOLD_DAYS`). The mock data seed must use matching IDs. The selector becomes a factory `selectCompletionRate(DONE_COLUMN_ID)` — discoverable and testable.

**Warning signs:** Selector tests use a different column ID than the mock data, causing the completion rate to always be 0%.

### Pitfall 5: Mock Service delay() Makes Effect Tests Slow

**What goes wrong:** `TaskMockService` with `latencyMs = 400` causes effect tests to take 400ms+ each. A suite of 10 tests takes 4+ seconds.

**Why it happens:** `delay()` uses real wall-clock time in tests unless the test uses fake timers.

**How to avoid:** Make `latencyMs` configurable — default to `0` in test instances:
```typescript
@Injectable({ providedIn: "root" })
export class TaskMockService {
  latencyMs = 400;  // Tests set this to 0
  shouldFail = false;
}
// In test: taskService.latencyMs = 0;
```

Alternatively, Vitest supports `vi.useFakeTimers()` to advance time programmatically, but the `latencyMs = 0` approach is simpler and does not require fake timer management.

### Pitfall 6: `createFeature` Cannot Have Optional State Properties

**What goes wrong:** If `TaskState` has optional properties (`error?: string | null`), `createFeature` will throw a TypeScript error at compile time.

**Why it happens:** `createFeature`'s auto-generated selectors rely on all state keys being present and non-optional.

**How to avoid:** Use `error: string | null` (not `error?: string`). All `TaskState` properties must be defined with explicit types (including `null` unions), not marked optional.

---

## Code Examples

All examples are in the Architecture Patterns section above. Key references:
- Pattern 2 — Actions file (all 15 actions)
- Pattern 3 — createFeature with EntityAdapter (full reducer)
- Pattern 4 — selectTasksByColumn, selectCountByPriority, selectCompletionRate
- Pattern 5 — Effects with concatMap + catchError
- Pattern 6 — Mock service with delay + configurable failure
- Pattern 7 — app.config.ts store wiring
- Pattern 8 — Reducer unit tests (pure function, no TestBed)
- Pattern 9 — Selector tests (projector method)
- Pattern 10 — Effect tests (Vitest-safe with ActionsSubject)

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `StoreModule.forRoot()` in NgModule | `provideStore()` in `app.config.ts` | NGRX 14+ / Angular standalone | No NgModules needed; DI is functional |
| `EffectsModule.forRoot()` | `provideEffects()` in `app.config.ts` | NGRX 14+ | Same as above |
| `@Effect()` decorator | `createEffect()` function | NGRX 8 | Decorator removed from NGRX 15+; use function |
| `createFeatureSelector` + manual child selectors | `createFeature` auto-generates them | NGRX 12.1 | ~30 lines of boilerplate eliminated |
| Selector `props` (e.g., `createSelector(..., props<{id}>())`) | Factory functions (`(id) => createSelector(...)`) | NGRX 11 (deprecated) | Props-based selectors are deprecated |
| Class-based effects with constructor DI | `inject()` in class fields | Angular 14+ / NGRX 16+ | Cleaner, no constructor boilerplate; ordering matters for Vitest |
| `switchMap` for all effects | `concatMap` for mutations, `switchMap` for reads | Best practice (always) | Race-condition prevention for mutations |

**Deprecated/outdated (do not use in Phase 2):**
- `@Effect()` decorator — removed from NGRX 15+
- `StoreModule.forRoot()` / `EffectsModule.forRoot()` — NgModule pattern, not standalone
- `createSelector` with `props` parameter — deprecated since NGRX 11
- `switchMap` for mutation effects — causes silent request cancellation

---

## Open Questions

1. **Should `selectCompletionRate` take `doneColumnId` as a parameter, or use a stored constant?**
   - What we know: The mock board has a fixed "Done" column. Single-board v1 app.
   - What's unclear: Whether to add `DONE_COLUMN_ID` to `core/constants.ts` or store `doneColumnId` in the NGRX state.
   - Recommendation: Add `DONE_COLUMN_ID = 'col-done'` to `core/constants.ts`. This is consistent with `OVERDUE_THRESHOLD_DAYS` and avoids store bloat. The planner should confirm this choice.

2. **Should `addTask`, `updateTask`, and `removeTask` also have full effects (with mock service calls), or are they reducer-only for Phase 2?**
   - What we know: NGR-12 requires "at least one effect with proper error handling." The `moveTask` effect covers this.
   - What's unclear: Whether to build full async effects for all 5 actions in Phase 2 or only `loadTasks` and `moveTask`.
   - Recommendation: Build effects for `loadTasks` and `moveTask` in Phase 2 (demonstrating the pattern twice). The remaining 3 can be direct reducer-only in Phase 2 and upgraded to effects in Phase 3 when the UI calls them. This keeps Phase 2 scope focused.

3. **Should mock data seed be in a separate `mock-data.ts` file or inline in the service?**
   - What we know: The mock service needs Board, Column[], and Task[] data for `loadTasks`.
   - Recommendation: Separate `mock-data.ts` file. This keeps the service file focused and allows the board seed to be imported in tests independently.

4. **Does `provideStoreDevtools` need `isDevMode()` guard in Phase 2?**
   - Recommendation: Yes. Wrap with `isDevMode()` to match Angular/NGRX best practices from day one. This is a one-liner: `provideStoreDevtools({ logOnly: !isDevMode() })`.

---

## Validation Architecture

> `workflow.nyquist_validation` is `true` in `.planning/config.json` — this section is required.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Angular CLI native Vitest (`@angular/build:unit-test`) — `@angular/build@21.2.1` |
| Config file | `angular.json` (no separate `vitest.config.ts`) |
| Quick run command | `npm test` (runs `ng test --watch=false`) |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NGR-01 | `loadTasks` action dispatches; reducer sets `loading: true` | unit (reducer) | `npm test` | ❌ Wave 0 — create `task.reducer.spec.ts` |
| NGR-02 | `addTaskSuccess` reducer adds task to entity collection | unit (reducer) | `npm test` | ❌ Wave 0 |
| NGR-03 | `moveTask` reducer updates `columnId` immediately | unit (reducer) | `npm test` | ❌ Wave 0 |
| NGR-04 | `updateTaskSuccess` reducer updates task fields | unit (reducer) | `npm test` | ❌ Wave 0 |
| NGR-05 | `removeTaskSuccess` reducer removes task from collection | unit (reducer) | `npm test` | ❌ Wave 0 |
| NGR-06 | `selectTasksByColumn('col-todo').projector(tasks)` returns only todo tasks | unit (selector) | `npm test` | ❌ Wave 0 — create `task.selectors.spec.ts` |
| NGR-07 | `selectCountByPriority.projector(tasks)` returns correct counts per priority | unit (selector) | `npm test` | ❌ Wave 0 |
| NGR-08 | `selectCompletionRate('col-done').projector(tasks)` returns correct % | unit (selector) | `npm test` | ❌ Wave 0 |
| NGR-09 | `moveTask` reducer updates columnId before effect resolves | unit (reducer) | `npm test` | ❌ Wave 0 (same test as NGR-03) |
| NGR-10 | `moveTaskFailure` reducer reverts `columnId` to `previousColumnId` | unit (reducer) | `npm test` | ❌ Wave 0 |
| NGR-11 | Entity adapter `selectAll` returns tasks array; `addOne`/`removeOne` work | unit (reducer) | `npm test` | ❌ Wave 0 |
| NGR-12 | `moveTask$` effect dispatches `moveTaskFailure` when service fails | unit (effect) | `npm test` | ❌ Wave 0 — create `task.effects.spec.ts` |
| NGR-13 | Action type strings follow `[Source] Verb Noun` convention | Manual review | N/A | ❌ Code review during plan |
| NGR-14 | Mock service returns observable with ~400ms delay; `shouldFail=true` returns error | unit (service) | `npm test` | ❌ Wave 0 — create `task-mock.service.spec.ts` |

### Sampling Rate

- **Per task commit:** `npm test` (full suite should be < 10 seconds with `latencyMs = 0` in tests)
- **Per wave merge:** `npm test && npx tsc --noEmit`
- **Phase gate:** All unit tests green; TypeScript compiles; `ng serve` starts without console errors

### Wave 0 Gaps

- [ ] `src/app/core/store/actions/task.actions.ts` — all 15 actions (NGR-01 through NGR-05, NGR-13)
- [ ] `src/app/core/store/reducers/task.reducer.ts` — createFeature + entity adapter (NGR-09, NGR-10, NGR-11)
- [ ] `src/app/core/store/reducers/task.reducer.spec.ts` — reducer pure function tests (NGR-01 through NGR-05, NGR-09, NGR-10, NGR-11)
- [ ] `src/app/core/store/selectors/task.selectors.ts` — factory selectors (NGR-06, NGR-07, NGR-08)
- [ ] `src/app/core/store/selectors/task.selectors.spec.ts` — projector tests (NGR-06, NGR-07, NGR-08)
- [ ] `src/app/core/store/effects/task.effects.ts` — loadTasks$ + moveTask$ effects (NGR-12)
- [ ] `src/app/core/store/effects/task.effects.spec.ts` — effect failure path test (NGR-12)
- [ ] `src/app/core/services/task-mock.service.ts` — delay + configurable failure (NGR-14)
- [ ] `src/app/core/services/task-mock.service.spec.ts` — service unit tests (NGR-14)
- [ ] `src/app/core/services/mock-data.ts` — Board/Column/Task seed data
- [ ] `src/app/core/store/index.ts` — updated barrel re-exporting all store symbols
- [ ] `src/app/core/constants.ts` — add `DONE_COLUMN_ID` constant
- [ ] `src/app/app.config.ts` — add `provideStore`, `provideEffects`, `provideStoreDevtools`

---

## Sources

### Primary (HIGH confidence)

- [ngrx/platform GitHub — actions-and-reducers DeepWiki](https://deepwiki.com/ngrx/platform/2.1-actions-and-reducers) — `createAction`, `props`, `createReducer`, `on()` API verified
- [Angular University — NgRx Entity Complete Guide](https://blog.angular-university.io/ngrx-entity/) — `createEntityAdapter`, `EntityState`, `getInitialState`, `getSelectors`, adapter CRUD methods, `Update<T>` type
- [timdeschryver.dev — NgRx Creator Functions 101](https://timdeschryver.dev/blog/ngrx-creator-functions-101) — `createAction`, `createReducer`, `createEffect` patterns
- [timdeschryver.dev — Testing an NgRx Project](https://timdeschryver.dev/blog/testing-an-ngrx-project) — reducer pure function testing, selector projector testing, effect testing without TestBed
- [timdeschryver.dev — Parameterized NgRx Selectors](https://timdeschryver.dev/blog/parameterized-selectors) — factory selector pattern (deprecation of props-based approach)
- [ngrx/platform GitHub Issue #4708](https://github.com/ngrx/platform/issues/4708) — `provideMockActions` + Vitest incompatibility with `inject()` field ordering; workaround confirmed
- [NGRX official — NgRx 16 functional effects announcement](https://dev.to/ngrx/announcing-ngrx-v16-integration-with-angular-signals-functional-effects-standalone-schematics-and-more-5gk6) — `provideStore`, `provideEffects` standalone API
- [Codigotipado — NgRx Effects Comprehensive Guide](https://www.codigotipado.com/p/ngrx-effects-a-comprehensive-guide) — functional effects with `inject()`, `concatMap`, `catchError` inside inner pipe

### Secondary (MEDIUM confidence)

- [monsterlessons-academy — createFeature NgRx](https://monsterlessons-academy.com/posts/create-feature-ngrx-it-changes-everything) — `createFeature` API and auto-generated selectors
- [NGRX RFC #2980 — Deprecate Selectors With Props](https://github.com/ngrx/platform/issues/2980) — confirms props-based selectors deprecated in NGRX 11
- [medium.com/@saranipeiris17 — Error Handling in NgRx Effects](https://medium.com/@saranipeiris17/error-handling-in-ngrx-effects-0d93bf9e92c8) — `catchError` placement requirement
- [javascript.plainenglish.io — NgRx Store Setup Angular 18](https://javascript.plainenglish.io/how-to-set-up-ngrx-store-in-angular-18-for-scalable-state-management-136e49c2f6f0) — `provideStore`/`provideEffects`/`provideStoreDevtools` in `app.config.ts`

### Tertiary (LOW confidence — verify on implementation)

- `selectCompletionRate` implementation as factory selector vs. using stored `doneColumnId` — architectural choice not yet validated against Phase 3 Signal requirements (SIG-07 may influence)
- Effect testing approach for `loadTasks$` with fake timers vs `latencyMs = 0` — both are valid; verify which is cleaner with the actual test files

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all NGRX versions installed in Phase 1; API surface verified from multiple authoritative sources
- Architecture patterns: HIGH — createAction/createReducer/createEffect/createFeature are stable APIs unchanged since NGRX 8-12
- Optimistic update pattern: HIGH — well-established pattern with multiple sources; `previousColumnId` in payload is canonical
- Vitest/NGRX compatibility: HIGH — issue #4708 is documented and the workaround is deterministic (field ordering)
- `selectCompletionRate` design: MEDIUM — two valid options; requires planner decision
- Effect scope (which effects to build): MEDIUM — recommendation is `loadTasks` + `moveTask` only; other effects are straightforward to add later

**Research date:** 2026-03-11
**Valid until:** 2026-04-11 (NGRX 21 is stable; no breaking changes expected)
