---
phase: 05-testing-and-storybook
plan: 02
subsystem: testing
tags: [storybook, angular, a11y, csf3, stories, components]

# Dependency graph
requires:
  - phase: 04-dynamic-widget-system
    provides: TaskCountWidgetComponent, ProgressWidgetComponent, DynamicWidgetOutletDirective
  - phase: 03-component-layer
    provides: TaskCardComponent, BoardPageComponent

provides:
  - Storybook 10 with @storybook/addon-a11y configured
  - 4 TaskCardComponent CSF3 stories (Default, Expanded, Overdue, EditMode)
  - 3 TaskCountWidgetComponent CSF3 stories (Neutral, Warning, Error)
  - 3 ProgressWidgetComponent CSF3 stories (ZeroPercent, PartialProgress, Complete)
  - ng run petello:build-storybook exits 0 with all 10 stories

affects: [06-deployment, README]

# Tech tracking
tech-stack:
  added:
    - "@storybook/angular@10.2.17"
    - "storybook@10.2.17"
    - "@storybook/addon-a11y@10.2.17"
    - "@storybook/test@8.6.15 (for userEvent/within in play() functions)"
    - "@angular-devkit/build-angular@21.2.2 (Storybook peer dep)"
  patterns:
    - CSF3 story format with typed Meta/StoryObj from @storybook/angular
    - applicationConfig() decorator in preview.ts for provideAnimationsAsync()
    - play() function using @storybook/test userEvent to trigger internal signals
    - ng run petello:build-storybook via angular.json builder targets

key-files:
  created:
    - ".storybook/main.ts"
    - ".storybook/preview.ts"
    - "tsconfig.storybook.json"
    - "src/app/features/board/task-card/task-card.component.stories.ts"
    - "src/app/features/board/task-count-widget/task-count-widget.component.stories.ts"
    - "src/app/features/board/progress-widget/progress-widget.component.stories.ts"
  modified:
    - "angular.json (storybook + build-storybook architect targets)"
    - "package.json (storybook packages + ng run scripts)"

key-decisions:
  - "Storybook 10 (not 8 as planned): @storybook/angular@8 has hard peer dep on Angular <20; v10 supports Angular <22"
  - "Used ng run petello:build-storybook instead of npx storybook build — required by @storybook/angular v10 architecture"
  - "Installed @angular-devkit/build-angular@21 to satisfy Storybook peer dep (parallel to @angular/build)"
  - "Copied RegExpObjectSerializer.js from root webpack to @angular-devkit/build-angular nested webpack (5.105.2 was incomplete)"
  - "Created tsconfig.storybook.json to include .storybook/ dir in TypeScript compilation"
  - "Removed @storybook/addon-essentials: absorbed into storybook core in v9/v10; not available as separate v10 package"
  - "Priority enum used in stories (not string literal) to match actual type definition"
  - "Storybook 10 checkpoint: Tasks 1-3 auto-completed; Task 4 (human-verify) pending user review"

patterns-established:
  - "Storybook Angular stories use ng run via angular.json, not direct storybook CLI"
  - "EditMode story uses play() to click Edit button since isEditMode is signal() not input()"
  - "Widget stories use type cast 'as WidgetStatus<number>' for args compatibility"

requirements-completed:
  - TOOL-06
  - TOOL-07
  - TOOL-10

# Metrics
duration: 33min
completed: 2026-03-13
---

# Phase 5 Plan 02: Storybook Stories Summary

**Storybook 10 with a11y addon and 10 CSF3 stories for TaskCard, TaskCountWidget, and ProgressWidget components using Angular builder integration**

## Performance

- **Duration:** 33 min
- **Started:** 2026-03-13T09:39:43Z
- **Completed:** 2026-03-13T10:13:00Z
- **Tasks:** 3 of 4 complete (Task 4 = human-verify checkpoint — awaiting user)
- **Files modified:** 8

## Accomplishments

- Storybook 10 installed and configured with `@storybook/addon-a11y` and Angular builder integration
- 10 CSF3 stories written across 3 components: TaskCard (4), TaskCountWidget (3), ProgressWidget (3)
- `ng run petello:build-storybook` exits 0; all stories compile without errors
- 77 unit tests still pass after Storybook install

## Task Commits

