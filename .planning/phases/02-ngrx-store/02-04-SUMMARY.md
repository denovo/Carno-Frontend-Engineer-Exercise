---
phase: 02-ngrx-store
plan: "04"
subsystem: store
tags: [ngrx, selectors, entity-adapter, vitest, projector]

# Dependency graph
requires:
  - phase: 02-ngrx-store/02-03
    provides: "taskAdapter and selectTasksState from task.reducer.ts"
provides:
  - "selectAllTasks — re-exported adapter base selector"
  - "selectTasksByColumn — factory selector, filters by columnId (NGR-06)"
  - "selectCountByPriority — Record<Priority, number> breakdown (NGR-07)"
  - "selectCompletionRate — factory selector, integer %, 0-guard (NGR-08)"
  - "task.selectors.spec.ts with 4 projector-based tests"
affects: [03-components, 04-widgets]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Factory selector pattern: (param: string) => createSelector(...) — avoids deprecated props-based selectors"
    - "Projector testing: selector.projector(rawInput) — fast tests with no store bootstrapping"
    - "Adapter composition: taskAdapter.getSelectors(selectTasksState) + createSelector for derived views"

key-files:
  created:
    - src/app/core/store/selectors/task.selectors.ts
    - src/app/core/store/selectors/task.selectors.spec.ts
  modified: []

key-decisions:
  - "Factory selectors (columnId) => createSelector(...) over deprecated createSelector with props — cleaner API for Phase 3 components"
  - "selectCompletionRate returns 0 for empty task list to prevent division-by-zero at the selector level"
  - "selectCountByPriority initializes all 4 Priority keys to 0 — consumers never need to guard for missing keys"

patterns-established:
  - "Selector factory pattern: export const selectX = (param) => createSelector(base, projector)"
  - "Projector test pattern: describe > it > selector(param).projector(rawData) > expect"

requirements-completed: [NGR-06, NGR-07, NGR-08]

# Metrics
duration: 5min
completed: 2026-03-11
---

# Phase 02 Plan 04: Task Selectors Summary

**Three derived NgRx selectors (column filter, priority counts, completion rate) with factory pattern and full projector-based Vitest coverage**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-11T15:37:55Z
- **Completed:** 2026-03-11T15:39:40Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created `task.selectors.ts` with 4 exports: `selectAllTasks`, `selectTasksByColumn`, `selectCountByPriority`, `selectCompletionRate`
- All parameterized selectors use the factory pattern — no deprecated props-based selectors
- Created `task.selectors.spec.ts` with 4 projector tests covering all three derived selectors, including the empty-list guard
- All 30 tests pass (7 test files)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create task.selectors.ts with three derived selectors** - `c34aeeb` (feat)
2. **Task 2: Create task.selectors.spec.ts with projector tests** - `ab1bcc1` (test)

**Plan metadata:** (docs commit pending)

## Files Created/Modified

- `src/app/core/store/selectors/task.selectors.ts` - Exports selectAllTasks, selectTasksByColumn factory, selectCountByPriority, selectCompletionRate factory
- `src/app/core/store/selectors/task.selectors.spec.ts` - 4 Vitest projector tests with deterministic fixture (3 tasks across 2 columns)

## Decisions Made

- Factory selectors (`(param) => createSelector(...)`) over deprecated props pattern — Phase 3 components call `selectTasksByColumn('col-todo')` which is idiomatic NgRx 17+
- `selectCompletionRate` returns 0 for empty list at the selector level — prevents division-by-zero without consumers needing to guard
- All 4 `Priority` enum keys pre-initialized to 0 in `selectCountByPriority` — ensures consumers get a complete record regardless of whether any task has that priority

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Selectors are the complete read-side contract between the store and Phase 3 components
- `selectCompletionRate` ready for the Phase 4 ProgressWidget — pass `DONE_COLUMN_ID` from `@app/core/constants`
- `selectTasksByColumn` ready for Phase 3 column components to subscribe to filtered task lists
- All selectors tested via projector — Phase 3 can import and trust without re-testing

---
*Phase: 02-ngrx-store*
*Completed: 2026-03-11*
