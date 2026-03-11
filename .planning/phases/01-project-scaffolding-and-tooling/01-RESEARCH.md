# Phase 1: Project Scaffolding and Tooling - Research

**Researched:** 2026-03-11
**Domain:** Angular 21 project generation, OXfmt Beta, Vitest (native Angular CLI), Conventional Commits / Husky, TypeScript data models
**Confidence:** HIGH (versions verified from npm; Angular 21 tooling confirmed from official sources)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- No `dueDate` field on `Task` — overdue is age-based
- Overdue = task `createdAt` older than `OVERDUE_THRESHOLD_DAYS` and not in the final (Done) column
- `OVERDUE_THRESHOLD_DAYS` defined as a named constant in `src/app/core/constants.ts` — not in the model file
- `createdAt` and `updatedAt` typed as `Date` objects (not ISO strings) — enables direct date arithmetic without parsing
- Directory layout inside `src/app/`: `core/` (store/, services/), `features/` (board/), `shared/` (models/, directives/, widgets/)
- `TaskCardComponent` lives in `features/board/` (feature-coupled, not shared)
- One file per model type: `board.model.ts`, `column.model.ts`, `task.model.ts`, `priority.enum.ts`
- Barrel `index.ts` re-export files in key folders (`shared/models/`, `core/store/`, etc.)
- `npm test` → `vitest run` (one-shot, CI mode); `npm run test:watch` → `vitest` (watch mode)
- Phase 1 scope for Vitest: one trivial passing test is sufficient
- `--style=scss` and `--routing` for `ng new`
- Separate `.scss` files per component (not inline)
- `@app/*` path alias in `tsconfig.json` pointing to `src/app/*`

### Claude's Discretion
- Exact husky hook configuration details (pre-commit vs commit-msg)
- OXfmt `.oxfmt.json` (or equivalent) configuration specifics — which file globs to include
- Placeholder page content for `ng serve` verification
- Exact content of the trivial Vitest test

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MDL-01 | TypeScript interface `Board` with id, name, and columns collection | Covered in Code Examples — Board interface pattern |
| MDL-02 | TypeScript interface `Column` with id, name, and order | Covered in Code Examples — Column interface pattern |
| MDL-03 | TypeScript interface `Task` with id, title, optional description, columnId, priority, optional assignee, createdAt, updatedAt | Covered in Code Examples — Task interface with Date fields |
| MDL-04 | Priority represented as TypeScript enum or union type with 4 tiers (Low, Medium, High, Critical) | Covered in Code Examples — Priority enum pattern |
| MDL-05 | Discriminated union types for strongly-typed action variants | Covered in Architecture Patterns — discriminated union pattern for future NGRX actions |
| TOOL-01 | Conventional Commits enforced via commitlint + husky pre-commit hook | Covered in Standard Stack and Configuration Examples |
| TOOL-02 | OXfmt Beta configured for local on-save formatting (TypeScript/JS files) | Covered in Standard Stack — OXfmt beta now supports Angular HTML templates too |
</phase_requirements>

---

## Summary

Angular 21 (current: 21.2.2) is available on npm and is the target framework. Two significant Angular 21 changes affect Phase 1 tooling decisions: (1) Vitest is now the Angular CLI's default test runner via a native builder (`@angular/build:unit-test`), replacing the need for `@analogjs/vitest-angular` for basic test infrastructure; (2) zoneless change detection is the default for new projects — `zone.js` is no longer added automatically by `ng new`.

OXfmt Beta (npm: `oxfmt@0.37.0`) is production-ready for Phase 1's scope. The February 2026 Beta release explicitly supports Angular HTML templates alongside TypeScript, meaning it can format the entire codebase without a hybrid tool setup. Install as a dev dependency via `npm add -D oxfmt`. The CONTEXT.md decision to use it only for TypeScript files is still valid but can be extended to templates if desired — document the decision either way.

Conventional Commits enforcement via `commitlint@20.4.3` + `husky@9.1.7` is straightforward and well-documented. The `commit-msg` hook (not pre-commit) is the correct hook for commitlint. Husky v9 requires a `prepare` script and a `.husky/commit-msg` shell script file.

