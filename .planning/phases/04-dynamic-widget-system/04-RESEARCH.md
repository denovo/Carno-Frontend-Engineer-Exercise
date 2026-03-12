# Phase 4: Dynamic Widget System - Research

**Researched:** 2026-03-12
**Domain:** Angular dynamic component rendering, ViewContainerRef, signals integration, Angular Material chips/progress bar
**Confidence:** HIGH

## Summary

Phase 4 builds two things: a generic `DynamicWidgetOutletDirective` that renders Angular components from a config array at runtime, and a `WidgetBarComponent` that uses that directive to display live task stats. The directive is the interview showpiece — it demonstrates mastery of Angular's programmatic rendering API.

Angular 21 ships `inputBinding()`, `outputBinding()`, and `twoWayBinding()` as stable APIs in `@angular/core`, importable directly alongside `ViewContainerRef`. These replace the manual `setInput()` + observable subscription loop that was the standard pattern before Angular 20. However, the CONTEXT.md has specified a discriminated union config API (`{ type: 'static' | 'observable' | 'signal', value: T }`), which means the directive internally switches on config type — this is intentional for interview clarity and is compatible with the new APIs (call `setInput` for static, `takeUntilDestroyed` subscription for observable, `effect()` for signal).

The primary injector concern for this directive is `effect()` outside injection context. The solution is to inject `Injector` in the directive constructor and pass it via `{ injector }` option to `effect()`, or use `runInInjectionContext(this.injector, () => effect(...))`. Both patterns work in Angular 21 directives.

**Primary recommendation:** Implement `DynamicWidgetOutletDirective` as an attribute directive (not structural) injecting `ViewContainerRef` + `DestroyRef` + `Injector`. Use `input()` signal for the config array. On config change (via `effect()` on the input signal), clear the container and recreate all component refs. Use `setInput()` for static values, `takeUntilDestroyed(this.destroyRef)` for observable inputs, and `effect(() => ref.setInput(...), { injector })` for signal inputs.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Widget placement:**
- Full-width horizontal strip between the toolbar and the board columns
- Implemented as a standalone `WidgetBarComponent` — `BoardPageComponent` includes `<app-widget-bar />` with no knowledge of widget internals
- `WidgetBarComponent` injects the Store, derives computed signals, and assembles the config array internally

**Widget visual style:**
- Compact stat chips — small pill/chip shape, label + value inline, low visual weight
- Status colour shown as a coloured dot/icon prefix before the label (neutral = grey, warning = amber, error = red)
- `ProgressWidget`: `MatProgressBar` with percentage label alongside (`Progress: ████░ 62%`)

**Status colour thresholds — TaskCountWidget:**
- Driven by **total task count** (simplest option, easy to explain in interview)
- Thresholds defined as named constants:
  - `neutral` → ≤ 10 tasks
  - `warning` → 11–20 tasks
  - `error` → > 20 tasks
- Status is a computed signal in `WidgetBarComponent` — reactive to store changes automatically

**Directive config API:**
- Input values wrapped in a discriminated union: `{ type: 'static' | 'observable' | 'signal', value: T }`
- Single `inputs` map per config (not separate `staticInputs`/`observableInputs`/`signalInputs` buckets)
- Reason: wrapper types are self-documenting at the call site, make the directive's internal `switch` easy to walk through, and are extensible without adding new top-level keys
- `WidgetBarComponent` builds the config array — `BoardPageComponent` is not involved in widget config

