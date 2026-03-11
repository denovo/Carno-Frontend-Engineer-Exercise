---
phase: 02-ngrx-store
plan: "03"
subsystem: api
tags: [ngrx, angular, typescript, store, entity, reducer]

# Dependency graph
requires:
  - phase: 02-02-ngrx-actions
    provides: 15 NGRX action creators with optimistic rollback props
  - phase: 01-02-data-models
    provides: Task interface, Priority enum from @app/shared/models
provides:
  - tasksFeature (createFeature) with auto-generated property selectors
  - taskAdapter (EntityAdapter<Task>) for adapter.getSelectors() in selectors plan
  - TaskState interface locking the store shape (ids, entities, loading, error)
  - initialState from taskAdapter.getInitialState
  - 9 pure-function reducer tests proving optimistic update and rollback
affects: [02-04-selectors, 02-05-effects, 02-06-wiring]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "createFeature wraps createReducer — generates selectLoading, selectError, selectTasksState auto-selectors"
    - "EntityAdapter handles all entity CRUD — no manual spread-and-map in reducers"
    - "Optimistic update: moveTask applies columnId change before API response (NGR-09)"
    - "Rollback: moveTaskFailure reverts columnId to previousColumnId atomically (NGR-10)"
    - "moveTaskSuccess is a no-op — optimistic update already applied, nothing to do"

key-files:
  created:
    - src/app/core/store/reducers/task.reducer.ts
    - src/app/core/store/reducers/task.reducer.spec.ts
  modified: []

key-decisions:
  - "TaskState uses non-optional error: string | null (not error?: string) — createFeature requirement for auto-selectors"
  - "sortComparer on taskAdapter sorts by createdAt ascending — ensures predictable selectAll ordering"
  - "moveTaskSuccess handler returns state unchanged — optimistic update already applied, noop avoids confusion"
  - "taskAdapter and initialState exported separately from tasksFeature destructure — Plan 04 selectors need taskAdapter for adapter.getSelectors(selectTasksState)"

patterns-established:
  - "Pure function reducer tests: call reducer(state, action) directly — no TestBed, no Angular DI"
  - "Pre-populate state for tests via taskAdapter.addOne(mockTask, initialState)"
  - "Mock tasks use Date objects (not strings) for createdAt/updatedAt — matches Task interface"

requirements-completed: [NGR-09, NGR-10, NGR-11]

# Metrics
duration: 5min
completed: 2026-03-11
---

# Phase 2 Plan 03: NGRX Reducer Summary

**createFeature + EntityAdapter reducer with 9 pure-function tests proving optimistic moveTask and previousColumnId rollback**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-11T15:34:30Z
- **Completed:** 2026-03-11T15:39:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created task.reducer.ts: createFeature with EntityAdapter, 11 on() handlers including optimistic update and rollback
- TaskState interface locks store shape with non-optional properties (required by createFeature auto-selectors)
- Created task.reducer.spec.ts: 9 pure-function tests, no TestBed — all pass
- moveTask optimistic update test and moveTaskFailure rollback test both explicit and passing (NGR-09, NGR-10)
- All 23 total tests pass (9 new reducer tests + 14 prior)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create task.reducer.ts with createFeature and EntityAdapter** - `11e99be` (feat)
2. **Task 2: Create task.reducer.spec.ts with pure function tests** - `31e0e9b` (feat)

**Plan metadata:** (pending docs commit)

## Files Created/Modified
- `src/app/core/store/reducers/task.reducer.ts` - createFeature with EntityAdapter, 11 on() handlers, full exports
- `src/app/core/store/reducers/task.reducer.spec.ts` - 9 pure-function reducer tests including optimistic and rollback

## Decisions Made
- TaskState.error is `string | null` (non-optional) — createFeature generates auto-selectors from all state properties, and optional fields cause selector type issues
- taskAdapter sorted by createdAt ascending for deterministic selectAll ordering used in selectors
- moveTaskSuccess returns state unchanged (no-op) — optimistic update already committed to state on moveTask dispatch
- taskAdapter exported separately (not from createFeature destructure) because Plan 04 selectors need it directly for `adapter.getSelectors(selectTasksState)`

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Plan 04 (selectors) can proceed: taskAdapter and selectTasksState exported for adapter.getSelectors()
- Plan 05 (effects) can proceed: tasksFeature reducer wired via createFeature is ready for provideStore()
- All NGR-09, NGR-10, NGR-11 requirements fulfilled and tested

---
*Phase: 02-ngrx-store*
*Completed: 2026-03-11*

## Self-Check: PASSED
- FOUND: src/app/core/store/reducers/task.reducer.ts
- FOUND: src/app/core/store/reducers/task.reducer.spec.ts
- FOUND: .planning/phases/02-ngrx-store/02-03-SUMMARY.md
- FOUND: commit 11e99be
- FOUND: commit 31e0e9b
