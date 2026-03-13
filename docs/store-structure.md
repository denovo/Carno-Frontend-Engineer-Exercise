# Store Structure

## Folder Layout

```
src/app/core/store/
├── actions/task.actions.ts       — 15 action creators (5 commands + 10 events)
├── effects/task.effects.ts       — loadTasks$, addTask$, moveTask$, updateTask$, removeTask$
├── reducers/task.reducer.ts      — createFeature with EntityAdapter, optimistic moveTask
├── selectors/task.selectors.ts   — selectTasksByColumn (factory), selectCountByPriority, selectCompletionRate
└── index.ts                      — barrel: named export { TaskEffects }
```

## Design Rationale

### `actions/task.actions.ts`

15 action creators following command/event naming. 5 commands — `loadTasks`, `addTask`, `moveTask`, `updateTask`, `removeTask` — paired with 10 event counterparts (`*Success` / `*Failure`). Commands are imperative (trigger an operation); events are past-tense outcomes (something completed or failed). This naming convention makes the Redux DevTools log readable at a glance.

`moveTask` carries three props: `{ taskId, previousColumnId, newColumnId }`. The `previousColumnId` is included at dispatch time — when the UI knows the current state — so the reducer can roll back without any store query in effects.

### `reducers/task.reducer.ts`

`createFeature` auto-generates the feature selector (`selectTasksState`) and per-field selectors (`selectLoading`, `selectError`), removing manual `createFeatureSelector` + `createSelector` boilerplate.

`EntityAdapter` provides normalised O(1) CRUD (`addOne`, `updateOne`, `removeOne`, `setAll`) over a dictionary structure. No hand-written array mutations.

Optimistic `moveTask`: the reducer handles `moveTask` (the command) by applying `taskAdapter.updateOne({ id: taskId, changes: { columnId: newColumnId } })` immediately. `moveTaskSuccess` is a no-op (`on(moveTaskSuccess, (state) => state)`) — the state is already correct. `moveTaskFailure` rolls back using the `previousColumnId` carried in the failure action, again via `taskAdapter.updateOne`. No selector call, no race condition window.

**Key constraint:** `TaskState.error` is `string | null` (non-optional). `createFeature`'s auto-generated `selectError` selector requires the field to exist with an explicit type; optional fields break the generated selector signature.

**Key constraint:** `taskAdapter` is exported separately from `tasksFeature` so `task.selectors.ts` can call `taskAdapter.getSelectors(selectTasksState)` to derive `selectAllTasks`. Bundling it inside the feature would create a circular dependency.

### `selectors/task.selectors.ts`

Factory selector pattern: `selectTasksByColumn` and `selectCompletionRate` return `(param) => createSelector(...)` rather than taking `props<{}>()`. The deprecated NGRX `props` pattern was removed in NGRX 17+; the factory pattern is the current idiomatic replacement. Callers invoke the factory once at field initialisation — the returned selector is memoized and does not recreate on each change-detection cycle.

`selectCompletionRate(doneColumnId)` guards against division-by-zero at the selector level: returns `0` when `tasks.length === 0`. Consumers never need to handle an `undefined` or `NaN` completion rate.

`selectCountByPriority` pre-initialises all four `Priority` keys (`Low`, `Medium`, `High`, `Critical`) to `0`. Consumers receive a complete `Record<Priority, number>` and do not need key-existence guards before rendering.

### `effects/task.effects.ts`

All five effects use `concatMap` (not `switchMap` or `mergeMap`). Mutations must not be cancellable or reorderable: a second `moveTask` dispatched before the first resolves must not cancel the first request. `concatMap` serialises inner observables, preserving request order.

`catchError` is placed inside the inner `concatMap` pipe (not on the outer actions pipe). If `catchError` were on the outer pipe, any single effect error would terminate the entire effect stream and stop it from responding to future actions. Inner placement lets the effect stream survive individual failures.

`inject()` fields (`actions$`, `taskService`) are declared before `createEffect()` fields. Vitest initialises class fields in declaration order; if an `inject()` field is declared after a `createEffect()` that reads it, the field is `undefined` at instantiation (NGRX issue #4708).

### `index.ts`

Named barrel export: `export { TaskEffects } from "./effects/task.effects"`. This prevents `@ngrx/effects` internals from bleeding through to consumers that import from `@app/core/store`. Consumers only see `TaskEffects`.
