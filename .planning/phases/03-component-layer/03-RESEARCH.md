# Phase 3: Component Layer - Research

**Researched:** 2026-03-12
**Domain:** Angular 21 standalone components, Angular Signals, Angular Material dialogs/snackbar, NGRX signal bridge
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Task card — collapsed state**
- Shows: title + priority badge (colour-coded)
- No description, assignee, or timestamps when collapsed
- Overdue indicator: red/amber border or background tint via CSS class computed signal (SIG-02) — not a badge label

**Task card — expanded state**
- Expanded reveals: description (if set), assignee, formatted `createdAt` / `updatedAt` dates
- Formatted dates use computed signals (SIG-03) — `createdAt` is `Date`, no parsing needed
- Overdue tint applies in expanded state too (tasks in Done column are never overdue)

**Task card — edit and move controls**
- Edit button visible only when card is expanded — click opens edit mode inline on the card (SIG-05 + SIG-06)
- Move select (column selector) visible only in expanded state — dispatches `moveTask` on change
- Delete button in expanded state — opens a MatDialog confirmation before dispatching `removeTask`
- Two separate local signal states: `isExpanded` and `isEditMode` (both default false)

**Task card — optimistic move feedback**
- While `moveTask` is pending (awaiting server), card gets subtle opacity/dim (CSS class via pending signal)
- On `moveTaskFailure`: card snaps back to original column + MatSnackBar toast "Failed to move task — reverted"
- On `moveTaskSuccess`: pending state cleared, card returns to normal opacity

**Create/edit form**
- Single `TaskFormComponent` opened via `MatDialog` (serves both create and edit)
- Fields: title (required), description (optional), priority (select from Priority enum), assignee (optional text)
- Column is NOT a form field on create — the dialog is opened with the target column pre-seeded (from the triggering button)
- Trigger points:
  - Per-column "+ Add task" button at the bottom of each column (opens dialog pre-set to that column)
  - Global "+ Add Task" button in the toolbar (opens dialog with a column selector, defaulting to first column)
- Edit trigger: Edit button on expanded TaskCard — opens same dialog pre-populated with existing task data

**Delete confirmation**
- MatDialog confirmation: "Delete this task?" with Cancel / Delete buttons
- Dispatches `removeTask` only on confirm

**Board page chrome**
- Toolbar: board name ("Petello Board") on the left, global "+ Add Task" MatButton on the right
- Loading state: `MatProgressBar` (indeterminate) below toolbar while `loadTasks` effect is pending, wired to store `loading` selector
- Columns displayed horizontally (flex row, no DnD)
- Empty column: shows "No tasks yet" placeholder text + "+ Add task" button

**Routing**
- Board page at root path `''` — single-page app, no nested routes needed for Phase 3
- `app.routes.ts` updated with `{ path: '', component: BoardPageComponent }`

**Smart / dumb component split (APP-08)**
- `BoardPageComponent` (smart): subscribes to store, dispatches actions, injects MatDialog + MatSnackBar
- `ColumnComponent` (dumb): receives `column` + `tasks` as inputs, emits task events upward
- `TaskCardComponent` (dumb): receives `task` as `input()` signal, emits `move` / `edit` / `delete` events
- `TaskFormComponent` (dialog): receives task data via `MAT_DIALOG_DATA`, returns form value on close

