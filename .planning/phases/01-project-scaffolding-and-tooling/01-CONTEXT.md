# Phase 1: Project Scaffolding and Tooling - Context

**Gathered:** 2026-03-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Generate a working Angular 21 project with all tooling installed and verified, plus TypeScript data model interfaces defined. This phase delivers the foundation every subsequent phase builds on. It does not include any NGRX store, UI components, or application logic — those belong to later phases.

</domain>

<decisions>
## Implementation Decisions

### Task model: overdue basis
- No `dueDate` field on `Task` — overdue is age-based
- Overdue = task `createdAt` older than `OVERDUE_THRESHOLD_DAYS` and not in the final (Done) column
- `OVERDUE_THRESHOLD_DAYS` defined as a named constant in a separate `src/app/core/constants.ts` (or `app.constants.ts`) — not in the model file
- `createdAt` and `updatedAt` typed as `Date` objects (not ISO strings) — enables direct date arithmetic in computed signals without parsing

### Directory structure
- Top-level layout inside `src/app/`:
  - `core/` — singleton services and NGRX store
    - `core/store/` — NGRX actions, reducer, selectors, effects
    - `core/services/` — mock API service
  - `features/` — feature-specific components
    - `features/board/` — board page component and `TaskCardComponent`
  - `shared/` — reusable types, directives, widgets
    - `shared/models/` — TypeScript interfaces (one file per type)
    - `shared/directives/` — `DynamicWidgetOutletDirective`
    - `shared/widgets/` — `TaskCountWidget`, `ProgressWidget`
- `TaskCardComponent` lives in `features/board/` (feature-coupled, not shared)
- One file per model type: `board.model.ts`, `column.model.ts`, `task.model.ts`, `priority.enum.ts`
- Barrel `index.ts` re-export files in key folders (`shared/models/`, `core/store/`, etc.)

### Vitest script wiring
- `npm test` → `vitest run` (one-shot, used by CI)
- `npm run test:watch` → `vitest` (watch mode, for development)
- Phase 1 scope: minimal — one trivial passing test is sufficient; coverage config deferred to Phase 5

### ng new options
- `--style=scss` — SCSS for all component stylesheets (Angular Material compatible)
- `--routing` — routing enabled (Angular Material nav components expect it; named routes for interview discussion)
- Separate `.scss` files per component (not inline styles)
- `@app/*` path alias configured in `tsconfig.json` pointing to `src/app/*`
  - Example: `import { Task } from '@app/shared/models'`

### Claude's Discretion
- Exact husky hook configuration details (pre-commit vs commit-msg)
- OXfmt `.oxfmt.json` configuration specifics (which file globs to include)
- Placeholder page content for `ng serve` verification
- Exact content of the trivial Vitest test

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — this is a greenfield project; no existing code to reuse

### Established Patterns
- Angular 21 standalone component architecture (default for `ng new`)
- All patterns established in this phase become the baseline for subsequent phases

### Integration Points
- NGRX store will live in `core/store/` (Phase 2 connects here)
- `features/board/` is where Phase 3 components land
- `shared/` provides the models that Phase 2's store and Phase 3's components import

</code_context>

<specifics>
## Specific Ideas

- Directory structure mirrors a production Angular application — interviewer should recognise it as intentional and explainable
- `@app/*` path aliases make imports clean throughout the codebase — visible quality signal

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-project-scaffolding-and-tooling*
*Context gathered: 2026-03-11*
