---
phase: 02-ngrx-store
plan: "05"
subsystem: api
tags: [ngrx, effects, rxjs, vitest, tdd, angular, optimistic-update, rollback]

# Dependency graph
requires:
  - phase: 02-01-mock-service
    provides: TaskMockService with configurable latencyMs/shouldFail for test injection
  - phase: 02-02-ngrx-actions
    provides: moveTask/moveTaskSuccess/moveTaskFailure/loadTasks/loadTasksSuccess/loadTasksFailure action creators
  - phase: 02-03-ngrx-reducer
    provides: TaskEffects class, ready for provideEffects() wiring in Plan 06
provides:
  - TaskEffects class with loadTasks$ and moveTask$ effects
  - Error handling: loadTasksFailure dispatched on service error
  - Optimistic rollback trigger: moveTaskFailure carries previousColumnId for reducer rollback
  - 3 effect tests covering failure path (NGR-12) — proves end-to-end rollback chain works
affects: [02-06-wiring, 03-components]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "inject() fields declared BEFORE createEffect() fields — Vitest DI safety (NGRX issue #4708)"
    - "catchError inside concatMap inner pipe — effect stream does NOT terminate on error"
    - "concatMap for mutation effects — prevents request reordering (not switchMap)"
    - "provideMockActions + ReplaySubject for Vitest-safe effect testing"
    - "firstValueFrom() to read single effect output — avoids subscribe callback anti-patterns"
    - "taskService.latencyMs = 0 in beforeEach — fast tests with no wall-clock delay"

key-files:
  created:
    - src/app/core/store/effects/task.effects.ts
    - src/app/core/store/effects/task.effects.spec.ts
  modified: []

key-decisions:
  - "inject() fields declared before createEffect() fields to avoid Vitest NGRX issue #4708 where actions$ is undefined during class field initialization"
  - "catchError scoped inside concatMap inner pipe — ensures effect stream survives individual failures (outer pipe stays alive)"
  - "concatMap chosen over switchMap — mutation effects must not cancel in-flight requests; concatMap queues them"
  - "new TaskMockService() in tests — service has no constructor params (no inject() internally), so direct instantiation works without TestBed.inject()"

patterns-established:
  - "Effect field declaration order: inject() fields first, createEffect() fields after — mandatory for Vitest compatibility"
  - "TestBed.configureTestingModule with provideMockActions(() => actions$) for effect specs"
  - "Set latencyMs = 0 before actions$.next() for synchronous effect execution in tests"

requirements-completed: [NGR-12]

# Metrics
duration: 3min
completed: 2026-03-11
---

# Phase 2 Plan 05: NGRX Effects Summary

**TaskEffects with loadTasks$ and moveTask$ using concatMap, inner-pipe catchError, and 3 Vitest tests proving the moveTaskFailure rollback chain carries previousColumnId**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-11T15:37:55Z
- **Completed:** 2026-03-11T15:40:56Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created task.effects.ts: TaskEffects with loadTasks$ and moveTask$ effects, inject() fields declared before createEffect() fields (Vitest DI safety), catchError inside inner pipe
- Created task.effects.spec.ts: 3 tests pass — moveTaskFailure carries previousColumnId (NGR-12 rollback proof), moveTaskSuccess carries taskId, loadTasksFailure fires on service error
- All 30 tests pass across 7 test files (3 new effects tests + 27 prior)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create task.effects.ts with loadTasks$ and moveTask$ effects** - `628c49e` (feat)
2. **Task 2: Create task.effects.spec.ts covering failure paths** - `977ce68` (feat)

**Plan metadata:** (pending docs commit)

## Files Created/Modified
- `src/app/core/store/effects/task.effects.ts` - TaskEffects class with 2 async effects, Vitest-safe field ordering
- `src/app/core/store/effects/task.effects.spec.ts` - 3 effect tests using TestBed + provideMockActions

## Decisions Made
- inject() fields must precede createEffect() fields: Vitest initializes class fields in declaration order; createEffect() executes immediately during instantiation and accesses `this.actions$`. Declaring after the effect leaves it undefined (NGRX issue #4708).
- catchError inside concatMap inner pipe: if catchError were in the outer pipe, the first error would terminate the entire effect stream — no further actions would be processed.
- concatMap over switchMap: switchMap cancels in-flight requests, which would silently drop move operations. concatMap queues them, ensuring every user action results in a service call.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Plan 06 (wiring) can proceed: TaskEffects is ready for provideEffects([TaskEffects]) in the store config
- Phase 3 (components) can use moveTask dispatch — the full optimistic update + rollback chain is implemented and tested
- NGR-12 (failure path coverage) fully satisfied

---
*Phase: 02-ngrx-store*
*Completed: 2026-03-11*
