# Phase 5: Testing and Storybook - Research

**Researched:** 2026-03-13
**Domain:** Vitest (Angular), Storybook 8 (Angular), Playwright E2E, GitHub Actions CI
**Confidence:** HIGH (verified by running test suite + official docs)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Vitest coverage**
- TOOL-03, TOOL-04, TOOL-05 are already satisfied by specs written in Phases 2–4
- Phase 5 runs the full suite (`ng test --watch=false`) as a smoke check — no new unit tests required
- No additional edge-case tests beyond what already exists

**Storybook setup**
- Storybook 8.x with Angular builder (Vite) — `npx storybook@8 init`
- `@storybook/addon-a11y` installed — Axe violations appear as warnings only in the A11y panel (non-blocking, never fail the build)
- CSF3 story format throughout

**Story data approach**
- All stories use direct input bindings — no NgRx store mock in stories
- TaskCardComponent and widget components are presentational — pass mock Task/WidgetStatus objects as inputs directly
- No `provideMockStore` or store decorators needed

**TaskCardComponent stories (TOOL-06)**
- 4 stories: default (collapsed, Medium priority), expanded (body visible), high-priority/overdue (Critical priority, old createdAt triggering overdue signal), edit mode (isEditMode signal true)
- Each story maps to a visible SIG requirement — good interview talking point

**Widget stories (TOOL-07)**
- `TaskCountWidgetComponent`: 3 stories — neutral (≤10 tasks), warning (11–20), error (>20)
- `ProgressWidgetComponent`: 3 stories — 0%, 62%, 100%
- Direct `WidgetStatus<number>` input binding in each story

**Playwright E2E (TOOL-08)**
- Full E2E browser tests (not component tests) — tests the real app in a browser
- Dev server via `webServer` config in `playwright.config.ts` — Playwright starts `ng serve` automatically
- 2 test specs:
  1. Happy path: open board → click "+ Add Task" → fill form → submit → verify task in correct column → move via select → verify task in new column
  2. Rollback path: navigate to `/?failNextMove=1` → move a task → verify task stays in original column after rollback
- The `?failNextMove=1` query param is read by the app at startup and sets `TaskMockService.shouldFail = true` for the next move operation only
- Chromium only in CI (no cross-browser matrix for a take-home exercise)

**GitHub Actions CI pipeline (TOOL-09 — partial)**
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

### Deferred Ideas (OUT OF SCOPE)
- Vercel deployment step in GitHub Actions — Phase 6
- Cross-browser Playwright matrix (Firefox, Safari) — out of scope for take-home exercise
- Storybook Chromatic visual diffing — out of scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TOOL-03 | Vitest unit tests for all selectors (selectTasksByColumn, selectCountByPriority, selectCompletionRate) | Tests already exist in `task.selectors.spec.ts` — 4 tests, all passing (verified) |
| TOOL-04 | Vitest unit test for reducer (moveTask optimistic update + rollback) | Tests already exist in `task.reducer.spec.ts` — 9 tests including optimistic + rollback, all passing (verified) |
| TOOL-05 | Vitest unit test for at least one effect (error handling path) | Tests already exist in `task.effects.spec.ts` — 9 tests covering all effects, all passing (verified) |
| TOOL-06 | Storybook stories for TaskCardComponent (default, expanded, edit mode, overdue state) | TaskCardComponent is standalone, uses `input()` signals; Storybook 8.1+ handles signal inputs natively in args |
| TOOL-07 | Storybook stories for TaskCountWidget and ProgressWidget | Both components are standalone, single `status` input of type `WidgetStatus<number>`; ProgressWidget needs `provideAnimationsAsync()` decorator |
| TOOL-08 | Playwright E2E test covering create task → move task → verify column transition | Standard `webServer` config with `ng serve`; query-param seam `?failNextMove=1` for rollback test |
| TOOL-09 | GitHub Actions CI pipeline: lint → test → build → deploy to Vercel (partial — deploy deferred to Phase 6) | Node 23.x + npm ci; Playwright uses `--with-deps` for browser install; Storybook build as standalone step |
| TOOL-10 | Axe accessibility linting integrated (Storybook a11y addon) — non-blocking (warn only) | `@storybook/addon-a11y` registered in `.storybook/main.ts`; no additional config needed for warn-only in UI panel |
</phase_requirements>