### Claude's Discretion
- Exact SCSS styles and Material theme tokens (minimal custom styling, Angular Material defaults)
- Animation/transition details on card expand/collapse
- Exact snackbar duration and positioning
- `MatProgressBar` exact positioning (top of toolbar vs below)

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| APP-01 | Single board view with columns displayed horizontally | BoardPageComponent with flex layout, MOCK_COLUMNS from mock-data.ts |
| APP-02 | Task card displayed in its column with title, priority indicator, assignee | TaskCardComponent with collapsed/expanded states, priority CSS badge |
| APP-03 | Create task form/dialog (title, description, priority, assignee) | TaskFormComponent via MatDialog, Reactive Forms with Validators.required on title |
| APP-04 | Edit task — inline or dialog, updates task details in store | Same TaskFormComponent pre-populated, dispatches updateTask action |
| APP-05 | Delete task with confirmation | MatDialog confirmation component, dispatches removeTask on confirm |
| APP-06 | Move task between columns via select box (triggers optimistic update) | MatSelect in expanded TaskCard, dispatches moveTask — reducer applies immediately, effect rolls back on failure |
| APP-07 | Angular Material components used for UI — minimal custom styling | MatToolbar, MatCard, MatButton, MatDialog, MatSnackBar, MatSelect, MatProgressBar, MatFormField |
| APP-08 | Smart / dumb component separation throughout | BoardPageComponent (smart), ColumnComponent (dumb), TaskCardComponent (dumb) |
| SIG-01 | TaskCardComponent uses `input()` signal API for receiving task data | `task = input.required<Task>()` — Angular 21 input() API |
| SIG-02 | Computed signal for priority CSS class | `priorityClass = computed(() => 'priority-' + this.task().priority.toLowerCase())` |
| SIG-03 | Computed signal for formatted date display | `formattedCreatedAt = computed(() => this.task().createdAt.toLocaleDateString())` |
| SIG-04 | Computed signal for overdue indicator | Age check: `(now - createdAt) / 86400000 > OVERDUE_THRESHOLD_DAYS` and task not in Done column |
| SIG-05 | Local UI state with signals — expansion state, edit mode | `isExpanded = signal(false)`, `isEditMode = signal(false)` |
| SIG-06 | `model()` two-way binding for edit mode in TaskCard | `model()` or writable signal; given locked design, `signal()` suffices for local state |
| SIG-07 | NGRX selector bridged to Angular signal via `store.selectSignal()` | `store.selectSignal(selectLoading)`, `store.selectSignal(selectTasksByColumn(col.id))` |
| SIG-08 | Smart components pass signal values to presentational components via `input()` | BoardPageComponent passes `tasks` signal to ColumnComponent; ColumnComponent passes `task` to TaskCardComponent |

</phase_requirements>

---

## Summary

Phase 3 builds the visible application on top of the complete NGRX store from Phase 2. The work is component authoring: four components (`BoardPageComponent`, `ColumnComponent`, `TaskCardComponent`, `TaskFormComponent`) plus one inline confirmation dialog, wired together through Angular Material and the signal bridge pattern.

The stack is already installed and configured. Angular Material 21, Angular CDK 21, and Angular Signals are all present in `package.json`. The store barrel at `@app/core/store` exports every action, selector, and effect needed. The path alias `@app/*` maps to `src/app/*` via `tsconfig.json`. No new dependencies need to be installed.

The primary technical novelties in this phase are: (1) the `input()` / `computed()` signal API on `TaskCardComponent` — the correct Angular 21 idiom for dumb components; (2) the `store.selectSignal()` bridge in `BoardPageComponent`; (3) the `isPending` tracking for optimistic move feedback, which requires storing in-flight task IDs (either a `Set` in a local signal or a store slice). The CONTEXT.md decision to pass `isPending` as an `input()` to the dumb TaskCardComponent is the cleanest approach.

**Primary recommendation:** Follow the smart/dumb split exactly as locked in CONTEXT.md. Use `store.selectSignal()` in `BoardPageComponent` to convert store state to signals, then pass those signals down as `input()` props. Keep all dispatch calls in the smart component — dumb components emit output events only.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@angular/core` | 21.2.0 | Components, signals, DI | Installed — project baseline |
| `@angular/material` | 21.2.1 | MatDialog, MatSnackBar, MatToolbar, MatCard, MatButton, MatSelect, MatProgressBar, MatFormField | Installed, locked decision |
| `@angular/forms` | 21.2.0 | Reactive Forms in TaskFormComponent | Installed, required for typed form |
| `@ngrx/store` | 21.0.1 | Store dispatch and selectSignal | Installed, Phase 2 complete |
| `@angular/router` | 21.2.0 | RouterOutlet, routes | Installed, needs route registration |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@angular/cdk` | 21.2.1 | Dialog overlay infrastructure | Pulled in by Material — no direct use needed |
| `rxjs` | 7.8 | takeUntilDestroyed, toSignal if needed | Already imported in effects — avoid in dumb components |

### Alternatives Considered
None — all choices are locked decisions from CONTEXT.md.