### Claude's Discretion
- Exact chip/pill styling (padding, border-radius, font size) — Angular Material tokens, keep consistent with existing component styles
- Dot indicator implementation (CSS pseudo-element, `mat-icon`, or inline SVG)
- Whether `ProgressWidget` uses `MatProgressBar` in determinate mode or a custom bar
- Injector strategy for `effect()` inside the directive (explicit `injector` option vs `runInInjectionContext`)
- Whether directive uses `ngOnChanges` or an `input()` signal effect to detect config changes

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DYN-01 | `DynamicWidgetOutletDirective` structural directive using `ViewContainerRef` | ViewContainerRef.createComponent() API documented; attribute directive pattern is simpler and sufficient |
| DYN-02 | Directive accepts single component configuration or array of configurations | Config array input signal; clear+recreate loop pattern documented |
| DYN-03 | Configuration interface with generic type safety for component inputs and outputs | `WidgetConfig<C>` with generic component type; `keyof` narrowing for input names |
| DYN-04 | Passes static value inputs to dynamically rendered components | `ref.setInput(key, value)` — synchronous, no subscription needed |
| DYN-05 | Passes Observable inputs to dynamically rendered components (subscribes internally) | `obs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(v => ref.setInput(key, v))` |
| DYN-06 | Passes Signal inputs to dynamically rendered components | `effect(() => ref.setInput(key, sig()), { injector: this.injector })` |
| DYN-07 | Subscribes to component outputs and forwards events to provided handler functions | `ref.instance.outputName.subscribe(handler)` with `takeUntilDestroyed` |
| DYN-08 | Proper lifecycle management — `ComponentRef.destroy()` called on directive destroy | `DestroyRef.onDestroy()` callback calls `vcr.clear()` which destroys all component refs |
| DYN-09 | All input subscriptions tracked and cleaned up using `DestroyRef` or `takeUntilDestroyed` | `takeUntilDestroyed(this.destroyRef)` on all observable subscriptions; effects auto-cleaned by injector |
| WGT-01 | `WidgetStatus<T>` generic interface with value, status, optional icon, optional tooltip | Pure TypeScript interface; no runtime dependencies |
| WGT-02 | `TaskCountWidget` displaying task count with status colouring derived from store | Computed signal from `selectAllTasks`; named threshold constants |
| WGT-03 | `ProgressWidget` displaying visual progress bar for completion rate | `MatProgressBar` determinate mode + `[value]` binding; `selectCompletionRate(DONE_COLUMN_ID)` |
| WGT-04 | Widget state derived from store selectors using computed signals | `store.selectSignal()` + `computed()` in `WidgetBarComponent`; signals passed as config |
| WGT-05 | Generic type parameters on `DynamicWidgetOutletDirective` configuration for type-safe widget composition | `WidgetConfig<C extends object>` where input keys are `keyof C`; ensures inputs map matches component type |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@angular/core` | 21.2.0 | `ViewContainerRef`, `ComponentRef`, `DestroyRef`, `Injector`, `effect()`, `input()` | Built-in — only choice |
| `@angular/core/rxjs-interop` | 21.2.0 | `takeUntilDestroyed()` | Official Angular RxJS bridge |
| `@ngrx/store` | 21.0.1 | `Store.selectSignal()` for widget data | Already installed |
| `@angular/material/progress-bar` | 21.2.1 | `MatProgressBarModule` for `ProgressWidget` | Already imported in BoardPageComponent |
| `@angular/material/chips` | 21.2.1 | `MatChipsModule` for chip styling | Already imported in TaskCardComponent |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@angular/material/icon` | 21.2.1 | `MatIconModule` for status dot indicators | If using `mat-icon` for coloured status dots |

### New Installs Required
None — all required libraries are already in the project.

---

## Architecture Patterns

### Recommended Project Structure
```
src/app/
├── core/
│   ├── directives/
│   │   ├── dynamic-widget-outlet.directive.ts    # DYN-01 through DYN-09
│   │   └── dynamic-widget-outlet.directive.spec.ts
│   ├── models/
│   │   └── widget.models.ts                      # WGT-01: WidgetStatus<T>, WidgetConfig<C>
│   └── constants.ts                               # Add WIDGET_TASK_COUNT_WARNING/ERROR
└── features/
    └── board/
        ├── widget-bar/
        │   ├── widget-bar.component.ts            # WGT-04: smart container
        │   ├── widget-bar.component.html
        │   └── widget-bar.component.scss
        ├── task-count-widget/
        │   ├── task-count-widget.component.ts     # WGT-02
        │   └── task-count-widget.component.html
        ├── progress-widget/
        │   ├── progress-widget.component.ts       # WGT-03
        │   └── progress-widget.component.html
        └── board-page/
            └── board-page.component.html          # Add <app-widget-bar /> here
```

### Pattern 1: DynamicWidgetOutletDirective — Config-Driven Rendering

**What:** Attribute directive on a `<div>` or `<ng-container>` that reads a config array signal, clears its `ViewContainerRef`, and creates a `ComponentRef` for each config entry. For each entry it iterates over the `inputs` map and handles static / observable / signal binding accordingly.

