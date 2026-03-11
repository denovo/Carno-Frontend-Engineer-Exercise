# Feature Landscape

**Domain:** Task Board Application (Trello-like) -- Senior Angular Engineer Exercise
**Researched:** 2026-03-11
**Confidence:** HIGH (exercise spec is explicit; domain is well-understood)

## Context

This is NOT a product launch. This is a technical exercise with a 2-hour estimate. Every feature must justify itself by demonstrating Angular competence, not by making a competitive product. The employer's spec defines 5 evaluation areas: state management, signals, dynamic rendering, architecture, and code quality. Features are evaluated through that lens.

---

## Table Stakes

Features the spec explicitly requires or that the demo falls flat without. Missing any of these means a failed submission.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Board with 3+ columns** (Todo, In Progress, Done) | Spec requirement; minimum viable board structure | Low | Single board only. Column model needs `id`, `name`, `order` |
| **Task CRUD** (create, read, update, delete) | Spec requirement; exercises full NGRX action lifecycle | Medium | Each operation needs an action pair (request/success/failure). Dialog or inline form for create/edit |
| **Move task between columns via select box** | Spec explicitly approves this over drag-and-drop | Low | Select box in TaskCardComponent. Triggers `moveTask` action |
| **Optimistic update with rollback on moveTask** | Spec requirement; core state management pattern being assessed | High | Must show: immediate UI update, mock API delay, rollback on failure. This is the centerpiece NGRX demonstration |
| **TypeScript interfaces** (Board, Column, Task) | Spec requirement; type safety is an evaluation criterion | Low | Task needs: id, title, description?, columnId, priority (4 tiers), assignee?, createdAt, updatedAt |
| **Priority tiers** (4 levels minimum) | Spec requirement on Task model | Low | Use union type: `'critical' \| 'high' \| 'medium' \| 'low'`. Enum is also acceptable but union is more idiomatic modern TS |
| **NGRX store** (actions, reducer, selectors, effects) | Core evaluation area | High | Actions: loadTasks, addTask, moveTask, updateTask, removeTask (each with success/failure variants) |
| **Parameterised selector** (tasks by column) | Spec requirement | Medium | Factory selector pattern: `selectTasksByColumn(columnId)`. Demonstrate memoisation |
| **Priority count breakdown selector** | Spec requirement | Low | Selector composing from task entities, grouping by priority |
| **Completion rate selector** | Spec requirement | Low | `(tasks in final column / total tasks) * 100`. Needs to know which column is "final" |
| **At least one effect with error handling** | Spec requirement | Medium | loadTasks effect is the natural choice. Show `catchError` with error action dispatch |
| **Mock service with RxJS delay** | Spec requirement; simulates network latency | Low | Service returns `of(data).pipe(delay(500))`. Add configurable failure rate for rollback demos |
| **TaskCardComponent with input signals** | Spec requirement; signals evaluation area | Medium | `input<Task>()` signal. Display title, description, priority badge, assignee, dates |
| **Computed signals** (CSS class, formatted dates, overdue) | Spec requirement | Medium | `computed(() => priorityClass(this.task()))`, `computed(() => formatDate(this.task().createdAt))`, `computed(() => isOverdue(this.task()))` |
| **Local UI state via signals** | Spec requirement | Low | `isExpanded = signal(false)`, `isEditing = signal(false)`. Toggle expansion, inline edit mode |
| **NGRX-to-signal bridge** (toSignal) | Spec requirement | Low | `toSignal(this.store.select(selector))` in smart components |
| **DynamicWidgetOutletDirective** | Spec requirement; dynamic rendering evaluation area | High | Structural directive using ViewContainerRef. Accept single or array config. Handle inputs (static, Observable, Signal), outputs, lifecycle cleanup |
| **Widget configuration interface** | Spec requirement | Medium | Generic interface: `WidgetConfig<T>` with component type, inputs map, output handlers map |
| **TaskCountWidget** | Spec requirement | Low | Displays count + status colour derived from store state |
| **ProgressWidget** | Spec requirement | Medium | Visual progress bar. Completion percentage from selector. Status colour thresholds |
| **Widget state from store via computed signals** | Spec requirement | Medium | Widgets consume store data through computed signals, not direct subscriptions |
| **README with architecture decisions** | Spec deliverable | Low | Setup instructions, architecture rationale, scalability section, AI usage disclosure |
| **Store structure documentation** | Spec deliverable | Low | Folder organization explanation |

