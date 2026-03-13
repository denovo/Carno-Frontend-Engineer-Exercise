# Requirements: Petello

**Defined:** 2026-03-11
**Core Value:** A well-architected codebase that demonstrates production-grade Angular patterns — the interviewer must be able to walk through every line and understand the reasoning behind it.

## v1 Requirements

### Data Models

- [x] **MDL-01**: TypeScript interface `Board` with id, name, and columns collection
- [x] **MDL-02**: TypeScript interface `Column` with id, name, and order
- [x] **MDL-03**: TypeScript interface `Task` with id, title, optional description, columnId, priority, optional assignee, createdAt, updatedAt
- [x] **MDL-04**: Priority represented as TypeScript enum or union type with 4 tiers (Low, Medium, High, Critical)
- [x] **MDL-05**: Discriminated union types for strongly-typed action variants

### NGRX State Management

- [x] **NGR-01**: Action `loadTasks` — load tasks for a board
- [x] **NGR-02**: Action `addTask` — add a new task
- [x] **NGR-03**: Action `moveTask` — move task between columns (optimistic update)
- [x] **NGR-04**: Action `updateTask` — update task details
- [x] **NGR-05**: Action `removeTask` — remove a task
- [x] **NGR-06**: Parameterised/factory selector `selectTasksByColumn(columnId)` returning tasks filtered by column
- [x] **NGR-07**: Selector `selectCountByPriority` returning count breakdown grouped by priority
- [x] **NGR-08**: Selector `selectCompletionRate` calculating % of tasks in final column
- [x] **NGR-09**: Optimistic update for `moveTask` — state updates immediately, rolls back if server fails
- [x] **NGR-10**: Rollback strategy stores previous columnId in action payload for reducer revert
- [x] **NGR-11**: Entity adapter (`@ngrx/entity`) for normalised task storage
- [x] **NGR-12**: At least one effect with proper error handling (using `catchError` + failure action dispatch)
- [x] **NGR-13**: Command vs event action naming pattern (e.g., `moveTask` command → `moveTaskSuccess` / `moveTaskFailure` events)
- [x] **NGR-14**: Local mock service simulating server responses with RxJS `delay()` and configurable failure

### Signals Integration

- [x] **SIG-01**: `TaskCardComponent` uses `input()` signal API for receiving task data
- [x] **SIG-02**: Computed signal for priority CSS class derived from task priority
- [x] **SIG-03**: Computed signal for formatted date display
- [x] **SIG-04**: Computed signal for overdue indicator (based on task age or due date)
- [x] **SIG-05**: Local UI state managed with signals — expansion state, edit mode
- [x] **SIG-06**: `model()` two-way binding for edit mode in TaskCard
- [x] **SIG-07**: NGRX selector bridged to Angular signal via `store.selectSignal()` or `toSignal()` in smart components
- [x] **SIG-08**: Smart components pass signal values down to presentational components via `input()` signals

### Dynamic Component Rendering

- [x] **DYN-01**: `DynamicWidgetOutletDirective` structural directive using `ViewContainerRef`
- [x] **DYN-02**: Directive accepts single component configuration or array of configurations
- [x] **DYN-03**: Configuration interface with generic type safety for component inputs and outputs
- [x] **DYN-04**: Passes static value inputs to dynamically rendered components
- [x] **DYN-05**: Passes Observable inputs to dynamically rendered components (subscribes internally)
- [x] **DYN-06**: Passes Signal inputs to dynamically rendered components (uses `effect()` or `toObservable()`)
- [x] **DYN-07**: Subscribes to component outputs and forwards events to provided handler functions
- [x] **DYN-08**: Proper lifecycle management — `ComponentRef.destroy()` called on directive destroy
- [x] **DYN-09**: All input subscriptions tracked and cleaned up using `DestroyRef` or `takeUntilDestroyed`

### Widget System

- [x] **WGT-01**: `WidgetStatus<T>` generic interface with value, status (success|warning|error|neutral), optional icon, optional tooltip
- [x] **WGT-02**: `TaskCountWidget` displaying task count with status colouring derived from store
- [x] **WGT-03**: `ProgressWidget` displaying visual progress bar for completion rate
- [x] **WGT-04**: Widget state derived from store selectors using computed signals — widgets react automatically to store changes
- [x] **WGT-05**: Generic type parameters on `DynamicWidgetOutletDirective` configuration for type-safe widget composition

### Application Shell

- [x] **APP-01**: Single board view with columns displayed horizontally
- [x] **APP-02**: Task card displayed in its column with title, priority indicator, assignee
- [x] **APP-03**: Create task form/dialog (title, description, priority, assignee)
- [x] **APP-04**: Edit task — inline or dialog, updates task details in store
- [x] **APP-05**: Delete task with confirmation
- [x] **APP-06**: Move task between columns via select box (triggers optimistic update)
- [x] **APP-07**: Angular Material components used for UI — minimal custom styling
- [x] **APP-08**: Smart (container) / dumb (presentational) component separation throughout

### Tooling and Quality

- [x] **TOOL-01**: Conventional Commits format enforced via `commitlint` + `husky` pre-commit hook
- [x] **TOOL-02**: OXfmt Beta configured for local on-save formatting (TypeScript/JS files)
- [ ] **TOOL-03**: Vitest unit tests for all selectors (selectTasksByColumn, selectCountByPriority, selectCompletionRate)
- [ ] **TOOL-04**: Vitest unit test for reducer (moveTask optimistic update + rollback)
- [ ] **TOOL-05**: Vitest unit test for at least one effect (error handling path)
- [x] **TOOL-06**: Storybook stories for `TaskCardComponent` (default, expanded, edit mode, overdue state)
- [x] **TOOL-07**: Storybook stories for `TaskCountWidget` and `ProgressWidget`
- [x] **TOOL-08**: Playwright E2E test covering create task → move task → verify column transition
- [ ] **TOOL-09**: GitHub Actions CI pipeline: lint → test → build → deploy to Vercel
- [x] **TOOL-10**: Axe accessibility linting integrated (Storybook a11y addon or pipeline step) — non-blocking (warn only)

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