**Primary recommendation:** Use `ng new petello --style=scss --routing --ssr=false` with Angular 21's native Vitest support (`ng test` → `@angular/build:unit-test`). Override `package.json` scripts to match CONTEXT.md requirements: `npm test` → `ng test --watch=false`, `npm run test:watch` → `ng test`.

---

## Standard Stack

### Core (Phase 1 scope)

| Library | Version (verified) | Purpose | Why Standard |
|---------|-------------------|---------|--------------|
| `@angular/core` | 21.2.2 | Application framework | Project decision; Angular 21 is current stable |
| `@angular/cli` | 21.2.1 | Scaffolding and dev tooling | Official CLI; `ng new` generates the project |
| `@angular/build` | 21.2.1 | Build and test builders | Includes `@angular/build:unit-test` for native Vitest |
| `typescript` | ~5.7+ | Type system | Installed by `ng new`; do not override |
| `rxjs` | ~7.8 | Reactive programming | Installed by `ng new`; needed by NGRX (Phase 2) |
| `@angular/material` | 21.2.1 | UI components | Added via schematic (`ng add`); Angular-official, zero friction |
| `oxfmt` | 0.37.0 | Code formatting | Project decision; OXfmt Beta supports TS and Angular templates |
| `@commitlint/cli` | 20.4.3 | Commit message linting | Stable, enforces Conventional Commits format |
| `@commitlint/config-conventional` | 20.4.3 | Commitlint rules preset | Standard Conventional Commits ruleset |
| `husky` | 9.1.7 | Git hooks manager | Runs commitlint on `commit-msg` hook; v9 is current |

### Supporting (needed in Phase 1 but primarily for later phases)

| Library | Version (verified) | Purpose | When to Use |
|---------|-------------------|---------|-------------|
| `@ngrx/store` | 21.0.1 | State management | Install now; configure in Phase 2 |
| `@ngrx/effects` | 21.0.1 | Side effects | Install now; configure in Phase 2 |
| `@ngrx/entity` | 21.0.1 | Normalised collections | Install now; configure in Phase 2 |
| `@ngrx/store-devtools` | 21.0.1 | Redux DevTools | Install now; wire in Phase 2 |
| `vitest` | 4.0.18 | Test runner (native) | Pulled in by `@angular/build:unit-test`; no separate config needed |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Angular native Vitest (`@angular/build:unit-test`) | `@analogjs/vitest-angular` | Native is official, zero extra packages; Analog adapter is still valid but adds a dependency layer — prefer native for new projects |
| `oxfmt` | Prettier or Biome | Project decision to use OXfmt; Prettier is more mature but slower; Biome is similar but OXfmt is the explicit preference |
| `husky` commit-msg hook | `simple-git-hooks` | Husky v9 is industry standard; simple-git-hooks is lighter but less documented |

### Installation

```bash
# 1. Scaffold the project (run outside the repo, then move in)
ng new petello --style=scss --routing --ssr=false

# 2. NGRX (all packages at once, same version)
npm install @ngrx/store @ngrx/effects @ngrx/entity @ngrx/store-devtools

# 3. Angular Material (via schematic — required for proper theme setup)
ng add @angular/material

# 4. Formatting
npm install -D oxfmt

# 5. Conventional Commits enforcement
npm install -D @commitlint/cli @commitlint/config-conventional husky

# 6. Initialize Husky
npx husky init
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
  app/
    app.component.ts              # Shell: <router-outlet>, minimal markup
    app.component.html
    app.component.scss
    app.config.ts                 # provideRouter, provideAnimationsAsync (Phase 2 adds store)
    app.routes.ts                 # Route definitions

    core/
      constants.ts                # OVERDUE_THRESHOLD_DAYS and other app-wide constants
      services/                   # Phase 2: mock API service
      store/                      # Phase 2: NGRX actions, reducer, selectors, effects
        index.ts                  # Barrel re-export (created in Phase 1 as empty placeholder)

    features/
      board/                      # Phase 3: board page component, TaskCardComponent

    shared/
      models/
        board.model.ts            # Board interface
        column.model.ts           # Column interface
        task.model.ts             # Task interface
        priority.enum.ts          # Priority enum
        index.ts                  # Barrel: re-exports all model types
      directives/                 # Phase 4: DynamicWidgetOutletDirective
      widgets/                    # Phase 4: TaskCountWidget, ProgressWidget

  environments/                   # Generated by ng new
    environment.ts
    environment.development.ts
```

