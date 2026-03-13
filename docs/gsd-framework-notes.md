# GSD Framework Notes

This document explains what GSD is, why it was chosen for this exercise, and what it produced. Written for two audiences: the interviewer evaluating AI usage transparency, and engineers curious about structured AI-assisted development.

---

## What is GSD?

GSD (Get-Shit-Done) is a structured AI planning framework that externalises intent before writing code. It runs as a series of slash commands in Claude:

| Command | Purpose |
|---|---|
| `/gsd:discuss-phase` | Capture intent, constraints, and non-goals |
| `/gsd:research-phase` | Domain research — compatibility, patterns, pitfalls |
| `/gsd:plan-phase` | Decompose into atomic tasks with explicit verify criteria |
| `/gsd:execute-phase` | Implementation, one task at a time, one commit per task |
| `/gsd:verify-work` | Acceptance testing against the plan's success criteria |

Each phase produces a `CONTEXT.md` with locked decisions. The executor agent cannot invent features that were deferred or explore approaches that were explicitly ruled out.

---

## Why GSD Was a Good Choice for This Exercise

**Prevents scope creep.** Each planning phase produces locked decisions. During execution, the executor can deviate only within three rules: auto-fix bugs (Rule 1), add missing critical functionality (Rule 2), fix blockers (Rule 3). Architectural changes require a human decision checkpoint (Rule 4). This kept the implementation focused on the spec.

**Creates a verifiable audit trail.** Every architectural decision in `STATE.md` was explicitly reviewed and approved before implementation began. The interviewer can trace any decision back to a recorded rationale: why `concatMap` instead of `switchMap`, why `signal()` instead of `model()`, why the `previousColumnId` is in the action payload rather than queried in the effect.

**Matches the exercise's AI transparency requirement.** The spec asked candidates to explain how AI was used. GSD makes AI assistance structured and auditable rather than opaque. The planning files are committed alongside the code — `.planning/` is not in `.gitignore`. The interviewer can read the research, the plans, and the decisions that preceded every file.

**Natural dependency chain.** GSD's phase decomposition forced thinking about what must exist before what: data models before the store, the store before components, components before the widget system, everything before testing. The six-phase sequence (scaffolding → store → components → widgets → testing → docs) matched the Angular application's natural dependency graph. This alignment reduced rework.

**Quality gate at each phase.** Each phase ends with `/gsd:verify-work`, which checks against the plan's success criteria. This caught integration issues before they propagated — for example, the Storybook 10 Angular builder requirement (Storybook 8 does not support Angular 20+) was identified in Phase 5 research before any Storybook code was written.

---

## What GSD Produced for This Exercise

- 6 phases, 17 execution plans
- Research documents for high-risk phases (Phase 1: tooling compatibility; Phase 4: `ViewContainerRef` patterns and Angular 21 `NG0602`)
- Per-task plans with explicit `<verify>` shell commands — the executor cannot mark a task complete without a passing automated check
- `STATE.md` accumulating every decision across all phases — the single source of truth for "why this code is the way it is"

---

## How It Compares to Unstructured AI Usage

Without GSD, AI assistance tends toward "vibe coding" — accepting generated code without understanding the constraints, then debugging emergent problems later. GSD forces the developer to specify intent first, review research, and approve every task before execution. The output is code the developer can explain and defend at the line level.

The planning files committed in `.planning/` are the evidence of that process.
