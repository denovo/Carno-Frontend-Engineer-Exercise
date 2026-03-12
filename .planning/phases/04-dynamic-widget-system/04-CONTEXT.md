# Phase 4: Dynamic Widget System - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a generic `DynamicWidgetOutletDirective` that renders Angular components from a config array at runtime, passing static, Observable, and Signal inputs and forwarding output events. Use this directive to power a `WidgetBarComponent` that displays live task stats (`TaskCountWidget`, `ProgressWidget`) derived from the NGRX store via computed signals. Testing and Storybook are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Widget placement
- Full-width horizontal strip between the toolbar and the board columns
- Implemented as a standalone `WidgetBarComponent` — `BoardPageComponent` includes `<app-widget-bar />` with no knowledge of widget internals
- `WidgetBarComponent` injects the Store, derives computed signals, and assembles the config array internally

### Widget visual style
- Compact stat chips — small pill/chip shape, label + value inline, low visual weight
- Status colour shown as a coloured dot/icon prefix before the label (neutral = grey, warning = amber, error = red)
- `ProgressWidget`: `MatProgressBar` with percentage label alongside (`Progress: ████░ 62%`)

### Status colour thresholds — TaskCountWidget
- Driven by **total task count** (simplest option, easy to explain in interview)
- Thresholds defined as named constants:
  - `neutral` → ≤ 10 tasks
  - `warning` → 11–20 tasks
  - `error` → > 20 tasks
- Status is a computed signal in `WidgetBarComponent` — reactive to store changes automatically

### Directive config API
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

</decisions>

<specifics>
## Specific Ideas

- Config interface should use generics for type safety: `WidgetConfig<C>` where `C` is the component type — keys in `inputs` are narrowed to valid input names for that component
- Directive internal switch: `case 'static': ref.setInput(...)`, `case 'observable': pipe(takeUntilDestroyed(...))`, `case 'signal': effect(() => ref.setInput(...))`
- Threshold constants should be named exports (e.g. `WIDGET_TASK_COUNT_WARNING = 10`, `WIDGET_TASK_COUNT_ERROR = 20`) so they're visible and explainable in the interview
- `WidgetStatus<T>` interface: `{ value: T; status: 'success' | 'warning' | 'error' | 'neutral'; icon?: string; tooltip?: string }`

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `selectCountByPriority` selector — available but not used by Phase 4 widgets (could power a future priority breakdown widget)
- `selectCompletionRate(DONE_COLUMN_ID)` selector — drives `ProgressWidget` completion percentage
- `selectAllTasks` — used in `WidgetBarComponent` to compute total task count for `TaskCountWidget`
- `DONE_COLUMN_ID` constant in `@app/core/constants` — passed to `selectCompletionRate`
- `MatProgressBarModule` — already imported in `BoardPageComponent`, available for `ProgressWidget`
- `MatChipsModule` — already imported in `TaskCardComponent`, can be used or replicated for chip styling

### Established Patterns
- Smart component injects Store, derives signals via `store.selectSignal()` or `computed()`, passes values down as inputs — `WidgetBarComponent` follows this same pattern
- `@app/*` path aliases throughout
- Standalone components, no NgModules
- Angular Material for all UI — no custom component libraries
- SCSS per component file

### Integration Points
- `board-page.component.html` — add `<app-widget-bar />` between `<mat-toolbar>` and the loading bar / `.board-columns` div
- `board-page.component.ts` — add `WidgetBarComponent` to `imports` array (no other changes needed)
- `core/store/index.ts` — `selectAllTasks`, `selectCompletionRate` already exported from the barrel

</code_context>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-dynamic-widget-system*
*Context gathered: 2026-03-12*