---

## Summary

All three Vitest requirement groups (TOOL-03, TOOL-04, TOOL-05) are already satisfied by spec files written in Phases 2–4. A verification run with `npm test` (Node 23 via nvm) produced 77 tests passing across 12 files, 0 failures. The sole Phase 5 action for unit tests is confirming the smoke-check passes in CI.

Storybook 8.x with Angular supports signal inputs natively since version 8.1. Components in this project (`TaskCardComponent`, `TaskCountWidgetComponent`, `ProgressWidgetComponent`) are all standalone with `input()` signals and `input.required()` — straightforward to wrap with direct args. The one nuance is that `ProgressWidgetComponent` uses `MatProgressBarModule` which requires `provideAnimationsAsync()` in the Storybook decorator, consistent with how existing unit tests handle it.

Playwright E2E adds the only net-new infrastructure. Standard `webServer` config starts `ng serve`; the rollback E2E test uses the `?failNextMove=1` query-param approach already planned, which needs a small initialization hook in `BoardPageComponent` or `AppComponent` to read the param and set `TaskMockService.shouldFail = true`. CI pipeline is a single YAML workflow using `actions/setup-node` with Node 23 and `npx playwright install --with-deps chromium`.

**Primary recommendation:** Install Playwright first (via `npm init playwright@latest`), write E2E tests, then install Storybook (`npx storybook@8 init`), write stories, and finish with the CI YAML — this ordering surfaces any Angular 21/Storybook compatibility issues before committing to the story format.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@storybook/angular` | 8.x (latest 8.y) | Angular component story renderer | Official Angular framework for Storybook; handles Angular compiler, templateUrl, SCSS |
| `@storybook/addon-a11y` | 8.x (matches SB) | Axe-core a11y checks in story panel | Bundled addon — matches main Storybook version; shows violations in UI without blocking build |
| `@playwright/test` | latest stable (1.49+) | E2E browser automation | Microsoft-maintained; Chromium-first; excellent Angular support via webServer config |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@storybook/addon-essentials` | 8.x | Docs, controls, actions, viewport | Installed automatically by `npx storybook@8 init` |
| `serve` or `http-server` | latest | Static file server for Playwright CI | Only needed if CI E2E job serves pre-built `dist/` rather than `ng serve` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@storybook/angular` 8.x | Storybook 9.x | SB9 is current as of 2026; 8.x was locked in CONTEXT.md — keep 8.x |
| Playwright via `npm init playwright@latest` | `playwright-ng-schematics` | Schematics add `angular.json` integration; overkill for a take-home, plain install is cleaner |
| `ng serve` for E2E webServer | pre-built `dist/` + `npx serve` | Pre-built is faster in CI but requires artifact passing between jobs; `ng serve` is simpler for correctness |

**Installation:**
```bash
# Playwright
npm init playwright@latest -- --quiet

# Storybook 8
npx storybook@8 init --no-open

# a11y addon (may already be installed by storybook init)
npm install --save-dev @storybook/addon-a11y
```

---

## Architecture Patterns

### Recommended Project Structure
```
.storybook/
├── main.ts             # framework, stories glob, addons
└── preview.ts          # global decorators (provideAnimationsAsync), a11y params

src/app/features/board/
├── task-card/
│   └── task-card.component.stories.ts
├── task-count-widget/
│   └── task-count-widget.component.stories.ts
└── progress-widget/
    └── progress-widget.component.stories.ts

e2e/
├── happy-path.spec.ts
└── rollback.spec.ts

playwright.config.ts
.github/
└── workflows/
    └── ci.yml
```

### Pattern 1: Storybook main.ts for Angular

**What:** Minimal `main.ts` that enables Vite builder (default for Angular in SB8+) and registers addons.
**When to use:** All Angular Storybook projects.

```typescript
// .storybook/main.ts
import type { StorybookConfig } from "@storybook/angular";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.ts"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/angular",
    options: {},
  },
};

