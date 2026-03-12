---
phase: 03-component-layer
plan: "03"
subsystem: ui
tags: [angular, ngrx, signals, material, board, crud]

# Dependency graph
requires:
  - phase: 03-01
    provides: TaskCardComponent with signal inputs and MoveEvent output
  - phase: 03-02
    provides: ColumnComponent, TaskFormComponent, ConfirmDialogComponent
  - phase: 02-ngrx-store
    provides: store actions, selectors, effects, optimistic moveTask pattern
provides:
  - BoardPageComponent smart container wiring all NGRX store interactions
  - Full CRUD board UI — create, edit, delete, move tasks
  - Signal bridge pattern (SIG-07/SIG-08) implemented in production component
  - App shell simplified to pure RouterOutlet; toolbar embedded in BoardPageComponent
affects: [04-dynamic-widgets, 05-testing, 06-deploy]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Signal bridge: store.selectSignal() called at class init, unwrapped in template before passing as input() to dumb components"
    - "Smart/dumb split: all store.dispatch() calls isolated to BoardPageComponent (APP-08)"
    - "Optimistic feedback: local pendingTaskIds signal updated on dispatch, cleared via Actions stream listener"
    - "Per-column signal map: tasksByColumn Record created from MOCK_COLUMNS at init — no factory selector called in template"

key-files:
  created:
    - src/app/features/board/board-page/board-page.component.ts
    - src/app/features/board/board-page/board-page.component.html
    - src/app/features/board/board-page/board-page.component.scss
  modified:
    - src/app/app.ts
    - src/app/app.html
    - src/app/app.spec.ts

key-decisions:
  - "Toolbar belongs inside BoardPageComponent, not AppComponent — AppComponent cannot easily pass callbacks to routed child; board toolbar is board-specific"
  - "tasksByColumn Record created at class init using Object.fromEntries — prevents factory selector being called inside template change-detection cycle"
  - "app.ts reduced to bare RouterOutlet shell — all board UI state and layout owned by BoardPageComponent"
  - "pendingTaskIds managed as local signal (not store state) — optimistic move feedback is UI-only transient state"
  - "takeUntilDestroyed(destroyRef) on Actions stream subscription — prevents memory leak on component destroy"

patterns-established:
  - "Signal bridge pattern (SIG-07 + SIG-08): store.selectSignal() in smart container, unwrapped value passed as input() to dumb components"
  - "All dispatch calls in single smart container; dumb components emit events via output() only"
  - "Actions stream listener for side effects (snackbar on failure) — not in effect or reducer"

requirements-completed: [APP-01, APP-02, APP-03, APP-04, APP-05, APP-06, APP-07, APP-08, SIG-07, SIG-08]

# Metrics
duration: ~45min
completed: 2026-03-12
---

# Phase 3 Plan 03: BoardPageComponent Summary

**BoardPageComponent smart container with full NGRX signal bridge (SIG-07/SIG-08), all CRUD handlers, Material toolbar, and human-verified board UI**

## Performance

- **Duration:** ~45 min
- **Started:** 2026-03-12
- **Completed:** 2026-03-12
- **Tasks:** 3 (2 auto + 1 human-verify checkpoint, approved)
- **Files modified:** 6

## Accomplishments

- Implemented BoardPageComponent as the sole smart container — all five NGRX dispatch calls (loadTasks, addTask, moveTask, updateTask, removeTask) live here, zero dispatch in dumb components (APP-08)
- Signal bridge pattern demonstrated: store.selectSignal() maps NGRX selectors to Angular signals at class init; unwrapped values flow into ColumnComponent via input() props (SIG-07, SIG-08)
- Optimistic move feedback via local pendingTaskIds signal — updated on dispatch, cleared via Actions stream listener (moveTaskSuccess/moveTaskFailure) with MatSnackBar toast on failure
- App shell simplified to pure RouterOutlet; Material toolbar with "Petello Board" title and global "+ Add Task" button embedded in BoardPageComponent
- Human verified: board renders three columns with seed tasks, all CRUD operations functional

## Task Commits

Each task was committed atomically:

1. **Task 1: BoardPageComponent smart store container** - `6bcfb51` (feat)
2. **Task 2: App shell — toolbar in BoardPageComponent, minimal app.ts/app.html** - `438b3eb`, `ba7e4d6` (feat, fix)
3. **Task 3: Visual verification checkpoint** - APPROVED by user

## Files Created/Modified

- `src/app/features/board/board-page/board-page.component.ts` - Smart container: store wiring, signal bridge, all CRUD handlers, pendingTaskIds signal, Actions stream listener
- `src/app/features/board/board-page/board-page.component.html` - Board layout with mat-toolbar, progress bar, and @for column loop passing signal values as inputs
- `src/app/features/board/board-page/board-page.component.scss` - Board layout (flex columns), sticky toolbar and loading bar
- `src/app/app.ts` - Simplified to pure RouterOutlet shell, removed unused signal import and title field
- `src/app/app.html` - Reduced to `<router-outlet />`
- `src/app/app.spec.ts` - Updated to match minimal app shell without h1 element

## Decisions Made

- Toolbar embedded in BoardPageComponent rather than AppComponent — routed child cannot easily receive callbacks from parent; board-specific actions belong with board component
- tasksByColumn Record built at class init via Object.fromEntries — prevents factory selector called inside template change-detection cycle (anti-pattern)
- pendingTaskIds kept as local signal (not store state) — transient UI-only feedback does not belong in the global store
- takeUntilDestroyed(destroyRef) on Actions stream subscription — canonical Angular 16+ memory-safe subscription cleanup

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None significant. The app.spec.ts test for the app shell needed updating after Task 2 removed the default `<h1>` element — this was a planned consequence of simplifying the app shell and was committed in `ba7e4d6`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Full board CRUD UI complete and human-verified — ready for Phase 4 (DynamicWidgetOutletDirective + widget system)
- Signal bridge pattern established; Phase 4 widget components can follow the same input() prop pattern
- All existing unit tests passing after Phase 3 changes

---
*Phase: 03-component-layer*
*Completed: 2026-03-12*