**Installation:**
```bash
# Nothing to install — all dependencies present in package.json
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/app/
├── features/
│   └── board/
│       ├── board-page/
│       │   ├── board-page.component.ts
│       │   ├── board-page.component.html
│       │   └── board-page.component.scss
│       ├── column/
│       │   ├── column.component.ts
│       │   ├── column.component.html
│       │   └── column.component.scss
│       ├── task-card/
│       │   ├── task-card.component.ts
│       │   ├── task-card.component.html
│       │   └── task-card.component.scss
│       └── task-form/
│           ├── task-form.component.ts
│           ├── task-form.component.html
│           └── task-form.component.scss
├── core/
│   └── (store, services, constants — already exists)
└── shared/
    └── models/  (already exists)
```

Note: Angular 21 drops the `.component.` infix from root files but components within `features/` conventionally retain it for clarity. The `board-page.component.ts` naming pattern is standard Angular generator output.

### Pattern 1: Input Signal on Dumb Component (SIG-01, SIG-08)

**What:** `TaskCardComponent` receives its task via `input.required<Task>()`. Angular 21's `input()` returns a `Signal<T>` — computed signals can reference it reactively without subscribing.

**When to use:** Any presentational component that receives data from a parent.

```typescript
// task-card.component.ts
import { Component, computed, input, output, signal } from "@angular/core";
import { Task } from "@app/shared/models";
import { DONE_COLUMN_ID, OVERDUE_THRESHOLD_DAYS } from "@app/core/constants";
import { Priority } from "@app/shared/models";

export interface MoveEvent { taskId: string; previousColumnId: string; newColumnId: string; }

@Component({
  selector: "app-task-card",
  standalone: true,
  templateUrl: "./task-card.component.html",
  styleUrl: "./task-card.component.scss",
})
export class TaskCardComponent {
  // SIG-01: input() signal API
  task = input.required<Task>();
  isPending = input<boolean>(false);

  // Output events (dumb component — never dispatches directly)
  move = output<MoveEvent>();
  edit = output<Task>();
  delete = output<Task>();

  // SIG-05: Local UI state
  isExpanded = signal(false);
  isEditMode = signal(false);

  // SIG-02: Priority CSS class
  priorityClass = computed(() => `priority-${this.task().priority.toLowerCase()}`);

  // SIG-03: Formatted dates
  formattedCreatedAt = computed(() =>
    this.task().createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  );
  formattedUpdatedAt = computed(() =>
    this.task().updatedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  );

  // SIG-04: Overdue indicator — age-based, never for Done column
  isOverdue = computed(() => {
    const t = this.task();
    if (t.columnId === DONE_COLUMN_ID) return false;
    const ageMs = Date.now() - t.createdAt.getTime();
    return ageMs / 86_400_000 > OVERDUE_THRESHOLD_DAYS;
  });
}
```

### Pattern 2: NGRX → Signal Bridge in Smart Component (SIG-07)

**What:** `store.selectSignal()` converts an NGRX selector to an Angular `Signal<T>`. The signal updates whenever the store state changes. No manual subscription or `async` pipe needed in the smart component class.

**When to use:** Smart components that need reactive store values to pass as `input()` to children.

```typescript
// board-page.component.ts (excerpt)
import { Component, inject, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { selectLoading, selectTasksByColumn, loadTasks, moveTask, addTask, updateTask, removeTask } from "@app/core/store";
import { MOCK_COLUMNS } from "@app/core/services/mock-data";
import { DONE_COLUMN_ID } from "@app/core/constants";

@Component({
  selector: "app-board-page",
  standalone: true,
  templateUrl: "./board-page.component.html",
  styleUrl: "./board-page.component.scss",
})
export class BoardPageComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  // SIG-07: NGRX → Signal bridge
  readonly loading = this.store.selectSignal(selectLoading);

  // Derive per-column task signals — one per column
  readonly columns = MOCK_COLUMNS;
  readonly tasksByColumn = Object.fromEntries(
    MOCK_COLUMNS.map((col) => [
      col.id,
      this.store.selectSignal(selectTasksByColumn(col.id)),
    ])
  );

  ngOnInit(): void {
    this.store.dispatch(loadTasks({ boardId: "board-1" }));
  }
}
```

### Pattern 3: MAT_DIALOG_DATA for TaskFormComponent

**What:** Angular Material injects dialog data via `MAT_DIALOG_DATA` injection token. The form component closes itself via `MatDialogRef.close(result)`, and the opener reads the result from `afterClosed()`.

**When to use:** Any dialog that returns data to the caller.