---

## Differentiators

Not required by spec, but demonstrate senior-level thinking. These are what separate a "meets requirements" submission from an "impressive" one.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Unit tests for selectors and effects** | Spec lists as bonus. Proves you understand testability. Selectors are pure functions -- easy to test well | Medium | Vitest. Test selector memoisation, effect error paths, rollback logic. High ROI for demonstrating quality |
| **Component tests for DynamicWidgetOutletDirective** | Spec lists as bonus. This is the hardest component to test -- doing it shows mastery | High | Test: single/array configs, input binding (static/Observable/Signal), output forwarding, cleanup on destroy |
| **Storybook stories for TaskCard and widgets** | Visual documentation of components in isolation | Medium | Shows component API thinking. Useful for interview walkthrough |
| **Command vs Event action pattern** | Spec bonus. Shows NGRX action hygiene awareness | Low | Commands: `[Task Page] Add Task`. Events: `[Tasks API] Add Task Success`. Source-tagged actions |
| **Custom memoisation for complex selectors** | Spec bonus. Shows deep NGRX understanding | Medium | Custom `createSelector` with object comparison for the priority breakdown selector |
| **Smart/dumb component separation** | Spec mentions in architecture section | Low | Container components (BoardComponent, ColumnComponent) dispatch actions. Presentational components (TaskCardComponent, widgets) receive data via inputs |
| **Configurable mock failure rate** | Demonstrates thoughtful testing of error paths | Low | `MockTaskService` with `failureRate` param. Makes optimistic update rollback easy to demo |
| **Loading and error states in UI** | Shows production thinking beyond happy path | Low | Loading spinner during initial load. Error toast/banner on failed operations. Rollback visual feedback |
| **takeUntilDestroyed / DestroyRef cleanup** | Spec mentions in architecture section. Shows memory management awareness | Low | Use in any component with manual subscriptions. Modern Angular pattern |
| **Undo notification on task delete** | Shows UX awareness within state management context | Medium | Snackbar with "Undo" action after deleteTask. Demonstrates another optimistic pattern |
| **E2E test for critical path** | Playwright test: create task, move between columns, verify state | Medium | Proves the app actually works end-to-end. CI integration |
| **Scalability section in README** | Spec explicitly asks for this | Low | Address: multiple boards, WebSocket updates, undo/redo, offline support. Architecture-level answers, not implementations |
| **Entity adapter for task state** | Shows awareness of NGRX entity patterns | Low | `@ngrx/entity` for normalised task storage. Built-in CRUD operations on entities. Reduces boilerplate |

---

## Anti-Features

Features to explicitly NOT build. Each wastes time that should go toward demonstrating the 5 evaluation areas.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Drag and drop** | Spec explicitly says select box is fine. DnD adds complexity (CDK DragDrop, reorder logic) without demonstrating NGRX/signals competence | Select box for column assignment. Mention DnD as a scalability consideration in README |
| **Multiple boards** | Out of scope per project plan. Adds routing, board CRUD, board switching -- none of which is evaluated | Single board. Mention multi-board architecture in README scalability section |
| **Authentication / user management** | Spec says not required. Zero evaluation value | Hardcode a mock user for assignee field if needed |
| **Real backend / API** | Spec says mock is fine. Building a backend burns time on non-evaluated work | RxJS-based mock service with configurable delay and failure |
| **Rich styling / CSS polish** | Spec says basic styling is fine, not assessing design | Angular Material defaults. Minimal custom CSS only where it clarifies UX (priority colours, progress bar) |
| **Real-time collaboration** | Architecture note only per project plan | Mention WebSocket pattern in README scalability section |
| **Offline support / PWA** | Not evaluated. Complex to implement properly | Mention in README as scalability consideration |
| **Rich text editor for task descriptions** | UI complexity with no state management value | Plain textarea for description |
| **Task search / filtering** | Tempting but not in spec. Time better spent on required selectors | Could mention as a future selector composition example |
| **Due dates with date picker** | Overdue calculation needs a date, but a full date picker UX is overkill | Use `createdAt` timestamp for overdue computed signal. Set a hardcoded "due date" in mock data if needed |
| **Task comments / activity log** | Product feature, not architectural demonstration | Skip entirely |
| **Board settings / column customization** | Not evaluated. Columns are static for this exercise | Hardcode columns in mock data |
| **Notifications system** | Product feature, not relevant to evaluation criteria | Skip. Use Angular Material snackbar for error feedback only |
| **Animations / transitions** | Polish work that doesn't demonstrate any evaluated skill | Skip unless trivially added via Angular Material |

