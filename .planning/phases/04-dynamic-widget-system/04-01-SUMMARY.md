---
phase: 04-dynamic-widget-system
plan: "01"
subsystem: ui
tags: [angular, directives, signals, rxjs, viewcontainerref, vitest, tdd]

# Dependency graph
requires:
  - phase: 03-component-layer
    provides: Angular signal patterns, inject() DI safety pattern, ng test runner setup
provides:
  - WidgetStatus<T>, InputBinding<T>, WidgetConfig<C> generic types in widget.models.ts
  - DynamicWidgetOutletDirective with static/observable/signal input binding and output forwarding
  - WIDGET_TASK_COUNT_WARNING and WIDGET_TASK_COUNT_ERROR constants
  - Unit tests DYN-01 through DYN-09 all passing
affects: [04-02, 04-03, phase-05-testing]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "untracked() wrapper in outer effect() when inner calls create nested effect() — prevents NG0602"
    - "inject() fields declared before all other class fields — Vitest DI safety (NGRX #4708)"
    - "takeUntilDestroyed(destroyRef) for observable cleanup in attribute directives"
    - "effect(..., { injector }) for signal bindings created outside injection context"

key-files:
  created:
    - src/app/core/models/widget.models.ts
    - src/app/core/directives/dynamic-widget-outlet.directive.ts
    - src/app/core/directives/dynamic-widget-outlet.directive.spec.ts
  modified:
    - src/app/core/constants.ts

key-decisions:
  - "untracked() wraps renderOne() calls inside config effect to escape reactive context — Angular 21 prohibits nested effect() (NG0602)"
  - "Observable imported from 'rxjs' in widget.models.ts, not '@angular/core' (which re-exports but does not declare it)"
  - "Directive template uses 'appDynamicWidgetOutlet' plain attribute (not [appDynamicWidgetOutlet] property binding) for attribute directive application"
  - "fakeAsync/tick() not used in spec — not available without zone-testing.js; async/await with whenStable() used instead for DYN-06"

patterns-established:
  - "Nested effect prevention: untracked() wrapper in parent effect when children may call effect()"
  - "Attribute directive testing: host component with standalone: true imports [Directive] and uses plain attribute in template"

requirements-completed: [DYN-01, DYN-02, DYN-03, DYN-04, DYN-05, DYN-06, DYN-07, DYN-08, DYN-09, WGT-01, WGT-05]

# Metrics
duration: 15min
completed: 2026-03-12
---

# Phase 4 Plan 01: Dynamic Widget Outlet Summary

**DynamicWidgetOutletDirective with ViewContainerRef rendering, static/observable/signal input binding, output forwarding, and full lifecycle cleanup — 8 unit tests passing**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-12T19:49:00Z
- **Completed:** 2026-03-12T19:55:30Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Built `WidgetStatus<T>`, `InputBinding<T>`, `WidgetConfig<C>` generic type system for the dynamic widget API
- Implemented `DynamicWidgetOutletDirective` rendering components from a runtime config array using `ViewContainerRef.createComponent()`
- Wired all three input binding types: static (synchronous setInput), observable (takeUntilDestroyed subscription), signal (effect with injector)
- Fixed Angular 21 NG0602 restriction by wrapping `renderOne()` in `untracked()` inside the config effect
- All 8 unit tests pass covering DYN-01 through DYN-09

## Task Commits

Each task was committed atomically:

1. **Task 1: Widget types, constants, and test scaffolds** - `9e450b7` (test) — committed in previous session
2. **Task 2: DynamicWidgetOutletDirective implementation** - `74486d4` (feat)

**Plan metadata:** _(docs commit follows)_

_Note: Task 1 RED commit was `9e450b7` from a prior session; Task 2 GREEN commit is `74486d4`._

## Files Created/Modified
- `src/app/core/models/widget.models.ts` — WidgetStatus<T>, InputBinding<T>, WidgetConfig<C> discriminated union types
- `src/app/core/constants.ts` — Added WIDGET_TASK_COUNT_WARNING=10 and WIDGET_TASK_COUNT_ERROR=20
- `src/app/core/directives/dynamic-widget-outlet.directive.ts` — Full directive implementation (108 lines)
- `src/app/core/directives/dynamic-widget-outlet.directive.spec.ts` — 8 unit tests with TestBed and FakeWidgetComponent

