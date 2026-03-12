---
phase: 03-component-layer
plan: 01
subsystem: ui
tags: [angular, signals, angular-material, ngrx, task-card, computed-signals]

# Dependency graph
requires:
  - phase: 02-ngrx-store
    provides: "Task model, Priority enum, DONE_COLUMN_ID/OVERDUE_THRESHOLD_DAYS constants, store actions"
provides:
  - "TaskCardComponent with full signal API (input/computed/output/signal)"
  - "MoveEvent interface for downstream consumers"
  - "provideAnimationsAsync() in app.config.ts for MatDialog/MatSnackBar"
  - "Lazy-loaded BoardPageComponent route at '' in app.routes.ts"
affects: [03-02-column-component, 03-03-board-page, 03-04-task-form]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dumb component pattern: input.required<T>() for data, output<E>() for events, no store injection"
    - "computed() for derived display values (priorityClass, formattedDates, isOverdue)"
    - "signal() for local UI state (isExpanded, isEditMode) with model() tradeoff comment"
    - "TDD: write failing spec (RED) → commit → implement (GREEN) → verify with ng test"

key-files:
  created:
    - src/app/features/board/task-card/task-card.component.ts
    - src/app/features/board/task-card/task-card.component.html
    - src/app/features/board/task-card/task-card.component.scss
    - src/app/features/board/task-card/task-card.component.spec.ts
  modified:
    - src/app/app.config.ts
    - src/app/app.routes.ts

key-decisions:
  - "ng test --watch=false (via nvm node v23) is correct test runner — bare npx vitest run lacks Angular compiler plugin and @app/ path alias resolution"
  - "loadComponent lazy route for BoardPageComponent avoids TypeScript compile error before Plan 03 creates the file"
  - "signal() for isExpanded/isEditMode, not model() — no parent two-way binding needed; documented with comment"

patterns-established:
  - "Dumb TaskCard pattern: all computed state, no store injection, all side-effects via output()"
  - "Priority CSS class: priority-${priority.toLowerCase()} naming convention"
  - "isOverdue: DONE_COLUMN_ID guard first, then age arithmetic in ms / 86_400_000"

requirements-completed: [SIG-01, SIG-02, SIG-03, SIG-04, SIG-05, SIG-06, APP-02, APP-07]

# Metrics
duration: 8min
completed: 2026-03-12
---

# Phase 3 Plan 01: TaskCardComponent Signal API Summary

**Dumb TaskCardComponent with input.required/computed/signal/output signals, collapsed + expanded template, and provideAnimationsAsync wired into app foundation**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-12T13:30:24Z
- **Completed:** 2026-03-12T13:37:47Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- TaskCardComponent implements full Angular signals API: `input.required<Task>()`, three `computed()` signals (priorityClass, formattedDates, isOverdue), two `signal()` local states (isExpanded, isEditMode), three `output()` events (move, edit, delete)
- 13 unit tests covering all computed signal behaviors (SIG-02 through SIG-05) all pass via `ng test`
- App foundation wired: `provideAnimationsAsync()` added for MatDialog, lazy `loadComponent` route for BoardPageComponent registered
- MoveEvent interface exported for downstream Phase 3 consumers (ColumnComponent, BoardPageComponent)

## Task Commits

Each task was committed atomically:

1. **Task 1: Foundation — provideAnimationsAsync + route stub** - `10fbd58` (feat)
2. **Task 2 RED: Failing spec for TaskCardComponent** - `c171250` (test)
3. **Task 2 GREEN: TaskCardComponent implementation** - `737c5c7` (feat)

**Plan metadata:** (docs commit follows)

_Note: TDD task 2 has two commits (test RED → feat GREEN)_

## Files Created/Modified
- `src/app/app.config.ts` - Added `provideAnimationsAsync()` for Material animation support
- `src/app/app.routes.ts` - Registered lazy `loadComponent` route for `''` path
- `src/app/features/board/task-card/task-card.component.ts` - TaskCardComponent with full signals API + MoveEvent interface
- `src/app/features/board/task-card/task-card.component.html` - Template: collapsed header (title+badge) and expanded body (description, assignee, dates, move select, edit/delete buttons)
- `src/app/features/board/task-card/task-card.component.scss` - Minimal styles: pending opacity, overdue border, priority border classes
- `src/app/features/board/task-card/task-card.component.spec.ts` - 13 unit tests for SIG-02 through SIG-05

## Decisions Made
- `ng test --watch=false` (via nvm node v23) is the correct test runner for this project. Bare `npx vitest run` lacks the Angular compiler plugin and `@app/` path alias resolution that the `@angular/build:unit-test` builder provides. The plan's verify command `npx vitest run` was superseded by this finding.
- `loadComponent` with inline arrow function used for route (not eager import) to avoid TypeScript compile error while `BoardPageComponent` doesn't exist until Plan 03.
- `signal()` chosen over `model()` for `isExpanded` and `isEditMode` — code comment explains the tradeoff inline.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated test runner from `npx vitest run` to `ng test --watch=false`**
- **Found during:** Task 2 (GREEN verification)
- **Issue:** `npx vitest run` fails on all specs using `@app/` path aliases — vitest lacks the Angular build plugin that resolves these aliases. The project uses `@angular/build:unit-test` which wraps vitest with Angular's compiler.
- **Fix:** Used `ng test --watch=false` (with nvm node v23 active) for all test runs. No config files modified — this is an existing project setup.
- **Files modified:** None
- **Verification:** All 43 tests pass across 8 spec files including the new task-card spec (13 tests)
- **Committed in:** N/A — discovery only, no file changes needed

---

**Total deviations:** 1 auto-discovered (test runner clarification, no file changes)
**Impact on plan:** No scope creep. All planned functionality implemented exactly as specified.

## Issues Encountered
- `npx vitest run` (bare) fails for `@app/` aliased imports — must use `ng test --watch=false` with node v23 active via nvm. This is pre-existing across all Phase 2 specs too.

## Next Phase Readiness
- TaskCardComponent is ready as a dumb presentational unit for Plan 02 (ColumnComponent)
- MoveEvent interface exported and available for smart parent components
- App foundation (animations, route) ready for Plan 03 (BoardPageComponent)
- All 43 tests passing, TypeScript clean

---
*Phase: 03-component-layer*
*Completed: 2026-03-12*