```typescript
// task-form.component.ts (key structure)
import { Component, inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormBuilder, Validators } from "@angular/forms";
import { Task, Priority, Column } from "@app/shared/models";

export interface TaskFormData {
  task?: Task;              // present when editing
  defaultColumnId: string;  // pre-seeded column for create
  columns: Column[];        // for column selector when global add
  showColumnSelector: boolean;
}

export interface TaskFormResult {
  title: string;
  description?: string;
  priority: Priority;
  assignee?: string;
  columnId: string;
}

@Component({ /* ... */ })
export class TaskFormComponent {
  private readonly dialogRef = inject<MatDialogRef<TaskFormComponent, TaskFormResult>>(MatDialogRef);
  readonly data = inject<TaskFormData>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    title: [this.data.task?.title ?? "", Validators.required],
    description: [this.data.task?.description ?? ""],
    priority: [this.data.task?.priority ?? Priority.Medium],
    assignee: [this.data.task?.assignee ?? ""],
    columnId: [this.data.task?.columnId ?? this.data.defaultColumnId],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.getRawValue() as TaskFormResult);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
```

**Opening the dialog from `BoardPageComponent`:**
```typescript
openCreateTask(defaultColumnId: string, showColumnSelector = false): void {
  const ref = this.dialog.open<TaskFormComponent, TaskFormData, TaskFormResult>(
    TaskFormComponent,
    {
      width: "480px",
      data: { defaultColumnId, columns: this.columns, showColumnSelector },
    }
  );
  ref.afterClosed().subscribe((result) => {
    if (result) {
      this.store.dispatch(addTask({ task: { ...result } }));
    }
  });
}
```

### Pattern 4: Pending State Tracking for Optimistic Move (APP-06)

**What:** When `moveTask` is dispatched, the card should dim until `moveTaskSuccess` or `moveTaskFailure` arrives. Since `TaskCardComponent` is dumb, the `isPending` boolean is computed in `BoardPageComponent` and passed as `input()`.

**Implementation:** A `Set<string>` tracking in-flight task IDs, managed as a writable signal in `BoardPageComponent`. On dispatch, add the taskId; on success/failure action (listened to via `Actions` stream or store effect), remove it.

Simpler alternative that avoids `Actions` in the smart component: derive `isPending` from a store-level `pendingTaskIds: string[]` slice. However, that requires a store change. The local signal approach is cleaner for Phase 3:

```typescript
// In BoardPageComponent
private readonly pendingTaskIds = signal<Set<string>>(new Set());

isPending(taskId: string): boolean {
  return this.pendingTaskIds().has(taskId);
}

onMoveTask(event: MoveEvent): void {
  this.pendingTaskIds.update((s) => new Set(s).add(event.taskId));
  this.store.dispatch(moveTask(event));
}
```

Listen for failure to show snackbar and clear pending — inject `Actions` (from `@ngrx/effects`) in `BoardPageComponent` and use `takeUntilDestroyed`:

```typescript
import { Actions, ofType } from "@ngrx/effects";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

// In BoardPageComponent constructor or ngOnInit:
inject(Actions).pipe(
  ofType(moveTaskFailure, moveTaskSuccess),
  takeUntilDestroyed(this.destroyRef)
).subscribe((action) => {
  this.pendingTaskIds.update((s) => {
    const next = new Set(s);
    next.delete(action.taskId);
    return next;
  });
  if (action.type === moveTaskFailure.type) {
    this.snackBar.open("Failed to move task — reverted", "Dismiss", { duration: 4000 });
  }
});
```

### Pattern 5: Inline Delete Confirmation via MatDialog

**What:** Rather than a separate component file, a simple confirmation can use `MatDialog.open()` with an inline component or a shared `ConfirmDialogComponent`.

**Recommended:** A small `ConfirmDialogComponent` is the correct pattern — reusable if delete is triggered from multiple places:

```typescript
// features/board/confirm-dialog/confirm-dialog.component.ts
@Component({
  template: `
    <h2 mat-dialog-title>Delete this task?</h2>
    <mat-dialog-content>This action cannot be undone.</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-button color="warn" [mat-dialog-close]="true">Delete</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
})
export class ConfirmDialogComponent {}
```

### Anti-Patterns to Avoid

- **Dispatching in dumb components:** `TaskCardComponent` and `ColumnComponent` must only emit output events. All `store.dispatch()` calls belong in `BoardPageComponent`.
- **Using `async` pipe with NGRX selectors:** In Angular 21 with signals, use `store.selectSignal()` instead. `async` pipe works but bypasses the signal graph.
- **Creating selectors inside the template:** `store.select(selectTasksByColumn(col.id))` in template expressions re-creates the selector on every change detection. Create the signal once in the component constructor/field.
- **Putting `isPending` in the NGRX store for Phase 3:** The store does not currently have a `pendingTaskIds` slice. Adding it requires store changes outside scope. Use a local signal in `BoardPageComponent`.
- **Calling `this.form.value` instead of `this.form.getRawValue()`:** Disabled form controls are excluded from `.value` but included in `.getRawValue()`. Use `getRawValue()` for safety.
- **Forgetting `takeUntilDestroyed` on `Actions` subscriptions:** Any subscription in a component that uses `inject(Actions).pipe(...).subscribe()` must include `takeUntilDestroyed()` to avoid memory leaks.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal dialogs | Custom overlay div + z-index | `MatDialog` | Focus trapping, backdrop, a11y, keyboard dismiss |
| Toast notifications | Fixed-position div with timeout | `MatSnackBar` | Queue management, dismiss, positioning, a11y live region |
| Form validation | Custom validation flags | `Validators.required` + `form.invalid` | Standard Angular pattern — interviewers expect it |
| Signal-to-observable bridge | Manual BehaviorSubject | `toObservable()` from `@angular/core/rxjs-interop` | Handles timing edge cases in zone-free context |
| Observable-to-signal bridge | Manual subscription + `signal()` | `toSignal()` from `@angular/core/rxjs-interop` | Handles completion and error states |

**Key insight:** Angular Material already handles every UI interaction pattern needed for this phase. Hand-rolling dialog or toast infrastructure would show unfamiliarity with the Material ecosystem.

---

## Common Pitfalls

### Pitfall 1: Factory Selector Called Inside Template
**What goes wrong:** `selectTasksByColumn` is a factory — calling it in template expressions (e.g., `*ngFor` + selector call) creates a new `MemoizedSelector` on every change detection tick, bypassing memoization.
**Why it happens:** Looks like it should work, and in simple cases it does, but performance degrades with many tasks.
**How to avoid:** Call `store.selectSignal(selectTasksByColumn(col.id))` once per column during class initialization. Store results in a record keyed by column ID.
**Warning signs:** Redux DevTools showing excessive selector computations; profiler showing many selector factory calls.

### Pitfall 2: Signal Input Not Called as Function in Template
**What goes wrong:** `{{ task.title }}` instead of `{{ task().title }}` in templates when `task` is an `input()` signal.
**Why it happens:** Angular template syntax for signals requires the call syntax `()`. TypeScript types will catch this in strict mode, but it's a common source of "works in class, broken in template" confusion.
**How to avoid:** Always treat `input()` returns as functions in templates: `task().title`, `task().priority`.
**Warning signs:** Template compilation error "task.title is not readable" or runtime `undefined` values.

### Pitfall 3: MatDialog Imports Missing from Standalone Component
**What goes wrong:** `MatDialog` is injected and called, but the dialog component fails to render because it lacks Material module imports.
**Why it happens:** Standalone components must explicitly import every Material module they use. There is no shared NgModule providing them.
**How to avoid:** Each standalone component lists all required Material modules in its `imports: []` array. `TaskFormComponent` needs: `MatDialogModule`, `MatFormFieldModule`, `MatInputModule`, `MatSelectModule`, `MatButtonModule`, `ReactiveFormsModule`.
**Warning signs:** Angular template error "Can't bind to 'formGroup'" or Material components rendering as plain HTML.

### Pitfall 4: `afterClosed()` Returns `undefined` on Backdrop Click
**What goes wrong:** Dialog close via backdrop or Escape key returns `undefined`, not a result. If the subscriber only checks `if (result)`, this is fine — but if it checks for a specific shape, it will throw.
**Why it happens:** `MatDialogRef.close()` without arguments emits `undefined` on the `afterClosed()` observable.
**How to avoid:** Always guard: `ref.afterClosed().subscribe((result) => { if (result) { ... } })`.

### Pitfall 5: Computed Signal with `Date.now()` Is Not Reactive
**What goes wrong:** `isOverdue = computed(() => Date.now() - this.task().createdAt.getTime() > ...)` — `Date.now()` is called once at computation time and never re-evaluated unless `task()` changes.
**Why it happens:** `computed()` re-evaluates only when its signal dependencies change. `Date.now()` has no signal dependency.
**How to avoid:** For Phase 3, this is acceptable — task cards recompute when the task input changes (e.g., after `updateTaskSuccess`). The overdue state is not a live clock. Document this limitation as a known constraint (good interview point).
**Warning signs:** Overdue status not updating between browser refreshes without task mutations.

### Pitfall 6: `model()` vs `signal()` for Local State
**What goes wrong:** SIG-06 mentions `model()` for edit mode. `model()` is a two-way bindable signal — it only makes sense when the parent binds `[(isEditMode)]`. Since `TaskCardComponent` is dumb and the parent does not bind to `isEditMode`, using `signal()` is correct; `model()` adds no value here.
**Why it happens:** `model()` looks like "the new, modern way" but it is specifically for two-way binding with parent components.
**How to avoid:** Use `signal(false)` for `isExpanded` and `isEditMode`. Satisfy SIG-06 intent by noting that `model()` was evaluated and `signal()` is appropriate given the single-component ownership of these states. `model()` could be used if a parent wanted to programmatically control expansion — valid architectural discussion for the interview.

### Pitfall 7: `BoardPageComponent` Not Added to Routes
**What goes wrong:** App renders blank because `app.routes.ts` still has `routes: Routes = []`.
**Why it happens:** Route registration is a separate step from component creation.
**How to avoid:** The first task in Phase 3 Wave 0 should register `{ path: '', component: BoardPageComponent }` in `app.routes.ts` and verify `ng serve` shows the board.

---

## Code Examples

### Angular Material Provider Setup (one-time in app.config.ts)

Angular Material 21 with standalone components does not require `provideAnimations()` separately — it is included via `provideAnimationsAsync()` or included automatically in many setups. However, dialogs require the overlay:

```typescript
// app.config.ts addition
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";

