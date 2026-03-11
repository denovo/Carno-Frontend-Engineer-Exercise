---
phase: 02-ngrx-store
plan: "02"
subsystem: api
tags: [ngrx, angular, typescript, store, actions]

# Dependency graph
requires:
  - phase: 01-02-data-models
    provides: Task interface, Priority enum from @app/shared/models
provides:
  - 15 NGRX action creators covering all task CRUD operations
  - moveTask action with previousColumnId for optimistic rollback support
  - updateTask using Update<Task> from @ngrx/entity for partial updates
affects: [02-03-mock-service, 02-04-reducer, 02-05-selectors, 02-06-effects]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "NGRX action type strings follow [Source] Verb Noun convention"
    - "Command/event action pairs: command dispatched by UI, event emitted by effects"
    - "Optimistic rollback data carried in command action props (previousColumnId in moveTask)"

key-files:
  created:
    - src/app/core/store/actions/task.actions.ts
  modified: []

key-decisions:
  - "moveTask carries previousColumnId in addition to newColumnId so effects can roll back without a separate selector call"
  - "moveTaskFailure also carries taskId and previousColumnId to enable targeted rollback in reducer"
  - "updateTask/updateTaskSuccess use Update<Task> from @ngrx/entity enabling partial entity updates without full object"
  - "addTask uses Omit<Task, 'id' | 'createdAt' | 'updatedAt'> — server assigns those fields"

patterns-established:
  - "Action type strings: [Source] Verb Noun — e.g. '[Board Page] Load Tasks', '[Task API] Add Task Success'"
  - "Failure actions always carry error: string for display/logging"
  - "Success actions carry the minimal data needed by the reducer (taskId vs full Task where appropriate)"

requirements-completed: [NGR-01, NGR-02, NGR-03, NGR-04, NGR-05, NGR-13]

# Metrics
duration: 1min
completed: 2026-03-11
---

# Phase 2 Plan 02: NGRX Actions Summary

**15 NGRX action creators across 5 CRUD operations with optimistic rollback props on moveTask using @ngrx/entity Update<Task>**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-11T15:27:25Z
- **Completed:** 2026-03-11T15:28:08Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Created src/app/core/store/actions/task.actions.ts with all 15 action creators
- moveTask carries previousColumnId and newColumnId enabling optimistic rollback in the reducer (NGR-10 readiness)
- updateTask and updateTaskSuccess use Update<Task> from @ngrx/entity for partial entity changes
- All type strings follow [Source] Verb Noun convention (NGR-13)
- File compiles without TypeScript errors (tsc --noEmit exits 0)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create task.actions.ts with all 15 action creators** - `ab38d3f` (feat)

**Plan metadata:** (pending docs commit)

## Files Created/Modified
- `src/app/core/store/actions/task.actions.ts` - 15 NGRX action creators for task CRUD (load, add, move, update, remove)

## Decisions Made
- moveTask carries previousColumnId in props (not retrieved from store in effects) so reducer can roll back columnId atomically without a selector call in the failure handler
- moveTaskFailure repeats taskId and previousColumnId for the same reason — the reducer needs both to revert the optimistic update
- addTask uses Omit<Task, "id" | "createdAt" | "updatedAt"> because those fields are server-assigned; the full Task is returned in addTaskSuccess
- updateTask/updateTaskSuccess use Update<Task> from @ngrx/entity — this is the standard pattern for partial entity updates with the entity adapter

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Actions file is the contract for all other store files (reducer, effects, selectors)
- Plans 02-03 (mock service), 02-04 (reducer), 02-05 (selectors), 02-06 (effects) can all proceed
- moveTask props are ready for optimistic update pattern in Plan 02-04 reducer

---
*Phase: 02-ngrx-store*
*Completed: 2026-03-11*

## Self-Check: PASSED
- FOUND: src/app/core/store/actions/task.actions.ts
- FOUND: .planning/phases/02-ngrx-store/02-02-SUMMARY.md
- FOUND: commit ab38d3f
