# signal() vs model() — Reasoning & Interview Notes

## Quick Reference

| | `signal()` | `model()` |
|---|---|---|
| **What it is** | A writable reactive primitive | A two-way bindable input/output pair |
| **Ownership** | Owned entirely by the component | Shared ownership — parent can read and write |
| **Parent binding** | Not possible from a parent template | `[(myModel)]="parentVar"` |
| **Template API** | `value()` to read, `.set()` / `.update()` to write | Same — `value()`, `.set()`, `.update()` |
| **Under the hood** | `WritableSignal<T>` | `ModelSignal<T>` — wraps an `input()` + `output()` pair |
| **Right choice when** | State is purely internal UI state | State is legitimately owned by both component and parent |

---

## What `signal()` Is

`signal()` creates a reactive value that lives entirely inside the component. Nothing outside the component can set it — it's encapsulated. The component is the sole owner.

```typescript
isEditMode = signal(false);

// Only this component can write to it
this.isEditMode.set(true);
this.isEditMode.update(v => !v);

// Template reads it
{{ isEditMode() }}
```

Use `signal()` for anything that is an **internal implementation detail** of the component: whether a dropdown is open, whether a panel is in edit mode, a locally computed counter, etc. The parent never needs to know about it, and exposing it would leak implementation details.

---

## What `model()` Is

`model()` is syntactic sugar over an `input()` + `output()` pair that Angular treats as a two-way binding. When you write:

```typescript
isExpanded = model(false);
```

Angular generates:
- An `input` named `isExpanded` (the parent can pass a value in)
- An `output` named `isExpandedChange` (the component emits when the value changes)

This allows the parent to use the two-way binding shorthand:

```html
<!-- Parent template -->
<app-task-card [(isExpanded)]="cardExpandedState" />
```

Which desugars to:

```html
<app-task-card
  [isExpanded]="cardExpandedState"
  (isExpandedChange)="cardExpandedState = $event"
/>
```

The component still reads and writes it identically to a signal:

```typescript
this.isExpanded.set(true);
this.isExpanded.update(v => !v);
const current = this.isExpanded();
```

The *difference* is only in what the parent can do with it.

---

## The Decision in This Codebase

### `isExpanded = model(false)` — why `model()` is right here

`isExpanded` controls whether a task card is collapsed or expanded. A parent component *could* legitimately want to control this — for example:

- An "Expand All" / "Collapse All" toolbar button in `BoardPageComponent`
- A keyboard shortcut that expands a focused card
- A search/filter feature that auto-expands cards matching a query

Because the expanded state is a meaningful part of the component's **public contract** — something a parent has a reasonable use case for setting — `model()` is the correct primitive. It leaves the door open for that parent binding without requiring a refactor later.

Even in the current implementation where no parent binds to it, using `model()` signals intent: *this state is part of the component's API surface*.

### `isEditMode = signal(false)` — why `signal()` is right here

`isEditMode` is an internal implementation detail of how `TaskCardComponent` manages its own state. In this app, "edit mode" doesn't actually render an inline form — it opens a `MatDialog` managed by the smart parent `BoardPageComponent`. The `isEditMode` flag exists only briefly as a transitional state before the dialog opens.

There is no scenario where `BoardPageComponent` (or any parent) would want to:
- Set `isEditMode` on a card from outside
- React to `isEditModeChange` events

If we used `model()` here, we'd be publishing a bindable API (`[(isEditMode)]`) that no consumer will ever use. That's misleading — it suggests the parent should care about this state when it shouldn't. It also violates encapsulation by turning an internal implementation detail into a public interface.

`signal()` is correct because `isEditMode` is **private complexity** — the component's internal machinery, not its contract.

---

## The General Rule

> Use `model()` when the state represents something the parent has a legitimate reason to read or write.
> Use `signal()` when the state is an internal implementation detail the parent doesn't need to know about.

A useful way to think about it: if you were designing this component as a reusable library component, would you include this state in the documentation? If yes, `model()`. If it would be an implementation detail you'd deliberately hide, `signal()`.

---

## Common Mistakes to Avoid

**Using `model()` for everything** — because it looks like a "better signal". It isn't. `model()` generates an `output` event that fires on every change. If the parent isn't binding to it, you're emitting events into the void on every state change. It also exposes state as public API that should be private.

**Using `signal()` when the parent genuinely needs control** — this forces you to add a separate `@Input()` / `input()` and manually sync it with the signal, which is exactly the problem `model()` solves.

**Confusing `model()` with `computed()`** — `computed()` is a *derived* read-only value calculated from other signals. `model()` is a *writable* value with a two-way binding API. Very different.

---

## Interview Talking Points

- `model()` was introduced in Angular 17.1 as part of the Signals-based reactivity system. It replaces the old `@Input() @Output()` two-way binding pattern with a cleaner, signals-native API.
- The `[(ngModel)]` syntax in template-driven forms is the most familiar example of two-way binding — `model()` brings that same pattern to component state in a type-safe, signals-based way.
- The fact that `model()` emits a `*Change` output means it integrates with `ChangeDetectionStrategy.OnPush` correctly — no zone.js required, fully signal-driven.
- In this codebase, using both side-by-side on `TaskCardComponent` is intentional: `isExpanded` has a plausible parent-binding use case (expand all), `isEditMode` is internal machinery. The comments explain the reasoning inline.