**When to use:** Any time you need to render a list of components from a runtime config array with heterogeneous input types.

**Skeleton:**
```typescript
// Source: angular.dev/api/core/ViewContainerRef
@Directive({ selector: '[appDynamicWidgetOutlet]', standalone: true })
export class DynamicWidgetOutletDirective<C extends object> {
  private readonly vcr = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  readonly configs = input<WidgetConfig<C>[]>([]);

  constructor() {
    // effect() is valid here — we are inside constructor injection context
    effect(() => {
      const cfgs = this.configs();
      this.vcr.clear();
      for (const cfg of cfgs) {
        this.renderOne(cfg);
      }
    });
    // Ensure all created component refs are destroyed with the directive
    this.destroyRef.onDestroy(() => this.vcr.clear());
  }

  private renderOne(cfg: WidgetConfig<C>): void {
    const ref = this.vcr.createComponent(cfg.component);
    for (const [key, binding] of Object.entries(cfg.inputs ?? {})) {
      const b = binding as InputBinding<unknown>;
      switch (b.type) {
        case 'static':
          ref.setInput(key, b.value);
          break;
        case 'observable':
          (b.value as Observable<unknown>)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((v) => ref.setInput(key, v));
          break;
        case 'signal':
          effect(() => ref.setInput(key, (b.value as Signal<unknown>)()), {
            injector: this.injector,
          });
          break;
      }
    }
    for (const [key, handler] of Object.entries(cfg.outputs ?? {})) {
      const outputRef = (ref.instance as Record<string, OutputEmitterRef<unknown>>)[key];
      if (outputRef) {
        outputRef.subscribe(handler as (v: unknown) => void);
        // OutputEmitterRef subscriptions are cleaned up with the component ref
      }
    }
  }
}
```

**Key note on `effect()` placement:** Calling `effect()` inside the `constructor()` is the safest injection-context location in a directive. Calling it inside `ngOnInit()` or any other lifecycle hook requires `runInInjectionContext(this.injector, () => effect(...))`. Use the constructor form.

### Pattern 2: WidgetConfig Generic Interface

**What:** Typed config object that associates a component class with its inputs/outputs using generics to narrow key names.

```typescript
// Source: project convention + TypeScript generics
export type InputBinding<T> =
  | { type: 'static'; value: T }
  | { type: 'observable'; value: Observable<T> }
  | { type: 'signal'; value: Signal<T> };

export interface WidgetConfig<C extends object> {
  component: Type<C>;
  inputs?: {
    [K in keyof C]?: InputBinding<C[K]>;
  };
  outputs?: {
    [K in keyof C]?: (event: C[K]) => void;
  };
}
```

**Note on generics in practice:** Full generic narrowing (`[K in keyof C]`) requires knowing `C` at callsite. `WidgetBarComponent` can use `WidgetConfig<TaskCountWidgetComponent>[]` for the array. The directive itself uses `WidgetConfig<object>[]` as its input type so it can accept heterogeneous arrays — type safety lives at the construction site in `WidgetBarComponent`.

### Pattern 3: WidgetBarComponent — Smart Container

**What:** Standalone component that injects `Store`, derives signals, and builds the config array. `BoardPageComponent` only needs to add `<app-widget-bar />` — no props passed.

```typescript
@Component({ selector: 'app-widget-bar', standalone: true, ... })
export class WidgetBarComponent {
  private readonly store = inject(Store);

  private readonly totalTasks = this.store.selectSignal(selectAllTasks);
  private readonly completionRate = this.store.selectSignal(
    selectCompletionRate(DONE_COLUMN_ID)
  );

  readonly taskCountStatus = computed<WidgetStatus<number>>(() => {
    const count = this.totalTasks().length;
    return {
      value: count,
      status: count <= WIDGET_TASK_COUNT_WARNING
        ? 'neutral'
        : count <= WIDGET_TASK_COUNT_ERROR
          ? 'warning'
          : 'error',
    };
  });

  readonly progressStatus = computed<WidgetStatus<number>>(() => ({
    value: this.completionRate(),
    status: 'neutral',
  }));

  readonly widgetConfigs: WidgetConfig<object>[] = [
    {
      component: TaskCountWidgetComponent,
      inputs: {
        status: { type: 'signal', value: this.taskCountStatus },
      },
    },
    {
      component: ProgressWidgetComponent,
      inputs: {
        status: { type: 'signal', value: this.progressStatus },
      },
    },
  ];
}
```