export default config;
```

### Pattern 2: Storybook preview.ts with Angular animation providers

**What:** Global `applicationConfig` decorator providing `provideAnimationsAsync()` so Angular Material components (e.g., `MatProgressBar`) animate correctly.
**When to use:** Any story rendering Angular Material components.

```typescript
// .storybook/preview.ts
// Source: https://storybook.js.org/docs/get-started/frameworks/angular
import type { Preview } from "@storybook/angular";
import { applicationConfig } from "@storybook/angular";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";

const preview: Preview = {
  decorators: [
    applicationConfig({
      providers: [provideAnimationsAsync()],
    }),
  ],
  parameters: {
    a11y: {
      element: "#storybook-root",
    },
  },
};

export default preview;
```

### Pattern 3: CSF3 Story with Signal Inputs

**What:** Storybook 8.1+ maps `args` directly to Angular signal inputs — no special utility type required.
**When to use:** All stories for components using `input()` or `input.required()`.

```typescript
// task-card.component.stories.ts
// Source: https://github.com/storybookjs/storybook/discussions/26859
import type { Meta, StoryObj } from "@storybook/angular";
import { TaskCardComponent } from "./task-card.component";
import { Priority } from "@app/shared/models";
import { MOCK_COLUMNS } from "@app/core/services/mock-data";

const meta: Meta<TaskCardComponent> = {
  component: TaskCardComponent,
  title: "Board/TaskCard",
};
export default meta;

type Story = StoryObj<TaskCardComponent>;