## Decisions Made
- `untracked()` wraps `renderOne()` calls in the config `effect()` — Angular 21 raises NG0602 if `effect()` is called within a reactive context; this is the prescribed escape hatch
- `Observable` imported from `'rxjs'` in `widget.models.ts` — `@angular/core` re-exports it but TypeScript couldn't resolve it as a named export in isolatedModules mode
- Directive template must use `appDynamicWidgetOutlet` (plain attribute), not `[appDynamicWidgetOutlet]` (property binding) — the selector `[appDynamicWidgetOutlet]` matches the attribute presence, not a property
- `fakeAsync`/`tick()` not available without `zone-testing.js`; DYN-06 (signal effect test) uses `async/await` with `fixture.whenStable()` instead

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Observable import in widget.models.ts**
- **Found during:** Task 2 (first test run)
- **Issue:** `import type { Observable, Signal, Type } from "@angular/core"` — Observable is not exported from @angular/core in isolatedModules mode (TS2459)
- **Fix:** Changed to `import type { Observable } from "rxjs"` — separate import for rxjs vs Angular core types
- **Files modified:** src/app/core/models/widget.models.ts
- **Verification:** `npx tsc --noEmit` passes with no errors
- **Committed in:** 74486d4

**2. [Rule 1 - Bug] Fixed attribute directive template binding syntax**
- **Found during:** Task 2 (first test run)
- **Issue:** Template used `[appDynamicWidgetOutlet]` (property binding) which Angular couldn't bind since attribute directives match on attribute presence, not property
- **Fix:** Changed to `appDynamicWidgetOutlet` (plain attribute) in TestHostComponent template
- **Files modified:** src/app/core/directives/dynamic-widget-outlet.directive.spec.ts
- **Verification:** Angular compiler error NG8002 resolved; build passes
- **Committed in:** 74486d4

**3. [Rule 1 - Bug] Fixed NG0602 nested effect() error with untracked()**
- **Found during:** Task 2 (DYN-06 test failure)
- **Issue:** Angular 21 prohibits calling `effect()` from within a reactive context; `renderOne()` was called inside the config `effect()`, and when processing signal bindings it tried to create a nested `effect()` — throwing NG0602
- **Fix:** Wrapped the `vcr.clear()` + `renderOne()` loop in `untracked()` to escape the reactive context while keeping configs() read in the tracking scope
- **Files modified:** src/app/core/directives/dynamic-widget-outlet.directive.ts
- **Verification:** DYN-06 test passes; all 8 tests pass
- **Committed in:** 74486d4

---

**Total deviations:** 3 auto-fixed (all Rule 1 bugs)
**Impact on plan:** All fixes required for correctness. No scope creep. The untracked() fix is an Angular 21-specific requirement not present in the plan's research skeleton.

## Issues Encountered
- `fakeAsync`/`tick()` in spec required `zone-testing.js` which is not configured in the @analogjs/vitest-angular setup. Rewrote DYN-05, DYN-06, DYN-09 tests to be synchronous or use `async/await` with `whenStable()`. DYN-09 became synchronous (Subject.observed check).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- DynamicWidgetOutletDirective is complete and tested — ready for Phase 4 Plan 02 (ColumnStatsWidgetComponent)
- All DYN requirements satisfied; WGT-01 and WGT-05 compile-time generic constraints verified
- No blockers

---
*Phase: 04-dynamic-widget-system*
*Completed: 2026-03-12*

## Self-Check: PASSED

- FOUND: src/app/core/models/widget.models.ts
- FOUND: src/app/core/directives/dynamic-widget-outlet.directive.ts
- FOUND: src/app/core/directives/dynamic-widget-outlet.directive.spec.ts
- FOUND: .planning/phases/04-dynamic-widget-system/04-01-SUMMARY.md
- FOUND: commit 9e450b7 (Task 1 - types + stubs)
- FOUND: commit 74486d4 (Task 2 - directive + real tests)
