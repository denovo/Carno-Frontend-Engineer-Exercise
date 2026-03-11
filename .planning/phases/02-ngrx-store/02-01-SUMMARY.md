---
phase: 02-ngrx-store
plan: "01"
subsystem: api
tags: [rxjs, ngrx-entity, mock-service, seed-data, vitest, tdd]

# Dependency graph
requires:
  - phase: 01-scaffold
    provides: Task/Board/Column/Priority interfaces and Priority enum from shared/models

provides:
  - DONE_COLUMN_ID constant (col-done) for selector tests
  - MOCK_BOARD, MOCK_COLUMNS, MOCK_TASKS seed data covering all 4 Priority values
  - TaskMockService with loadTasks/moveTask/addTask/updateTask/removeTask methods
  - Configurable latencyMs and shouldFail for deterministic unit testing

affects:
  - 02-ngrx-store/02-02 (actions already committed, uses Task type)
  - 02-ngrx-store/02-03 (reducer tests import MOCK_TASKS)
  - 02-ngrx-store/02-04 (selector tests use DONE_COLUMN_ID for selectCompletionRate)
  - 02-ngrx-store/02-05 (effects tests inject TaskMockService)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Import type for interfaces with isolatedModules (export type { Board })"
    - "Public latencyMs/shouldFail fields on mock service for test override"
    - "TDD: RED spec first, then GREEN implementation, then commit each phase"

key-files:
  created:
    - src/app/core/constants.ts (modified — added DONE_COLUMN_ID)
    - src/app/core/services/mock-data.ts
    - src/app/core/services/task-mock.service.ts
    - src/app/core/services/mock-data.spec.ts
    - src/app/core/services/task-mock.service.spec.ts
  modified:
    - src/app/shared/models/index.ts (export type fix for isolatedModules)

key-decisions:
  - "Export MOCK_COLUMNS and MOCK_TASKS separately (alongside MOCK_BOARD) for clean service imports"
  - "Public latencyMs and shouldFail fields (not private) so tests override without DI"
  - "addTask uses Omit<Task, 'id'|'createdAt'|'updatedAt'> parameter type for type safety"

patterns-established:
  - "Mock service pattern: public latencyMs=400, shouldFail=false; set latencyMs=0 in beforeEach"
  - "Seed data: deterministic Date objects (new Date('2026-01-01')) not new Date() for reproducibility"

requirements-completed: [NGR-14]

# Metrics
duration: 8min
completed: 2026-03-11
---

# Phase 2 Plan 01: Mock Service Layer Summary

**TaskMockService with 5 CRUD methods, configurable latency/failure injection, and MOCK_BOARD seed data covering all 4 Priority values across 3 columns**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-11T15:27:23Z
- **Completed:** 2026-03-11T15:35:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- DONE_COLUMN_ID constant exported from constants.ts (value 'col-done') for selector tests in Plan 04
- MOCK_BOARD/MOCK_COLUMNS/MOCK_TASKS seed with 6 tasks across 3 columns, all 4 Priority levels
- TaskMockService injectable with latencyMs=400/shouldFail=false (both public for test override)
- 14 tests passing (6 mock-data + 4 service + 2 model + 2 app)

## Task Commits

Each task was committed atomically (TDD: RED + GREEN per task):

1. **Task 1 RED: failing mock-data spec** - `1269fce` (test)
2. **Task 1 GREEN: DONE_COLUMN_ID + MOCK_BOARD seed** - `ffbabad` (feat)
3. **Task 2 RED: failing TaskMockService spec** - `8a56636` (test)
4. **Task 2 GREEN: TaskMockService implementation** - `c217247` (feat)

_Note: TDD tasks have multiple commits (test → feat)_

## Files Created/Modified
- `src/app/core/constants.ts` - Added DONE_COLUMN_ID = 'col-done' alongside existing OVERDUE_THRESHOLD_DAYS
- `src/app/core/services/mock-data.ts` - MOCK_COLUMNS, MOCK_TASKS (6 tasks, all 4 priorities), MOCK_BOARD
- `src/app/core/services/task-mock.service.ts` - Injectable service with 5 CRUD methods and configurable latency
- `src/app/core/services/mock-data.spec.ts` - 6 tests verifying seed data structure
- `src/app/core/services/task-mock.service.spec.ts` - 4 tests: loadTasks, shouldFail, moveTask, addTask
- `src/app/shared/models/index.ts` - Fixed export type for interfaces (TS1205 isolatedModules fix)

## Decisions Made
- Exported MOCK_COLUMNS and MOCK_TASKS separately alongside MOCK_BOARD for clean service imports (plan suggested this as the cleaner alternative)
- addTask parameter typed as `Omit<Task, 'id'|'createdAt'|'updatedAt'>` for strict type safety in spec
- Deterministic seed dates using `new Date('2026-01-01')` strings for reproducible test comparisons

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed isolatedModules TS1205 error in models/index.ts**
- **Found during:** Task 1 (RED phase — running tests after writing spec)
- **Issue:** `export { Board }` for interface types fails with `isolatedModules: true` (TS1205); requires `export type { Board }`
- **Fix:** Changed Board, Column, Task, TaskAction re-exports to `export type { ... }`; Priority enum kept as `export { }` since it's a value
- **Files modified:** src/app/shared/models/index.ts
- **Verification:** tsc --noEmit exits 0; all 14 tests pass
- **Committed in:** 1269fce (part of Task 1 RED commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Required fix — isolatedModules is enforced in tsconfig. Without this fix, all spec files importing interfaces via the barrel index would fail compilation.

## Issues Encountered
None — once the isolatedModules export type issue was resolved, both tasks proceeded cleanly.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All Phase 2 plans can now import MOCK_TASKS, MOCK_BOARD, DONE_COLUMN_ID, and TaskMockService
- Plan 02-03 (reducer): import MOCK_TASKS for initial state setup
- Plan 02-04 (selectors): import DONE_COLUMN_ID for selectCompletionRate tests
- Plan 02-05 (effects): inject TaskMockService and set latencyMs=0 + shouldFail for test scenarios

---
*Phase: 02-ngrx-store*
*Completed: 2026-03-11*

## Self-Check: PASSED

- FOUND: src/app/core/constants.ts
- FOUND: src/app/core/services/mock-data.ts
- FOUND: src/app/core/services/task-mock.service.ts
- FOUND: src/app/core/services/mock-data.spec.ts
- FOUND: src/app/core/services/task-mock.service.spec.ts
- FOUND: commit 1269fce (test RED Task 1)
- FOUND: commit ffbabad (feat GREEN Task 1)
- FOUND: commit 8a56636 (test RED Task 2)
- FOUND: commit c217247 (feat GREEN Task 2)
