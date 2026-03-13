---
phase: 04-dynamic-widget-system
plan: "02"
subsystem: ui
tags: [angular, signals, angular-material, vitest, tdd, components]

# Dependency graph
requires:
  - phase: 04-dynamic-widget-system-01
    provides: WidgetStatus<T> type, widget patterns, signal input.required() established
  - phase: 03-component-layer
    provides: Angular signal patterns, ng test runner setup, TestBed patterns
provides:
  - TaskCountWidgetComponent — chip with status-coloured dot, input.required<WidgetStatus<number>>()
  - ProgressWidgetComponent — MatProgressBar determinate mode with percentage label
  - Unit tests WGT-02 (7 tests) and WGT-03 (6 tests) all passing
affects: [04-03, phase-05-testing]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "input.required<WidgetStatus<number>>() — same signal API as TaskCardComponent"
    - "provideAnimationsAsync() required in TestBed for MatProgressBar components"
    - "ComponentRef.setInput() for signal input in TestBed (not direct assignment)"

key-files:
  created:
    - src/app/features/board/task-count-widget/task-count-widget.component.ts
    - src/app/features/board/task-count-widget/task-count-widget.component.html
    - src/app/features/board/task-count-widget/task-count-widget.component.scss
    - src/app/features/board/task-count-widget/task-count-widget.component.spec.ts
    - src/app/features/board/progress-widget/progress-widget.component.ts
    - src/app/features/board/progress-widget/progress-widget.component.html
    - src/app/features/board/progress-widget/progress-widget.component.scss
    - src/app/features/board/progress-widget/progress-widget.component.spec.ts
  modified: []

key-decisions:
  - "ng test --include glob breaks for templateUrl/styleUrl components in this setup — full ng test --watch=false is the correct runner"
  - "ProgressWidgetComponent spec requires provideAnimationsAsync() for MatProgressBar — same as TaskCardComponent"

patterns-established:
  - "Presentational widget pattern: input.required<WidgetStatus<T>>() only, no store injection, no computed signals"
  - "Status colour via CSS class binding: [class]=\"'status-' + status().status\" — no ngClass needed"

requirements-completed: [WGT-02, WGT-03]

# Metrics
duration: 5min
completed: 2026-03-12
---

# Phase 4 Plan 02: Widget Components Summary

**Two presentational widget components: TaskCountWidgetComponent (coloured-dot chip) and ProgressWidgetComponent (MatProgressBar + percentage label) using input.required<WidgetStatus<number>>() signal API**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-12T19:58:34Z
- **Completed:** 2026-03-12T20:04:00Z
- **Tasks:** 2
- **Files modified:** 8 created

## Accomplishments
- Built `TaskCountWidgetComponent` — inline chip with coloured dot indicator matching status: neutral (grey), warning (amber), error (red), success (green)
- Built `ProgressWidgetComponent` — MatProgressBar in determinate mode with "Progress: [bar] N%" layout
- Both components use `input.required<WidgetStatus<number>>()` (signal API, not @Input decorator) — purely presentational, no store injection
- All 13 widget tests pass (7 TaskCount + 6 Progress); full suite at 70 tests / 11 files passing

## Task Commits

Each task was committed atomically:

1. **Task 1: TaskCountWidgetComponent** - `2cd9a8a` (feat)
2. **Task 2: ProgressWidgetComponent** - `5005e63` (feat)

**Plan metadata:** _(docs commit follows)_

## Files Created/Modified
- `src/app/features/board/task-count-widget/task-count-widget.component.ts` — Standalone component, input.required<WidgetStatus<number>>()
- `src/app/features/board/task-count-widget/task-count-widget.component.html` — Chip with status dot + label + value
- `src/app/features/board/task-count-widget/task-count-widget.component.scss` — Pill shape, CSS custom property surface, 4 status colours
- `src/app/features/board/task-count-widget/task-count-widget.component.spec.ts` — 7 tests: count renders, 4 status classes, edge values
- `src/app/features/board/progress-widget/progress-widget.component.ts` — Standalone component with MatProgressBarModule
- `src/app/features/board/progress-widget/progress-widget.component.html` — Progress: label + mat-progress-bar + N% span
- `src/app/features/board/progress-widget/progress-widget.component.scss` — Inline flex layout with min-width constraints
- `src/app/features/board/progress-widget/progress-widget.component.spec.ts` — 6 tests: bar present, determinate mode, %, edge values

## Decisions Made
- `ng test --watch=false` (full suite) used instead of `--include` glob — the `--include` flag fails for components with `templateUrl`/`styleUrl` in this Vitest/Angular build setup; confirmed in Phase 3-01 decision log
- `provideAnimationsAsync()` added to ProgressWidgetComponent TestBed setup — MatProgressBar requires it (same requirement as TaskCardComponent test)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- `ng test --include="**/progress-widget*"` failed with "No loader configured for .html/.scss" — this is a known limitation of the `--include` flag with templateUrl components in this project's build setup. Full suite run (`ng test --watch=false`) works correctly. Not a bug — documented in Phase 03-01 decisions.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Both widget components complete and tested — ready for Phase 4 Plan 03 (wiring widgets into ColumnComponent via DynamicWidgetOutletDirective)
- All WGT-02 and WGT-03 requirements satisfied
- No blockers

---
*Phase: 04-dynamic-widget-system*
*Completed: 2026-03-12*

## Self-Check: PASSED

- FOUND: src/app/features/board/task-count-widget/task-count-widget.component.ts
- FOUND: src/app/features/board/task-count-widget/task-count-widget.component.html
- FOUND: src/app/features/board/task-count-widget/task-count-widget.component.scss
- FOUND: src/app/features/board/task-count-widget/task-count-widget.component.spec.ts
- FOUND: src/app/features/board/progress-widget/progress-widget.component.ts
- FOUND: src/app/features/board/progress-widget/progress-widget.component.html
- FOUND: src/app/features/board/progress-widget/progress-widget.component.scss
- FOUND: src/app/features/board/progress-widget/progress-widget.component.spec.ts
- FOUND: .planning/phases/04-dynamic-widget-system/04-02-SUMMARY.md
- FOUND: commit 2cd9a8a (Task 1 - TaskCountWidgetComponent)
- FOUND: commit 5005e63 (Task 2 - ProgressWidgetComponent)
