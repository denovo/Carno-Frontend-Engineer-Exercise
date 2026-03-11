# Technology Stack

**Project:** Petello (Task Board Application)
**Researched:** 2026-03-11
**Overall Confidence:** MEDIUM — WebSearch, Bash, and WebFetch were unavailable during research. Versions are based on training data (cutoff May 2025) plus Angular's predictable 6-month release cadence. All version numbers should be verified with `npm view <package> version` before scaffolding.

---

## IMPORTANT: Version Verification Required

Before running `ng new` or `npm install`, run these commands to confirm actual latest versions:

```bash
npm view @angular/core version
npm view @ngrx/store version
npm view vitest version
npm view @analogjs/vitest-angular version
npm view @storybook/angular version
npm view @playwright/test version
npm view @angular/material version
npm view @commitlint/cli version
npm view husky version
```

Update the versions below with actual results before proceeding.

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Angular | ~21.x | Application framework | PROJECT.md specifies Angular 21; Angular ships major releases every 6 months (v19 Nov 2024, v20 ~May 2025, v21 ~Nov 2025). Should be stable by March 2026. | MEDIUM |
| TypeScript | ~5.7+ | Type system | Angular 21 will ship with whatever TS version it was built against. Use whatever `ng new` installs — do not override. | MEDIUM |
| RxJS | ~7.8 | Reactive programming | NGRX effects depend on RxJS. Angular has been shipping with RxJS 7.x since Angular 16. Angular may move to RxJS 8 eventually but 7.x is the safe bet. | MEDIUM |
| Zone.js | ~0.15+ or zoneless | Change detection | Angular 19+ made zoneless change detection experimentally available. Angular 21 may have it stable. Default to whatever `ng new` provides; consider opting into zoneless if stable. | LOW |

### State Management

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| @ngrx/store | ~19.x or ~21.x | Global state management | NGRX versions track Angular majors. Exercise requires NGRX explicitly. Use `createFeature()` for concise feature state setup (available since NGRX 15+). | MEDIUM |
| @ngrx/effects | ~19.x or ~21.x | Side effect handling | Required for the exercise's effect with error handling requirement. Functional effects API (`createEffect` with functional style) is the modern pattern. | MEDIUM |
| @ngrx/store-devtools | ~19.x or ~21.x | Development debugging | Redux DevTools integration. Essential for development; strip from production builds. | MEDIUM |

**NGRX Version Note:** NGRX historically tracks Angular major versions closely but not always 1:1. Check `npm view @ngrx/store version` and its `peerDependencies` to confirm Angular 21 compatibility. If NGRX hasn't released an Angular 21-compatible version yet, use the latest available and check their GitHub for compatibility notes.

### UI Components

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| @angular/material | ~21.x | Component library | Official Angular team library, zero integration friction. PROJECT.md specifies minimal styling with Material defaults. Material 3 (MDC) has been the default since Angular 17. | MEDIUM |
| @angular/cdk | ~21.x | Component primitives | Installed alongside Material. CDK's `DragDropModule` is available but out of scope per PROJECT.md — select box approach is preferred. | MEDIUM |

### Testing

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| vitest | ~3.x | Unit test runner | PROJECT.md specifies Vitest over Jest. Vitest 2.x was stable as of mid-2025; 3.x may be current by March 2026. Vite-native, significantly faster than Jest for Angular projects. | MEDIUM |
| @analogjs/vitest-angular | ~1.x+ | Angular Vitest integration | The established community adapter for running Vitest with Angular's TestBed. Handles Angular compiler integration, zone.js setup, and component testing. Without this, Vitest cannot process Angular templates/decorators. | MEDIUM |
| @analogjs/vite-plugin-angular | ~1.x+ | Vite Angular compilation | Required peer of vitest-angular. Compiles Angular components within Vite's pipeline. | MEDIUM |
| @storybook/angular | ~8.x or ~9.x | Component stories | Storybook 8 was released early 2024 and supports Angular. Storybook 9 may be available by March 2026. Use for TaskCardComponent, widgets, and DynamicWidgetOutlet demos. | LOW |
| @playwright/test | ~1.50+ | E2E testing | Industry standard E2E framework. Playwright releases frequently; use latest stable. Built-in test runner, auto-waiting, trace viewer. | MEDIUM |

### Code Quality & Formatting

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| oxfmt | beta | Code formatter | PROJECT.md specifies OXfmt Beta as a Prettier alternative. Part of the oxc (Oxidation Compiler) ecosystem — Rust-based, extremely fast. Note: this is explicitly a "candidate preference" per PROJECT.md and must be disclosed in README. | LOW |
| oxlint | ~0.x | Linter (optional complement) | From the same oxc ecosystem. Can complement or replace ESLint for speed. Consider using alongside oxfmt for a unified oxc toolchain. | LOW |
| @commitlint/cli | ~19.x+ | Commit message linting | Enforces Conventional Commits format. Stable, widely adopted. | HIGH |
| @commitlint/config-conventional | ~19.x+ | Commitlint rules | Standard Conventional Commits ruleset. | HIGH |
| husky | ~9.x+ | Git hooks | Runs commitlint on commit-msg hook. Husky 9 simplified setup significantly (no more `.husky/install`). | HIGH |