1. **Task 1: Install Storybook 10 and configure .storybook/** - `3a1aede` (chore)
2. **Task 2: TaskCardComponent stories (4 stories)** - `37dc77a` (feat)
3. **Task 3: Widget stories (3+3)** - `e552876` (feat)

## Files Created/Modified

- `.storybook/main.ts` - Storybook config with stories glob and @storybook/addon-a11y
- `.storybook/preview.ts` - Global provideAnimationsAsync() decorator + a11y element param
- `tsconfig.storybook.json` - TypeScript config including .storybook/ dir for webpack compilation
- `angular.json` - Added storybook + build-storybook architect targets using @storybook/angular builders
- `package.json` - Added Storybook packages and ng run storybook/build-storybook scripts
- `src/app/features/board/task-card/task-card.component.stories.ts` - 4 CSF3 stories
- `src/app/features/board/task-count-widget/task-count-widget.component.stories.ts` - 3 CSF3 stories
- `src/app/features/board/progress-widget/progress-widget.component.stories.ts` - 3 CSF3 stories

## Decisions Made

- **Storybook 10 instead of 8:** Plan specified v8 but `@storybook/angular@8` hard-requires Angular <20. Angular 21 project requires Storybook 10 (supports Angular <22).
- **ng run integration:** `@storybook/angular@10` requires running via Angular builder (`ng run petello:build-storybook`) to get `angularBrowserTarget` context. Direct `npx storybook build` fails with `AngularLegacyBuildOptionsError`.
- **@angular-devkit/build-angular parallel install:** Storybook's Angular framework requires this as a peer dep (even in v10). Installed alongside `@angular/build` — no conflict since they're separate tools.
- **webpack RegExpObjectSerializer fix:** `@angular-devkit/build-angular@21` bundles webpack@5.105.2 which is missing `RegExpObjectSerializer.js`. Copied from root webpack@5.105.4 to unblock compilation.
- **Priority.Medium enum vs string literal:** Mock task fixtures use `Priority.Medium` (not `"MEDIUM"`) to match the actual TypeScript type.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Upgraded Storybook 8 → 10 due to Angular 21 peer dep incompatibility**
- **Found during:** Task 1 (Storybook install)
- **Issue:** `@storybook/angular@8` requires Angular 15–19 (peer dep `@angular/core: ">=15.0.0 < 20.0.0"`). Angular 21 fails peer dep resolution even with `--legacy-peer-deps`.
- **Fix:** Upgraded to `@storybook/angular@10.2.17` + `storybook@10.2.17` which support Angular up to 22.
- **Files modified:** package.json, package-lock.json
- **Verification:** `ng run petello:build-storybook` exits 0
- **Committed in:** 3a1aede (Task 1 commit)

**2. [Rule 3 - Blocking] Added tsconfig.storybook.json for .storybook/ TypeScript compilation**
- **Found during:** Task 1 (first Storybook build attempt)
- **Issue:** Storybook webpack compiler threw "preview.ts is missing from the TypeScript compilation" — root tsconfig.json uses project references, not include
- **Fix:** Created `tsconfig.storybook.json` extending root with explicit `include` covering `src/**/*.ts` and `.storybook/**/*.ts`
- **Files modified:** tsconfig.storybook.json, angular.json
- **Verification:** Build succeeds after adding tsConfig to angular.json builders
- **Committed in:** 3a1aede (Task 1 commit)

**3. [Rule 3 - Blocking] Fixed missing RegExpObjectSerializer.js in nested webpack**
- **Found during:** Task 1 (Storybook build with @angular-devkit/build-angular@21)
- **Issue:** webpack@5.105.2 nested in @angular-devkit/build-angular is missing RegExpObjectSerializer.js (incomplete npm package). Root webpack@5.105.4 has the file.
- **Fix:** Copied RegExpObjectSerializer.js from root webpack to nested webpack directory
- **Files modified:** node_modules/@angular-devkit/build-angular/node_modules/webpack/lib/serialization/RegExpObjectSerializer.js
- **Verification:** Module loads without error; storybook build completes
- **Committed in:** 3a1aede (Task 1 commit - not in git as it's node_modules)

**4. [Rule 1 - Bug] Removed @storybook/addon-essentials from main.ts addons**
- **Found during:** Task 1 (version mismatch error)
- **Issue:** `@storybook/addon-essentials` only exists in v8 (not v9/v10); listing it with Storybook 10 causes `NoMatchingExportError` version mismatch
- **Fix:** Removed from addons array in main.ts; essentials are bundled in storybook@10 core
- **Files modified:** .storybook/main.ts
- **Verification:** No version mismatch error; storybook builds successfully
- **Committed in:** 3a1aede (Task 1 commit)

---

**Total deviations:** 4 auto-fixed (3 blocking, 1 bug fix)
**Impact on plan:** All fixes required to make Storybook work with Angular 21. The core objective (10 CSF3 stories + a11y addon) is fully achieved. Storybook 10 is functionally equivalent to the planned Storybook 8 for story authoring purposes.

## Issues Encountered

- `@storybook/angular@8` init fails ERESOLVE with Angular 21 — resolved by upgrading to v10
- `@storybook/angular@10` requires Angular builder integration (not direct CLI) — resolved by adding architect targets to angular.json
- webpack@5.105.2 in @angular-devkit/build-angular missing file — resolved by copying from root webpack@5.105.4
- `@storybook/addon-essentials` no longer exists as standalone v9/v10 package — removed from config

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Storybook 10 running at http://localhost:6006 via `npm run storybook` (ng run petello:storybook)
- 10 stories ready for visual review: TaskCard (4) + TaskCountWidget (3) + ProgressWidget (3)
- A11y panel available in Storybook UI for accessibility analysis
- Task 4 checkpoint: user must run `npm run storybook` and visually verify all stories before Plan 03 begins

---
*Phase: 05-testing-and-storybook*
*Completed: 2026-03-13*

## Self-Check: PASSED

All created files verified present:
- FOUND: .storybook/main.ts
- FOUND: .storybook/preview.ts
- FOUND: tsconfig.storybook.json
- FOUND: task-card.component.stories.ts
- FOUND: task-count-widget.component.stories.ts
- FOUND: progress-widget.component.stories.ts
- FOUND: 05-02-SUMMARY.md

All task commits verified in git:
- FOUND: 3a1aede (chore: install Storybook 10)
- FOUND: 37dc77a (feat: TaskCard stories)
- FOUND: e552876 (feat: widget stories)
