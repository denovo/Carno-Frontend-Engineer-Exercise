# Phase 3: Component Layer - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the board UI: columns displayed horizontally, TaskCard components with signals, full task CRUD (create/edit/delete/move) wired to the NGRX store via signal bridges. Users can interact with the board end-to-end after this phase. Dynamic widget system and testing are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Task card — collapsed state
- Shows: title + priority badge (colour-coded)
- No description, assignee, or timestamps when collapsed
- Overdue indicator: red/amber border or background tint via CSS class computed signal (SIG-02) — not a badge label

### Task card — expanded state
- Expanded reveals: description (if set), assignee, formatted `createdAt` / `updatedAt` dates
- Formatted dates use computed signals (SIG-03) — `createdAt` is `Date`, no parsing needed
- Overdue tint applies in expanded state too (tasks in Done column are never overdue)

### Task card — edit and move controls
- Edit button visible only when card is expanded — click opens edit mode inline on the card (SIG-05 + SIG-06)
- Move select (column selector) visible only in expanded state — dispatches `moveTask` on change
- Delete button in expanded state — opens a MatDialog confirmation before dispatching `removeTask`
- Two separate local signal states: `isExpanded` and `isEditMode` (both default false)

### Task card — optimistic move feedback
- While `moveTask` is pending (awaiting server), card gets subtle opacity/dim (CSS class via pending signal)
- On `moveTaskFailure`: card snaps back to original column + MatSnackBar toast "Failed to move task — reverted"
- On `moveTaskSuccess`: pending state cleared, card returns to normal opacity

### Create/edit form
- Single `TaskFormComponent` opened via `MatDialog` (serves both create and edit)
- Fields: title (required), description (optional), priority (select from Priority enum), assignee (optional text)
- Column is NOT a form field on create — the dialog is opened with the target column pre-seeded (from the triggering button)
- Trigger points:
  - Per-column "+ Add task" button at the bottom of each column (opens dialog pre-set to that column)
  - Global "+ Add Task" button in the toolbar (opens dialog with a column selector, defaulting to first column)
- Edit trigger: Edit button on expanded TaskCard — opens same dialog pre-populated with existing task data

### Delete confirmation
- MatDialog confirmation: "Delete this task?" with Cancel / Delete buttons
- Dispatches `removeTask` only on confirm

### Board page chrome
- Toolbar: board name ("Petello Board") on the left, global "+ Add Task" MatButton on the right
- Loading state: `MatProgressBar` (indeterminate) below toolbar while `loadTasks` effect is pending, wired to store `loading` selector
- Columns displayed horizontally (flex row, no DnD)
- Empty column: shows "No tasks yet" placeholder text + "+ Add task" button

### Routing
- Board page at root path `''` — single-page app, no nested routes needed for Phase 3
- `app.routes.ts` updated with `{ path: '', component: BoardPageComponent }`

### Smart / dumb component split (APP-08)
- `BoardPageComponent` (smart): subscribes to store, dispatches actions, injects MatDialog + MatSnackBar
- `ColumnComponent` (dumb): receives `column` + `tasks` as inputs, emits task events upward
- `TaskCardComponent` (dumb): receives `task` as `input()` signal, emits `move` / `edit` / `delete` events
- `TaskFormComponent` (dialog): receives task data via `MAT_DIALOG_DATA`, returns form value on close

### Claude's Discretion
- Exact SCSS styles and Material theme tokens (minimal custom styling, Angular Material defaults)
- Animation/transition details on card expand/collapse
- Exact snackbar duration and positioning
- `MatProgressBar` exact positioning (top of toolbar vs below)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `MOCK_COLUMNS`, `MOCK_TASKS`, `MOCK_BOARD` in `core/services/mock-data.ts` — board page uses these for `loadTasks` seeding via the mock service
- `DONE_COLUMN_ID` (`'col-done'`) in `core/constants.ts` — used in computed signal for overdue (tasks in Done are not overdue)
- `OVERDUE_THRESHOLD_DAYS = 7` in `core/constants.ts` — used in TaskCard overdue computed signal directly
- All store selectors ready: `selectTasksByColumn(columnId)`, `selectCountByPriority`, `selectCompletionRate`, `selectAllTasks`
- `TaskMockService` with public `latencyMs`/`shouldFail` for controlled test scenarios
- Store barrel at `core/store/index.ts` — exports actions, selectors, feature key, TaskEffects

### Established Patterns
- `Task.createdAt` and `Task.updatedAt` are `Date` objects — no ISO string parsing in computed signals, use direct date arithmetic
- NGRX actions use command naming (`moveTask`) / event naming (`moveTaskSuccess`) — board page dispatches commands, effects emit events
- `moveTask` carries `previousColumnId` in props — rollback data already in the failure action payload, no need to select it
- All imports use `@app/*` path aliases (`@app/shared/models`, `@app/core/store`)
- SCSS per component file (established in Phase 1)
- Angular 21 standalone components (no NgModule)

### Integration Points
- `app.routes.ts` (currently empty) — add `{ path: '', component: BoardPageComponent }`
- `app.ts` — currently bare `RouterOutlet`; Phase 3 adds a `MatToolbar` header in the app shell template
- `core/store` — `BoardPageComponent` injects `Store`, dispatches `loadTasks` on `ngOnInit`, subscribes to `selectTasksByColumn` per column
- `MatSnackBar` injected in `BoardPageComponent` to surface `moveTaskFailure` toast
- `MatDialog` injected in `BoardPageComponent` (or column) to open `TaskFormComponent`

</code_context>

<specifics>
## Specific Ideas

- Card expand/collapse pattern: two independent boolean signals (`isExpanded`, `isEditMode`) — good interview talking point about local signal state vs store state
- Optimistic pending state is a third boolean signal on the card (`isPending`) derived from store or passed as input — enables CSS class binding without store coupling in the dumb component
- `selectTasksByColumn` is a factory selector — `BoardPageComponent` calls `store.selectSignal(selectTasksByColumn(col.id))` per column and passes result as `input()` to `ColumnComponent`

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-component-layer*
*Context gathered: 2026-03-12*