### Deployment & CI

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Vercel | N/A (SaaS) | Hosting | Free tier, zero-config Angular SPA deployment. Use `@vercel/static-build` or configure output directory. | HIGH |
| GitHub Actions | N/A (SaaS) | CI pipeline | test -> lint -> build -> deploy pipeline. Use official actions for Node.js setup and caching. | HIGH |

---

## Angular 21 APIs to Use

These are the modern Angular patterns that should be used throughout the codebase. Angular has been migrating toward signals and functional APIs since v16-17, and by v21 these should be the primary patterns.

### Signals (stable since Angular 17+)

```typescript
// Component inputs — use input() instead of @Input()
readonly task = input.required<Task>();
readonly isExpanded = input<boolean>(false);

// Component outputs — use output() instead of @Output()
readonly taskMoved = output<MoveTaskEvent>();

// Computed signals for derived state
readonly priorityClass = computed(() => `priority-${this.task().priority}`);
readonly isOverdue = computed(() => this.task().dueDate < new Date());

// Model signals for two-way binding (Angular 17.1+)
readonly editMode = model<boolean>(false);

// Signal-based queries (Angular 17.2+)
readonly cardElement = viewChild<ElementRef>('card');
```

### NGRX-Signal Bridge

```typescript
// Use selectSignal (NGRX 17+) or toSignal from @angular/core/rxjs-interop
readonly tasks = toSignal(this.store.select(selectTasksByColumn(this.columnId)));

// Or if NGRX provides selectSignal:
readonly tasks = this.store.selectSignal(selectTasksByColumn(this.columnId));
```

### Functional APIs

```typescript
// Functional guards, resolvers, interceptors (stable since Angular 15+)
export const taskResolver: ResolveFn<Task[]> = (route) => {
  const store = inject(Store);
  store.dispatch(TaskActions.loadTasks());
  return inject(TaskService).getTasks();
};

// inject() in constructor or field initializer
readonly store = inject(Store);
readonly destroyRef = inject(DestroyRef);
```

### Cleanup Patterns

```typescript
// takeUntilDestroyed (Angular 16+) — preferred over manual unsubscribe
this.store.select(selectSomething).pipe(
  takeUntilDestroyed(this.destroyRef)
).subscribe(/* ... */);

// DestroyRef.onDestroy for imperative cleanup
this.destroyRef.onDestroy(() => {
  // cleanup logic
});
```

### Standalone Components (default since Angular 17)

```typescript
// All components should be standalone (no NgModules)
@Component({
  selector: 'app-task-card',
  standalone: true,  // default in Angular 17+, may be implicit in 21
  imports: [MatCardModule, MatIconModule, DatePipe],
  templateUrl: './task-card.component.html',
})
export class TaskCardComponent { }
```

**Note on `standalone: true`:** By Angular 19, `standalone: true` became the default and the property may be omittable. In Angular 21, it is almost certainly implicit. Verify with `ng generate component` output.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| State | NGRX | NgRx SignalStore, Akita, Elf | Exercise explicitly requires NGRX (classic store pattern) |
| Testing | Vitest | Jest | PROJECT.md specifies Vitest. Faster, Vite-native, modern |
| Testing Adapter | @analogjs/vitest-angular | jest-preset-angular | Analog is the established Vitest-Angular bridge; jest-preset is for Jest |
| Component Dev | Storybook | Chromatic, Ladle | Storybook is the standard; PROJECT.md specifies it |
| E2E | Playwright | Cypress | Playwright is faster, better CI support, multi-browser by default |
| Formatting | OXfmt | Prettier, Biome | PROJECT.md specifies OXfmt as candidate preference |
| Linting | oxlint (or ESLint) | Biome | If using oxfmt already, oxlint is the natural complement. ESLint is also fine but slower. |
| CSS | Angular Material (M3) | Tailwind, PrimeNG | Material is the official Angular component library, zero-friction integration |
| Hosting | Vercel | Netlify, Firebase Hosting | PROJECT.md specifies Vercel |
| Modules | Standalone components | NgModules | NgModules are legacy; standalone is default since Angular 17 |

---

## What NOT to Use

| Technology | Why Not |
|------------|---------|
| Jest | Slower than Vitest, not Vite-native. PROJECT.md explicitly chose Vitest. |
| Prettier | PROJECT.md explicitly chose OXfmt Beta. Document the choice in README. |
| NgModules | Legacy pattern. Angular 17+ defaults to standalone components. Using NgModules in 2026 signals outdated knowledge to the interviewer. |
| `@Input()` / `@Output()` decorators | Legacy. Use `input()`, `output()`, `model()` signal-based APIs. Decorator-based inputs still work but demonstrate old patterns. |
| `@ViewChild()` / `@ContentChild()` | Legacy. Use `viewChild()`, `contentChild()` signal-based queries. |
| Protractor | Dead since 2022. Playwright is the replacement. |
| Karma | Deprecated in Angular. Vitest replaces it. |
| `BehaviorSubject` for local state | Use signals for local component state. RxJS is for async streams and NGRX integration, not local UI state. |
| `ngOnInit` for inject-based setup | Prefer `inject()` in field initializers and `afterNextRender()` / `afterRender()` for DOM-dependent initialization. |

