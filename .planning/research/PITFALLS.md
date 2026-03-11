# Domain Pitfalls

**Domain:** Angular 21 + NGRX Task Board (Interview Exercise)
**Researched:** 2026-03-11
**Overall confidence:** MEDIUM (training data only -- WebSearch unavailable during research)

---

## Critical Pitfalls

Mistakes that cause rewrites, major bugs, or interview red flags.

### Pitfall 1: DynamicWidgetOutletDirective Memory Leaks

**What goes wrong:** The structural directive creates `ComponentRef` instances via `ViewContainerRef.createComponent()` but fails to destroy them on input changes or directive destruction. Subscriptions to component outputs (via `ComponentRef.instance`) are not cleaned up, leading to leaked event listeners and zombie components.

**Why it happens:** When the input array changes (e.g., widget configs update), developers call `createComponent` again without first calling `viewContainerRef.clear()` or iterating existing refs to call `componentRef.destroy()`. Output subscriptions created via `componentRef.instance.someOutput.subscribe()` are not tracked or torn down.

**Consequences:** Memory leaks accumulate with each change detection cycle that triggers re-creation. In an interview walkthrough, the interviewer will specifically probe lifecycle management (the spec explicitly calls out "proper cleanup of subscriptions and component references").

**Prevention:**
1. Maintain a `ComponentRef[]` array and a `Subscription` (or array of subscriptions) as directive state
2. On every input change, call `destroy()` on each existing `ComponentRef`, unsubscribe all output subscriptions, then `viewContainerRef.clear()`
3. In `ngOnDestroy`, perform the same cleanup
4. Use `DestroyRef` + `takeUntilDestroyed()` for any RxJS subscriptions within the directive itself
5. For Signal inputs passed to dynamic components, use `effect()` with the directive's injector to auto-cleanup

**Detection:** Check for `createComponent` calls without corresponding `destroy()` calls. Check for `.subscribe()` without corresponding unsubscribe logic. Run the app, toggle widget configs rapidly, and check DevTools heap snapshots for detached DOM nodes.

**Phase relevance:** Phase 3 (Dynamic Component Rendering) -- must be correct from the start, not retrofitted.

---

### Pitfall 2: NGRX/Signal Bridge Zone Pollution and Glitchy Reads

**What goes wrong:** Using `toSignal()` with NGRX selectors (`this.store.select(...)`) without understanding the timing semantics. The signal reads the initial `undefined` value before the store emits, causing template errors or flickering UI. Alternatively, mixing `async` pipe and `toSignal()` for the same selector in different components causes redundant subscriptions and inconsistent update timing.

**Why it happens:** `toSignal()` subscribes eagerly but the store selector emits asynchronously (microtask). The default behavior returns `undefined` until the first emission unless `initialValue` is provided or `requireSync` is set (which throws if the observable does not emit synchronously -- NGRX selectors DO emit synchronously via `BehaviorSubject`, so `requireSync: true` is safe for store selectors specifically).

**Consequences:** TypeScript types become `T | undefined` everywhere, forcing excessive null checks or unsafe assertions. If `requireSync` is misused with a non-synchronous observable (e.g., an HTTP call), it throws at runtime.

**Prevention:**
1. For NGRX store selectors, use `toSignal(this.store.select(selector), { requireSync: true })` -- this is safe because `select()` emits synchronously via `BehaviorSubject` and avoids the `undefined` type widening
2. For effects that involve HTTP calls, use `toSignal(obs$, { initialValue: defaultValue })` instead
3. Pick ONE pattern per component: either all signals (preferred for new code) or all async pipes, never mix
4. Use `selectSignal()` if available in your NGRX version (NGRX 17+ added `store.selectSignal()`) -- this is the cleanest bridge

**Detection:** Search for `toSignal(` without `requireSync` or `initialValue`. Look for `| undefined` in template bindings that should never be undefined.

**Phase relevance:** Phase 2 (NGRX Store) and Phase 3 (Signals Integration) -- establish the pattern early and apply consistently.

---

### Pitfall 3: Optimistic Update Rollback State Corruption

**What goes wrong:** The moveTask optimistic update mutates the store state immediately, but the rollback on API failure restores to stale state because additional actions were dispatched between the optimistic update and the rollback.

**Why it happens:** The naive pattern is:
1. Dispatch `moveTaskOptimistic` (reducer moves the task immediately)
2. Effect calls API
3. On failure, dispatch `moveTaskRollback` with the "previous" column ID

But if the user moves another task (or the same task again) between steps 1 and 3, the rollback action uses a snapshot that no longer reflects reality.

**Consequences:** Tasks appear in wrong columns, duplicate in multiple columns, or vanish from the board entirely. This is the #1 thing the interviewer is testing with the optimistic update requirement.