**Note on `standalone: true` in Angular 21:** With Angular 21's zoneless default and fully standalone architecture, `standalone: true` in the `@Component` decorator is still present but may become optional. Use it explicitly for clarity — the interviewer will recognise the pattern.

### Pattern 1: TypeScript Interface Hierarchy for Models

**What:** One interface/enum per file, all exported through a barrel `index.ts`. Types reference each other by import to avoid circular dependencies.

**When to use:** Always. Each model has a single source of truth file.

```typescript
// Source: CONTEXT.md decisions + TypeScript best practices

// shared/models/priority.enum.ts
export enum Priority {
  Low = 'LOW',
  Medium = 'MEDIUM',
  High = 'HIGH',
  Critical = 'CRITICAL',
}

// shared/models/task.model.ts
import { Priority } from './priority.enum';

export interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  priority: Priority;
  assignee?: string;
  createdAt: Date;
  updatedAt: Date;
}

// shared/models/column.model.ts
export interface Column {
  id: string;
  name: string;
  order: number;
}

// shared/models/board.model.ts
import { Column } from './column.model';

export interface Board {
  id: string;
  name: string;
  columns: Column[];
}

// shared/models/index.ts
export { Board } from './board.model';
export { Column } from './column.model';
export { Task } from './task.model';
export { Priority } from './priority.enum';
```

### Pattern 2: OVERDUE_THRESHOLD_DAYS Constant

**What:** Age-based overdue determination — no `dueDate` field. The threshold is a named constant in a dedicated constants file.

```typescript
// core/constants.ts
export const OVERDUE_THRESHOLD_DAYS = 7;
```

**Usage in computed signals (Phase 3):**
```typescript
// In TaskCardComponent
import { OVERDUE_THRESHOLD_DAYS } from '@app/core/constants';

readonly isOverdue = computed(() => {
  const task = this.task();
  const ageMs = Date.now() - task.createdAt.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  return ageDays > OVERDUE_THRESHOLD_DAYS;
  // NOTE: "not in Done column" check done by checking task.columnId
  // against the known Done column ID — resolved in Phase 3
});
```

### Pattern 3: `@app/*` tsconfig Path Alias

**What:** Configures TypeScript path mapping so `import { Task } from '@app/shared/models'` resolves to `src/app/shared/models/index.ts`.

```json
// tsconfig.json — add to compilerOptions
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@app/*": ["src/app/*"]
    }
  }
}
```

**Why:** Clean imports throughout the codebase. Avoids `../../../` relative paths. Visible quality signal to interviewers.

### Pattern 4: Angular 21 Vitest Native Setup

**What:** Angular 21's CLI ships with `@angular/build:unit-test` builder that integrates Vitest natively. No `vitest.config.ts` needed for basic setup — configuration lives in `angular.json`.

**How `ng new` generates it (Angular 21):**
```json
// angular.json (auto-generated by ng new in Angular 21)
{
  "test": {
    "builder": "@angular/build:unit-test",
    "options": {
      "tsConfig": "tsconfig.spec.json",
      "buildTarget": "petello::development"
    }
  }
}
```

**Override `package.json` scripts to match CONTEXT.md requirements:**
```json
{
  "scripts": {
    "test": "ng test --watch=false",
    "test:watch": "ng test"
  }
}
```

**Why `ng test --watch=false`:** The `ng test` command runs in watch mode by default. `--watch=false` produces a one-shot run for CI, matching `vitest run` behaviour specified in CONTEXT.md.

### Pattern 5: MDL-05 — Discriminated Union for Action Types

**What:** Discriminated unions provide compile-time exhaustive type checking. Defined alongside models, consumed in Phase 2 by NGRX actions.