const baseTask = {
  id: "story-task-1",
  title: "Design login screen",
  description: "Create wireframes for the login UI",
  columnId: "col-todo",
  priority: Priority.Medium,
  assignee: "alice",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const Default: Story = {
  args: {
    task: baseTask,
    columns: MOCK_COLUMNS,
  },
};

export const Expanded: Story = {
  args: {
    task: baseTask,
    columns: MOCK_COLUMNS,
    isExpanded: true,     // model() input — writable
  },
};

export const Overdue: Story = {
  args: {
    task: {
      ...baseTask,
      priority: Priority.Critical,
      createdAt: new Date("2025-01-01"),  // >7 days old → overdue signal true
    },
    columns: MOCK_COLUMNS,
  },
};

export const EditMode: Story = {
  args: {
    task: baseTask,
    columns: MOCK_COLUMNS,
    isExpanded: true,
  },
  // isEditMode is signal(), not input() — cannot be set from args.
  // Use play() function to call component.enterEditMode() after render.
  play: async ({ canvasElement }) => {
    // Import userEvent if calling component methods is insufficient
    // For interview demo, the story can show expanded state with a note.
  },
};
```

**Key note on `isEditMode`:** `isEditMode` is a `signal()` (not `input()`), so it cannot be driven from Storybook args. Two options: (a) add a story-specific `play()` function that queries the component instance and calls `enterEditMode()`, or (b) refactor `isEditMode` to `model()` only for the stories context. Option (a) is preferable — no production code change.

### Pattern 4: Widget Story — Simple Input Binding

```typescript
// task-count-widget.component.stories.ts
import type { Meta, StoryObj } from "@storybook/angular";
import { TaskCountWidgetComponent } from "./task-count-widget.component";

const meta: Meta<TaskCountWidgetComponent> = {
  component: TaskCountWidgetComponent,
  title: "Board/TaskCountWidget",
};
export default meta;

type Story = StoryObj<TaskCountWidgetComponent>;

export const Neutral: Story = { args: { status: { value: 5, status: "neutral" } } };
export const Warning: Story = { args: { status: { value: 15, status: "warning" } } };
export const Error: Story   = { args: { status: { value: 25, status: "error" } } };
```

### Pattern 5: Playwright webServer Config

**What:** Playwright starts `ng serve` automatically before running tests.
**Source:** https://playwright.dev/docs/test-webserver

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:4200",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "ng serve",
    url: "http://localhost:4200",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,  // ng serve can take >30s on first build
  },
});
```

### Pattern 6: Playwright E2E Test Structure

```typescript
// e2e/happy-path.spec.ts
import { test, expect } from "@playwright/test";

test("create task and move to In Progress column", async ({ page }) => {
  await page.goto("/");

  // Click Add Task (global toolbar button)
  await page.getByRole("button", { name: /add task/i }).click();

  // Fill task form dialog
  await page.getByLabel(/title/i).fill("E2E Test Task");
  await page.getByLabel(/priority/i).selectOption("HIGH");
  await page.getByRole("button", { name: /save|add/i }).click();

  // Verify task appears in Todo column
  const todoColumn = page.getByTestId("column-col-todo");
  await expect(todoColumn.getByText("E2E Test Task")).toBeVisible();

  // Move task via select box
  const moveSelect = todoColumn.getByTestId("move-select-task-1");
  // OR: use getByRole("combobox") within the task card
  await moveSelect.selectOption("col-in-progress");

  // Verify task appears in In Progress column
  const inProgressColumn = page.getByTestId("column-col-in-progress");
  await expect(inProgressColumn.getByText("E2E Test Task")).toBeVisible();
});
```

### Pattern 7: Rollback E2E Test via Query Param Seam

```typescript
// e2e/rollback.spec.ts
import { test, expect } from "@playwright/test";

test("failed move reverts task to original column", async ({ page }) => {
  // failNextMove=1 → TaskMockService.shouldFail = true for one operation
  await page.goto("/?failNextMove=1");

  // Wait for tasks to load
  const todoColumn = page.getByTestId("column-col-todo");
  await expect(todoColumn).toBeVisible();

  // Move an existing seed task (task-1 is seeded in col-todo)
  const moveSelect = page.getByTestId("move-select-task-1");
  await moveSelect.selectOption("col-in-progress");

  // After service failure + rollback, task should remain in col-todo
  await expect(todoColumn.getByText("Design login screen")).toBeVisible();

  // Snackbar error message appears
  await expect(page.getByText(/failed to move task/i)).toBeVisible();
});
```

**Implementation requirement for `?failNextMove=1`:** `BoardPageComponent.ngOnInit` (or an `APP_INITIALIZER`) must read `window.location.search`, detect `failNextMove=1`, and call `taskService.shouldFail = true`. Since `TaskMockService.shouldFail` auto-resets after one use is NOT implemented — the service sets it once; the effect resets it via the success/failure path only if the service resets it. Verify that `shouldFail` is consumed in a one-shot fashion, or the E2E test must navigate fresh.

### Anti-Patterns to Avoid

- **Calling `ng serve` twice in CI:** `reuseExistingServer: !process.env.CI` ensures Playwright manages the server in CI, not manual. Do not add a separate `ng serve` step in the workflow.
- **Running E2E on `ng serve` in CI E2E job:** The context shows the plan uses `ng build` output + preview server for the E2E CI job. This is slightly faster and more production-representative. If going that route, set `command: "npx serve dist/petello/browser -l 4200"` in `webServer`.
- **Bare `npx vitest run` in CI:** The `@app/` path alias and Angular compiler plugin are not available to bare Vitest. Always use `ng test --watch=false`.
- **Installing all Playwright browsers in CI:** `npx playwright install --with-deps chromium` only, per the locked decision (Chromium only).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Angular test seam for E2E failure simulation | Custom interceptor, mock backend | `TaskMockService.shouldFail = true` set by query param | Service already has the field; one-line init hook is sufficient |
| Story args type for signal inputs | Manual `InputSignalValue<T>` utility type | Storybook 8.1+ native support via `StoryObj<Component>` | Signal input unwrapping is built into SB 8.1+ Angular integration |
| Running Angular tests in CI without nvm | Shell scripts to source nvm | `actions/setup-node` with `node-version: '23'` | GitHub Actions setup-node handles version pinning cleanly |
| A11y enforcement | Custom axe runner script | `@storybook/addon-a11y` panel | Non-blocking warning-only behavior is the default UI mode — no code config needed |
| Cross-browser testing | Multiple Playwright projects config | Single `chromium` project | Locked out of scope; adding Firefox/Safari is a one-line addition in Phase 6 if needed |

**Key insight:** The entire testing phase is largely assembly, not construction. The unit test specs are done; the components for Storybook are standalone and presentational; Playwright's webServer abstraction handles the dev server lifecycle. The only non-trivial implementation is the `?failNextMove=1` query param hook and the `data-testid` attribute placement on DOM elements for E2E selectors.

---

## Common Pitfalls

### Pitfall 1: Node Version Mismatch in CI
**What goes wrong:** Running `ng test` with Node 22.x (LTS) fails with `ERR_REQUIRE_ESM` from `@angular/compiler-cli`. This was verified locally — the test suite fails on Node 22.11.0.
**Why it happens:** Angular 21's compiler-cli is ESM-only; Node 22.11 is below the minimum (22.12+) required by Angular 21.
**How to avoid:** Use `node-version: '23'` in `actions/setup-node`. Do not use `node-version: 'lts/*'` (which resolves to 22.11 on current runners).
**Warning signs:** `ERR_REQUIRE_ESM` in CI test step output.

### Pitfall 2: Storybook Init Modifying angular.json Test Config
**What goes wrong:** `npx storybook@8 init` adds a `storybook` architect target to `angular.json` but may also touch the `test` architect block.
**Why it happens:** SB init is automated and sometimes makes assumptions about test runners.
**How to avoid:** Review `angular.json` diff after running `npx storybook@8 init`. The existing `test` architect block (`@angular/build:unit-test`) must not be modified.
**Warning signs:** `ng test --watch=false` fails after Storybook installation.

### Pitfall 3: `isEditMode` Cannot Be Set From Story Args
**What goes wrong:** `isEditMode` is `signal(false)` — not `input()` or `model()` — so Storybook args cannot drive it. The Edit Mode story appears identical to Default story.
**Why it happens:** Storybook only bridges `input()` and `model()` fields to args; `signal()` fields are internal state.
**How to avoid:** Use a `play()` function in the Edit Mode story that finds the component instance and calls `component.enterEditMode()` after render. Alternatively, document the limitation inline.

### Pitfall 4: Playwright webServer Timeout on Cold `ng serve`
**What goes wrong:** `ng serve` takes 20–40 seconds on first compile; Playwright's default `timeout` for `webServer` is 60s. On slow CI machines, this can exceed the timeout.
**Why it happens:** Angular 21's esbuild build is fast, but cold starts still include TypeScript compilation.
**How to avoid:** Set `webServer.timeout: 120_000` (2 minutes) in `playwright.config.ts`.

### Pitfall 5: E2E Selectors Break On Refactoring
**What goes wrong:** Using CSS class selectors (`.task-card`, `.column-header`) in Playwright tests causes tests to fail when styles are reorganized.
**Why it happens:** Class names are implementation details.
**How to avoid:** Use `data-testid` attributes on key interactive elements (column containers, task cards, move select boxes, add-task button). Supplement with `getByRole()` for form elements (labels, buttons) — preferred by Playwright for accessibility-first selectors.

### Pitfall 6: Storybook `provideAnimationsAsync` Missing for ProgressWidget
**What goes wrong:** `ProgressWidgetComponent` uses `MatProgressBarModule`; without animations provider, Storybook renders but may throw console errors or show broken animation state.
**Why it happens:** Same as in unit tests — `MatProgressBar` requires animations.
**How to avoid:** Set `provideAnimationsAsync()` as a global decorator in `.storybook/preview.ts` (Pattern 2). This covers all stories including `TaskCardComponent` (which also uses Material modules).

### Pitfall 7: `?failNextMove=1` is One-Shot — Must Not Persist
**What goes wrong:** If `TaskMockService.shouldFail` remains `true` after the first move, all subsequent store operations fail — breaking unrelated E2E tests.
**Why it happens:** `shouldFail` is a public field with no auto-reset logic.
**How to avoid:** Implement the param reading logic to set `shouldFail = true` only once and have the effect handler (or `ngOnInit`) reset it to `false` after the first move attempt. Alternatively, rely on the fact that each Playwright test navigates to a fresh URL without the param — isolating the state.

---

## Code Examples

### GitHub Actions CI Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "23"
          cache: "npm"
      - run: npm ci
      - run: npm run format:check
      - run: npm test

  build:
    needs: lint-and-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "23"
          cache: "npm"
      - run: npm ci
      - run: npm run build
      - run: npx storybook@8 build   # fails build if Storybook breaks
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  e2e:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "23"
          cache: "npm"
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      - run: npx playwright test
        env:
          CI: "true"
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

**Note:** When using pre-built `dist/` for E2E, update `playwright.config.ts` `webServer.command` to `npx serve dist/petello/browser -l 4200` and install `serve` as a devDependency, or use `http-server`.

### Query Param Seam Init (ngOnInit)

```typescript
// In BoardPageComponent.ngOnInit() — add this block:
// E2E test seam: ?failNextMove=1 simulates server failure for rollback test
const params = new URLSearchParams(window.location.search);
if (params.get("failNextMove") === "1") {
  this.taskService.shouldFail = true;
}
```

This requires injecting `TaskMockService` into `BoardPageComponent`. Since it is already `providedIn: "root"`, injection is one line: `private readonly taskService = inject(TaskMockService)`.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `ng e2e` with Protractor | Playwright or Cypress | Angular 12 (Protractor deprecated) | Playwright is the 2025 standard for Angular E2E |
| Jest for Angular tests | Vitest via `@angular/build:unit-test` | Angular 20+ | Angular CLI now configures Vitest natively; no `@analogjs/vitest-angular` needed in Angular 21 |
| `@Input()` decorator in stories | `input()` signal — args pass raw value | Storybook 8.1 | Signal inputs work natively in SB 8.1+ args; no utility type needed |
| `BrowserAnimationsModule` import | `provideAnimationsAsync()` provider | Angular 17+ | Standalone components use provider-based setup |

**Deprecated/outdated:**
- `@analogjs/vitest-angular`: Was a workaround for Vitest + Angular before Angular CLI integrated Vitest natively. Not needed for Angular 21 — `@angular/build:unit-test` handles it.
- `protractor`: Removed from Angular CLI in v15. Do not reference.
- `storybookjs/storybook@7`: SB7 has no signal input support. SB8.1+ required.

---

## Open Questions

1. **Storybook Edit Mode story — `play()` function approach**
   - What we know: `isEditMode` is `signal(false)` and cannot be driven from args; `play()` functions in Storybook can interact with the DOM
   - What's unclear: Whether Storybook's `play()` can access Angular component instance methods directly or only DOM interactions via `userEvent`
   - Recommendation: Use DOM interaction in `play()` — click the "Edit" button if rendered (requires the card to be expanded first), or add a comment noting the limitation. If the button is only visible when expanded, chain: set `isExpanded: true` in args, then `play()` clicks the Edit button.

2. **E2E webServer strategy: `ng serve` vs pre-built `dist/`**
   - What we know: CONTEXT.md says "E2E job runs after build job, uses `ng build` output + `npx serve`"; this means downloading the build artifact and serving it statically
   - What's unclear: Whether `ng serve` output is identical to `ng build` for the rollback test (query param handling is the same either way)
   - Recommendation: Use pre-built `dist/` + `npx serve` in CI as planned. Keep `reuseExistingServer: !process.env.CI` so local dev uses `ng serve`.

3. **Storybook 8 exact version compatibility with Angular 21**
   - What we know: Storybook docs state Angular ≥18 <22 is supported; Angular 21 is in that range; signal inputs work from SB 8.1+
   - What's unclear: Whether any Angular 21-specific APIs (e.g., `provideBrowserGlobalErrorListeners()` in app config) cause issues during Storybook initialization
   - Recommendation: Run `npx storybook@8 init` and verify the generated preview runs before writing stories. If init adds incompatible providers to generated story templates, clean them up.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.x (via `@angular/build:unit-test`) |
| Config file | `angular.json` `test` architect block (no separate `vitest.config.ts`) |
| Quick run command | `npm test` (Node 23 required — source nvm first locally) |
| Full suite command | `npm test` (same; no separate watch/coverage flag needed) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TOOL-03 | All 3 selectors produce correct derived state | unit | `npm test` (includes `task.selectors.spec.ts`) | ✅ Exists |
| TOOL-04 | Reducer applies optimistic move and rolls back on failure | unit | `npm test` (includes `task.reducer.spec.ts`) | ✅ Exists |
| TOOL-05 | Effects dispatch failure actions on service error | unit | `npm test` (includes `task.effects.spec.ts`) | ✅ Exists |
| TOOL-06 | Storybook renders TaskCardComponent stories | manual | `npx storybook@8 dev` — visual inspection | ❌ Wave 0 |
| TOOL-07 | Storybook renders widget component stories | manual | `npx storybook@8 dev` — visual inspection | ❌ Wave 0 |
| TOOL-08 | E2E create→move→verify + rollback | e2e | `npx playwright test` | ❌ Wave 0 |
| TOOL-09 | CI pipeline passes lint→test→build→e2e | integration | Push to main branch / PR | ❌ Wave 0 |
| TOOL-10 | A11y violations shown in Storybook panel (non-blocking) | manual | `npx storybook@8 dev` — A11y panel inspection | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test` (77 unit tests, ~6s)
- **Per wave merge:** `npm test && npx playwright test` (unit + E2E)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `e2e/happy-path.spec.ts` — covers TOOL-08 happy path
- [ ] `e2e/rollback.spec.ts` — covers TOOL-08 rollback path
- [ ] `playwright.config.ts` — webServer + baseURL config
- [ ] `.storybook/main.ts` — framework, stories glob, addons
- [ ] `.storybook/preview.ts` — global decorator with `provideAnimationsAsync()`
- [ ] `src/app/features/board/task-card/task-card.component.stories.ts` — covers TOOL-06
- [ ] `src/app/features/board/task-count-widget/task-count-widget.component.stories.ts` — covers TOOL-07
- [ ] `src/app/features/board/progress-widget/progress-widget.component.stories.ts` — covers TOOL-07
- [ ] `.github/workflows/ci.yml` — covers TOOL-09
- [ ] Framework installs: `npm init playwright@latest -- --quiet` + `npx storybook@8 init --no-open`
- [ ] `data-testid` attributes on column containers, task cards, move select boxes, add-task button (required for E2E selectors)

*(Unit test infrastructure is fully in place — all existing spec files cover TOOL-03, TOOL-04, TOOL-05)*

---

## Sources

### Primary (HIGH confidence)
- `npm test` (Node 23.1.0) — verified 77/77 tests passing, confirmed all selector/reducer/effect specs exist and pass
- [Playwright webServer docs](https://playwright.dev/docs/test-webserver) — webServer config options, `url`, `reuseExistingServer`
- [Playwright CI intro](https://playwright.dev/docs/ci-intro) — GitHub Actions workflow structure
- [Storybook for Angular](https://storybook.js.org/docs/get-started/frameworks/angular) — Angular ≥18 <22 supported; `applicationConfig` + `provideAnimations()` pattern
- [Storybook signal input discussion](https://github.com/storybookjs/storybook/discussions/26859) — confirmed SB 8.1+ handles `input()` signals natively in args

### Secondary (MEDIUM confidence)
- [Storybook Angular 21 vitest discussion](https://github.com/storybookjs/storybook/discussions/33515) — open question on addon-vitest, does not affect `@storybook/angular` story rendering
- [Playwright locators best practice](https://playwright.dev/docs/locators) — `getByRole()` preferred; `data-testid` via `getByTestId()` as fallback

### Tertiary (LOW confidence)
- WebSearch results on GitHub Actions Node 23 for Angular CI — patterns align with official Playwright CI docs but not independently verified for Angular 21 specifically

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified by running the test suite, official Storybook Angular docs confirm Angular 21 is in the supported range
- Architecture: HIGH — Storybook patterns verified in official docs; Playwright webServer config verified in official docs
- Pitfalls: HIGH for Node version mismatch (reproduced locally); MEDIUM for remaining pitfalls (based on known patterns and existing codebase)
- E2E selector strategy: MEDIUM — Playwright recommends role-first but data-testid is widely accepted; exact attributes depend on template implementation

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (Storybook 8.x stable; Playwright 1.x stable; Angular 21 stable)
