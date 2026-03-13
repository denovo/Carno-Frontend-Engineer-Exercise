# Phase 5: Testing and Storybook - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Install Storybook and Playwright, verify existing Vitest coverage passes, write Storybook stories for TaskCardComponent and widget components, write Playwright E2E tests (happy path + rollback), and set up the GitHub Actions CI pipeline (lint → test → build). Vercel deployment wiring is deferred to Phase 6.

</domain>

<decisions>
## Implementation Decisions

### Vitest coverage
- TOOL-03, TOOL-04, TOOL-05 are already satisfied by specs written in Phases 2–4
- Phase 5 runs the full suite (`ng test --watch=false`) as a smoke check — no new unit tests required
- No additional edge-case tests beyond what already exists

### Storybook setup
- Storybook 8.x with Angular builder (Vite) — `npx storybook@8 init`
- `@storybook/addon-a11y` installed — Axe violations appear as **warnings only** in the A11y panel (non-blocking, never fail the build)
- CSF3 story format throughout

### Story data approach
- All stories use **direct input bindings** — no NgRx store mock in stories
- TaskCardComponent and widget components are presentational — pass mock Task/WidgetStatus objects as inputs directly
- No `provideMockStore` or store decorators needed

### TaskCardComponent stories (TOOL-06)
- 4 stories: **default** (collapsed, Medium priority), **expanded** (body visible), **high-priority/overdue** (Critical priority, old createdAt triggering overdue signal), **edit mode** (isEditMode signal true)
- Each story maps to a visible SIG requirement — good interview talking point

### Widget stories (TOOL-07)
- `TaskCountWidgetComponent`: 3 stories — neutral (≤10 tasks), warning (11–20), error (>20)
- `ProgressWidgetComponent`: 3 stories — 0%, 62%, 100%
- Direct `WidgetStatus<number>` input binding in each story

### Playwright E2E (TOOL-08)
- Full E2E browser tests (not component tests) — tests the real app in a browser
- Dev server via `webServer` config in `playwright.config.ts` — Playwright starts `ng serve` automatically
- **2 test specs:**
  1. Happy path: open board → click "+ Add Task" → fill form → submit → verify task in correct column → move via select → verify task in new column
  2. Rollback path: navigate to `/?failNextMove=1` → move a task → verify task stays in original column after rollback
- The `?failNextMove=1` query param is read by the app at startup and sets `TaskMockService.shouldFail = true` for the next move operation only
- Chromium only in CI (no cross-browser matrix for a take-home exercise)

### GitHub Actions CI pipeline (TOOL-09 — partial)
- Phase 5 delivers: `lint → test → build → e2e` workflow file (`.github/workflows/ci.yml`)
- Vercel deployment step is deferred to Phase 6
- E2E job runs after build job, uses `ng build` output + `npx serve` or Angular's preview server
- Node 23.x, pnpm/npm install cached
- Storybook build step included (fail build if Storybook breaks)

### Claude's Discretion
- Exact Playwright selector strategy (data-testid attributes vs semantic selectors)
- Story decorator setup for Angular providers (e.g., BrowserAnimationsModule)
- CI job matrix (whether to use job artifacts between steps or re-build)
- Exact Storybook port and preview configuration

</decisions>

<specifics>
## Specific Ideas

- The `?failNextMove=1` query param approach is an interview talking point: "controlled test seam without extra infrastructure"
- Stories should be functional, not styled showcases — minimal story description, focus on component states
- `ng test --watch=false` is the correct runner (bare `vitest` lacks Angular compiler plugin)

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `TaskMockService`: `latencyMs` and `shouldFail` public fields — can be overridden directly without DI for test seams
- `task.selectors.spec.ts`, `task.reducer.spec.ts`, `task.effects.spec.ts`: already complete — no changes needed
- `TaskCardComponent` at `src/app/features/board/task-card/` — standalone, uses `input()` signals — straightforward to wrap in Storybook
- `TaskCountWidgetComponent`, `ProgressWidgetComponent` — standalone presentational, take `WidgetStatus<number>` input — trivial to write stories for

### Established Patterns
- `ng test --watch=false` — correct Vitest runner with Angular compiler (bare `npx vitest run` lacks @app/ alias resolution)
- `provideAnimationsAsync()` required in TestBed for MatProgressBar components — will also be needed in Storybook decorator
- All components are standalone — no NgModules to import in story decorators
- OXfmt double-quote style applies to all new `.ts` files

### Integration Points
- `BoardPageComponent` is the integration point for E2E tests — it's the root view containing toolbar, widget bar, and columns
- `TaskMockService` is the seam for E2E error simulation via query param
- `angular.json` test architect block — already configured for Vitest; no changes needed for unit tests

</code_context>

<deferred>
## Deferred Ideas

- Vercel deployment step in GitHub Actions — Phase 6
- Cross-browser Playwright matrix (Firefox, Safari) — out of scope for take-home exercise
- Storybook Chromatic visual diffing — out of scope

</deferred>

---

*Phase: 05-testing-and-storybook*
*Context gathered: 2026-03-13*
