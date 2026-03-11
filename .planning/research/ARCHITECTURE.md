# Architecture Patterns

**Domain:** Task Board Application (Angular 21 + NGRX)
**Researched:** 2026-03-11
**Confidence:** MEDIUM — Based on stable Angular 18-19+ patterns and NGRX conventions. Angular 21 may have incremental API changes, but standalone components, signals, and NGRX classic store patterns are well-established. External doc verification was unavailable; flag Angular 21-specific APIs for validation during implementation.

## Recommended Architecture

Petello follows a **feature-shell architecture** with standalone components (NgModules are deprecated in modern Angular). A single feature area (`board`) contains all task board logic. The NGRX store sits at the app root, with feature state registered via `provideState`. Smart (container) components dispatch actions and select state; presentational (dumb) components receive data via input signals and emit events via outputs.

### High-Level Structure

```
AppComponent (shell)
  |
  +-- BoardPageComponent (smart/container - routes to this)
  |     |
  |     +-- BoardHeaderComponent (presentational)
  |     |     +-- [DynamicWidgetOutlet] -> TaskCountWidget, ProgressWidget
  |     |
  |     +-- ColumnComponent (presentational, repeated per column)
  |           |
  |           +-- TaskCardComponent (presentational, repeated per task)
  |                 +-- Priority badge (computed signal)
  |                 +-- Column select box (move task)
  |                 +-- Edit/delete controls
  |
  +-- TaskDialogComponent (smart - modal for create/edit)
```

### Folder Structure

```
src/
  app/
    app.component.ts              # Shell: router-outlet, global layout
    app.config.ts                 # provideStore, provideEffects, provideRouter, etc.
    app.routes.ts                 # Top-level routes

    core/                         # Singleton services, guards, interceptors
      services/
        task-api.service.ts       # Mock API (RxJS delay, simulates latency + errors)
      models/
        board.model.ts            # Board, Column, Task interfaces
        widget.model.ts           # WidgetStatus<T>, WidgetConfig interfaces
        priority.model.ts         # Priority enum/union type

    store/                        # NGRX store (feature: 'tasks')
      tasks.actions.ts            # loadTasks, addTask, moveTask, updateTask, removeTask
      tasks.reducer.ts            # Entity adapter-based reducer
      tasks.effects.ts            # API side effects, error handling, rollback
      tasks.selectors.ts          # tasksByColumn, priorityBreakdown, completionRate
      tasks.state.ts              # TasksState interface, initial state
      index.ts                    # Public API barrel

    features/
      board/                      # Board feature area
        board-page/
          board-page.component.ts           # Smart: dispatches, selects, orchestrates
          board-page.component.html
          board-page.component.spec.ts
        board-header/
          board-header.component.ts         # Presentational: displays widgets
          board-header.component.html
        column/
          column.component.ts               # Presentational: renders task list
          column.component.html
        task-card/
          task-card.component.ts            # Presentational: input signals, computed
          task-card.component.html
          task-card.component.stories.ts    # Storybook story
          task-card.component.spec.ts
        task-dialog/
          task-dialog.component.ts          # Smart: form for create/edit, dispatches

    widgets/                      # Widget system
      widget-status.model.ts      # (re-exported from core/models if preferred)
      task-count-widget/
        task-count-widget.component.ts
        task-count-widget.component.stories.ts
      progress-widget/
        progress-widget.component.ts
        progress-widget.component.stories.ts

    shared/                       # Shared directive, pipes, small utilities
      directives/
        dynamic-widget-outlet.directive.ts  # Structural directive
        dynamic-widget-outlet.directive.spec.ts
      pipes/
        relative-date.pipe.ts     # Optional: "2 days ago" formatting

  environments/
    environment.ts
    environment.prod.ts
```

