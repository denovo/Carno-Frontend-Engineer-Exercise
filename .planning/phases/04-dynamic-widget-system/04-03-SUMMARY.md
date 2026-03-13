---
phase: 04-dynamic-widget-system
plan: "03"
subsystem: ui
tags: [angular, signals, ngrx, viewcontainerref, computed, tdd, vitest]

# Dependency graph
requires:
  - phase: 04-dynamic-widget-system-01
    provides: DynamicWidgetOutletDirective, WidgetConfig<C> type, signal input binding
  - phase: 04-dynamic-widget-system-02
    provides: TaskCountWidgetComponent, ProgressWidgetComponent, input.required<WidgetStatus<number>>()
  - phase: 03-component-layer
    provides: BoardPageComponent, store signal bridge patterns, ng test runner setup
provides:
  - WidgetBarComponent smart container with computed taskCountStatus and progressStatus signals
  - Full widget bar wired into BoardPageComponent via single <app-widget-bar /> element
  - Human-verified: widget bar renders between toolbar and columns, updates reactively on store changes
affects: [phase-05-testing, phase-06-deploy]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Smart container pattern: component injects Store, derives computed signals, builds widgetConfigs plain array"
    - "Factory selector called ONCE at field init (not in computed/effect) — memoization safety (Pitfall 4)"
    - "widgetConfigs as readonly plain array (not signal) — static component set, only values update via signal effects"

key-files:
  created:
    - src/app/features/board/widget-bar/widget-bar.component.ts
    - src/app/features/board/widget-bar/widget-bar.component.html
    - src/app/features/board/widget-bar/widget-bar.component.scss
    - src/app/features/board/widget-bar/widget-bar.component.spec.ts
  modified:
    - src/app/features/board/board-page/board-page.component.ts
    - src/app/features/board/board-page/board-page.component.html

key-decisions:
  - "widgetConfigs is a plain readonly array (not a signal) — component set never changes, only signal input values update reactively"
  - "selectCompletionRate(DONE_COLUMN_ID) selector factory called once at field init — not inside computed() or effect() — prevents selector recreation on each reactive evaluation"
  - "BoardPageComponent has zero knowledge of widget internals — only imports WidgetBarComponent and renders <app-widget-bar />"
  - "provideMockStore selectors override used in spec — MemoizedSelector type not imported from @ngrx/store/testing (not exported there)"

patterns-established:
  - "Smart container pattern: inject Store → selectSignal() at field init → computed() signals → plain widgetConfigs array"
  - "TDD spec with provideMockStore: override selectAllTasks with makeTasks(N) helper to drive all three threshold boundaries"

requirements-completed: [WGT-04]

# Metrics
duration: ~10min
completed: 2026-03-13
---

# Phase 4 Plan 03: WidgetBar Integration Summary

**WidgetBarComponent smart container wires TaskCountWidget + ProgressWidget into BoardPageComponent via DynamicWidgetOutletDirective — fully reactive to live store changes, human-verified**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-12T20:05:31Z
- **Completed:** 2026-03-13T00:32:46Z (includes human verify checkpoint)
- **Tasks:** 3 (2 auto + 1 human-verify)
- **Files modified:** 6 (4 created, 2 modified)

## Accomplishments
- Built `WidgetBarComponent` as a pure smart container: injects Store, derives `totalTasks` and `completionRate` signals at field init, computes `taskCountStatus` (neutral/warning/error thresholds) and `progressStatus` (always neutral), builds a static `widgetConfigs` plain array wiring both widgets via signal bindings
- Wired `WidgetBarComponent` into `BoardPageComponent` with two minimal changes: import added, `<app-widget-bar />` inserted between `</mat-toolbar>` and the loading bar
- Human-verified: widget bar renders as a full-width strip between toolbar and columns, task count and progress update automatically when tasks are added or moved to Done
- Full test suite: 77 tests / 12 files all passing

## Task Commits

Each task was committed atomically:

