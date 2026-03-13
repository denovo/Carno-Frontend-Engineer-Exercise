# Interview Talking Points

Structured by the exercise evaluation criteria. These are specific, reference-backed points — not generic statements about Angular or NGRX.

---

## 1. State Management

**EntityAdapter — normalised store, O(1) CRUD**
The store uses `createEntityAdapter<Task>` with an id selector and a `createdAt`-based sort comparer. Tasks live in a dictionary (`entities: Record<string, Task>`) rather than an array. `addOne`, `updateOne`, `removeOne`, and `setAll` are O(1) or O(n) where unavoidable — no hand-written array mutations, no risk of accidentally mutating in place.

**Optimistic `moveTask` — rollback without a selector call in effects**
`moveTask` is dispatched with `{ taskId, previousColumnId, newColumnId }`. The `previousColumnId` is captured at dispatch time, when the component knows the current column. The reducer applies the update immediately on `moveTask`; the effect runs asynchronously. On failure, the reducer handles `moveTaskFailure({ taskId, previousColumnId })` and reverts using `taskAdapter.updateOne({ id: taskId, changes: { columnId: previousColumnId } })`. The effect never queries the store for the previous column. If it did, there would be a read-after-write window: between the optimistic write and the effect's store query, another action could have changed the task's column, and the rollback would use stale data. Carrying `previousColumnId` in the payload eliminates that window entirely.

**`concatMap` vs `switchMap` for mutations**
All five effects use `concatMap`. `switchMap` cancels the in-flight inner observable when a new action arrives — correct for search (only the latest query matters) but wrong for mutations (a second move request cannot silently cancel the first). `mergeMap` would allow concurrent requests, risking out-of-order responses. `concatMap` serialises: each mutation completes before the next begins. The trade-off is latency under rapid input — acceptable for a task board.

**`catchError` placement — effect stream survival**
`catchError` is inside the inner `concatMap` pipe, not on the outer `actions$.pipe(...)`. If it were on the outer pipe, the first unhandled error would complete the outer observable and the effect would stop reacting to all future actions permanently. Inner placement means each individual request can fail in isolation; the outer stream continues.

---

## 2. Signals Usage

**`input()` signals on `TaskCardComponent`**
`task` is declared as `input.required<Task>()` — an Angular 17+ signal input. The component receives a signal, not a plain value. Downstream `computed()` properties chain off it automatically without `ngOnChanges`.

**Computed signal chain**
`task()` feeds three computed signals:
- `priorityClass()` — derives a CSS class string from `task().priority` for template binding
- `formattedDate()` — formats `task().createdAt` for display
- `isOverdue()` — compares `task().createdAt` age against `OVERDUE_THRESHOLD_DAYS`

When the parent updates the `task` input (e.g., after a store event), all three derived values recompute lazily and the template updates in one pass.

**`store.selectSignal()` bridge at `BoardPageComponent`**
`BoardPageComponent` converts NGRX observable selectors to Angular signals using `store.selectSignal(selector)`. Smart components hold all store wiring; dumb components (`ColumnComponent`, `TaskCardComponent`) receive plain signal inputs. No `async` pipes, no manual `subscribe` calls in the component tree below `BoardPageComponent`.

**`signal()` not `model()` for `isExpanded` / `isEditMode`**
`model()` is Angular's two-way binding primitive — it exposes a writable signal to the parent and generates an `EventEmitter` for the `[(binding)]` syntax. `isExpanded` and `isEditMode` are local UI state with no parent binding. Using `model()` would be semantically wrong and would generate an unnecessary output event. `signal()` is the correct primitive for self-contained component state.

---

## 3. Dynamic Component Rendering

**`ViewContainerRef.createComponent()` + `ComponentRef.setInput()`**
`DynamicWidgetOutletDirective` uses `ViewContainerRef.createComponent(type)` to instantiate each widget component at runtime. Inputs are passed via `ComponentRef.setInput(name, value)`, which is the post-Angular-14 typed API — no need to cast `componentRef.instance` and set properties directly.

**Observable inputs — internal subscription + `setInput()`**
When a widget config input is an `Observable`, the directive subscribes internally and calls `setInput(name, value)` on each emission. The subscription is tracked via `takeUntilDestroyed()` for cleanup.

**Signal inputs — `effect()` wrapped in `untracked()`**
When a widget config input is an Angular signal, the directive creates an `effect(() => setInput(name, signalRef()))` to push updates. The `effect()` is wrapped in `untracked()` — Angular 21 raises `NG0602` if a new `effect()` is created inside an existing reactive context (e.g., another effect). `untracked()` breaks that reactive dependency and prevents the error.

**Lifecycle cleanup**
`DestroyRef` + `takeUntilDestroyed()` tears down all subscriptions when the directive is destroyed. Each rendered `ComponentRef` is explicitly destroyed via `componentRef.destroy()` to avoid memory leaks.

---

## 4. Architecture

**Smart/dumb component split**
`BoardPageComponent` (smart): all store selectors, all dispatch calls, all signal bridges. `ColumnComponent` and `TaskCardComponent` (dumb): receive typed signal inputs, emit output events, have zero knowledge of the store. Dumb components are testable in complete isolation from NGRX.

**`core/` / `features/board/` / `shared/` layout**
- `core/` — singleton services (`TaskMockService`) and state (`store/`). Imported once by `AppModule`-equivalent providers.
- `features/board/` — the board feature: `BoardPageComponent`, `ColumnComponent`, `TaskCardComponent`, dialogs. Feature-specific, lazy-loaded.
- `shared/` — `DynamicWidgetOutletDirective` and widget models. Reusable, store-independent. Importable by any feature.

**Factory selectors over the deprecated `props` pattern**
`selectTasksByColumn` is declared as `(columnId: string) => createSelector(selectAllTasks, ...)`. In `BoardPageComponent`, the factory is called once per column at field initialisation, storing the returned selector: `tasksByColumn = Object.fromEntries(COLUMNS.map(col => [col.id, store.selectSignal(selectTasksByColumn(col.id))]))`. Calling `createSelector` inside a template expression or `computed()` would recreate the selector on every change-detection pass, defeating memoization.

---

## 5. Code Quality

**Discriminated union with `_exhaustiveCheck`**
`TaskAction` in `task.models.ts` is a discriminated union with a compile-time exhaustiveness guard: the `switch` statement's default branch assigns the action to a `never`-typed variable. Adding a new action variant without handling it in the switch is a TypeScript compile error, not a silent runtime bug.

**`export type` for interfaces**
All model interfaces use `export type` (e.g., `export type Task = {...}`). This is required for `isolatedModules` (TypeScript error TS1205): the compiler needs explicit confirmation that the export is type-only so it can be erased at emit without resolving the module graph.

**`inject()` field ordering**
`actions$` and `taskService` are declared before any `createEffect()` field in `TaskEffects`. Vitest initialises class fields top-to-bottom; if a `createEffect()` executes before the `inject()` fields it references are initialised, those fields are `undefined`. This is NGRX issue #4708, and the fix is declaration order, not a workaround.

**`provideStoreDevtools({ maxAge: 25, autoPause: true })`**
`maxAge: 25` limits the Redux DevTools history to 25 actions, preventing the in-memory action log from growing unbounded in long sessions. `autoPause: true` suspends DevTools processing when the browser panel is closed — the app does not pay the serialisation cost when DevTools is not being used.