| Requirement | Phase | Status |
|-------------|-------|--------|
| MDL-01 | Phase 1: Project Scaffolding and Tooling | Complete |
| MDL-02 | Phase 1: Project Scaffolding and Tooling | Complete |
| MDL-03 | Phase 1: Project Scaffolding and Tooling | Complete |
| MDL-04 | Phase 1: Project Scaffolding and Tooling | Complete |
| MDL-05 | Phase 1: Project Scaffolding and Tooling | Complete |
| TOOL-01 | Phase 1: Project Scaffolding and Tooling | Complete |
| TOOL-02 | Phase 1: Project Scaffolding and Tooling | Complete |
| NGR-01 | Phase 2: NGRX Store | Complete |
| NGR-02 | Phase 2: NGRX Store | Complete |
| NGR-03 | Phase 2: NGRX Store | Complete |
| NGR-04 | Phase 2: NGRX Store | Complete |
| NGR-05 | Phase 2: NGRX Store | Complete |
| NGR-06 | Phase 2: NGRX Store | Complete |
| NGR-07 | Phase 2: NGRX Store | Complete |
| NGR-08 | Phase 2: NGRX Store | Complete |
| NGR-09 | Phase 2: NGRX Store | Complete |
| NGR-10 | Phase 2: NGRX Store | Complete |
| NGR-11 | Phase 2: NGRX Store | Complete |
| NGR-12 | Phase 2: NGRX Store | Complete |
| NGR-13 | Phase 2: NGRX Store | Complete |
| NGR-14 | Phase 2: NGRX Store | Complete |
| APP-01 | Phase 3: Component Layer | Complete |
| APP-02 | Phase 3: Component Layer | Complete |
| APP-03 | Phase 3: Component Layer | Complete |
| APP-04 | Phase 3: Component Layer | Complete |
| APP-05 | Phase 3: Component Layer | Complete |
| APP-06 | Phase 3: Component Layer | Complete |
| APP-07 | Phase 3: Component Layer | Complete |
| APP-08 | Phase 3: Component Layer | Complete |
| SIG-01 | Phase 3: Component Layer | Complete |
| SIG-02 | Phase 3: Component Layer | Complete |
| SIG-03 | Phase 3: Component Layer | Complete |
| SIG-04 | Phase 3: Component Layer | Complete |
| SIG-05 | Phase 3: Component Layer | Complete |
| SIG-06 | Phase 3: Component Layer | Complete |
| SIG-07 | Phase 3: Component Layer | Complete |
| SIG-08 | Phase 3: Component Layer | Complete |
| DYN-01 | Phase 4: Dynamic Widget System | Complete |
| DYN-02 | Phase 4: Dynamic Widget System | Complete |
| DYN-03 | Phase 4: Dynamic Widget System | Complete |
| DYN-04 | Phase 4: Dynamic Widget System | Complete |
| DYN-05 | Phase 4: Dynamic Widget System | Complete |
| DYN-06 | Phase 4: Dynamic Widget System | Complete |
| DYN-07 | Phase 4: Dynamic Widget System | Complete |
| DYN-08 | Phase 4: Dynamic Widget System | Complete |
| DYN-09 | Phase 4: Dynamic Widget System | Complete |
| WGT-01 | Phase 4: Dynamic Widget System | Complete |
| WGT-02 | Phase 4: Dynamic Widget System | Complete |
| WGT-03 | Phase 4: Dynamic Widget System | Complete |
| WGT-04 | Phase 4: Dynamic Widget System | Complete |
| WGT-05 | Phase 4: Dynamic Widget System | Complete |
| TOOL-03 | Phase 5: Testing and Storybook | Pending |
| TOOL-04 | Phase 5: Testing and Storybook | Pending |
| TOOL-05 | Phase 5: Testing and Storybook | Pending |
| TOOL-06 | Phase 5: Testing and Storybook | Complete |
| TOOL-07 | Phase 5: Testing and Storybook | Complete |
| TOOL-08 | Phase 5: Testing and Storybook | Complete |
| TOOL-09 | Phase 5: Testing and Storybook | Pending |
| TOOL-10 | Phase 5: Testing and Storybook | Complete |
| DOC-01 | Phase 6: CI/CD, Deployment, and Documentation | Pending |
| DOC-02 | Phase 6: CI/CD, Deployment, and Documentation | Pending |
| DOC-03 | Phase 6: CI/CD, Deployment, and Documentation | Pending |
| DOC-04 | Phase 6: CI/CD, Deployment, and Documentation | Pending |
| DOC-05 | Phase 6: CI/CD, Deployment, and Documentation | Pending |
| DOC-06 | Phase 6: CI/CD, Deployment, and Documentation | Pending |
| DOC-07 | Phase 6: CI/CD, Deployment, and Documentation | Pending |
| DOC-08 | Phase 6: CI/CD, Deployment, and Documentation | Pending |
| DOC-09 | Phase 6: CI/CD, Deployment, and Documentation | Pending |

**Coverage:**
- v1 requirements: 68 total
- Mapped to phases: 68
- Unmapped: 0

---
*Requirements defined: 2026-03-11*
*Last updated: 2026-03-11 after roadmap creation*