---

## Feature Dependencies

```
Board/Column/Task interfaces
  --> NGRX store (actions, reducer, selectors)
    --> Effects (requires mock service)
    --> Optimistic update + rollback (requires moveTask action + effect)
    --> Parameterised selector (requires reducer with entity state)
    --> Priority breakdown selector (requires task entities)
    --> Completion rate selector (requires task entities + column ordering)
  --> TaskCardComponent
    --> Input signals (requires Task interface)
    --> Computed signals (requires input signal)
    --> Local UI state signals (independent)
    --> NGRX-to-signal bridge (requires store + selectors)
  --> DynamicWidgetOutletDirective (independent of store, needs component configs)
    --> Widget configuration interface
    --> TaskCountWidget (requires priority breakdown selector)
    --> ProgressWidget (requires completion rate selector)
    --> Widget state via computed signals (requires store selectors + toSignal bridge)
  --> Mock service (required by effects, independent otherwise)
```

### Critical Path

1. **Data models** (Board, Column, Task interfaces) -- everything depends on these
2. **NGRX store** (actions, reducer, selectors) -- UI components depend on store
3. **Mock service** -- effects depend on this
4. **Effects with error handling** -- optimistic update depends on this
5. **TaskCardComponent with signals** -- the primary UI surface
6. **DynamicWidgetOutletDirective** -- independent track, can be built in parallel with #5
7. **Widgets** (TaskCount, Progress) -- depend on directive + selectors

### Parallel Tracks

After data models and store are in place, two tracks can proceed independently:
- **Track A:** TaskCardComponent + column UI + board layout
- **Track B:** DynamicWidgetOutletDirective + widget system

---

## MVP Recommendation

### Must Ship (exercise fails without these)

1. All **table stakes** features -- these ARE the spec requirements
2. At minimum: interfaces, full NGRX store, TaskCardComponent with signals, DynamicWidgetOutletDirective, both widgets, mock service, optimistic update with rollback

### Should Ship (separates good from great)

1. **Unit tests for selectors and effects** -- highest ROI bonus item. Selectors are pure functions, easy to test well, and the spec calls them out as bonus
2. **Command vs event action naming** -- zero extra implementation time, just naming discipline
3. **Smart/dumb component separation** -- architecture win, spec mentions it
4. **Loading and error states** -- shows production thinking
5. **Entity adapter** -- reduces boilerplate, shows NGRX ecosystem knowledge

### Nice to Have (if time permits)

1. **Storybook stories** -- visual documentation
2. **E2E test** -- proves it works
3. **Component tests for directive** -- impressive but time-consuming

### Defer (not for this submission)

- Drag and drop, multiple boards, auth, rich styling, search, real-time -- all anti-features for this context

---

## NGRX Store Features (Detailed)

These are the core state management features the exercise evaluates.

| Store Feature | Purpose | Pattern | Complexity |
|---------------|---------|---------|------------|
| `loadTasks` action pair | Initial data fetch | Pessimistic (wait for API) | Low |
| `addTask` action pair | Task creation | Pessimistic or optimistic | Medium |
| `moveTask` action pair | Column transfer | **Optimistic with rollback** -- the showcase | High |
| `updateTask` action pair | Edit task details | Pessimistic | Low |
| `removeTask` action pair | Delete task | Pessimistic (or optimistic with undo) | Low |
| `selectTasksByColumn(id)` | Filter tasks for column | Factory/parameterised selector | Medium |
| `selectPriorityBreakdown` | Count by priority | Composed selector | Low |
| `selectCompletionRate` | % in final column | Composed selector | Low |
| `loadTasks$` effect | API call with error handling | `switchMap` + `catchError` | Medium |
| `moveTask$` effect | Optimistic update orchestration | Store previous state, call API, rollback on error | High |

