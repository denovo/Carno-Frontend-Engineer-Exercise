# Requirements: Petello

**Defined:** 2026-03-11
**Core Value:** A well-architected codebase that demonstrates production-grade Angular patterns — the interviewer must be able to walk through every line and understand the reasoning behind it.

## v1 Requirements

### Data Models

- [ ] **MDL-01**: TypeScript interface `Board` with id, name, and columns collection
- [ ] **MDL-02**: TypeScript interface `Column` with id, name, and order
- [ ] **MDL-03**: TypeScript interface `Task` with id, title, optional description, columnId, priority, optional assignee, createdAt, updatedAt
- [ ] **MDL-04**: Priority represented as TypeScript enum or union type with 4 tiers (Low, Medium, High, Critical)
- [ ] **MDL-05**: Discriminated union types for strongly-typed action variants

### NGRX State Management

- [ ] **NGR-01**: Action `loadTasks` — load tasks for a board
- [ ] **NGR-02**: Action `addTask` — add a new task
- [ ] **NGR-03**: Action `moveTask` — move task between columns (optimistic update)
- [ ] **NGR-04**: Action `updateTask` — update task details
- [ ] **NGR-05**: Action `removeTask` — remove a task
- [ ] **NGR-06**: Parameterised/factory selector `selectTasksByColumn(columnId)` returning tasks filtered by column
- [ ] **NGR-07**: Selector `selectCountByPriority` returning count breakdown grouped by priority
- [ ] **NGR-08**: Selector `selectCompletionRate` calculating % of tasks in final column
- [ ] **NGR-09**: Optimistic update for `moveTask` — state updates immediately, rolls back if server fails
- [ ] **NGR-10**: Rollback strategy stores previous columnId in action payload for reducer revert
- [ ] **NGR-11**: Entity adapter (`@ngrx/entity`) for normalised task storage
- [ ] **NGR-12**: At least one effect with proper error handling (using `catchError` + failure action dispatch)
- [ ] **NGR-13**: Command vs event action naming pattern (e.g., `moveTask` command → `moveTaskSuccess` / `moveTaskFailure` events)
- [ ] **NGR-14**: Local mock service simulating server responses with RxJS `delay()` and configurable failure

### Signals Integration

- [ ] **SIG-01**: `TaskCardComponent` uses `input()` signal API for receiving task data
- [ ] **SIG-02**: Computed signal for priority CSS class derived from task priority
- [ ] **SIG-03**: Computed signal for formatted date display
- [ ] **SIG-04**: Computed signal for overdue indicator (based on task age or due date)
- [ ] **SIG-05**: Local UI state managed with signals — expansion state, edit mode
- [ ] **SIG-06**: `model()` two-way binding for edit mode in TaskCard
- [ ] **SIG-07**: NGRX selector bridged to Angular signal via `store.selectSignal()` or `toSignal()` in smart components
- [ ] **SIG-08**: Smart components pass signal values down to presentational components via `input()` signals

### Dynamic Component Rendering

- [ ] **DYN-01**: `DynamicWidgetOutletDirective` structural directive using `ViewContainerRef`
- [ ] **DYN-02**: Directive accepts single component configuration or array of configurations
- [ ] **DYN-03**: Configuration interface with generic type safety for component inputs and outputs
- [ ] **DYN-04**: Passes static value inputs to dynamically rendered components
- [ ] **DYN-05**: Passes Observable inputs to dynamically rendered components (subscribes internally)
- [ ] **DYN-06**: Passes Signal inputs to dynamically rendered components (uses `effect()` or `toObservable()`)
- [ ] **DYN-07**: Subscribes to component outputs and forwards events to provided handler functions
- [ ] **DYN-08**: Proper lifecycle management — `ComponentRef.destroy()` called on directive destroy
- [ ] **DYN-09**: All input subscriptions tracked and cleaned up using `DestroyRef` or `takeUntilDestroyed`

### Widget System

- [ ] **WGT-01**: `WidgetStatus<T>` generic interface with value, status (success|warning|error|neutral), optional icon, optional tooltip
- [ ] **WGT-02**: `TaskCountWidget` displaying task count with status colouring derived from store
- [ ] **WGT-03**: `ProgressWidget` displaying visual progress bar for completion rate
- [ ] **WGT-04**: Widget state derived from store selectors using computed signals — widgets react automatically to store changes
- [ ] **WGT-05**: Generic type parameters on `DynamicWidgetOutletDirective` configuration for type-safe widget composition