```typescript
// shared/models/task-action.model.ts (or part of task.model.ts)
export type TaskAction =
  | { type: 'move'; taskId: string; fromColumnId: string; toColumnId: string }
  | { type: 'add'; title: string; columnId: string; priority: Priority }
  | { type: 'remove'; taskId: string }
  | { type: 'update'; taskId: string; changes: Partial<Task> };

// Usage with exhaustive check:
function handleAction(action: TaskAction): void {
  switch (action.type) {
    case 'move':   /* TypeScript knows fromColumnId/toColumnId exist */ break;
    case 'add':    /* TypeScript knows title/columnId/priority exist */ break;
    case 'remove': /* TypeScript knows taskId exists */ break;
    case 'update': /* TypeScript knows taskId/changes exist */ break;
    // No default needed — TypeScript will error if a case is missing
  }
}
```

### Anti-Patterns to Avoid

- **`standalone: false` on components:** Angular 21 is fully standalone. Never create NgModules.
- **`zone.js` imports in `test-setup.ts`:** Angular 21 is zoneless by default. Do not add `import 'zone.js/testing'` — the native Vitest builder handles this.
- **`--routing=false`:** Route setup is locked in CONTEXT.md. Always scaffold with `--routing`.
- **ISO string dates:** `createdAt` and `updatedAt` must be `Date` objects (locked decision). Never use `string`.
- **`dueDate` field on Task:** Explicitly excluded. Overdue is age-based using `createdAt`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Conventional Commits enforcement | Custom git hook script | `commitlint` + `husky` | Edge cases in message parsing, multi-line handling |
| TypeScript code formatting | Custom ESLint rules for style | `oxfmt` | OXfmt is 30x faster than Prettier, passes 100% of Prettier's TS conformance tests |
| Angular compilation in tests | Custom Vite plugin/transformer | Angular CLI's `@angular/build:unit-test` | Official Angular team solution; handles zoneless setup, decorators, TestBed |
| tsconfig path resolution | Manual module resolution config | TypeScript `paths` in `tsconfig.json` | Well-tested mechanism; IDE support is automatic |

**Key insight:** Phase 1 tooling is all about reaching for the official/ecosystem-standard tool immediately. Every hand-rolled alternative introduces friction that costs interview time explaining why.

---

## Common Pitfalls

### Pitfall 1: Using `@analogjs/vitest-angular` when Angular 21 native works

**What goes wrong:** Following older guides or the previous STACK.md research — which predates Angular 21's stable Vitest support — leads to installing `@analogjs/vitest-angular` and creating `vitest.config.ts` when the Angular CLI already handles this natively.

**Why it happens:** `@analogjs/vitest-angular` was the correct answer for Angular 17-20. Angular 21 changed this.

**How to avoid:** Use `ng new` with Angular 21, inspect the generated `angular.json` — it will contain `"builder": "@angular/build:unit-test"`. Run `ng test` immediately after scaffolding to confirm. Do NOT add `vitest.config.ts` unless you need custom configuration (coverage thresholds, custom reporters) deferred to Phase 5.

**Warning signs:** If `ng new` does NOT generate `@angular/build:unit-test` in `angular.json`, the globally installed `@angular/cli` may be an older version. Run `ng version` and upgrade if needed: `npm install -g @angular/cli@latest`.

### Pitfall 2: `zone.js` conflicts in Angular 21 (Zoneless default)

**What goes wrong:** Adding `import 'zone.js'` to `src/main.ts` or `zone.js/testing` to test setup files. Angular 21 apps are zoneless by default — zone.js is not included.

**Why it happens:** Every Angular guide written before Nov 2025 includes zone.js setup. These guides are now incorrect for Angular 21 new projects.

