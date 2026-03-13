---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: planning
stopped_at: Completed 05-03-PLAN.md
last_updated: "2026-03-13T13:11:04.763Z"
last_activity: 2026-03-11 -- Roadmap created
progress:
  total_phases: 6
  completed_phases: 5
  total_plans: 17
  completed_plans: 17
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-11)

**Core value:** A well-architected codebase that demonstrates production-grade Angular patterns -- the interviewer must be able to walk through every line and understand the reasoning behind it.
**Current focus:** Phase 1: Project Scaffolding and Tooling

## Current Position

Phase: 1 of 6 (Project Scaffolding and Tooling)
Plan: 0 of ? in current phase
Status: Ready to plan
Last activity: 2026-03-11 -- Roadmap created

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: -
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: -
- Trend: -

*Updated after each plan completion*
| Phase 01 P01 | 45 | 2 tasks | 25 files |
| Phase 01 P01 | 45 | 3 tasks | 30 files |
| Phase 01 P02 | 10 | 2 tasks | 7 files |
| Phase 02-ngrx-store P02 | 1 | 1 tasks | 1 files |
| Phase 02 P01 | 8 | 2 tasks | 6 files |
| Phase 02-ngrx-store P03 | 5 | 2 tasks | 2 files |
| Phase 02-ngrx-store P04 | 5 | 2 tasks | 2 files |
| Phase 02-ngrx-store P05 | 3 | 2 tasks | 2 files |
| Phase 02-ngrx-store P06 | 55 | 2 tasks | 2 files |
| Phase 03 P01 | 8 | 2 tasks | 6 files |
| Phase 03-component-layer P02 | 4 | 2 tasks | 7 files |
| Phase 03 P03 | 45 | 3 tasks | 6 files |
| Phase 04-dynamic-widget-system P01 | 15 | 2 tasks | 4 files |
| Phase 04-dynamic-widget-system P02 | 5 | 2 tasks | 8 files |
| Phase 04-dynamic-widget-system P03 | 10 | 3 tasks | 6 files |
| Phase 05-testing-and-storybook P01 | 12 | 3 tasks | 8 files |
| Phase 05-testing-and-storybook P02 | 33 | 3 tasks | 8 files |
| Phase 05-testing-and-storybook P03 | 3 | 2 tasks | 3 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Roadmap: 6 phases derived from requirement categories, standard granularity
- Research: Phase 1 and Phase 4 flagged for deeper research (tooling compatibility, ViewContainerRef patterns)
- [Phase 01]: Node 23.1.0 required via .nvmrc — Angular 21.2 requires node >=22.12, system has v22.11.0
- [Phase 01]: Angular 21 file naming: app.ts not app.component.ts (drops .component. infix)
- [Phase 01]: pre-commit hook emptied — tests run in CI; commit-msg hook sources nvm for Node version compatibility
- [Phase 01]: OXfmt converts single-quoted imports to double-quoted — establishes double-quote style for project
- [Phase 01]: Angular 21 uses new file naming: app.ts (not app.component.ts)
- [Phase 01]: Node 23.1.0 required via .nvmrc — Angular 21.2 requires node >=22.12
- [Phase 01]: pre-commit hook emptied — commit-msg hook sources nvm for commitlint
- [Phase 01]: OXfmt establishes double-quote import style for the entire project
- [Phase 01]: createdAt/updatedAt typed as Date (not string) to enable direct date arithmetic in Phase 3 computed signals
- [Phase 01]: Task has no dueDate — overdue detection via age (createdAt + OVERDUE_THRESHOLD_DAYS constant)
- [Phase 01]: TaskAction discriminated union includes compile-time _exhaustiveCheck to prove exhaustiveness
- [Phase 02-ngrx-store]: moveTask carries previousColumnId in props for optimistic rollback without selector call in effects
- [Phase 02-ngrx-store]: addTask uses Omit<Task, id|createdAt|updatedAt> — server assigns those fields, full Task returned in addTaskSuccess
- [Phase 02-ngrx-store]: updateTask uses Update<Task> from @ngrx/entity for partial entity changes
- [Phase 02]: models/index.ts uses export type for interfaces (isolatedModules TS1205 requirement)
- [Phase 02]: MOCK_COLUMNS and MOCK_TASKS exported separately alongside MOCK_BOARD for clean service imports
- [Phase 02]: TaskMockService: public latencyMs/shouldFail fields (not private) for direct test override without DI
- [Phase 02-03]: TaskState.error is string | null (non-optional) — createFeature auto-selector requirement
- [Phase 02-03]: taskAdapter exported separately from tasksFeature — Plan 04 selectors need it for adapter.getSelectors()
- [Phase 02-03]: moveTaskSuccess is a no-op reducer handler — optimistic update already applied on moveTask dispatch
- [Phase 02-04]: Factory selectors (columnId) => createSelector over deprecated props pattern — cleaner API for Phase 3 components
- [Phase 02-04]: selectCompletionRate returns 0 for empty task list — division-by-zero guard at selector level
- [Phase 02-04]: selectCountByPriority pre-initializes all 4 Priority keys to 0 — consumers get complete record without key guards
- [Phase 02-ngrx-store]: inject() fields before createEffect() fields — Vitest DI safety (NGRX issue #4708)
- [Phase 02-ngrx-store]: catchError inside concatMap inner pipe — effect stream survives individual errors without terminating
- [Phase 02-ngrx-store]: concatMap for mutation effects — prevents request cancellation and reordering
- [Phase 02-ngrx-store]: store/index.ts uses named export { TaskEffects } to prevent @ngrx/effects internals bleeding through barrel
- [Phase 02-ngrx-store]: provideStoreDevtools configured with maxAge: 25, autoPause: true for performance-safe DevTools
- [Phase 03-01]: ng test --watch=false is correct test runner — bare npx vitest run lacks Angular compiler plugin and @app/ alias resolution
- [Phase 03-01]: signal() for isExpanded/isEditMode not model() — no parent two-way binding needed; documented inline
- [Phase 03-01]: loadComponent lazy route for BoardPageComponent to avoid TypeScript compile error before Plan 03 creates the file
- [Phase 03-02]: ColumnComponent passes pendingTaskIds as Set<string> input — smart parent computes the set, dumb component calls .has(task.id) in template
- [Phase 03-02]: TaskFormData.showColumnSelector flag gates column select rendering — single dialog serves both per-column and global add
- [Phase 03-02]: [mat-dialog-close]='true' on Delete vs bare mat-dialog-close on Cancel — caller guards with if(confirmed === true)
- [Phase 03-03]: Toolbar belongs inside BoardPageComponent — AppComponent cannot pass callbacks to routed child; board toolbar is board-specific
- [Phase 03-03]: tasksByColumn Record created at class init with Object.fromEntries — prevents factory selector called inside template change-detection cycle
- [Phase 03-03]: pendingTaskIds managed as local signal (not store state) — optimistic move feedback is transient UI-only state
- [Phase 04-dynamic-widget-system]: untracked() wraps renderOne() in config effect — Angular 21 NG0602 prohibits nested effect() in reactive context
- [Phase 04-dynamic-widget-system]: Observable imported from 'rxjs' in widget.models.ts — @angular/core re-exports but isolatedModules fails to resolve
- [Phase 04-dynamic-widget-system]: Attribute directive template uses plain attribute (appDynamicWidgetOutlet) not property binding ([appDynamicWidgetOutlet])
- [Phase 04-dynamic-widget-system]: ng test --watch=false (full suite) required for templateUrl/styleUrl components — --include flag breaks
- [Phase 04-dynamic-widget-system]: provideAnimationsAsync() required in TestBed for MatProgressBar component tests
- [Phase 04-03]: widgetConfigs is a plain readonly array (not a signal) — component set is static, only signal input values update via DynamicWidgetOutletDirective effects
- [Phase 04-03]: selectCompletionRate(DONE_COLUMN_ID) factory called once at field init — not inside computed() — prevents selector recreation defeating memoization
- [Phase 04-03]: BoardPageComponent has zero widget internals — imports WidgetBarComponent and renders <app-widget-bar /> only
- [Phase 05-01]: playwright.config.ts uses process.env.CI to branch webServer: ng serve locally vs npx serve dist/ in CI
- [Phase 05-01]: ?failNextMove=1 seam sets TaskMockService.shouldFail = true directly — no DI override needed, service is providedIn root
- [Phase 05-01]: shouldFail is NOT auto-reset — rollback spec navigates fresh and moves exactly one task to ensure flag consumed once
- [Phase 05-02]: Storybook 10 (not 8): @storybook/angular@8 requires Angular <20; v10 supports Angular <22 and works with Angular 21
- [Phase 05-02]: Storybook Angular runs via ng run petello:build-storybook (AngularLegacyBuildOptionsError prevents direct storybook CLI)
- [Phase 05-02]: @angular-devkit/build-angular@21 installed as Storybook peer dep alongside @angular/build
- [Phase 05-testing-and-storybook]: CI uses npm run build-storybook (ng run petello:build-storybook) not npx storybook CLI — Storybook 10 requires Angular builder
- [Phase 05-testing-and-storybook]: npm ci --legacy-peer-deps in CI jobs — Storybook 10 peer dep conflicts require this flag

### Pending Todos

None yet.

### Blockers/Concerns

- Angular 21 + Vitest/Storybook/OXfmt compatibility is unverified (highest risk, addressed in Phase 1)
- NGRX version compatibility with Angular 21 needs verification during Phase 1

## Session Continuity

Last session: 2026-03-13T13:11:04.759Z
Stopped at: Completed 05-03-PLAN.md
Resume file: None