**Rationale for this structure:**
- `core/` holds singletons that exist once (services, models). No components here.
- `store/` is at app level because there is only one feature store (`tasks`). In a multi-feature app, store files would live inside each feature folder.
- `features/board/` groups all board-related components. Each component gets its own folder.
- `widgets/` is separate from `features/board/` because widgets are rendered dynamically and could be reused outside the board context.
- `shared/` holds the `DynamicWidgetOutletDirective` because it is a generic rendering utility, not board-specific.

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `AppComponent` | Shell layout, `<router-outlet>` | Router |
| `BoardPageComponent` | Container: injects Store, dispatches actions, selects state, bridges NGRX to signals via `toSignal()` | Store (dispatch/select), TaskDialogComponent (opens dialog) |
| `BoardHeaderComponent` | Displays widgets via `DynamicWidgetOutletDirective` | Receives widget configs as input signal |
| `ColumnComponent` | Renders column title + list of TaskCards | Receives `column` and `tasks` as input signals, emits `taskMoved`, `taskDeleted` |
| `TaskCardComponent` | Renders single task, inline edit, priority badge, column select | Receives `task` and `columns` as input signals, emits `moved`, `updated`, `deleted` |
| `TaskDialogComponent` | Modal form for creating/editing tasks | Injects Store (or receives task as input), dispatches `addTask`/`updateTask`, uses `MatDialogRef` |
| `DynamicWidgetOutletDirective` | Dynamically instantiates components from config array | Receives `WidgetConfig[]`, uses `ViewContainerRef` to create/destroy components |
| `TaskCountWidget` | Displays task count with status color | Receives count + status via input signals (set by directive) |
| `ProgressWidget` | Displays progress bar | Receives percentage + status via input signals (set by directive) |
| `TaskApiService` | Mock API: CRUD operations with `RxJS delay()` and occasional simulated errors | Called by Effects only |

### Data Flow

```
User Action (click, form submit, select change)
       |
       v
Smart Component (BoardPageComponent / TaskDialogComponent)
       |
       | store.dispatch(action)
       v
   NGRX Store
       |
       +---> Reducer (synchronous state update)
       |        |
       |        v
       |     Updated State
       |        |
       |        v
       |     Selectors (memoised queries)
       |        |
       |        v
       |     toSignal() in smart component
       |        |
       |        v
       |     Input signals down to presentational components
       |
       +---> Effects (side effects)
                |
                v
          TaskApiService (mock HTTP)
                |
                +---> Success: dispatch success action -> reducer updates
                +---> Failure: dispatch failure action -> reducer rolls back
```

**Optimistic update flow (moveTask):**

```
1. User selects new column in TaskCardComponent
2. ColumnComponent emits taskMoved(taskId, newColumnId)
3. BoardPageComponent dispatches moveTask({ taskId, fromColumnId, toColumnId })
4. Reducer IMMEDIATELY moves task to new column (optimistic)
5. Effect calls TaskApiService.moveTask()
6.   Success -> dispatch moveTaskSuccess (no-op or confirm)
7.   Failure -> dispatch moveTaskFailure({ taskId, fromColumnId })
         -> Reducer moves task BACK to original column (rollback)
         -> Effect shows snackbar/toast with error message
```

## Patterns to Follow

### Pattern 1: Smart/Dumb Component Split

**What:** Only smart (container) components interact with the Store. Presentational components receive data through input signals and emit events through output callbacks.

**When:** Always. This is non-negotiable for testability and reusability.

**Example:**
```typescript
// SMART: BoardPageComponent
@Component({
  selector: 'app-board-page',
  standalone: true,
  imports: [ColumnComponent, BoardHeaderComponent],
  template: `
    @for (column of columns(); track column.id) {
      <app-column
        [column]="column"
        [tasks]="tasksByColumn()[column.id] ?? []"
        (taskMoved)="onTaskMoved($event)"
        (taskDeleted)="onTaskDeleted($event)"
      />
    }
  `
})
export class BoardPageComponent {
  private store = inject(Store);

  // Bridge NGRX to signals
  columns = toSignal(this.store.select(selectColumns), { initialValue: [] });
  tasksByColumn = toSignal(this.store.select(selectTasksByColumnMap), { initialValue: {} });

  onTaskMoved(event: { taskId: string; toColumnId: string }) {
    this.store.dispatch(TasksActions.moveTask(event));
  }
}

// DUMB: ColumnComponent
@Component({
  selector: 'app-column',
  standalone: true,
  imports: [TaskCardComponent],
  template: `...`
})
export class ColumnComponent {
  column = input.required<Column>();
  tasks = input.required<Task[]>();

  taskMoved = output<{ taskId: string; toColumnId: string }>();
  taskDeleted = output<string>();
}
```

### Pattern 2: NGRX Action Hygiene (Event-Based Actions)

**What:** Actions describe events that happened, not commands to execute. Use `[Source] Event Description` naming.

**When:** Always. The exercise spec mentions "command vs event action patterns" as a bonus.