### Application Shell

- [ ] **APP-01**: Single board view with columns displayed horizontally
- [ ] **APP-02**: Task card displayed in its column with title, priority indicator, assignee
- [ ] **APP-03**: Create task form/dialog (title, description, priority, assignee)
- [ ] **APP-04**: Edit task — inline or dialog, updates task details in store
- [ ] **APP-05**: Delete task with confirmation
- [ ] **APP-06**: Move task between columns via select box (triggers optimistic update)
- [ ] **APP-07**: Angular Material components used for UI — minimal custom styling
- [ ] **APP-08**: Smart (container) / dumb (presentational) component separation throughout

### Tooling and Quality

- [ ] **TOOL-01**: Conventional Commits format enforced via `commitlint` + `husky` pre-commit hook
- [ ] **TOOL-02**: OXfmt Beta configured for local on-save formatting (TypeScript/JS files)
- [ ] **TOOL-03**: Vitest unit tests for all selectors (selectTasksByColumn, selectCountByPriority, selectCompletionRate)
- [ ] **TOOL-04**: Vitest unit test for reducer (moveTask optimistic update + rollback)
- [ ] **TOOL-05**: Vitest unit test for at least one effect (error handling path)
- [ ] **TOOL-06**: Storybook stories for `TaskCardComponent` (default, expanded, edit mode, overdue state)
- [ ] **TOOL-07**: Storybook stories for `TaskCountWidget` and `ProgressWidget`
- [ ] **TOOL-08**: Playwright E2E test covering create task → move task → verify column transition
- [ ] **TOOL-09**: GitHub Actions CI pipeline: lint → test → build → deploy to Vercel
- [ ] **TOOL-10**: Axe accessibility linting integrated (Storybook a11y addon or pipeline step) — non-blocking (warn only)

### Documentation

- [ ] **DOC-01**: `README.md` with setup instructions (`npm install && ng serve`)
- [ ] **DOC-02**: README architecture decisions section with rationale for each key choice
- [ ] **DOC-03**: README scalability considerations (multi-board, real-time, undo/redo, offline)
- [ ] **DOC-04**: README AI usage disclosure (transparent, per exercise requirements)
- [ ] **DOC-05**: README explanation of Conventional Commits and why they are valuable
- [ ] **DOC-06**: Store structure document (folder organisation + rationale)
- [ ] **DOC-07**: Interview talking points notes (separate file, structured by evaluation area)
- [ ] **DOC-08**: GSD framework notes — why it was a good choice for planning this exercise
- [ ] **DOC-09**: Data flow diagram for task column transition (Mermaid or ASCII — shows action → reducer → effect → component chain)

## v2 Requirements

### Future Enhancements

- **FEAT-01**: Drag and drop column reordering (CDK DragDrop)
- **FEAT-02**: Multiple boards (board list/selection screen)
- **FEAT-03**: Real-time collaboration (WebSocket / NgRx effects integration)
- **FEAT-04**: Undo/redo (NgRx action history)
- **FEAT-05**: Offline support (service worker + optimistic queue)
- **FEAT-06**: Task due dates and date picker
- **FEAT-07**: Custom memoization strategy for complex selectors

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend / real API | Mock service only — no real backend required |
| Authentication | Not required per spec |
| Drag and drop | Select box explicitly approved by spec; DnD deferred to v2 |
| Rich CSS styling | Angular Material defaults; visual polish deferred |
| Multiple boards | Single board for v1; multi-board is architecture note |
| Real-time collaboration | Architecture note in README only |

## Traceability

Populated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| MDL-01 through MDL-05 | Phase 1 | Pending |
| TOOL-01, TOOL-02 | Phase 1 | Pending |
| NGR-01 through NGR-14 | Phase 2 | Pending |
| SIG-01 through SIG-08 | Phase 3 | Pending |
| APP-01 through APP-08 | Phase 3 | Pending |
| DYN-01 through DYN-09 | Phase 4 | Pending |
| WGT-01 through WGT-05 | Phase 4 | Pending |
| TOOL-03 through TOOL-10 | Phase 5 | Pending |
| DOC-01 through DOC-09 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 59 total
- Mapped to phases: 59
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-11*
*Last updated: 2026-03-11 after initial definition*