### Optimistic Update Flow (moveTask)

This is the most important feature to get right. The flow:

1. Dispatch `moveTask({ taskId, fromColumnId, toColumnId })`
2. Reducer immediately updates task's columnId (optimistic)
3. Effect calls mock service
4. **Success:** Dispatch `moveTaskSuccess` (no-op in reducer, state already correct)
5. **Failure:** Dispatch `moveTaskFailure({ taskId, fromColumnId })` -- reducer reverts columnId

The reducer needs to handle the rollback case. Store the previous columnId either in the action payload or in a separate state slice.

---

## Signal Pattern Features (Detailed)

| Signal Feature | Where Used | Pattern | Notes |
|----------------|-----------|---------|-------|
| `input<Task>()` | TaskCardComponent | Input signal | Replaces `@Input()` decorator |
| `computed(() => priorityClass(...))` | TaskCardComponent | Computed signal | Derives CSS class from priority value |
| `computed(() => formatDate(...))` | TaskCardComponent | Computed signal | Display-formatted timestamps |
| `computed(() => isOverdue(...))` | TaskCardComponent | Computed signal | Boolean flag for visual indicator |
| `signal(false)` for `isExpanded` | TaskCardComponent | Writable signal | Local UI toggle state |
| `signal(false)` for `isEditing` | TaskCardComponent | Writable signal | Local UI mode state |
| `toSignal(store.select(...))` | Smart components | NGRX-signal bridge | Converts Observable selector to signal |
| `computed(() => deriveWidgetState(...))` | Widget components | Computed from store signal | Chain: store selector -> toSignal -> computed |

---

## Dynamic Rendering Features (Detailed)

| Feature | Purpose | Complexity | Notes |
|---------|---------|------------|-------|
| `DynamicWidgetOutletDirective` | Structural directive for dynamic component instantiation | High | Uses `ViewContainerRef.createComponent()` |
| `WidgetConfig<T>` interface | Type-safe component configuration | Medium | Generic over component type. Fields: `component`, `inputs`, `outputs` |
| Static input binding | Pass plain values to dynamic components | Low | `componentRef.setInput(key, value)` |
| Observable input binding | Pass Observable streams to dynamic components | Medium | Subscribe, update input on emission, unsubscribe on destroy |
| Signal input binding | Pass signals to dynamic components | Medium | Use `effect()` to watch signal changes and update inputs |
| Output forwarding | Connect dynamic component outputs to handler functions | Medium | Subscribe to `componentRef.instance[outputName]` EventEmitter |
| Lifecycle cleanup | Destroy components and subscriptions | Medium | `ngOnDestroy` or `DestroyRef` to clean up all refs |
| Array config support | Render multiple dynamic components | Low | Iterate configs, create multiple component refs |

---

## Widget System Features (Detailed)

| Feature | Purpose | Pattern | Notes |
|---------|---------|---------|-------|
| `WidgetStatus<T>` interface | Generic status container | TypeScript generics | `{ value: T, status: 'success' \| 'warning' \| 'error' \| 'neutral', icon?: string, tooltip?: string }` |
| `TaskCountWidget` | Display task count with status colour | Presentational component | Status derived from count thresholds or priority distribution |
| `ProgressWidget` | Visual progress bar | Presentational component | Percentage from completion rate selector. Colour from thresholds (e.g., <25% = error, <75% = warning, >=75% = success) |
| Store-derived widget state | Reactive widget data | `computed()` from `toSignal()` | Widget inputs are computed signals that react to store changes |

---

## Sources

- Employer's exercise specification (README.md in repository) -- PRIMARY source for all requirements
- Project plan (.planning/PROJECT.md) -- scope decisions and constraints
- Domain knowledge of Trello, Jira, Linear, and task board patterns
- Angular signals API, NGRX patterns (training data -- MEDIUM confidence for API details, verify during implementation)

**Note:** WebSearch was unavailable during this research session. Feature landscape is driven primarily by the explicit exercise spec, which is highly detailed and leaves little ambiguity about what to build. Confidence remains HIGH because the spec itself is the authoritative source for this exercise.