**Example:**
```typescript
// tasks.actions.ts
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const TasksPageActions = createActionGroup({
  source: 'Tasks Page',
  events: {
    'Load Tasks': props<{ boardId: string }>(),
    'Add Task': props<{ task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> }>(),
    'Move Task': props<{ taskId: string; fromColumnId: string; toColumnId: string }>(),
    'Update Task': props<{ taskId: string; changes: Partial<Task> }>(),
    'Remove Task': props<{ taskId: string }>(),
  },
});

export const TasksApiActions = createActionGroup({
  source: 'Tasks API',
  events: {
    'Tasks Loaded Successfully': props<{ tasks: Task[] }>(),
    'Tasks Loaded Failure': props<{ error: string }>(),
    'Move Task Success': props<{ taskId: string }>(),
    'Move Task Failure': props<{ taskId: string; fromColumnId: string; error: string }>(),
    // ... etc
  },
});
```

### Pattern 3: Entity Adapter for Tasks

**What:** Use `@ngrx/entity` `EntityAdapter` for normalised task storage. Avoids manual array manipulation and provides built-in selectors.

**When:** Any collection-based state. Tasks are the primary collection here.

**Example:**
```typescript
// tasks.state.ts
import { EntityState, createEntityAdapter } from '@ngrx/entity';

export interface TasksState extends EntityState<Task> {
  loading: boolean;
  error: string | null;
  pendingMoves: Record<string, string>; // taskId -> originalColumnId (for rollback)
}

export const tasksAdapter = createEntityAdapter<Task>({
  sortComparer: (a, b) => a.createdAt.localeCompare(b.createdAt),
});

export const initialTasksState: TasksState = tasksAdapter.getInitialState({
  loading: false,
  error: null,
  pendingMoves: {},
});
```

### Pattern 4: Signal-Based Computed State in TaskCardComponent

**What:** Use Angular `input()` signals for data, `computed()` for derived display values, and writable `signal()` for local UI state.

**Example:**
```typescript
@Component({
  selector: 'app-task-card',
  standalone: true,
})
export class TaskCardComponent {
  // Input signals
  task = input.required<Task>();
  columns = input.required<Column[]>();

  // Computed signals (derived from inputs)
  priorityClass = computed(() => `priority-${this.task().priority.toLowerCase()}`);
  formattedDate = computed(() => new Date(this.task().updatedAt).toLocaleDateString());
  isOverdue = computed(() => {
    const task = this.task();
    return task.dueDate ? new Date(task.dueDate) < new Date() : false;
  });

  // Local UI state signals
  isExpanded = signal(false);
  isEditing = signal(false);

  // Outputs
  moved = output<{ taskId: string; toColumnId: string }>();
  updated = output<{ taskId: string; changes: Partial<Task> }>();
  deleted = output<string>();

  toggleExpanded() {
    this.isExpanded.update(v => !v);
  }
}
```

### Pattern 5: DynamicWidgetOutletDirective (ViewContainerRef Pattern)

**What:** A structural directive that dynamically creates components from a configuration array. Uses `ViewContainerRef.createComponent()`, sets inputs via `ComponentRef.setInput()`, and subscribes to outputs.

**Architecture:**
```typescript
// Widget configuration interface
export interface WidgetConfig<C = any> {
  component: Type<C>;
  inputs?: Record<string, unknown | Observable<unknown> | Signal<unknown>>;
  outputs?: Record<string, (event: any) => void>;
}

// The directive
@Directive({
  selector: '[appDynamicWidgetOutlet]',
  standalone: true,
})
export class DynamicWidgetOutletDirective implements OnInit, OnChanges, OnDestroy {
  private vcr = inject(ViewContainerRef);
  private destroyRef = inject(DestroyRef);
  private componentRefs: ComponentRef<any>[] = [];
  private subscriptions: Subscription[] = [];

  appDynamicWidgetOutlet = input.required<WidgetConfig | WidgetConfig[]>();

  // On changes: clear old components, create new ones
  // For each config:
  //   1. vcr.createComponent(config.component)
  //   2. For each input: componentRef.setInput(key, value)
  //      - If value is Observable: subscribe, setInput on each emission
  //      - If value is Signal: use effect() to track and setInput
  //   3. For each output: subscribe to componentRef.instance[outputName]
  //   4. Track refs and subscriptions for cleanup
}
```

**Key lifecycle concerns:**
- `OnDestroy`: destroy all ComponentRefs, unsubscribe all Subscriptions
- When input array changes: tear down old, create new
- Use `DestroyRef` / `takeUntilDestroyed()` for automatic cleanup of effects

### Pattern 6: NGRX-to-Signal Bridge

**What:** Use `toSignal()` from `@angular/core/rxjs-interop` to convert NGRX selectors (Observables) into signals at the smart component level. Pass resulting signals (or their values) down to presentational components.

