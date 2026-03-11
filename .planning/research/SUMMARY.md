# Project Research Summary

**Project:** Petello (Task Board Application)
**Domain:** Angular 21 + NGRX interview exercise (Trello-like board)
**Researched:** 2026-03-11
**Confidence:** MEDIUM

## Executive Summary

Petello is a task board application built as a senior Angular engineer technical exercise. The exercise evaluates five specific competencies: NGRX state management (with optimistic updates and rollback), Angular signals integration, dynamic component rendering, component architecture, and code quality tooling. The domain itself -- a Kanban board with columns and task cards -- is well-understood, meaning the real challenge is demonstrating mastery of modern Angular patterns rather than solving novel product problems. The recommended approach is a feature-shell architecture with standalone components, a single NGRX feature store using the entity adapter pattern, signal-first component state, and a structural directive for dynamic widget rendering.

The stack is Angular 21, NGRX, Vitest, Playwright, Storybook, Angular Material, and OXfmt Beta -- all specified or implied by the exercise requirements. The primary risk is tooling compatibility: Angular 21 is the latest release and several ecosystem tools (Storybook, @analogjs/vitest-angular, OXfmt) may not yet fully support it. All version numbers must be verified with `npm view` before scaffolding. The secondary risk is the optimistic update rollback pattern, which is the exercise's centerpiece state management challenge and easy to get wrong with concurrent operations.

The build should follow a strict dependency order: data models first, then NGRX store (independently testable), then presentational components (independently Storybook-able), then smart component integration, then the dynamic widget system, and finally testing/CI/deployment. This ordering maximizes the ability to demonstrate working pieces even if time runs short, and allows parallel development tracks after the foundation is laid.

## Key Findings

### Recommended Stack

The stack is largely dictated by the exercise specification. Angular 21 with standalone components and signal-based APIs is the framework. NGRX classic store (not SignalStore) is required for state management. Vitest replaces Jest/Karma for unit testing, requiring the @analogjs/vitest-angular adapter for Angular compilation support. OXfmt Beta is the specified code formatter (a candidate preference that must be disclosed in the README). Vercel hosts the deployment; GitHub Actions runs CI.

**Core technologies:**
- **Angular 21 + TypeScript ~5.7+**: Framework specified by exercise. Use signals (`input()`, `computed()`, `signal()`), standalone components, and functional APIs throughout
- **NGRX (store, effects, store-devtools)**: Required state management. Use `createFeature()`, `createActionGroup()`, functional effects, entity adapter
- **Vitest + @analogjs/vitest-angular**: Specified test runner. Test selectors/reducers as pure functions; use Analog plugin for component tests
- **Angular Material (M3)**: Official component library, minimal styling per spec
- **Playwright**: E2E testing framework
- **Storybook**: Component documentation (verify Angular 21 compatibility first)
- **OXfmt Beta**: Code formatter (verify Angular template support; fallback to Prettier for templates if needed)
- **Commitlint + Husky**: Conventional commit enforcement
- **Vercel + GitHub Actions**: Deployment and CI pipeline

### Expected Features

**Must have (table stakes -- exercise fails without these):**
- Board with 3+ columns (Todo, In Progress, Done) with full task CRUD
- Move task between columns via select box with optimistic update and rollback
- NGRX store: actions, reducer, selectors (parameterised by column, priority breakdown, completion rate), effects with error handling
- Mock API service with RxJS delay and configurable failure
- TaskCardComponent with input signals, computed signals (CSS class, formatted dates, overdue check), and local UI state signals
- NGRX-to-signal bridge via `toSignal()` in smart components
- DynamicWidgetOutletDirective (structural directive, ViewContainerRef pattern)
- TaskCountWidget and ProgressWidget consuming store state via computed signals
- TypeScript interfaces (Board, Column, Task with 4-tier priority)
- README with architecture decisions and scalability section

**Should have (differentiators):**
- Unit tests for selectors and effects (spec calls out as bonus)
- Command vs Event action naming pattern (zero implementation cost, just naming discipline)
- Smart/dumb component separation (spec mentions explicitly)
- Entity adapter for normalized task state
- Loading and error states in UI
- Storybook stories for TaskCard and widgets

**Defer (anti-features for this exercise):**
- Drag and drop, multiple boards, authentication, rich styling, search/filtering, real-time collaboration, offline support

### Architecture Approach

Feature-shell architecture with standalone components (no NgModules). A single NGRX feature store (`tasks`) at the app level handles all state. Smart (container) components (BoardPageComponent, TaskDialogComponent) dispatch actions and select state via `toSignal()`. Presentational components (TaskCardComponent, ColumnComponent, widgets) receive data through input signals and emit events through outputs. The DynamicWidgetOutletDirective lives in `shared/` as a generic rendering utility. Widget components live in a separate `widgets/` directory because they are dynamically instantiated and could be reused outside the board context.

