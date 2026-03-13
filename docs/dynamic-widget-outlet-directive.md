# DynamicWidgetOutletDirective — Reasoning & Interview Notes

## What It Is

`DynamicWidgetOutletDirective` is a structural directive that renders Angular components dynamically at runtime from a configuration object, rather than declaring them statically in a template. Instead of writing `<app-task-count-widget />` directly in HTML, you pass a config describing which component to render, what inputs to give it, and what outputs to listen to — and the directive handles the rest.

```html
<!-- Static rendering — component is hardcoded in the template -->
<app-task-count-widget [data]="taskCountSignal" />

<!-- Dynamic rendering — component is described in a config object -->
<ng-container [dynamicWidgetOutlet]="widgetConfigs" />
```

The key difference: in the dynamic approach, the component type, its inputs, and its output handlers are all data. This means the set of rendered widgets can change at runtime, be driven by configuration, or be composed generically.

---

## Why This Pattern Exists

The exercise tests whether you understand Angular's lower-level component rendering APIs — specifically `ViewContainerRef` and `ComponentRef`. Most Angular developers only interact with components declaratively in templates. This pattern demonstrates understanding of the imperative layer underneath.

Real-world use cases for dynamic component rendering:
- Plugin systems (render a component registered by a third party)
- CMS-driven layouts (render components from a JSON config fetched from an API)
- Dashboard builders (user-configured widget arrangements)
- Modal/dialog systems (Angular Material's `MatDialog` uses this internally)
- Feature flag–driven rendering (different component implementations behind a flag)

In Petello, the use case is a widget dashboard — a defined set of widgets rendered from a config array, where each widget receives live store data as signals.

---

## Key Angular APIs

### `ViewContainerRef`
A reference to a container in the DOM where Angular can attach views. When injected in a directive, it refers to the host element's position in the view hierarchy. Used to imperatively create, insert, and destroy component instances.

```typescript
// Creates a component instance and attaches it to the view tree
const ref = this.vcr.createComponent(SomeComponent);
```

### `ComponentRef<T>`
The handle Angular returns when you create a component imperatively. Gives you access to:
- `ref.instance` — the component class instance (for setting inputs)
- `ref.setInput(name, value)` — the correct way to set `input()` signals
- `ref.destroy()` — tears down the component and removes it from the DOM

### `effect()` / `toObservable()`
Used to bridge Signal inputs into the dynamically rendered component. When an input is typed as `{ type: 'signal', value: Signal<T> }`, the directive uses an Angular `effect()` to watch the signal and call `ref.setInput()` whenever it changes.

### `DestroyRef`
Injected to run cleanup logic when the directive is destroyed. All subscriptions (from Observable inputs) and effects (from Signal inputs) are registered against `DestroyRef` so they clean up automatically — no manual `ngOnDestroy` teardown needed.

---

## The Config Interface

The directive accepts a single config object or an array. Each config describes one component to render:

```typescript
export type InputBinding<T> =
  | { type: 'static';     value: T }
  | { type: 'observable'; value: Observable<T> }
  | { type: 'signal';     value: Signal<T> };

export interface WidgetConfig<C> {
  component: Type<C>;
  inputs?: { [K in keyof C]?: InputBinding<C[K]> };
  outputs?: { [K in keyof C]?: (event: C[K]) => void };
}
```

### Why wrapper types, not separate buckets

An alternative design uses three separate keys (`staticInputs`, `observableInputs`, `signalInputs`). The wrapper type union was chosen instead because:

1. **Single `inputs` map** — all inputs for a component live in one place, regardless of how they're sourced. Easier to read and refactor.
2. **Self-documenting** — `{ type: 'signal', value: mySignal }` is explicit at the call site about what kind of reactivity is involved.
3. **Better for the interview walkthrough** — the `type` discriminant makes the directive's internal `switch` statement obvious and easy to explain.
4. **Extensible** — adding a new binding type (e.g., `{ type: 'resource' }` for Angular's future `resource()` API) only requires adding a new variant, not a new top-level key.

### How the directive handles each type internally

```typescript
for (const [inputName, binding] of Object.entries(inputs)) {
  switch (binding.type) {
    case 'static':
      ref.setInput(inputName, binding.value);
      break;

    case 'observable':
      binding.value
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(val => ref.setInput(inputName, val));
      break;

    case 'signal':
      effect(() => {
        ref.setInput(inputName, binding.value());
      }, { injector: this.injector });
      break;
  }
}
```

The `effect()` for Signal inputs runs in the directive's injection context, not the component's — which is why an explicit `injector` option is passed.

---

## Lifecycle Management

This is a common interview follow-up: *"How do you avoid memory leaks?"*

**Components:** Every `ComponentRef` is stored. When the directive is destroyed (or the config input changes), `ref.destroy()` is called on each one. This runs the component's `ngOnDestroy`, unregisters change detection, and removes the DOM node.

**Observable subscriptions:** Piped with `takeUntilDestroyed(this.destroyRef)`. When the directive is destroyed, DestroyRef notifies all pipes and they complete automatically.

**Signal effects:** Created with `{ injector: this.injector }`. Effects are tied to the injector's lifecycle — when the directive's injector is destroyed, the effect is cleaned up.

**Config changes:** If the `widgetConfigs` input changes at runtime, the directive destroys all existing component refs and re-renders from the new config. This keeps rendering declarative — the directive reacts to config changes the same way Angular reacts to template changes.

---

## The Widget Side

Widgets are plain standalone Angular components. They don't know they're being rendered dynamically — they just have `input()` signals and `output()` emitters like any other component.

```typescript
@Component({ selector: 'app-task-count-widget', ... })
export class TaskCountWidget {
  data = input.required<WidgetStatus<number>>();
}
```

`WidgetStatus<T>` is the generic interface that carries both the value and its semantic state:

```typescript
export interface WidgetStatus<T> {
  value: T;
  status: 'success' | 'warning' | 'error' | 'neutral';
  icon?: string;
  tooltip?: string;
}
```

The status colouring is derived in `WidgetBarComponent` using a computed signal:

```typescript
// TaskCountWidget status thresholds (defined as named constants)
readonly taskCount: Signal<WidgetStatus<number>> = computed(() => {
  const count = this.allTaskCount();
  return {
    value: count,
    status: count <= WIDGET_TASK_COUNT_WARNING
      ? 'neutral'
      : count <= WIDGET_TASK_COUNT_ERROR
        ? 'warning'
        : 'error'
  };
});
```

The widget itself is a dumb presentational component — it receives a `WidgetStatus<number>` and renders it. The business logic (what count means warning vs error) lives in the config layer, not the widget.

---

## Where `WidgetBarComponent` Fits

`WidgetBarComponent` is the smart component that:
1. Injects the Store
2. Builds `Signal<WidgetStatus<T>>` values from store selectors via `computed()`
3. Assembles the `WidgetConfig[]` array
4. Renders the array via `[dynamicWidgetOutlet]`

`BoardPageComponent` simply includes `<app-widget-bar />` — it doesn't know or care about widget internals.

This separation means:
- Adding a new widget = add an entry to `WidgetBarComponent`'s config array
- `BoardPageComponent` doesn't grow
- The directive is reusable anywhere

---

## Interview Talking Points

**"Why not just put the widgets directly in the template?"**
> You could, and for a fixed set of widgets it would be simpler. The directive demonstrates knowledge of Angular's imperative rendering APIs — `ViewContainerRef`, `ComponentRef`, `setInput()` — which are the primitives that power Angular Material's dialogs, CDK overlays, and any plugin-capable system. The widget system is the context; the directive is the demonstration.

**"How does it handle Signal inputs without `async` pipe?"**
> It uses `effect()` inside the directive's injection context. When the signal changes, the effect calls `ref.setInput()` on the component ref. Angular's change detection picks up the new input value the same way it would for a static template binding.

**"What happens when the config array changes?"**
> The directive's `ngOnChanges` (or an `input()` signal effect) detects the change, calls `destroy()` on all existing `ComponentRef` instances, clears the `ViewContainerRef`, and re-renders from the new config. This is equivalent to Angular tearing down and rebuilding a subtree when structural conditions change.

**"How do you prevent memory leaks?"**
> Three mechanisms: `ComponentRef.destroy()` for component cleanup, `takeUntilDestroyed(destroyRef)` for Observable subscriptions, and injector-scoped `effect()` for Signal subscriptions. All three tie cleanup to the directive's destruction — nothing needs to be manually unsubscribed.

**"Why generics on `WidgetConfig<C>`?"**
> Type safety at the call site. Without generics, `inputs` would be `Record<string, InputBinding<unknown>>` and the compiler couldn't catch mismatched input names or wrong value types. With `C` bound to the component type, TypeScript narrows the valid input keys and their expected types.