**Example:**
```typescript
// In BoardPageComponent (smart)
private store = inject(Store);

// Convert NGRX selector observable to signal
completionRate = toSignal(
  this.store.select(selectCompletionRate),
  { initialValue: 0 }
);

priorityBreakdown = toSignal(
  this.store.select(selectPriorityBreakdown),
  { initialValue: {} as Record<Priority, number> }
);

// Build widget configs using computed signals
widgetConfigs = computed<WidgetConfig[]>(() => [
  {
    component: TaskCountWidget,
    inputs: {
      count: this.store.select(selectTotalTaskCount),  // Observable input
      status: computed(() => this.completionRate() > 80 ? 'success' : 'warning'),
    },
  },
  {
    component: ProgressWidget,
    inputs: {
      percentage: this.store.select(selectCompletionRate),  // Observable input
    },
  },
]);
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Store Injection in Presentational Components
**What:** Injecting `Store` directly into `TaskCardComponent` or `ColumnComponent`.
**Why bad:** Breaks testability, creates hidden dependencies, makes components unusable outside NGRX context. The exercise spec explicitly asks for smart/dumb separation.
**Instead:** Pass data in via input signals, emit events via outputs. Only smart containers talk to the Store.

### Anti-Pattern 2: Fat Effects
**What:** Putting business logic (validation, transformation, state derivation) inside Effects.
**Why bad:** Effects become untestable monoliths. Reducers are pure functions and easier to test.
**Instead:** Effects handle side effects only (API calls, navigation, showing toasts). Reducers handle all state transformations. Selectors handle all derived state.

### Anti-Pattern 3: Manual Subscription Management
**What:** Calling `.subscribe()` in components and manually tracking subscriptions.
**Why bad:** Memory leaks, boilerplate, easy to forget cleanup.
**Instead:** Use `toSignal()` (auto-unsubscribes), `takeUntilDestroyed()`, or the `async` pipe. For the directive, use `DestroyRef` and collect subscriptions in an array for bulk teardown.

### Anti-Pattern 4: Mutable State in Reducers
**What:** Mutating state objects directly instead of creating new references.
**Why bad:** NGRX change detection relies on reference equality. Mutated objects will not trigger selector re-evaluation.
**Instead:** Use spread operators or, better, `@ngrx/entity` adapter methods which return new state objects automatically.

### Anti-Pattern 5: Barrel File Over-Export
**What:** Creating `index.ts` barrel files in every folder, re-exporting everything.
**Why bad:** Circular dependency risk, tree-shaking interference, slower IDE performance.
**Instead:** Only barrel-export from `store/index.ts` (the public API of the store). Import components directly by path.

## NGRX Store Structure Detail

```
store/
  tasks.actions.ts      # Two action groups: TasksPageActions, TasksApiActions
  tasks.reducer.ts      # Entity adapter reducer, handles optimistic updates + rollback
  tasks.effects.ts      # API calls, error handling, snackbar side effects
  tasks.selectors.ts    # selectTasksByColumn(columnId), selectPriorityBreakdown,
                        # selectCompletionRate, selectAllTasks, selectTasksLoading
  tasks.state.ts        # TasksState interface, adapter, initial state
  index.ts              # Barrel: re-exports actions, selectors, and feature key/reducer
```

**Why flat, not nested:** With a single feature store, nesting `actions/`, `reducers/` subfolders adds navigation overhead for zero benefit. One file per concern is cleaner and matches NGRX team recommendations.

**Feature registration in app.config.ts:**
```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(),
    provideState('tasks', tasksReducer),
    provideEffects(TasksEffects),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideStoreDevtools({ maxAge: 25 }),
  ],
};
```

## Testing Architecture

| Layer | Tool | What to Test | Location |
|-------|------|--------------|----------|
| Unit | Vitest | Selectors (pure functions, easy), Reducer (state transitions), Effects (marble testing with `provideMockActions`), TaskApiService | `*.spec.ts` co-located with source |
| Component | Storybook | TaskCardComponent (all priority states, expanded/collapsed, edit mode), TaskCountWidget, ProgressWidget | `*.stories.ts` co-located with component |
| E2E | Playwright | Full board flow: load -> add task -> move between columns -> verify state | `e2e/` folder at project root |

**Vitest configuration note:** Angular 21 uses Vite as its build system. Vitest integrates natively. Use `@analogjs/vitest-angular` (or Angular's built-in Vitest support if available in v21) for component testing setup.

**Storybook:** Use `@storybook/angular` with CSF3 format. Stories act as visual documentation of component states, which is valuable for the interview walkthrough.

## GitHub Actions Pipeline Structure

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npx ng lint           # ESLint
      - run: npx vitest run        # Unit tests
      - run: npx ng build          # Production build (catches template errors)

  e2e:
    runs-on: ubuntu-latest
    needs: quality                 # Only run E2E if unit tests pass
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test

  deploy:
    runs-on: ubuntu-latest
    needs: [quality, e2e]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25  # Or Vercel CLI directly
```

