# Roadmap: Petello

## Overview

Petello is built in six phases that follow the natural dependency chain of an Angular application: foundation and tooling first, then the data layer (NGRX store), then the UI component layer (signals + application shell), then the dynamic widget system, then formal testing and Storybook, and finally CI/CD, deployment, and documentation. Each phase delivers a coherent, independently verifiable capability. The store is testable before any UI exists; components are buildable before wiring to the store; widgets are architecturally independent from the board UI.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Project Scaffolding and Tooling** - Angular 21 scaffold with data models, verified toolchain (OXfmt, Vitest, Storybook, Conventional Commits) (completed 2026-03-11)
- [x] **Phase 2: NGRX Store** - Complete state management layer with actions, reducer, selectors, effects, entity adapter, optimistic update, and mock service (completed 2026-03-11)
- [ ] **Phase 3: Component Layer** - TaskCard with signals, board page with NGRX-to-signal bridge, full task CRUD UI using Angular Material
- [x] **Phase 4: Dynamic Widget System** - DynamicWidgetOutletDirective with full input/output forwarding, WidgetStatus interface, TaskCountWidget, ProgressWidget (completed 2026-03-13)
- [ ] **Phase 5: Testing and Storybook** - Vitest unit tests, Storybook stories, Playwright E2E, Axe a11y integration
- [ ] **Phase 6: CI/CD, Deployment, and Documentation** - GitHub Actions pipeline, Vercel deployment, README, interview notes, architecture docs

## Phase Details

### Phase 1: Project Scaffolding and Tooling
**Goal**: A working Angular 21 project with all tooling verified and data model interfaces defined -- the foundation every other phase builds on
**Depends on**: Nothing (first phase)
**Requirements**: MDL-01, MDL-02, MDL-03, MDL-04, MDL-05, TOOL-01, TOOL-02
**Success Criteria** (what must be TRUE):
  1. `ng serve` starts the application and renders a placeholder page in the browser
  2. TypeScript interfaces for Board, Column, Task, and Priority exist and compile without errors
  3. Conventional Commits are enforced -- a commit with a non-conforming message is rejected by the pre-commit hook
  4. OXfmt formats TypeScript files on save (or via CLI) and the formatter runs without errors
  5. Vitest runs a trivial test successfully (`npm test` passes)
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Angular 21 scaffold, NGRX/Material/OXfmt/commitlint install, path alias, directory skeleton (TOOL-01, TOOL-02)
- [ ] 01-02-PLAN.md — TypeScript data model interfaces: Board, Column, Task, Priority enum, TaskAction discriminated union, barrel index, Vitest smoke test (MDL-01 through MDL-05)

### Phase 2: NGRX Store
**Goal**: The entire state management layer is built and unit-tested independently of any UI -- actions, reducer, selectors, effects, entity adapter, optimistic update with rollback, and mock API service all work
**Depends on**: Phase 1
**Requirements**: NGR-01, NGR-02, NGR-03, NGR-04, NGR-05, NGR-06, NGR-07, NGR-08, NGR-09, NGR-10, NGR-11, NGR-12, NGR-13, NGR-14
**Success Criteria** (what must be TRUE):
  1. All five task actions (load, add, move, update, remove) dispatch and the reducer produces correct state transitions (verified by unit tests)
  2. The three selectors (selectTasksByColumn, selectCountByPriority, selectCompletionRate) return correct derived data from store state
  3. Moving a task updates state immediately (optimistic) and rolls back to the previous column if the mock service returns an error
  4. The mock service introduces observable latency (RxJS delay) and can be configured to fail, triggering effect error handling
  5. Actions follow command/event naming (e.g., moveTask, moveTaskSuccess, moveTaskFailure)
**Plans**: 6 plans

Plans:
- [ ] 02-01-PLAN.md — Mock seed data (MOCK_BOARD/MOCK_TASKS), TaskMockService with configurable latency/failure, DONE_COLUMN_ID constant (NGR-14)
- [ ] 02-02-PLAN.md — All 15 action creators with command/event naming convention (NGR-01, NGR-02, NGR-03, NGR-04, NGR-05, NGR-13)
- [ ] 02-03-PLAN.md — createFeature reducer with EntityAdapter, TaskState, optimistic moveTask + rollback, reducer spec (NGR-09, NGR-10, NGR-11)
- [ ] 02-04-PLAN.md — Derived selectors: selectTasksByColumn (factory), selectCountByPriority, selectCompletionRate (factory), selectors spec (NGR-06, NGR-07, NGR-08)
- [ ] 02-05-PLAN.md — TaskEffects with loadTasks$ and moveTask$ (concatMap + inner catchError), effects spec covering failure paths (NGR-12)
- [ ] 02-06-PLAN.md — Store wiring: provideStore/provideEffects/provideStoreDevtools in app.config.ts, store barrel index (all NGR requirements confirmed wired)