**Prevention:**
1. Store the full previous state snapshot for the specific entity (task ID + previous column ID) in the action payload, not a global state snapshot
2. Use a correlation ID on each move operation so the rollback targets the exact operation that failed
3. In the reducer, the rollback action should ONLY revert if the task's current column matches the optimistic target (i.e., no subsequent move has occurred)
4. Consider a simpler pattern: `moveTaskOptimistic` sets a `pending: true` flag on the task, `moveTaskSuccess` clears it, `moveTaskFailure` reverts column AND clears the flag
5. If a second move happens while the first is pending, cancel the first (use `switchMap` in the effect keyed by task ID, or `concatLatestFrom`)

**Detection:** Rapidly move the same task between columns while the mock API has a delay. Check if rollback produces the correct state.

**Phase relevance:** Phase 2 (NGRX Store) -- this is the core architectural challenge of the exercise.

---

### Pitfall 4: Vitest + Angular TestBed Compatibility Failure

**What goes wrong:** Vitest does not natively support Angular's TestBed, decorators, or the Angular compiler. Running `ng test`-style specs with Vitest fails immediately with decorator/metadata errors or "Cannot resolve all parameters" errors.

**Why it happens:** Angular's compilation model requires the Angular compiler (ngc) or JIT compilation to process decorators like `@Component`, `@Injectable`, etc. Jest works because `jest-preset-angular` handles this via a custom transformer. Vitest has no equivalent first-party Angular preset.

**Consequences:** Tests do not run at all, or require extensive custom configuration. Time spent fighting tooling instead of writing tests.