---

## Installation

```bash
# Scaffold Angular 21 project
ng new petello --style=scss --routing=true --ssr=false

# Core dependencies
npm install @ngrx/store @ngrx/effects @ngrx/store-devtools

# UI
# (Angular Material is added via schematic for proper setup)
ng add @angular/material

# Testing - Vitest
npm install -D vitest @analogjs/vitest-angular @analogjs/vite-plugin-angular

# Testing - Storybook
npx storybook@latest init --type angular

# Testing - Playwright
npm install -D @playwright/test
npx playwright install

# Code Quality
npm install -D @commitlint/cli @commitlint/config-conventional husky

# Formatting (OXfmt Beta - verify installation method)
# OXfmt is part of the oxc ecosystem. Installation method may vary:
# Option A: npm install -D oxfmt (if published to npm)
# Option B: cargo install oxfmt (if Rust toolchain available)
# Option C: Download binary from GitHub releases
# Verify at: https://github.com/nicolo-ribaudo/oxfmt or oxc project

# Initialize Husky
npx husky init

# Vercel CLI (optional, for manual deploys)
npm install -D vercel
```

---

## Configuration Files

### vitest.config.ts

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    reporters: ['default'],
  },
});
```

### src/test-setup.ts

```typescript
import '@analogjs/vitest-angular/setup-zone';
// or for zoneless: import '@analogjs/vitest-angular/setup-snapshots';
```

### commitlint.config.js

```javascript
export default {
  extends: ['@commitlint/config-conventional'],
};
```

### .husky/commit-msg

```bash
npx --no -- commitlint --edit ${1}
```

### vercel.json

```json
{
  "buildCommand": "ng build",
  "outputDirectory": "dist/petello/browser",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'ng serve',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
  },
});
```

---

## GitHub Actions CI Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npx vitest run --coverage
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
      - run: npm run build
      # Deploy to Vercel via Vercel GitHub integration (preferred)
      # or via vercel CLI with VERCEL_TOKEN secret
```

---

## Key Architecture Decisions for Stack

1. **Standalone-only architecture** — No NgModules anywhere. Every component, directive, and pipe is standalone. This is the Angular 21 way.

2. **Signal-first, RxJS-when-needed** — Use signals for all component state and template bindings. Use RxJS only in NGRX effects and when interfacing with inherently async/stream-based APIs. Bridge with `toSignal()` and `toObservable()`.

3. **Functional NGRX** — Use `createFeature()`, functional effects, and `createActionGroup()` for concise, type-safe store code. Avoid class-based effects.

4. **Vitest over Jest** — Faster feedback loops. The `@analogjs/vitest-angular` adapter handles Angular compilation within Vite's pipeline. Configure in `vitest.config.ts`, not `angular.json`.

5. **OXfmt for formatting** — Candidate preference, must be documented. Rust-based, extremely fast. If OXfmt Beta lacks Angular template support, fall back to Prettier for templates only and document the hybrid approach.

---

## Risk Flags

| Risk | Severity | Mitigation |
|------|----------|------------|
| Angular 21 may not exist yet (if release delayed) | HIGH | Check `npm view @angular/core version`. If still on 20, use Angular 20. The exercise says "17+" so any modern Angular works. |
| NGRX version may lag Angular release | MEDIUM | Use latest NGRX that supports the installed Angular version. Check peerDependencies. |
| OXfmt Beta may lack Angular template formatting | MEDIUM | Test with `.html` templates. If unsupported, use Prettier for templates only and document the limitation. |
| @analogjs/vitest-angular may have breaking changes | MEDIUM | Pin exact version. Check Analog's Angular version support matrix. |
| Storybook Angular support may lag | MEDIUM | Storybook's Angular support has historically lagged. If latest Storybook doesn't work with Angular 21, use `@next` tag or pin to last working version. |

---

## Sources

- Angular release schedule: Angular follows a predictable 6-month major release cadence (v17 Nov 2023, v18 May 2024, v19 Nov 2024, projected v20 May 2025, v21 Nov 2025) — **MEDIUM confidence, based on established pattern**
- NGRX version alignment: NGRX tracks Angular majors — **MEDIUM confidence, based on historical pattern**
- Vitest Angular adapter: @analogjs/vitest-angular is the community standard — **MEDIUM confidence, established as of training data**
- All version numbers: **LOW-MEDIUM confidence, must be verified with npm before scaffolding**
- Commitlint + Husky: Stable, well-established ecosystem — **HIGH confidence**
- Vercel Angular deployment: Well-documented, standard pattern — **HIGH confidence**
- OXfmt: **LOW confidence** — relatively new tool, verify current status and Angular support