### Phase 3: Component Layer
**Goal**: Users can see a board with columns, create/edit/delete tasks, and move tasks between columns -- all UI is wired to the NGRX store via signal bridges
**Depends on**: Phase 1, Phase 2
**Requirements**: APP-01, APP-02, APP-03, APP-04, APP-05, APP-06, APP-07, APP-08, SIG-01, SIG-02, SIG-03, SIG-04, SIG-05, SIG-06, SIG-07, SIG-08
**Success Criteria** (what must be TRUE):
  1. The board displays columns (Todo, In Progress, Done at minimum) with task cards showing title, priority indicator, and assignee
  2. A user can create a new task via a form or dialog, and it appears in the correct column
  3. A user can edit a task's details (title, description, priority, assignee) and see the changes reflected immediately
  4. A user can delete a task with a confirmation step, and it disappears from the board
  5. A user can move a task between columns via a select box, and the UI updates optimistically (with rollback on failure)
**Plans**: 3 plans

Plans:
- [ ] 03-01-PLAN.md — Foundation (provideAnimationsAsync, route stub) + TaskCardComponent with full signal API: input(), computed(), signal(), output() (SIG-01 through SIG-06, APP-02, APP-07)
- [ ] 03-02-PLAN.md — ColumnComponent (dumb column with task list) + TaskFormComponent (create/edit dialog) + ConfirmDialogComponent (delete confirmation) (APP-03, APP-04, APP-05, APP-06, APP-07, APP-08)
- [ ] 03-03-PLAN.md — BoardPageComponent smart container: store.selectSignal() bridge, all CRUD handlers, pending state tracking, app shell toolbar (APP-01, APP-02, APP-03, APP-04, APP-05, APP-06, APP-07, APP-08, SIG-07, SIG-08)

### Phase 4: Dynamic Widget System
**Goal**: A generic dynamic component rendering directive powers a widget dashboard that displays live task statistics derived from the store
**Depends on**: Phase 2, Phase 3
**Requirements**: DYN-01, DYN-02, DYN-03, DYN-04, DYN-05, DYN-06, DYN-07, DYN-08, DYN-09, WGT-01, WGT-02, WGT-03, WGT-04, WGT-05
**Success Criteria** (what must be TRUE):
  1. DynamicWidgetOutletDirective renders components from a configuration array, passing static, Observable, and Signal inputs correctly
  2. Widget output events are forwarded to handler functions defined in the configuration
  3. TaskCountWidget displays current task count with status colouring that updates automatically when tasks are added or removed
  4. ProgressWidget displays a visual progress bar reflecting the completion rate that updates automatically when tasks move to the Done column
  5. Destroying or reconfiguring the directive cleans up all ComponentRefs and subscriptions without memory leaks
**Plans**: 3 plans

Plans:
- [ ] 04-01-PLAN.md — Widget types (WidgetStatus, WidgetConfig, InputBinding), threshold constants, DynamicWidgetOutletDirective with full static/observable/signal input forwarding and output routing
- [ ] 04-02-PLAN.md — TaskCountWidgetComponent (status chip with colour dot) and ProgressWidgetComponent (MatProgressBar with percentage label)
- [ ] 04-03-PLAN.md — WidgetBarComponent smart container + board-page integration + human visual verification

### Phase 5: Testing and Storybook
**Goal**: Comprehensive test coverage and component documentation validate that every major feature works correctly and is visually inspectable
**Depends on**: Phase 2, Phase 3, Phase 4
**Requirements**: TOOL-03, TOOL-04, TOOL-05, TOOL-06, TOOL-07, TOOL-08, TOOL-09, TOOL-10
**Success Criteria** (what must be TRUE):
  1. Vitest unit tests pass for all three selectors, the reducer (including optimistic update and rollback), and at least one effect (error handling path)
  2. Storybook renders stories for TaskCardComponent in multiple states (default, expanded, edit mode, overdue)
  3. Storybook renders stories for TaskCountWidget and ProgressWidget
  4. Playwright E2E test creates a task, moves it to another column, and verifies the column transition
  5. Axe a11y checks run in Storybook (non-blocking warnings)
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

### Phase 6: CI/CD, Deployment, and Documentation
**Goal**: The application is deployed, the CI pipeline validates every push, and all documentation is complete for the interviewer to review
**Depends on**: Phase 5
**Requirements**: DOC-01, DOC-02, DOC-03, DOC-04, DOC-05, DOC-06, DOC-07, DOC-08, DOC-09
**Success Criteria** (what must be TRUE):
  1. GitHub Actions pipeline runs lint, test, build, and deploy steps on push, and a failing test blocks deployment
  2. The application is live on Vercel and accessible via a public URL
  3. README contains setup instructions, architecture decisions with rationale, scalability considerations, AI usage disclosure, and Conventional Commits explanation
  4. Store structure document explains folder organisation and rationale
  5. Interview talking points, GSD framework notes, and a data flow diagram are present as separate documentation files
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Scaffolding and Tooling | 2/2 | Complete   | 2026-03-11 |
| 2. NGRX Store | 6/6 | Complete   | 2026-03-11 |
| 3. Component Layer | 2/3 | In Progress|  |
| 4. Dynamic Widget System | 3/3 | Complete   | 2026-03-13 |
| 5. Testing and Storybook | 0/? | Not started | - |
| 6. CI/CD, Deployment, and Documentation | 0/? | Not started | - |