**Major components:**
1. **BoardPageComponent** -- Smart container: injects Store, dispatches actions, bridges NGRX to signals, orchestrates the board layout
2. **TaskCardComponent** -- Presentational: displays task with input/computed/local signals, emits move/update/delete events
3. **ColumnComponent** -- Presentational: renders column title and list of TaskCards
4. **DynamicWidgetOutletDirective** -- Structural directive: dynamically instantiates widget components from WidgetConfig array via ViewContainerRef
5. **TaskCountWidget / ProgressWidget** -- Presentational widgets: receive store-derived data via directive-set inputs
6. **NGRX Store (actions, reducer, selectors, effects)** -- Single feature store with entity adapter, optimistic update pattern, and memoized selectors
7. **TaskApiService** -- Mock API with RxJS delay and configurable failure rate

### Critical Pitfalls

1. **DynamicWidgetOutletDirective memory leaks** -- Track all ComponentRefs and subscriptions; destroy and clear ViewContainerRef before re-creating on input changes; use DestroyRef for automatic cleanup
2. **Optimistic update rollback state corruption** -- Store previous columnId per task in action payload; use conditional rollback (only revert if task is still in the optimistic target column); handle concurrent moves with switchMap keyed by taskId
3. **NGRX/Signal bridge `undefined` types** -- Use `toSignal(store.select(...), { requireSync: true })` for store selectors (safe because they emit synchronously); never mix async pipe and toSignal for the same selector
4. **Vitest + Angular TestBed compatibility** -- Must install @analogjs/vite-plugin-angular; validate with a trivial component test before writing real tests; test pure functions (selectors, reducers) without TestBed
5. **Storybook + Angular 21 version lag** -- Check compatibility matrix before scaffolding; have Playwright component test fallback ready; document any limitation in README

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Project Scaffolding and Tooling

**Rationale:** Every other phase depends on the project existing and tools working. Tooling compatibility (Vitest, Storybook, OXfmt with Angular 21) is the highest-risk unknown and must be validated before investing in code.
**Delivers:** Working Angular 21 project with NGRX, Vitest, Storybook, Playwright, commitlint/husky configured and validated. All version numbers confirmed.
**Addresses:** Core framework setup; all code quality tooling
**Avoids:** Pitfall 4 (Vitest compatibility), Pitfall 5 (Storybook compatibility), Pitfall 6 (OXfmt issues), Pitfall 7 (Husky hooks), Pitfall 12 (standalone provider setup)

### Phase 2: Data Models and NGRX Store

**Rationale:** The store is the backbone of the application. All UI components depend on the data models and store selectors. The store can be built and unit-tested independently of any UI, making it the highest-value early deliverable.
**Delivers:** TypeScript interfaces (Board, Column, Task), full NGRX store (actions with command/event naming, entity adapter reducer with optimistic update/rollback, memoized selectors, effects with error handling), mock API service, and unit tests for selectors and effects.
**Addresses:** Task CRUD actions, moveTask optimistic update, parameterised selector, priority breakdown selector, completion rate selector, effects with error handling, mock service
**Avoids:** Pitfall 3 (rollback state corruption), Pitfall 11 (entity adapter overkill -- make a deliberate choice)

### Phase 3: Presentational Components

**Rationale:** Presentational components depend only on data model interfaces, not on the store. They can be built, Storybook'd, and visually validated in isolation. This enables a parallel track alongside store work.
**Delivers:** TaskCardComponent (input signals, computed signals, local UI state), ColumnComponent, BoardHeaderComponent, TaskDialogComponent shell. Storybook stories for TaskCard.
**Addresses:** All signal features (input, computed, writable signals), smart/dumb component separation
**Avoids:** Pitfall 9 (computed signal chains -- keep shallow from the start), Anti-Pattern 1 (no Store injection in presentational components)

### Phase 4: Smart Component Integration

**Rationale:** With store and presentational components both ready, this phase wires them together. The NGRX-to-signal bridge is established here.
**Delivers:** BoardPageComponent connecting store to presentational components via toSignal(). TaskDialogComponent dispatching create/edit actions. Full board with working task CRUD and optimistic move.
**Addresses:** NGRX-to-signal bridge (toSignal), smart/dumb integration, optimistic update visible in UI
**Avoids:** Pitfall 2 (signal bridge zone pollution -- use requireSync pattern)

### Phase 5: Dynamic Widget System

**Rationale:** The widget system (DynamicWidgetOutletDirective + widgets) is architecturally independent from the board UI. It depends on store selectors for data but not on board components. Building it as a separate phase keeps scope contained.
**Delivers:** DynamicWidgetOutletDirective, WidgetConfig interface, TaskCountWidget, ProgressWidget, widget integration in BoardHeaderComponent. Unit tests for the directive.
**Addresses:** Dynamic component rendering, widget state from store via computed signals, lifecycle cleanup
**Avoids:** Pitfall 1 (directive memory leaks -- correct from the start)

### Phase 6: Testing, CI/CD, and Polish

