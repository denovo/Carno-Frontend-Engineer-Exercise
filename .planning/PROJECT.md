# Petello

## What This Is

Petello is a task board application built as a Senior Angular Frontend Engineer take-home exercise. It lets users create, organize, and track tasks across multiple columns on a board. The primary purpose is to demonstrate architectural competence in Angular 21, NGRX state management, signals, dynamic component rendering, and modern tooling.

## Core Value

A well-architected codebase that demonstrates production-grade Angular patterns — the interviewer must be able to walk through every line and understand the reasoning behind it.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Core Application**
- [ ] Task board with columns (Todo, In Progress, Done, minimum)
- [ ] Task CRUD: create, read, update, delete tasks
- [ ] Move tasks between columns via select box (optimistic update with rollback)
- [ ] TypeScript interfaces: Board, Column, Task (with priority tiers, assignee, timestamps)

**State Management (NGRX)**
- [ ] Actions: loadTasks, addTask, moveTask, updateTask, removeTask
- [ ] Parameterised selector: tasks by column
- [ ] Selector: count breakdown by priority
- [ ] Selector: completion rate (% tasks in final column)
- [ ] At least one effect with proper error handling
- [ ] Optimistic update + rollback strategy for moveTask
- [ ] Local mock service (RxJS delay) simulating network latency

**Signals Integration**
- [ ] TaskCardComponent with input signals
- [ ] Computed signals: CSS class from priority, formatted dates, overdue state
- [ ] Local UI state via signals (expansion, edit mode)
- [ ] NGRX selector → Angular signal bridge (toSignal)

**Dynamic Component Rendering**
- [ ] DynamicWidgetOutletDirective (structural directive)
- [ ] Accepts single or array of component configurations
- [ ] Passes inputs: static values, Observables, and Signals
- [ ] Subscribes to outputs and forwards to handlers
- [ ] Proper lifecycle management and subscription cleanup

**Widget System**
- [ ] WidgetStatus interface with generics
- [ ] TaskCountWidget (count + status colour)
- [ ] ProgressWidget (visual progress bar)
- [ ] Widget state derived from store via computed signals

**Tooling & Quality**
- [ ] Angular 21 + Angular Material (minimal styling)
- [ ] Conventional Commits enforced (with commitlint + husky)
- [ ] OXfmt Beta for code formatting (on save, local only)
- [ ] Vitest for unit tests (selectors, effects, key services)
- [ ] Storybook for component stories (TaskCardComponent, widgets)
- [ ] Playwright for E2E/component tests in CI pipeline
- [ ] GitHub Actions: test → lint → build → deploy
- [ ] Deploy to Vercel (free tier)

**Documentation**
- [ ] README: setup, architecture decisions, scalability considerations, AI usage disclosure
- [ ] Store structure documentation (folder org + rationale)
- [ ] Interview talking points notes
- [ ] Notes on GSD framework usage and why it was appropriate
- [ ] Notes on Conventional Commits and their value

### Out of Scope

- Backend / real API — mock service only
- Authentication — not required
- Drag and drop — select box is sufficient per spec
- Rich styling / CSS polish — Angular Material defaults, style later
- Multiple boards — single board for v1
- Real-time collaboration — architecture note only

## Context

- This is a take-home exercise for a senior engineering role. The interviewer will walk through the code in detail, so every decision must be explainable.
- The spec is from the employer and covers 5 technical areas: data models, NGRX, signals, dynamic rendering, widgets.
- The candidate (Pete) intends to use AI tooling transparently, with a README disclosure.
- The GSD framework is being used to plan and execute the build in a structured way.
- App name: **Petello** (Trello-inspired).

## Constraints

- **Framework**: Angular 21 — latest, not the Angular 17+ specified in the exercise (candidate preference, still meets intent)
- **State**: NGRX only (as specified)
- **Styling**: Angular Material defaults, minimal custom CSS — styling deferred
- **Testing**: Vitest (unit), Storybook (component), Playwright (E2E) — not Jest
- **Formatting**: OXfmt Beta — not Prettier (candidate preference, must be noted in README)
- **Commits**: Conventional Commits format, enforced via commitlint + husky
- **Deployment**: Vercel free tier
- **CI**: GitHub Actions

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Angular 21 over Angular 17+ | Latest stable, signals API more mature | — Pending |
| Angular Material | Official Angular team library, zero friction | — Pending |
| Vitest over Jest | Vite-native, faster, spec says "Vite for tests" | — Pending |
| OXfmt Beta | Candidate preference, modern alternative to Prettier | — Pending |
| Select box for column move | Spec explicitly approves; saves time for state management depth | — Pending |
| Local mock service | No external deps, controllable latency for demos | — Pending |
| Single board for v1 | Scope control; multi-board is architecture note only | — Pending |

---
*Last updated: 2026-03-11 after initialization*