**Prevention:**
1. Use `analogjs/vite-plugin-angular` (Analog's Vite plugin) which provides Angular compilation support for Vite-based tools including Vitest
2. Install `@analogjs/vite-plugin-angular` and configure `vitest.config.ts` with the plugin
3. For unit tests of pure functions (selectors, reducer logic), no Angular TestBed is needed -- test them as plain TypeScript functions. This is the simplest and most reliable approach
4. For component tests, Storybook interaction tests or Playwright component tests may be more reliable than Vitest + TestBed
5. Verify the Analog plugin version is compatible with Angular 21 before committing to this path

**Detection:** Run `vitest` on a simple Angular component test early. If it fails with decorator errors, the plugin is missing or misconfigured.

**Phase relevance:** Phase 1 (Project Setup) -- must be validated before writing any tests. Getting this wrong late means rewriting all test infrastructure.

---

### Pitfall 5: Storybook + Angular 21 Version Incompatibility

**What goes wrong:** Storybook's Angular framework adapter (`@storybook/angular`) may not support Angular 21 at the time of development. The adapter relies on Angular's internal compiler APIs which change between major versions.

**Why it happens:** Storybook typically lags behind Angular major releases by weeks to months. Angular 21 is the latest, and Storybook's Angular integration needs explicit updates to support new Angular compiler internals.

**Consequences:** `npm install` fails with peer dependency conflicts. Or Storybook installs but crashes at runtime with cryptic compiler errors. Stories do not render.

**Prevention:**
1. Check Storybook's Angular compatibility matrix BEFORE scaffolding. Use `npx storybook@latest init` and see if it detects Angular 21
2. If incompatible, use `--legacy-peer-deps` or `--force` cautiously, then test if stories actually render
3. Have a fallback plan: if Storybook is broken with Angular 21, document it in the README as a known constraint and rely on Playwright component tests instead
4. Pin Storybook to the latest version that claims Angular 21 support (check Storybook changelog/releases)
5. Keep stories simple -- avoid deep Angular DI in stories, use mock providers, which reduces surface area for compatibility issues

**Detection:** Run `npx storybook dev` immediately after setup. If it does not render a basic story, do not spend hours debugging -- evaluate the fallback.

**Phase relevance:** Phase 1 (Project Setup) -- validate early. If broken, pivot the testing strategy before writing stories.

---

## Moderate Pitfalls

### Pitfall 6: OXfmt Beta Breaking or Inconsistent Formatting

**What goes wrong:** OXfmt is a beta tool. It may not handle all TypeScript/Angular template syntax correctly, produce inconsistent formatting across runs, or conflict with other tools (ESLint, Angular template parser).

**Prevention:**
1. Pin the exact OXfmt version in `package.json` (not a range)
2. Run OXfmt on the full codebase after initial scaffold to catch any immediate failures
3. If OXfmt cannot handle Angular HTML templates, restrict it to `.ts` files only and use a different formatter (or none) for templates
4. Document the choice and any limitations in the README -- the interviewer should see this as a deliberate, informed decision
5. Do NOT add OXfmt to CI -- keep it "on save, local only" as planned. This avoids CI failures from beta instability

**Detection:** Format a file, then format it again. If the output differs, the tool is unstable on that file type.

**Phase relevance:** Phase 1 (Project Setup) -- configure once, verify, then leave alone.

---

### Pitfall 7: Conventional Commits + Husky Pre-commit Hook Failures in CI

**What goes wrong:** Husky hooks are not installed in CI environments (because `npm ci` may skip `prepare` scripts, or CI runs in a non-git context). Alternatively, hooks break on contributors' machines due to Husky v9+ requiring explicit script files in `.husky/`.

**Prevention:**
1. Use Husky v9+ syntax: `.husky/commit-msg` must be an executable shell script (not the old `.husky/_/husky.sh` pattern)
2. Add `"prepare": "husky"` to `package.json` scripts (Husky v9 pattern)
3. Make sure `.husky/commit-msg` contains the commitlint command: `npx --no -- commitlint --edit "$1"`
4. In CI (GitHub Actions), hooks are irrelevant because CI does not make commits -- but if CI runs `npm ci` and `prepare` fails because `.git` does not exist (e.g., in a Docker build), add: `"prepare": "husky || true"` to gracefully skip
5. Test the hook locally: make a commit with a bad message format and verify it is rejected

**Detection:** Make a commit with message "fix stuff" (no conventional format). If it succeeds, the hook is not working.

**Phase relevance:** Phase 1 (Project Setup) -- must be validated with the first commit.

---

### Pitfall 8: Vercel Angular SSR/Prerender Misconfiguration

**What goes wrong:** Vercel's Angular preset may attempt SSR or prerendering by default for Angular 17+ apps. A purely client-side SPA with mock data does not need SSR, and enabling it causes build failures (missing server entry point) or runtime errors (mock services trying to run in Node).

**Prevention:**
1. Ensure `angular.json` does NOT have `ssr: true` in the build configuration (Angular 17+ `ng new` may add this by default)
2. Use `ng new --ssr=false` or remove the `server` builder configuration
3. In `vercel.json`, set the framework to `angular` or use the `@vercel/static-build` builder with `ng build` output
4. Verify the `outputPath` in `angular.json` aligns with what Vercel expects (typically `dist/<project-name>/browser`)
5. Test `ng build` locally and verify the output directory structure before deploying

**Detection:** First Vercel deploy fails with "Cannot find server entry point" or the deployed site shows a blank page with console errors.

**Phase relevance:** Phase 5 (CI/CD + Deployment) -- validate with a minimal deploy early, not after the full app is built.

---

### Pitfall 9: Signal Computed Chains Causing Excessive Re-computation

**What goes wrong:** Deeply nested `computed()` signals that depend on store data cause a cascade of re-computations on every store update, even when the specific slice of state has not changed.

**Prevention:**
1. NGRX selectors already handle memoization -- do not re-memoize in computed signals. Use `store.selectSignal(memoizedSelector)` and derive from there
2. Keep computed signal chains shallow (max 2-3 levels deep)
3. For the TaskCardComponent: derive `priorityClass`, `formattedDate`, and `isOverdue` as separate computed signals from the task input signal, not chained from each other
4. Use `equal` option in `computed()` for object-valued signals to prevent unnecessary updates: `computed(() => ..., { equal: myEqualFn })`

**Detection:** Add `console.log` inside computed signals during development. If a computed fires when unrelated state changes, the dependency chain is too broad.

**Phase relevance:** Phase 3 (Signals Integration) -- establish correct patterns in TaskCardComponent.

---

### Pitfall 10: Playwright CI Flakiness with Angular Dev Server

**What goes wrong:** Playwright tests in CI start `ng serve`, but the dev server takes too long to compile, causing Playwright to timeout waiting for the server. Or tests pass locally but fail in CI due to timing differences.

**Prevention:**
1. In CI, build first (`ng build`), then serve the static build with a lightweight server (e.g., `npx serve dist/...`) rather than using `ng serve`
2. Configure `playwright.config.ts` `webServer` block with adequate `timeout` (at least 120000ms for CI)
3. Use `reuseExistingServer: !process.env.CI` so local dev reuses a running server but CI always starts fresh
4. Add `retries: 2` in CI config to handle transient flakiness
5. Use `waitForSelector` or `expect(locator).toBeVisible()` instead of fixed `waitForTimeout()` calls

**Detection:** CI tests timeout or fail intermittently while local tests pass consistently.

**Phase relevance:** Phase 5 (CI/CD) -- configure Playwright for CI from the start, not after writing all tests locally.

---

## Minor Pitfalls

### Pitfall 11: NGRX Entity Adapter Overkill for Simple State

**What goes wrong:** Developers reach for `@ngrx/entity` with `EntityAdapter` for the tasks collection. While not wrong, it adds complexity (normalized IDs, entity map) that may be overkill for a mock-data exercise and harder to explain in an interview.

**Prevention:** For this exercise, a simple `Task[]` in state with manual array manipulation in reducers is perfectly defensible. The interviewer wants to see you understand NGRX patterns, not that you can install an adapter. If you DO use EntityAdapter, be prepared to explain why and demonstrate you understand what it does under the hood.

**Phase relevance:** Phase 2 (NGRX Store) -- make a deliberate choice and be ready to defend it.

---

### Pitfall 12: Forgetting `provideStore()` and `provideEffects()` in Standalone App

**What goes wrong:** Angular 21 uses standalone components by default. The old `StoreModule.forRoot()` pattern requires `NgModule`. With standalone, you must use `provideStore()` and `provideEffects()` in the application config.

**Prevention:**
1. In `app.config.ts`, use `provideStore({ tasks: taskReducer })` and `provideEffects(TaskEffects)`
2. Do NOT create an `AppModule` just for NGRX -- this is an antipattern in Angular 17+
3. For feature-level state, use `provideState('featureName', featureReducer)` in route providers

**Detection:** "NullInjectorError: No provider for Store" at runtime.

**Phase relevance:** Phase 2 (NGRX Store) -- first thing to configure.

---

### Pitfall 13: Interview Anti-Pattern -- Over-Engineering Without Explanation

**What goes wrong:** The codebase has complex patterns (abstract factories, excessive generics, multi-layer indirection) but the candidate cannot explain WHY during the interview walkthrough. The spec says "you will be expected to walk through your solution in detail."

**Prevention:**
1. Every abstraction must have a one-sentence justification
2. If a pattern exists only because "it's best practice," simplify it
3. The DynamicWidgetOutletDirective is the place to show sophistication. The TaskCardComponent should be straightforward
4. Add code comments on non-obvious decisions (not what the code does, but WHY)
5. Keep the store flat and simple -- one feature state, not a deeply nested normalized structure

**Detection:** Can you explain every file's purpose in under 30 seconds? If not, simplify.

**Phase relevance:** All phases -- maintain throughout.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Project Setup (Phase 1) | Vitest + Angular incompatible without Analog plugin | Validate test runner with a trivial test before proceeding |
| Project Setup (Phase 1) | Storybook does not support Angular 21 yet | Check compat, have Playwright fallback ready |
| Project Setup (Phase 1) | Husky hooks not triggering | Test with an invalid commit message immediately |
| Project Setup (Phase 1) | OXfmt beta crashes on Angular templates | Restrict to `.ts` files, keep local-only |
| NGRX Store (Phase 2) | Optimistic rollback corrupts state on concurrent moves | Use correlation IDs and conditional rollback in reducer |
| NGRX Store (Phase 2) | Forgot standalone providers (`provideStore`) | Use `app.config.ts`, not modules |
| Signals (Phase 3) | `toSignal()` returns `T | undefined` everywhere | Use `requireSync: true` for store selectors |
| Signals (Phase 3) | Computed signal chains too deep | Derive directly from store signal, keep chains shallow |
| Dynamic Rendering (Phase 3) | ViewContainerRef not cleaned up on input change | Track ComponentRefs, destroy + clear before re-creating |
| Dynamic Rendering (Phase 3) | Output subscriptions leak | Maintain subscription array, teardown on changes and destroy |
| Testing (Phase 4) | Vitest TestBed tests fail with decorator errors | Test selectors/reducers as pure functions; use Analog plugin for component tests |
| CI/CD (Phase 5) | Playwright times out waiting for `ng serve` in CI | Build first, serve static files instead |
| CI/CD (Phase 5) | Vercel tries SSR, build fails | Ensure `ssr: false` in Angular config |
| Documentation (Phase 6) | README does not address AI usage transparently | Spec REQUIRES AI disclosure -- write it honestly |

---

## Sources

- Training data knowledge of Angular (v14-19 patterns, signals API introduced in v16, stabilized in v17-18)
- Training data knowledge of NGRX (v15-17, `selectSignal` added in NGRX v17)
- Training data knowledge of Vitest + Angular via AnalogJS
- Training data knowledge of Storybook Angular framework adapter compatibility patterns
- Training data knowledge of Playwright configuration patterns
- Training data knowledge of Vercel Angular deployment

**NOTE:** All findings are based on training data (cutoff ~May 2025). Angular 21 specifics, current Storybook/Vitest compatibility, and OXfmt beta status should be verified against current documentation before implementation. Confidence is MEDIUM across the board -- phase-specific research during implementation is strongly recommended for tooling compatibility (Vitest, Storybook, OXfmt).