**How to avoid:** Let `ng new` generate the project. Do not add zone.js imports. If Angular Material setup scripts add zone.js, check `app.config.ts` — it should have `provideZonelessChangeDetection()` or equivalent (or nothing, if it's truly implicit in v21).

**Warning signs:** `console.error: Zone.js not found` — this is expected and fine in Angular 21 zoneless. If you see it and the app works, do not "fix" it by adding zone.js.

### Pitfall 3: OXfmt Beta formatting instability

**What goes wrong:** OXfmt formats a `.ts` file once, then produces different output on second run. Idempotency failures break "format on save" workflows.

**Why it happens:** Beta tooling may have unstable formatting for edge cases in complex type expressions.

**How to avoid:** After installing, run `npx oxfmt .` twice on the project and diff the results. If output differs, restrict `oxfmt` globs to avoid the problematic file type/syntax. Document in README. Do NOT add OXfmt to CI — keep it local only per CONTEXT.md.

**Warning signs:** Re-running the formatter changes anything. Idempotency failure.

### Pitfall 4: Wrong git hook for commitlint

**What goes wrong:** Placing commitlint in `.husky/pre-commit` instead of `.husky/commit-msg`. `pre-commit` runs before the commit message is entered — `$1` (the message file path) is not yet available.

**Why it happens:** Common confusion between hook types. `pre-commit` is for linting/tests; `commit-msg` is for message validation.

**How to avoid:** Use the `commit-msg` hook exclusively for commitlint:
```bash
# .husky/commit-msg
npx --no -- commitlint --edit "$1"
```

**Warning signs:** Commitlint runs but `$1` is empty or undefined, causing confusing error messages.

### Pitfall 5: Path alias `@app/*` not resolving in tests

**What goes wrong:** TypeScript path aliases work in `ng build` and `ng serve` but fail in `ng test` because the test builder uses a separate tsconfig (`tsconfig.spec.json`) that doesn't inherit or extend the paths.

**Why it happens:** `tsconfig.spec.json` extends `tsconfig.json` but may not pick up all options correctly.

**How to avoid:** Verify `tsconfig.spec.json` extends `tsconfig.json` (it should by default). Add paths explicitly to `tsconfig.spec.json` if needed. Test with an import using `@app/*` in a test file early.

**Warning signs:** `Error: Cannot find module '@app/shared/models'` in test output.

---

## Code Examples

Verified patterns from official/primary sources:

### Husky v9 Setup (commitlint)

```bash
# package.json scripts section must include:
# "prepare": "husky"
# Then:
npx husky init
# Creates .husky/pre-commit — we need commit-msg instead:
echo 'npx --no -- commitlint --edit "$1"' > .husky/commit-msg
chmod +x .husky/commit-msg
```

```javascript
// commitlint.config.js (ES module — package.json must have "type": "module"
// OR use commitlint.config.cjs for CommonJS)
export default {
  extends: ['@commitlint/config-conventional'],
};
```

```json
// package.json scripts
{
  "prepare": "husky",
  "test": "ng test --watch=false",
  "test:watch": "ng test",
  "format": "oxfmt .",
  "format:check": "oxfmt --check ."
}
```

### OXfmt Configuration

OXfmt supports `.prettierrc` migration and `.editorconfig`. For Phase 1, a minimal configuration is sufficient:

```bash
# Install
npm install -D oxfmt

# Format all TS files (and optionally HTML templates)
npx oxfmt "src/**/*.ts"
# or include templates:
npx oxfmt "src/**/*.{ts,html}"

# Migrate from prettier config if one exists:
npx oxfmt --migrate prettier
```

For a `.oxfmt.json` or `oxfmt.config.json` — check `npx oxfmt --help` after install; the beta may use `.prettierrc` as-is. Do not over-engineer the config in Phase 1.

### Angular 21 Path Alias (tsconfig.json)

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@app/*": ["src/app/*"]
    },
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Trivial Vitest Test (Phase 1 placeholder)

```typescript
// src/app/shared/models/models.spec.ts
import { Priority } from './priority.enum';

describe('Priority enum', () => {
  it('should define four priority levels', () => {
    expect(Object.values(Priority)).toHaveLength(4);
    expect(Priority.Low).toBe('LOW');
    expect(Priority.Medium).toBe('MEDIUM');
    expect(Priority.High).toBe('HIGH');
    expect(Priority.Critical).toBe('CRITICAL');
  });
});
```

This tests a pure enum — no Angular TestBed needed, no zone concerns. Extremely reliable.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `karma` + `jasmine` for Angular testing | Angular CLI native Vitest (`@angular/build:unit-test`) | Angular 21 (Nov 2025) | No extra packages needed; `ng test` runs Vitest |
| `zone.js` (required) | Zoneless by default in `ng new` | Angular 21 (Nov 2025) | No `zone.js` imports needed; cleaner change detection |
| `@analogjs/vitest-angular` for Vitest + Angular | Angular CLI native Vitest (built-in) | Angular 21 (Nov 2025) | `@analogjs/vitest-angular` is now a third-party option, not the standard path |
| `standalone: true` required explicitly | `standalone: true` is default/implicit | Angular 19+ | Still include for clarity; interviewer may not know it's implicit |
| `provideZonelessChangeDetection()` explicit call | Automatic in Angular 21 | Angular 21 (Nov 2025) | Do not add manually; `ng new` handles it |
| OXfmt Alpha (TS only) | OXfmt Beta (TS + Angular HTML + CSS + more) | Feb 2026 | Can format entire Angular project with one tool |

**Deprecated/outdated (do not use):**
- `karma` — deprecated in Angular, removed as default in v21
- `jasmine` — replaced by Vitest in Angular 21 default
- `@Input()` / `@Output()` decorators — legacy; use `input()`, `output()`, `model()` signals
- `NgModule` — legacy; standalone is the way
- `zone.js` imports in new Angular 21 projects — not needed

---

## Open Questions

1. **Does `ng new` in Angular 21 still add zone.js to `package.json` as a dependency?**
   - What we know: Angular 21 is zoneless by default; `provideZonelessChangeDetection()` is no longer needed
   - What's unclear: Whether `zone.js` still appears in `package.json` as an optional/unused dep from `ng new`
   - Recommendation: Run `ng new`, check `package.json` and `main.ts`. Remove `zone.js` if present and unused. Document the finding.

2. **Does OXfmt read `.prettierrc` automatically or require its own config file?**
   - What we know: OXfmt beta supports `--migrate prettier` to convert Prettier config; it respects `.editorconfig`
   - What's unclear: Whether the config filename for OXfmt is `.oxfmtrc`, `oxfmt.config.json`, or it reads `.prettierrc` directly
   - Recommendation: Run `npx oxfmt --help` after install and check the docs at https://oxc.rs/docs/guide/usage/formatter for the current config file name.

3. **Angular 21 `ng add @angular/material` — does it conflict with zoneless?**
   - What we know: Angular Material 21.2.1 is available; it should support zoneless
   - What's unclear: Whether the Material schematic adds zone.js back as a dependency
   - Recommendation: Run `ng add @angular/material` and inspect the diff. If it re-adds zone.js, remove it and verify Material still works.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Angular CLI native Vitest (`@angular/build:unit-test`) — part of `@angular/build@21.2.1` |
| Config file | `angular.json` (no separate `vitest.config.ts` needed for Phase 1) |
| Quick run command | `npm test` (runs `ng test --watch=false`) |
| Full suite command | `npm test` (same for Phase 1 — only one trivial test) |

### Phase Requirements → Test/Verification Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MDL-01 | `Board` interface compiles with id, name, columns | TypeScript compile | `npx tsc --noEmit` | ❌ Wave 0 — create `board.model.ts` |
| MDL-02 | `Column` interface compiles with id, name, order | TypeScript compile | `npx tsc --noEmit` | ❌ Wave 0 — create `column.model.ts` |
| MDL-03 | `Task` interface compiles with all required fields; `createdAt`/`updatedAt` are `Date` type | TypeScript compile | `npx tsc --noEmit` | ❌ Wave 0 — create `task.model.ts` |
| MDL-04 | `Priority` enum has exactly 4 values | unit | `npm test` | ❌ Wave 0 — create `priority.enum.ts` + `models.spec.ts` |
| MDL-05 | Discriminated union `TaskAction` type is exhaustive (switch with no default compiles) | TypeScript compile | `npx tsc --noEmit` | ❌ Wave 0 — create `task-action.model.ts` |
| TOOL-01 | Bad commit message is rejected by hook | Manual | `git commit -m "bad message"` → expect rejection | ❌ Wave 0 — configure husky + commitlint |
| TOOL-02 | `npx oxfmt src/**/*.ts` runs without error | Manual/CLI | `npm run format:check` | ❌ Wave 0 — install oxfmt + add scripts |

**Additional success criteria verification:**

| Success Criterion | How to Verify |
|-------------------|--------------|
| `ng serve` starts and renders placeholder | Manual: open browser to `http://localhost:4200` |
| TypeScript compiles without errors | `npx tsc --noEmit` exits with code 0 |
| Vitest trivial test passes | `npm test` exits with code 0 |
| Conventional Commits hook rejects bad message | `git commit -m "not conventional"` → exit code non-zero |
| OXfmt runs without errors | `npm run format:check` exits with code 0 |

### Sampling Rate

- **Per task commit:** `npm test` (trivial — completes in < 5 seconds)
- **Per wave merge:** `npm test && npx tsc --noEmit` (compile + test)
- **Phase gate:** All 5 success criteria verified manually + `npm test` green

### Wave 0 Gaps

- [ ] `src/app/shared/models/board.model.ts` — Board interface (MDL-01)
- [ ] `src/app/shared/models/column.model.ts` — Column interface (MDL-02)
- [ ] `src/app/shared/models/task.model.ts` — Task interface with Date fields (MDL-03)
- [ ] `src/app/shared/models/priority.enum.ts` — Priority enum 4 values (MDL-04)
- [ ] `src/app/shared/models/task-action.model.ts` — Discriminated union (MDL-05)
- [ ] `src/app/shared/models/index.ts` — Barrel re-export
- [ ] `src/app/core/constants.ts` — OVERDUE_THRESHOLD_DAYS
- [ ] `src/app/core/store/index.ts` — Empty barrel (placeholder for Phase 2)
- [ ] `src/app/shared/models/models.spec.ts` — Trivial Priority enum test (TOOL-01, validates Vitest works)
- [ ] `tsconfig.json` — `@app/*` path alias added
- [ ] `.husky/commit-msg` — commitlint hook (TOOL-01)
- [ ] `commitlint.config.js` — extends conventional
- [ ] `package.json` scripts: `test`, `test:watch`, `format`, `format:check`, `prepare`

---

## Sources

### Primary (HIGH confidence)
- npm registry — `@angular/core@21.2.2`, `@ngrx/store@21.0.1`, `@angular/material@21.2.1`, `oxfmt@0.37.0`, `@commitlint/cli@20.4.3`, `husky@9.1.7`, `vitest@4.0.18` — verified 2026-03-11
- [Angular v21 announcement](https://blog.angular.dev/announcing-angular-v21-57946c34f14b) — Vitest as default test runner, zoneless default
- [Angular official: migrating to Vitest](https://angular.dev/guide/testing/migrating-to-vitest) — confirms `@angular/build:unit-test` builder, no need for `@analogjs/vitest-angular`
- [OXfmt Beta release (Feb 2026)](https://oxc.rs/blog/2026-02-24-oxfmt-beta) — Angular HTML template support confirmed

### Secondary (MEDIUM confidence)
- [Ninja Squad: What's new in Angular 21](https://blog.ninja-squad.com/2025/11/20/what-is-new-angular-21.0) — corroborates Vitest native support and zoneless default
- [Angular.schule: Vitest in Angular 21](https://angular.schule/blog/2025-11-migrate-to-vitest/) — confirms `ng new` generates Vitest by default, `@angular/build:unit-test` config
- [commitlint local setup guide](https://commitlint.js.org/guides/local-setup.html) — commitlint + husky v9 `commit-msg` hook pattern
- [Push-based.io: Angular 21 goes zoneless](https://push-based.io/article/angular-v21-goes-zoneless-by-default-what-changes-why-its-faster-and-how-to) — zoneless change detection details

### Tertiary (LOW confidence — flag for validation)
- OXfmt config file name (`.oxfmtrc` vs `oxfmt.config.json`) — not confirmed from official docs; run `npx oxfmt --help` to verify
- Whether `ng add @angular/material` adds zone.js in Angular 21 — unverified; inspect diff after running schematic

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified from npm on 2026-03-11
- Architecture: HIGH — Angular 21 patterns confirmed from official Angular blog and angular.dev docs
- Vitest native support: HIGH — confirmed from angular.dev official guide
- OXfmt Beta: HIGH for Angular support; LOW for exact config file format (verify on install)
- Pitfalls: HIGH — derived from verified Angular 21 changes and known v9 husky patterns

**Research date:** 2026-03-11
**Valid until:** 2026-04-11 (stable ecosystem; OXfmt Beta may update more frequently)