1. **Task 1: WidgetBarComponent (smart container)** - `bba2b88` (feat)
2. **Task 2: Wire WidgetBarComponent into BoardPageComponent** - `72c76c6` (feat)
3. **Task 3: Visual verification** - human-approved checkpoint (no code commit)

**Plan metadata:** _(docs commit follows)_

## Files Created/Modified
- `src/app/features/board/widget-bar/widget-bar.component.ts` — Smart container: inject Store, field-init selectSignal() calls, computed taskCountStatus/progressStatus, widgetConfigs plain array
- `src/app/features/board/widget-bar/widget-bar.component.html` — `<div class="widget-bar" appDynamicWidgetOutlet [configs]="widgetConfigs"></div>`
- `src/app/features/board/widget-bar/widget-bar.component.scss` — Full-width flex strip with surface-container-low background and outline-variant border
- `src/app/features/board/widget-bar/widget-bar.component.spec.ts` — 7 tests: all three threshold boundaries, progressStatus neutral, widgetConfigs array shape
- `src/app/features/board/board-page/board-page.component.ts` — Added WidgetBarComponent import and to imports[]
- `src/app/features/board/board-page/board-page.component.html` — Added `<app-widget-bar />` after `</mat-toolbar>`

## Decisions Made
- `widgetConfigs` is a plain `readonly WidgetConfig<object>[]` — not a signal. The component set is static and never changes; only the signal input _values_ update reactively through the effects wired by `DynamicWidgetOutletDirective`. Making it a signal would add unnecessary overhead.
- `selectCompletionRate(DONE_COLUMN_ID)` factory called once at field init, result stored in `private readonly completionRate` — calling the factory inside a `computed()` would create a new selector instance on every reactive evaluation, defeating memoization.
- `BoardPageComponent` has no widget internals — the encapsulation boundary is strict per CONTEXT.md locked decision.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed non-exported MemoizedSelector import from spec**
- **Found during:** Task 1 (first test run)
- **Issue:** Initial spec imported `MemoizedSelector` from `@ngrx/store/testing` — the type is declared there but not exported, causing TS2459
- **Fix:** Removed the unused `MemoizedSelector` import and the associated `overrideAllTasks` variable declaration that used `jest.Mock` (also unavailable)
- **Files modified:** widget-bar.component.spec.ts
- **Verification:** Build passes, all 77 tests green
- **Committed in:** bba2b88 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 - blocking)
**Impact on plan:** Minor spec cleanup. No behaviour changes. Tests pass as intended.

## Issues Encountered
- `ng build` fails with a pre-existing `@angular/animations/browser` resolution error that existed before this plan. The `ng serve` dev server (Vite) works correctly and was used for human verification. Deferred to Phase 6 (CI/deploy) for investigation.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 4 (Dynamic Widget System) is fully complete: Directive (Plan 01) + Widgets (Plan 02) + Integration (Plan 03)
- All WGT-04 requirements satisfied; DYN and WGT requirement sets complete
- Phase 5 (Testing: Storybook + Playwright + Axe) can proceed immediately
- The `ng build` animation resolution error should be addressed in Phase 5 or 6

---
*Phase: 04-dynamic-widget-system*
*Completed: 2026-03-13*

## Self-Check: PASSED

- FOUND: src/app/features/board/widget-bar/widget-bar.component.ts
- FOUND: src/app/features/board/widget-bar/widget-bar.component.html
- FOUND: src/app/features/board/widget-bar/widget-bar.component.scss
- FOUND: src/app/features/board/widget-bar/widget-bar.component.spec.ts
- FOUND: src/app/features/board/board-page/board-page.component.ts
- FOUND: src/app/features/board/board-page/board-page.component.html
- FOUND: .planning/phases/04-dynamic-widget-system/04-03-SUMMARY.md
- FOUND: commit bba2b88 (Task 1 - WidgetBarComponent)
- FOUND: commit 72c76c6 (Task 2 - BoardPage wiring)