**Critical:** `widgetConfigs` is a plain readonly array — not a signal — because the component set never changes. Only the _values_ flowing through the signal inputs change. This means the directive's config-change `effect()` fires only once (on init). The per-input `effect()` calls inside `renderOne()` handle live updates reactively.

### Pattern 4: Widget Components — Presentational

**What:** Pure presentational components with `input()` signal taking `WidgetStatus<T>`.

```typescript
// TaskCountWidgetComponent
@Component({ selector: 'app-task-count-widget', standalone: true, ... })
export class TaskCountWidgetComponent {
  readonly status = input.required<WidgetStatus<number>>();
}
```

The template reads `status().value` and `status().status` for conditional classes.

### Anti-Patterns to Avoid

- **Calling `effect()` in `ngOnInit()`** without `injector` option: results in runtime error "effect() can only be called within an injection context". Use constructor or pass `{ injector }`.
- **Calling `selectSignal()` or factory selectors inside the directive template**: The directive has no template. Always pass signals through the config API.
- **Making `widgetConfigs` a signal when the config is static**: Creates unnecessary reactivity. Static array is correct — let the per-input signal effects handle value updates.
- **Not calling `vcr.clear()` on `DestroyRef.onDestroy()`**: Leads to component refs accumulating. `vcr.clear()` calls `destroy()` on all child component refs.
- **Subscribing to `ComponentRef.instance.output` for signal-based outputs**: In Angular 21 standalone components, outputs created with `output()` return `OutputEmitterRef`. Subscribe via `.subscribe()` on the ref, not `.pipe(takeUntil(...))`. `OutputEmitterRef` is not an RxJS `Observable`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Observable subscription cleanup | Custom unsubscribe tracking | `takeUntilDestroyed(destroyRef)` | Built-in, composable, no Subject needed |
| Signal reactivity in directive | Manual change detection | `effect(() => ..., { injector })` | Angular's reactive primitive; auto-cleaned |
| Progress bar rendering | Custom `<div>` with width % | `MatProgressBar` determinate mode | Already installed; accessible by default |
| Component instance cleanup | Manual `componentRef.destroy()` array | `vcr.clear()` | Destroys all child views atomically |
| Status threshold logic | Complex switch | Named constants + ternary | Explicit, testable, explainable in interview |

**Key insight:** The directive's value comes from the config API abstraction, not from low-level DOM work. Resist reinventing lifecycle management when Angular's DI provides it.

---

## Common Pitfalls

