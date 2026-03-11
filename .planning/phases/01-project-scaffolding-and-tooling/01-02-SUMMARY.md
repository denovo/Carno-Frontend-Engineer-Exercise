---
phase: 01-project-scaffolding-and-tooling
plan: "02"
subsystem: ui
tags: [angular, typescript, ngrx, vitest, data-models]

# Dependency graph
requires:
  - phase: 01-01
    provides: "@app/* TypeScript path alias, Angular 21 scaffold, Vitest test runner"
provides:
  - Board interface exported from @app/shared/models
  - Column interface exported from @app/shared/models
  - Task interface (createdAt/updatedAt as Date, no dueDate) exported from @app/shared/models
  - Priority enum (Low/Medium/High/Critical) exported from @app/shared/models
  - TaskAction discriminated union (move/add/remove/update) exported from @app/shared/models
  - Barrel index at src/app/shared/models/index.ts
  - Vitest test runner verified functional (Priority enum tests pass)
affects:
  - 02 (NGRX store entity adapter uses Task, Column, Board interfaces)
  - 03 (component layer imports models via @app/shared/models)
  - 04 (widget system uses TaskAction discriminated union)
  - 05 (Vitest test suite builds on models.spec.ts pattern)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pure TypeScript interfaces with no Angular dependencies — validatable via npx tsc --noEmit"
    - "Discriminated union with literal 'type' discriminant for compile-time exhaustive checking"
    - "Age-based overdue detection: createdAt Date field + OVERDUE_THRESHOLD_DAYS (no dueDate)"
    - "Barrel index pattern: all model types importable from single @app/shared/models path"
    - "Vitest tests import directly from source, no Angular TestBed needed for pure TS"

key-files:
  created:
    - src/app/shared/models/priority.enum.ts
    - src/app/shared/models/column.model.ts
    - src/app/shared/models/task.model.ts
    - src/app/shared/models/board.model.ts
    - src/app/shared/models/task-action.model.ts
    - src/app/shared/models/index.ts
    - src/app/shared/models/models.spec.ts
  modified: []

key-decisions:
  - "createdAt/updatedAt typed as Date (not string) to enable direct date arithmetic in Phase 3 computed signals"
  - "Task has no dueDate — overdue detection via age (createdAt + OVERDUE_THRESHOLD_DAYS constant)"
  - "TaskAction discriminated union includes compile-time _exhaustiveCheck function to prove exhaustiveness"
  - "index.ts pre-emptively exports TaskAction alongside core interfaces for single-import convenience"

patterns-established:
  - "Model isolation: each interface/enum in its own file, no circular dependencies"
  - "Barrel export: all model types re-exported from index.ts for clean @app/shared/models imports"
  - "Exhaustive switch pattern: _exhaustiveCheck helper documents discriminated union coverage"

requirements-completed: [MDL-01, MDL-02, MDL-03, MDL-04, MDL-05]

# Metrics
duration: 10min
completed: 2026-03-11
---

# Phase 1 Plan 02: Data Models Summary

**TypeScript Board/Column/Task/Priority/TaskAction interfaces with barrel index and Vitest runner verification — compile-time discriminated union exhaustiveness proven**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-11T08:00:00Z
- **Completed:** 2026-03-11T08:10:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Five model files defining the full data layer contract for NGRX store (Phase 2), components (Phase 3), and widgets (Phase 4)
- TaskAction discriminated union with compile-time exhaustive switch check proving all 4 variants are covered
- Vitest test runner verified functional: 4 tests pass (2 new Priority enum tests + 2 existing app tests)
- All types importable via single `import { Board, Column, Task, Priority, TaskAction } from '@app/shared/models'`

## Task Commits

Each task was committed atomically:

1. **Task 1: Priority enum, Board/Column/Task interfaces, barrel index** - `7ce6bb8` (feat)
2. **Task 2: TaskAction discriminated union and Priority enum unit test** - `6989fc2` (feat)

**Plan metadata:** (pending docs commit)

## Files Created/Modified
- `src/app/shared/models/priority.enum.ts` - Priority enum: Low/Medium/High/Critical with uppercase string values
- `src/app/shared/models/column.model.ts` - Column interface: id, name, order
- `src/app/shared/models/task.model.ts` - Task interface: createdAt/updatedAt as Date, no dueDate
- `src/app/shared/models/board.model.ts` - Board interface: id, name, columns array
- `src/app/shared/models/task-action.model.ts` - TaskAction discriminated union with 4 variants + exhaustive check
- `src/app/shared/models/index.ts` - Barrel re-export for all 5 model types
- `src/app/shared/models/models.spec.ts` - 2 Vitest tests validating Priority enum values

## Decisions Made
- `createdAt` and `updatedAt` are typed as `Date` (not `string`) to enable direct date arithmetic in Phase 3 computed signals without parsing overhead
- No `dueDate` field on Task — overdue detection is age-based via `OVERDUE_THRESHOLD_DAYS = 7` constant from `core/constants.ts`
- `_exhaustiveCheck` function embedded in `task-action.model.ts` documents discriminated union coverage and ensures TypeScript errors if a variant is ever removed

## Deviations from Plan

None - plan executed exactly as written.

The plan noted that `index.ts` should include `TaskAction` pre-emptively and that `task-action.model.ts` must exist before running `npx tsc --noEmit`. Both Task 1 and Task 2 files were created before the first tsc verification run, which succeeded cleanly.

## Issues Encountered
- Node version mismatch: system default is v22.11.0, Angular CLI requires >=22.12. Resolved by sourcing nvm and switching to v23.1.0 (as configured in `.nvmrc`). This was an expected condition documented in Plan 01-01 decisions.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All model interfaces are stable and ready for Phase 2 NGRX store implementation
- NGRX entity adapters will use `Task` with `id: string` as the entity key
- `TaskAction` discriminated union is the foundation for Phase 2 NGRX actions
- No blockers

---
*Phase: 01-project-scaffolding-and-tooling*
*Completed: 2026-03-11*

## Self-Check: PASSED

- All 7 model files exist in src/app/shared/models/
- Commit 7ce6bb8 confirmed in git log (Task 1)
- Commit 6989fc2 confirmed in git log (Task 2)
- npx tsc --noEmit exits 0
- npm test exits 0 (4 tests pass)
