# Petello — Task Board Application

A Trello-inspired task board built with Angular 21, NGRX 19, and Angular Material as a senior engineering take-home exercise. Every architectural decision documented here was made deliberately — the goal is a codebase an interviewer can walk through line by line and understand the reasoning behind each choice.

**[Live Demo](https://carno-frontend-engineer-exercise.vercel.app/)** — deployed on Vercel.

---

## Quick Start

**Prerequisites:** Node 23 (managed via [nvm](https://github.com/nvm-sh/nvm))

```bash
nvm use                  # installs/switches to Node 23 from .nvmrc
npm install              # install dependencies (see note on --legacy-peer-deps below)
ng serve                 # development server at http://localhost:4200
```

> **Peer dep note:** Storybook 10 has unresolved peer dependency conflicts with Angular 21. If `npm install` fails, run `npm install --legacy-peer-deps`.

### Other commands

```bash
npm test                 # Vitest unit tests (via ng test --watch=false)
npm run e2e              # Playwright end-to-end tests
npm run storybook        # Storybook component library at http://localhost:6006
npm run build            # production build to dist/petello/browser/
```

---

## Tech Stack

| Tool | Version | Role |
|------|---------|------|
| Angular | 21 | Application framework |
| NGRX | 19 | State management (store + effects) |
| Angular Material | 21 | UI component library |
| Vitest (`@analogjs/vitest-angular`) | — | Unit testing |
| Storybook | 10 | Component library / isolated dev |
| Playwright | — | End-to-end testing |
| OXfmt | beta | TypeScript/JS formatting |
| Commitlint + Husky | — | Conventional Commits enforcement |
| Vercel | — | SPA hosting |
| GitHub Actions | — | CI pipeline (lint → test → build) |

---

## Architecture Decisions

These decisions were made deliberately and can each be defended in detail. The "why" matters more than the "what".

### 1. Angular 21 (not Angular 17 as per the exercise spec)

The exercise specifies "Angular 17+". Angular 21 was chosen because it makes signals first-class — `input()`, `output()`, `model()`, and `signal()` are stable APIs rather than experimental. The new file naming convention (`app.ts` not `app.component.ts`) reflects Angular's direction. The intent of the spec is fully met; the version is higher, not lower.

### 2. NGRX with EntityAdapter

NGRX's `@ngrx/entity` `EntityAdapter` provides normalised O(1) CRUD operations without hand-rolling immutable update logic. The entity map (`ids` + `entities`) is a flat dictionary — no nested array manipulation. `createFeature` automatically generates the feature selector and per-slice selectors, reducing boilerplate. DevTools support is a side effect: time-travel debugging works for free.

See [docs/store-structure.md](docs/store-structure.md) for the full store layout.

### 3. Optimistic `moveTask` with `previousColumnId` in the action payload

`moveTask` carries both `columnId` (destination) and `previousColumnId` (origin) in its props. The reducer applies the optimistic update immediately when the action is dispatched — the UI responds at zero latency. If the effect's HTTP call fails, the rollback action restores `previousColumnId` without a selector call inside the effect. The rollback data travels with the action, not retrieved after the fact from store state. This eliminates a class of race conditions where the store might have changed between dispatch and effect completion.

### 4. `concatMap` for mutation effects

`switchMap` cancels in-flight requests when a new action arrives. For task mutations (`moveTask`, `addTask`, `deleteTask`) that is wrong — cancelling a move mid-flight leaves the server and client in an inconsistent state. `concatMap` queues requests and processes them in order, guaranteeing no mutation is dropped. `catchError` is placed inside the `concatMap` inner pipe so a single failure does not terminate the effect stream.

### 5. `signal()` over `model()` for local UI state

`TaskCardComponent` has `isExpanded` and `isEditMode` as `signal<boolean>(false)`, not `model<boolean>(false)`. The distinction matters: `model()` creates a two-way-bindable signal — it signals to a parent that the value can flow upward via event emission. `isExpanded` and `isEditMode` are private expansion/edit state — no parent needs to read or write them. Using `model()` would be incorrect semantics, not just style.

### 6. `store.selectSignal()` bridge at smart component boundaries

Smart components (`BoardPageComponent`) call `store.selectSignal(selector)` to produce Angular signals from NGRX selectors. These signals are passed into presentational components as plain `input()` values. Presentational components (`ColumnComponent`, `TaskCardComponent`) have zero store coupling — they receive signals, compute derived signals, and emit events. The bridge exists at exactly one layer.

### 7. Smart / dumb component split

`BoardPageComponent` holds all store wiring: dispatching actions, selecting signals, and passing data down via `input()`. `ColumnComponent` and `TaskCardComponent` are fully presentational — they can be rendered in Storybook without a store. This split is not architectural dogma; it reflects the practical benefit that leaf components become trivially testable and independently documented.

### 8. `DynamicWidgetOutletDirective` with `untracked()` around `renderOne()`

Angular 21 raises `NG0602` if `effect()` is created inside a reactive context (another `effect()` or `computed()`). The directive's config-change effect calls `renderOne()`, which itself may set up per-component effects. Wrapping `renderOne()` in `untracked()` exits the reactive context before any nested effect creation. This is the correct API surface — `untracked()` is explicitly provided for this use case. See [docs/dynamic-widget-outlet-directive.md](docs/dynamic-widget-outlet-directive.md) for full directive documentation.

### 9. Vitest via `@analogjs/vitest-angular` — run via `ng test`, not bare `vitest run`

`@analogjs/vitest-angular` provides the Angular compiler plugin that handles `templateUrl`, `styleUrl`, and path alias resolution (`@app/`). Running bare `npx vitest run` skips the plugin — templates are not compiled and `@app/` imports are not resolved. The correct command is `ng test --watch=false`, which invokes the Angular builder, which invokes Vitest with the plugin loaded.

### 10. Storybook 10 (not Storybook 8)

`@storybook/angular@8` has a peer dependency on Angular `<20`, making it incompatible with Angular 21. Storybook 10 supports Angular `<22`. Storybook runs via `ng run petello:build-storybook` (Angular builder) rather than the Storybook CLI directly, because `AngularLegacyBuildOptionsError` prevents direct CLI invocation. `@angular-devkit/build-angular@21` is installed alongside `@angular/build` as a Storybook peer requirement.

### 11. `npm ci --legacy-peer-deps` everywhere

Storybook 10's peer dependency tree conflicts with Angular 21's packages. Plain `npm ci` fails. `--legacy-peer-deps` restores npm v6 resolution behaviour, which tolerates the conflicts. This flag is required in GitHub Actions CI jobs, in the Vercel install command, and in local `npm install` if the lockfile is regenerated.

---

## Scalability Considerations

The exercise brief asks explicitly how the architecture would scale across four scenarios. These are not theoretical — each answer reflects seams already present in the current implementation.

### Multiple boards

The `selectTasksByColumn` selector is a factory selector parameterised by `columnId`. The store slice has a flat task dictionary — extending it to multi-board requires adding a `boardId` key to each `Task` and a `loadTasks({ boardId })` dispatch from a board-selection route. The mock service's method signature already models this boundary (`getTasks(boardId: string)`). No reducer logic would change; only the loading action and selector factory gain an additional parameter.

### Real-time collaboration (WebSocket updates)

A WebSocket effect can push `moveTaskSuccess`, `addTaskSuccess`, and `deleteTaskSuccess` actions directly when another user mutates data. The reducer handles these actions already — the real-time path reuses exactly the same reducer cases as the HTTP path. The only new concern is conflict resolution: last-write-wins is trivial (accept the server push and overwrite); operational transform is a significant new concern but confined to the effect layer. No reducer changes are needed for basic real-time.

### Undo/redo

`moveTask` already carries `previousColumnId` — this was designed with undo in mind. A meta-reducer wrapping the existing state transitions could maintain an undo stack by recording the inverse action on each `moveTask` dispatch. NGRX's `MetaReducer` type is designed for exactly this pattern. The rollback logic already exists in the effect layer for server-failure recovery; undo reuses the same `moveTaskFailure` action with the `previousColumnId` already in the payload.

### Offline support

Optimistic updates are already in place — the UI never waits for the server response. Adding offline support requires two additions: a service worker (for asset caching) and an action queue that retries failed mutations on reconnect. The `shouldFail` / rollback seam used in Playwright testing (`?failNextMove=1`) demonstrates that the rollback path is exercised and reliable. An offline queue would sit at the same seam — intercepting failed effects and re-dispatching them when connectivity is restored.

---

## AI Usage Disclosure

Claude (Anthropic) was used as the primary development tool via the **GSD (Get-Shit-Done)** structured planning framework.

**What GSD produced:**
- A 6-phase project roadmap from requirements analysis
- Per-phase research documents investigating tool compatibility, API surfaces, and pitfalls before writing code
- Task-level execution plans with explicit acceptance criteria and verification steps
- Per-task atomic commits capturing each piece of work

**What the candidate controlled:**
- The phased approach and sequencing decisions (scaffolding before store, store before components, etc.)
- All key architectural choices: Angular 21 over 17, NGRX EntityAdapter, `concatMap` vs `switchMap`, `signal()` vs `model()`, Storybook 10
- Review and approval of every execution plan before it ran — each architectural decision in STATE.md was explicitly confirmed
- The AI usage approach itself — choosing structured planning over ad-hoc generation

**The distinction from "vibe coding":**

Every line of implementation in this codebase can be walked through and explained. The structured planning approach means architectural decisions were made upfront and documented, not discovered by reading AI output after the fact. The GSD framework forces explicit decision points — the candidate cannot accidentally accept an architectural choice without approving it.

This is the "AI as force multiplier" model the exercise brief endorses.

See [docs/gsd-framework-notes.md](docs/gsd-framework-notes.md) for a detailed account of how GSD was used throughout this project.

---

## Conventional Commits

All commits in this repository follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

feat(store): add moveTask optimistic update
fix(effects): place catchError inside concatMap inner pipe
chore(ci): add npm ci --legacy-peer-deps to all jobs
docs(06-02): write project README
```

**Types used in this project:** `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `ci`, `style`, `build`

**Enforcement:** `commitlint` (`commitlint.config.js` extends `@commitlint/config-conventional`) + Husky `commit-msg` hook. The hook sources nvm to ensure Node 23 is active for commitlint compatibility — without this, commitlint fails on machines where the system Node version is below the project's requirement.

**Why this matters beyond style:**

Conventional Commits produce machine-readable history. Tools like `semantic-release` can parse commit types to determine whether a release is a patch, minor, or major version bump. `standard-version` generates changelogs directly from commit messages. For a team codebase, conventional commits mean pull requests are self-documenting — the type prefix tells a reviewer whether to look for behaviour changes (`feat`, `fix`) or infrastructure changes (`chore`, `ci`) before opening the diff.

---

## Project Structure

```
src/app/
  core/
    models/          # Board, Column, Task interfaces; discriminated unions
    services/        # TaskMockService (simulated network with latency + shouldFail seam)
    store/
      actions/       # task.actions.ts — command actions (loadTasks, moveTask, etc.)
      effects/       # task.effects.ts — concatMap mutations, switchMap loads
      reducers/      # task.reducer.ts — EntityAdapter CRUD + optimistic move
      selectors/     # task.selectors.ts — factory selectors, derived metrics
  features/
    board/
      board-page/    # Smart component — store wiring, signal bridge
      column/        # Presentational — renders task list, dispatches via output()
      task-card/     # Presentational — signals, computed display values, edit mode
  shared/
    directives/      # DynamicWidgetOutletDirective
    widgets/
      task-count-widget/   # WidgetStatus<number> — count with priority context
      progress-widget/     # WidgetStatus<number> — completion rate progress bar
      widget-bar/          # Composes widgets; feeds store signals into directive
```

See [docs/store-structure.md](docs/store-structure.md) for detailed store file layout and the rationale for each file's responsibility.

---

## Documentation

Supplementary documentation lives in [docs/](docs/):

| Document | Contents |
|----------|----------|
| [docs/store-structure.md](docs/store-structure.md) | NGRX store file organisation and reasoning |
| [docs/data-flow-diagram.md](docs/data-flow-diagram.md) | ASCII data-flow: optimistic moveTask and pessimistic addTask |
| [docs/dynamic-widget-outlet-directive.md](docs/dynamic-widget-outlet-directive.md) | DynamicWidgetOutletDirective API, lifecycle, and NG0602 solution |
| [docs/signal-model-reasoning.md](docs/signal-model-reasoning.md) | `signal()` vs `model()` — when to use each |
| [docs/accessibility-color-independence.md](docs/accessibility-color-independence.md) | WCAG 1.4.1 compliance — status indicators that don't rely on colour alone |
| [docs/interview-talking-points.md](docs/interview-talking-points.md) | Prepared talking points for the technical interview walkthrough |
| [docs/gsd-framework-notes.md](docs/gsd-framework-notes.md) | How the GSD planning framework was used throughout this project |
| [EXERCISE.md](EXERCISE.md) | Original exercise brief (preserved verbatim) |