**Pipeline order rationale:** Lint and unit tests are fast (run first, fail fast). E2E is slow and flaky-prone (run only after unit tests pass). Deploy only on main after all checks pass.

## Scalability Considerations

The exercise spec asks for a README section on scalability. Here is how the architecture addresses each concern:

| Concern | Current (Single Board) | At Scale |
|---------|----------------------|----------|
| Multiple Boards | Single `tasks` feature state | Add `boards` feature state, nest tasks under board ID in state, parameterise selectors by boardId |
| Real-time Collaboration | Not implemented | Add WebSocket effect that listens for remote changes, dispatches actions to merge into state. Entity adapter handles upserts cleanly |
| Undo/Redo | Not implemented | Add `ngrx-undo` or custom meta-reducer that snapshots state on each action. Dispatch `undo`/`redo` actions |
| Offline Support | Not needed | Add `@ngrx/entity` sync queue: buffer actions when offline, replay on reconnect. Service worker for asset caching |

## Build Order (Dependencies Between Components)

This ordering reflects what must exist before the next layer can be built:

```
Phase 1: Foundation (no dependencies)
  - Core models (Board, Column, Task, Priority, WidgetStatus interfaces)
  - TaskApiService (mock, standalone)

Phase 2: State Management (depends on Phase 1)
  - NGRX actions (depends on models)
  - NGRX reducer + state (depends on actions + models)
  - NGRX selectors (depends on state shape)
  - NGRX effects (depends on actions + TaskApiService)

Phase 3: Presentational Components (depends on Phase 1 models only)
  - TaskCardComponent (depends on Task model)
  - ColumnComponent (depends on Column + Task models)
  - BoardHeaderComponent (shell, no complex deps)
  - Can build and Storybook these WITHOUT the store

Phase 4: Smart Components + Integration (depends on Phases 2 + 3)
  - BoardPageComponent (connects store to presentational components)
  - TaskDialogComponent (form + store dispatch)

Phase 5: Dynamic Rendering (depends on Phase 1 models)
  - DynamicWidgetOutletDirective (generic, no store dependency)
  - Widget components (TaskCountWidget, ProgressWidget)
  - Wire widgets into BoardHeaderComponent via directive

Phase 6: Testing + CI (depends on Phases 1-5)
  - Vitest specs for store (selectors, reducer, effects)
  - Storybook stories (TaskCard, widgets)
  - Playwright E2E (full flow)
  - GitHub Actions pipeline

Phase 7: Polish + Deploy
  - Vercel deployment
  - README documentation
  - Interview prep notes
```

**Why this order:**
- Models and mock service are dependency-free foundations.
- Store can be built and unit-tested independently of any UI.
- Presentational components can be built and Storybook'd independently of the store (they only need model interfaces).
- Smart components are the integration layer: they need both store and presentational components.
- The widget directive is a separate concern that can be built in parallel with Phases 3-4.
- Testing and CI wrap everything up.

## Sources

- Angular standalone component patterns: Angular official documentation (angular.dev). Standalone is the default since Angular 17; NgModules are legacy. HIGH confidence.
- NGRX store patterns (createActionGroup, Entity Adapter, provideStore/provideState): NGRX official documentation (ngrx.io). Stable API since NGRX v15+. HIGH confidence.
- Angular signals (input(), computed(), signal(), toSignal()): Angular official documentation. Stable since Angular 17, input signals stable since Angular 17.1. HIGH confidence.
- ViewContainerRef.createComponent() and ComponentRef.setInput(): Angular official API. Stable API. HIGH confidence.
- Angular 21 specific APIs: MEDIUM confidence. My knowledge extends to Angular 19. Core patterns (standalone, signals, NGRX integration) are stable and unlikely to have breaking changes, but verify version-specific APIs during `ng new` scaffolding.
- Vitest + Angular integration: MEDIUM confidence. `@analogjs/vitest-angular` is the established solution; Angular 21 may have native Vitest support.
- OXfmt Beta: LOW confidence. Verify installation and configuration during tooling setup phase.