**Rationale:** With all features implemented, this phase adds comprehensive testing, CI pipeline, Vercel deployment, and documentation.
**Delivers:** Playwright E2E test (create task, move, verify), GitHub Actions CI pipeline, Vercel deployment, README with architecture decisions, scalability section, and AI usage disclosure.
**Addresses:** E2E testing, CI pipeline, deployment, documentation deliverables
**Avoids:** Pitfall 8 (Vercel SSR misconfiguration -- use ssr=false), Pitfall 10 (Playwright CI flakiness -- build first, serve static), Pitfall 13 (over-engineering without explanation -- write clear README)

### Phase Ordering Rationale

- **Models and store before UI** because every component depends on data shapes and state queries. Store can be tested in isolation with pure function tests.
- **Presentational components before smart components** because they can be built and Storybook'd without a running store. This also enforces the smart/dumb separation pattern from the start.
- **Widget system as a separate phase** because it is architecturally independent and the DynamicWidgetOutletDirective is the most complex piece -- isolating it reduces risk.
- **Testing and CI last** because it wraps everything, but the store unit tests should be written alongside Phase 2 (not deferred).
- **Phases 2 and 3 can run in parallel** after Phase 1 completes, since they share only data model interfaces.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1 (Scaffolding):** High uncertainty around Angular 21 + Vitest/Storybook/OXfmt compatibility. Must verify versions with `npm view` and test each tool before proceeding. This phase warrants `/gsd:research-phase`.
- **Phase 5 (Dynamic Widget System):** The DynamicWidgetOutletDirective pattern involves ViewContainerRef lifecycle management, Signal/Observable input binding to dynamic components, and output forwarding. Complex enough to warrant phase-specific research on Angular 21's ComponentRef API changes.

Phases with standard patterns (skip research-phase):
- **Phase 2 (NGRX Store):** Well-documented NGRX patterns. Entity adapter, createActionGroup, functional effects are stable APIs.
- **Phase 3 (Presentational Components):** Standard Angular signal patterns, well-documented since Angular 17.
- **Phase 4 (Smart Component Integration):** Straightforward wiring of store to components via toSignal().
- **Phase 6 (Testing/CI/Deploy):** Standard Playwright, GitHub Actions, and Vercel patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | All version numbers are estimates based on Angular's release cadence. Must verify with `npm view` before scaffolding. Core patterns (standalone, signals, NGRX) are stable. |
| Features | HIGH | Exercise spec is explicit and detailed. Very little ambiguity about what to build. Feature prioritization is clear. |
| Architecture | MEDIUM | Feature-shell + smart/dumb + NGRX patterns are well-established through Angular 19. Angular 21 specifics (e.g., zoneless, new signal APIs) need validation. |
| Pitfalls | MEDIUM | Pitfalls are based on training data through May 2025. Tooling compatibility pitfalls (Vitest, Storybook, OXfmt) are the most likely to be outdated -- these tools move fast. |

**Overall confidence:** MEDIUM -- The architectural patterns and feature requirements are clear and well-understood. The primary uncertainty is tooling version compatibility with Angular 21, which can only be resolved during Phase 1 scaffolding.

### Gaps to Address

- **Angular 21 actual availability:** If Angular 21 is not yet released, fall back to Angular 20. The exercise spec says "17+" so any modern Angular is acceptable.
- **NGRX Angular 21 compatibility:** NGRX version may lag Angular release. Check peerDependencies during scaffolding.
- **OXfmt Beta Angular template support:** May not handle `.html` templates. Verify during Phase 1; restrict to `.ts` files if needed.
- **Storybook Angular 21 support:** Historically lags behind Angular releases. Have Playwright component test fallback.
- **`store.selectSignal()` availability:** NGRX 17+ added this, but it may or may not be available in the NGRX version compatible with Angular 21. Fall back to `toSignal(store.select(...))`.
- **Zoneless change detection:** Angular 21 may have stable zoneless support. Worth exploring during Phase 1 but not critical -- Zone.js still works fine.

## Sources

### Primary (HIGH confidence)
- Exercise specification (README.md in repository) -- all feature requirements, evaluation criteria, and scope constraints
- PROJECT.md (.planning/) -- project plan decisions on scope, tools, and constraints

### Secondary (MEDIUM confidence)
- Angular documentation patterns (angular.dev) -- standalone components, signals API, functional APIs (based on Angular 17-19 training data)
- NGRX documentation patterns (ngrx.io) -- createActionGroup, entity adapter, functional effects (based on NGRX 15-17 training data)
- AnalogJS Vitest adapter patterns -- established community standard for Vitest + Angular
- Playwright and GitHub Actions documentation -- stable, well-documented patterns

### Tertiary (LOW confidence)
- Angular 21 specific APIs -- extrapolated from Angular's 6-month release cadence; must verify
- OXfmt Beta -- relatively new tool, verify current status and Angular support
- Storybook Angular 21 compatibility -- historically lags; verify during scaffolding

---
*Research completed: 2026-03-11*
*Ready for roadmap: yes*