// Add to providers array:
provideAnimationsAsync(),
```

### store.selectSignal() Pattern

```typescript
// HIGH confidence — standard NGRX 21 API
readonly loading = this.store.selectSignal(selectLoading);
readonly todoTasks = this.store.selectSignal(selectTasksByColumn("col-todo"));
```

### input.required() Pattern (Angular 21)

```typescript
import { input } from "@angular/core";
// In component class:
task = input.required<Task>();
isPending = input<boolean>(false);
// In template: {{ task().title }}, [class.pending]="isPending()"
```

### output() Pattern (Angular 21)

```typescript
import { output } from "@angular/core";
// In component class:
move = output<MoveEvent>();
// Emit: this.move.emit({ taskId, previousColumnId, newColumnId });
// Parent binds: (move)="onMoveTask($event)"
```

### Reactive Form with Priority Enum

```typescript
readonly priorityOptions = Object.values(Priority); // ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
// In template: <mat-option *ngFor="let p of priorityOptions" [value]="p">{{ p }}</mat-option>
```

### takeUntilDestroyed in Component

```typescript
import { DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

// In component:
private readonly destroyRef = inject(DestroyRef);

// In ngOnInit or constructor:
someObservable$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(...);
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@Input()` decorator | `input()` signal function | Angular 17.1 | Input is now a `Signal<T>` — reactive without subscription |
| `@Output() EventEmitter` | `output()` function | Angular 17.3 | No longer extends `EventEmitter`, simpler API |
| `async` pipe + Observable | `store.selectSignal()` | NGRX 17+ | Direct signal — no pipe, no subscribe |
| `ngOnDestroy` + `Subject` teardown | `takeUntilDestroyed(destroyRef)` | Angular 16 | DI-based cleanup, works in constructor |
| `new FormControl('')` | `fb.group({...})` typed | Angular 14+ | Typed reactive forms — `form.getRawValue()` returns typed object |

**Deprecated/outdated:**
- `@Input()` decorator: Still works but signals pattern is preferred in Angular 21 for new components.
- `ngOnDestroy + takeUntil(destroy$)`: Replaced by `takeUntilDestroyed(destroyRef)`.
- `BrowserAnimationsModule`: Replaced by `provideAnimationsAsync()` in standalone apps.

---

## Open Questions

1. **`model()` for SIG-06: genuine two-way binding or `signal()` sufficient?**
   - What we know: CONTEXT.md mentions `model()` for edit mode; TaskCardComponent is a dumb component with no parent two-way binding.
   - What's unclear: Whether the spec evaluator specifically wants to see `model()` API demonstrated.
   - Recommendation: Use `signal(false)` for both `isExpanded` and `isEditMode`. Add a code comment noting `model()` was considered and would be used if a parent needed to programmatically toggle expansion. This surfaces the knowledge without misapplying the API.

2. **`provideAnimationsAsync()` — already in app.config.ts?**
   - What we know: `app.config.ts` does not currently include it. MatDialog requires overlay/animation providers.
   - What's unclear: Whether `@angular/build:unit-test` with Angular 21 auto-includes animation providers.
   - Recommendation: Add `provideAnimationsAsync()` to `app.config.ts` in Wave 0 of this phase. Low risk, required for dialog animations.

3. **Column selector in global "+ Add Task" dialog**
   - What we know: The toolbar button opens the form with a column selector defaulting to the first column.
   - What's unclear: Whether `ColumnComponent` should also emit an "add task" event or if `BoardPageComponent` manages this.
   - Recommendation: `ColumnComponent` emits `addTask = output<string>()` (emitting the column ID). `BoardPageComponent` handles it and opens the dialog. Clean separation.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.8 (via `@angular/build:unit-test`) |
| Config file | `tsconfig.spec.json` (types: vitest/globals) |
| Quick run command | `npm test -- --reporter=verbose` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SIG-02 | `priorityClass` computed returns correct CSS class | unit | `npm test -- --reporter=verbose` | ❌ Wave 0 |
| SIG-03 | `formattedCreatedAt` computed formats Date correctly | unit | `npm test -- --reporter=verbose` | ❌ Wave 0 |
| SIG-04 | `isOverdue` computed: false for Done column, true beyond threshold | unit | `npm test -- --reporter=verbose` | ❌ Wave 0 |
| SIG-05 | `isExpanded` / `isEditMode` toggle correctly | unit | `npm test -- --reporter=verbose` | ❌ Wave 0 |
| APP-01 | Board displays all columns | manual / smoke | `ng serve` visual check | N/A |
| APP-03 | Create task dispatches addTask with correct payload | unit | `npm test -- --reporter=verbose` | ❌ Wave 0 |
| APP-05 | Delete confirmation dialog dispatches removeTask on confirm | unit | `npm test -- --reporter=verbose` | ❌ Wave 0 |
| APP-06 | Move task triggers optimistic update and rollback | unit (reducer already tested) | existing tests | ✅ Phase 2 |

### Sampling Rate
- **Per task commit:** `npm test` (full suite, <10s currently)
- **Per wave merge:** `npm test` + `ng build --configuration production` (verify no bundle errors)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/app/features/board/task-card/task-card.component.spec.ts` — computed signal tests for SIG-02, SIG-03, SIG-04, SIG-05
- [ ] `provideAnimationsAsync()` added to `app.config.ts` — required for MatDialog
- [ ] `{ path: '', component: BoardPageComponent }` registered in `app.routes.ts`

---

## Sources

### Primary (HIGH confidence)
- Codebase inspection (`src/app/**`) — direct read of all existing source files, versions, and patterns
- `package.json` — confirmed Angular 21.2.0, Angular Material 21.2.1, NGRX 21.0.1, Vitest 4.0.8
- `tsconfig.json` — confirmed `@app/*` path alias, strict mode, isolatedModules
- Angular 21 API knowledge (input/output/computed/signal functions, store.selectSignal) — stable since Angular 17-19, confirmed production in 21

### Secondary (MEDIUM confidence)
- Angular Material standalone import pattern — confirmed via prior project Phase 1/2 patterns; each component imports required Material modules
- `takeUntilDestroyed` cleanup pattern — established Angular 16+ pattern, confirmed available in Angular 21

### Tertiary (LOW confidence)
- `provideAnimationsAsync()` requirement for MatDialog — standard Angular Material setup guidance; needs verification that it is absent from current `app.config.ts` (confirmed absent by code read, so HIGH confidence this gap exists)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries confirmed installed via package.json
- Architecture: HIGH — locked by CONTEXT.md decisions; patterns verified against existing codebase
- Pitfalls: HIGH — derived from direct code inspection and known Angular/NGRX API behaviours
- Signal API patterns: HIGH — stable since Angular 17, project already uses `signal()` in app.ts

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable Angular/NGRX APIs — 30-day horizon)