### Pitfall 1: `effect()` Called Outside Injection Context
**What goes wrong:** `NG0203: effect() can only be called within an injection context` at runtime.
**Why it happens:** `effect()` (like `inject()`) must be called during component/directive construction or inside `runInInjectionContext`. Calling it in `ngOnInit`, `ngOnChanges`, or a helper method triggered after construction fails.
**How to avoid:** Call the effect that monitors the `configs` input signal inside `constructor()`. Pass `{ injector: this.injector }` to any `effect()` calls made inside `renderOne()` (which runs from the constructor's effect body — still needs explicit injector because we are inside a callback, not a constructor field initializer).
**Warning signs:** Error fires at first change detection cycle, not at construction.

### Pitfall 2: `vcr.clear()` Timing on Config Change
**What goes wrong:** Old widget components remain rendered alongside new ones when config changes.
**Why it happens:** The `effect()` on `configs` fires reactively, but if you only create new refs without clearing first, previous refs accumulate.
**How to avoid:** Always call `this.vcr.clear()` at the top of the config-change effect before the creation loop. `vcr.clear()` both removes views from the DOM and calls `destroy()` on each `ComponentRef`.
**Warning signs:** Duplicate widgets appearing in the widget bar.

### Pitfall 3: Observable `takeUntilDestroyed` DestroyRef Scope
**What goes wrong:** Subscription outlives the dynamic component (or the directive) if the wrong `DestroyRef` is used.
**Why it happens:** There are two possible `DestroyRef` contexts — the directive's own and the dynamically created component's. Use the **directive's** `DestroyRef` for all subscriptions created by the directive. The component ref is destroyed before the directive when `vcr.clear()` is called, so the directive's `DestroyRef` is the correct owner.
**How to avoid:** Capture `private readonly destroyRef = inject(DestroyRef)` once in the directive constructor and use it for all `takeUntilDestroyed` calls.
**Warning signs:** Memory leak in long-running scenario; subscriptions fire after widget is removed.

### Pitfall 4: Factory Selector Memoization Loss
**What goes wrong:** `selectCompletionRate(DONE_COLUMN_ID)` called inside `computed()` or inside the effect creates a new selector instance on every call, bypassing memoization.
**Why it happens:** `createSelector` memoizes per selector _instance_. A new call to the factory creates a new instance with empty cache.
**How to avoid:** Call `store.selectSignal(selectCompletionRate(DONE_COLUMN_ID))` once at class field initialization time (as `WidgetBarComponent` already does for other selectors). Store the resulting signal reference — don't call the factory in reactive contexts.
**Warning signs:** Excessive recalculation visible in DevTools; each task event triggers full completion recalc.

### Pitfall 5: `input()` Signal vs `@Input()` in Widget Components
**What goes wrong:** Widget component uses `@Input()` decorator; `ref.setInput()` works but bypasses change detection in some edge cases, and the component cannot use Angular signals API on its input.
**Why it happens:** `@Input()` and `input()` both work with `setInput()`, but `input()` signals are the project standard (SIG-01 established this).
**How to avoid:** All widget components use `input.required<T>()` for their `status` input. This is consistent with `TaskCardComponent`'s established pattern.
**Warning signs:** Component does not update when signal value changes; template reads undefined.

---

## Code Examples

Verified patterns from official Angular documentation:

### ViewContainerRef.createComponent with bindings (Angular 21, stable)
```typescript
// Source: angular.dev/api/core/ViewContainerRef
const ref = this.vcr.createComponent(MyWidget, {
  bindings: [
    inputBinding('status', this.statusSignal),
    outputBinding('dismiss', (event) => this.onDismiss(event)),
  ],
});
```

**Note:** This is the new API-level approach. The CONTEXT.md has decided on a discriminated-union config approach instead, which means we use `setInput()` + manual `effect()` in `renderOne()`. Both are valid in Angular 21. The discriminated union approach is more explicit and interview-friendly.

### `setInput()` for static values
```typescript
// Source: angular.dev/api/core/ComponentRef#setInput
ref.setInput('title', 'Total Tasks');
```

### Observable input binding with `takeUntilDestroyed`
```typescript
// Source: angular.dev/api/core/rxjs-interop/takeUntilDestroyed
observable$.pipe(
  takeUntilDestroyed(this.destroyRef)
).subscribe((value) => ref.setInput('status', value));
```

### Signal input binding with `effect()` and explicit `injector`
```typescript
// Source: angular.dev/api/core/effect + angular.dev/api/core/runInInjectionContext
effect(
  () => ref.setInput('status', statusSignal()),
  { injector: this.injector }
);
```

### MatProgressBar determinate mode
```typescript
// Source: material.angular.dev/components/progress-bar/overview
// In template:
// <mat-progress-bar mode="determinate" [value]="status().value" />
// Import:
import { MatProgressBarModule } from '@angular/material/progress-bar';
```

### `WidgetStatus<T>` interface
```typescript
// Source: project convention (CONTEXT.md specifics section)
export interface WidgetStatus<T> {
  value: T;
  status: 'success' | 'warning' | 'error' | 'neutral';
  icon?: string;
  tooltip?: string;
}
```

### Named threshold constants (in `constants.ts`)
```typescript
// Source: CONTEXT.md specifics
export const WIDGET_TASK_COUNT_WARNING = 10;  // neutral if count <= this
export const WIDGET_TASK_COUNT_ERROR = 20;    // warning if count <= this, error if above
```

### `DestroyRef.onDestroy()` for component cleanup
```typescript
// Source: angular.dev/api/core/DestroyRef
this.destroyRef.onDestroy(() => {
  this.vcr.clear(); // destroys all ComponentRefs in the container
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `ComponentFactoryResolver` + `ComponentFactory` | `ViewContainerRef.createComponent(Type, options)` | Angular 13 | Simpler API, no factory lookup |
| Manual `Subject` + `takeUntil(destroy$)` | `takeUntilDestroyed(destroyRef)` | Angular 16 | No Subject boilerplate |
| `@Input()` + `ngOnChanges` for reactive inputs | `input()` signal + `effect()` | Angular 17 | Template reads are signal-aware |
| Manual `setInput()` loop after `createComponent` | `inputBinding()` / `outputBinding()` in `bindings` array | Angular 20.1 | Declarative, co-located with creation |
| `effect()` options `allowSignalWrites` required | Removed — `effect()` can read and write without flag | Angular 19+ | Less boilerplate |

**Deprecated/outdated:**
- `ComponentFactoryResolver`: removed from Angular API, do not import
- `ComponentFactory`: replaced by direct `Type<T>` reference
- `ngModel` two-way binding in dynamic contexts: use `twoWayBinding()` or signal model
- `takeUntil(this.destroy$)` pattern: replaced by `takeUntilDestroyed()`

---

## Open Questions

1. **`outputBinding()` vs `ref.instance.output.subscribe()` for Angular 21 signal outputs**
   - What we know: Angular 21 `output()` returns `OutputEmitterRef<T>`. `outputBinding()` is available in `ViewContainerRef.createComponent`'s `bindings` array.
   - What's unclear: Whether `OutputEmitterRef.subscribe()` is safe to call on a dynamically created component (i.e., when does it clean up?). The CONTEXT.md notes output forwarding as DYN-07 but no widget currently uses outputs, making this lower priority.
   - Recommendation: Since no current widget uses `output()`, implement `outputs` map in the directive interface but keep implementation minimal (use `ref.instance.outputName.subscribe(handler)` directly — `OutputEmitterRef` subscriptions are cleaned when the component ref is destroyed). Test with a simple emit if outputs are added later.

2. **`WidgetConfig<C>` generic type — heterogeneous array challenge**
   - What we know: TypeScript `WidgetConfig<C>[]` requires all elements to share the same `C`. A mixed array of `WidgetConfig<TaskCountWidgetComponent>` and `WidgetConfig<ProgressWidgetComponent>` requires `WidgetConfig<object>[]` or a union type.
   - What's unclear: Whether the planner should define a specific union or use `WidgetConfig<object>[]` as the array type in `WidgetBarComponent`.
   - Recommendation: Use `WidgetConfig<object>[]` for the array in `WidgetBarComponent`; the per-entry type safety is enforced at object literal construction time by TypeScript inference. Document this tradeoff inline as an interview talking point.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest via @analogjs/vitest-angular (ng test --watch=false) |
| Config file | angular.json (test architect block) |
| Quick run command | `ng test --watch=false --include="**/dynamic-widget*"` |
| Full suite command | `ng test --watch=false` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DYN-01 | Directive creates ComponentRef in ViewContainerRef | unit | `ng test --watch=false --include="**/dynamic-widget-outlet*"` | ❌ Wave 0 |
| DYN-02 | Directive renders all configs from array | unit | `ng test --watch=false --include="**/dynamic-widget-outlet*"` | ❌ Wave 0 |
| DYN-03 | WidgetConfig type accepts valid component inputs only | compile-time | tsc --noEmit (CI) | N/A |
| DYN-04 | Static input value passed via setInput | unit | `ng test --watch=false --include="**/dynamic-widget-outlet*"` | ❌ Wave 0 |
| DYN-05 | Observable input value subscription updates component | unit | `ng test --watch=false --include="**/dynamic-widget-outlet*"` | ❌ Wave 0 |
| DYN-06 | Signal input value effect updates component | unit | `ng test --watch=false --include="**/dynamic-widget-outlet*"` | ❌ Wave 0 |
| DYN-07 | Output handler invoked on component emit | unit | `ng test --watch=false --include="**/dynamic-widget-outlet*"` | ❌ Wave 0 |
| DYN-08 | ComponentRef.destroy() called on directive destroy | unit | `ng test --watch=false --include="**/dynamic-widget-outlet*"` | ❌ Wave 0 |
| DYN-09 | Subscriptions cleaned up on directive destroy | unit | `ng test --watch=false --include="**/dynamic-widget-outlet*"` | ❌ Wave 0 |
| WGT-01 | WidgetStatus interface assignable / correct shape | compile-time | tsc --noEmit (CI) | N/A |
| WGT-02 | TaskCountWidget renders count and correct status class | unit | `ng test --watch=false --include="**/task-count-widget*"` | ❌ Wave 0 |
| WGT-03 | ProgressWidget renders progress bar with correct value | unit | `ng test --watch=false --include="**/progress-widget*"` | ❌ Wave 0 |
| WGT-04 | WidgetBarComponent derived signals react to store changes | unit | `ng test --watch=false --include="**/widget-bar*"` | ❌ Wave 0 |
| WGT-05 | WidgetConfig generic type safe at construction | compile-time | tsc --noEmit (CI) | N/A |

### Sampling Rate
- **Per task commit:** `ng test --watch=false --include="**/*widget*" --include="**/dynamic-widget*"`
- **Per wave merge:** `ng test --watch=false`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/app/core/directives/dynamic-widget-outlet.directive.spec.ts` — covers DYN-01 through DYN-09
- [ ] `src/app/features/board/widget-bar/widget-bar.component.spec.ts` — covers WGT-04
- [ ] `src/app/features/board/task-count-widget/task-count-widget.component.spec.ts` — covers WGT-02
- [ ] `src/app/features/board/progress-widget/progress-widget.component.spec.ts` — covers WGT-03

---

## Integration Points (Existing Codebase)

### `board-page.component.html` Change
Add between `<mat-toolbar>` closing tag and `@if (loading())` line:
```html
<app-widget-bar />
```

### `board-page.component.ts` Change
Add `WidgetBarComponent` to the `imports` array. No other changes required — the CONTEXT.md decision is that `BoardPageComponent` has no knowledge of widget internals.

### `constants.ts` Additions
```typescript
export const WIDGET_TASK_COUNT_WARNING = 10;
export const WIDGET_TASK_COUNT_ERROR = 20;
```

### Barrel Exports
- `src/app/core/store/index.ts` — `selectAllTasks` and `selectCompletionRate` already exported, no changes needed
- New directive may need export from a `core/directives/index.ts` barrel if one is created

---

## Sources

### Primary (HIGH confidence)
- `angular.dev/api/core/ViewContainerRef` — `createComponent` method signature, `bindings` parameter, Angular 21 current docs
- `angular.dev/guide/components/programmatic-rendering` — Full guide on `inputBinding`, `outputBinding`, `twoWayBinding`, signal patterns, cleanup patterns
- `angular.dev/api/core/inputBinding` — Function signature `inputBinding(publicName: string, value: () => unknown): Binding`
- `angular.dev/api/core/outputBinding` — Function signature `outputBinding<T>(eventName: string, listener: (event: T) => unknown): Binding`
- `angular.dev/api/core/rxjs-interop/takeUntilDestroyed` — `takeUntilDestroyed(destroyRef?)` operator docs
- `angular.dev/api/core/DestroyRef` — `onDestroy()` callback registration

### Secondary (MEDIUM confidence)
- `dev.to/this-is-angular/the-next-generation-of-dynamic-component` — `inputBinding`/`outputBinding` preview patterns (pre-20, but directionally accurate)
- `dev.to/codewithrajat/angulars-game-changing-dynamic-component-features` — Angular 20+ binding array usage examples
- `github.com/angular/angular/issues/50319` — Known issue: `effect()` / `takeUntilDestroyed` outside injection context in dynamically created components — confirms `runInInjectionContext` / `{ injector }` approach

### Tertiary (LOW confidence)
- Multiple Medium/DEV articles on chip styling with Angular Material — CSS custom property approach is consistent across sources but not from official docs

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed, versions confirmed in package.json
- Architecture: HIGH — directive pattern verified against Angular 21 official docs; config API is project-specified
- Pitfalls: HIGH — injection context issue verified via GitHub issue #50319; selector memoization is established project knowledge
- Test map: MEDIUM — test command flags (--include) confirmed by project's existing ng test --watch=false pattern

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (Angular releases monthly but 21.x patch changes rarely affect these APIs)
