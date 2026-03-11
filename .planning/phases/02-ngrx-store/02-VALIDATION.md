---
phase: 2
slug: ngrx-store
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-11
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Angular CLI native Vitest (`@angular/build:unit-test`) — `@angular/build@21.2.1` |
| **Config file** | `angular.json` (no separate `vitest.config.ts`) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~10 seconds (with `latencyMs = 0` in tests) |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test && npx tsc --noEmit`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 0 | NGR-01..05, NGR-13 | unit (actions) | `npm test` | ❌ Wave 0 | ⬜ pending |
| 02-01-02 | 01 | 0 | NGR-09, NGR-10, NGR-11 | unit (reducer) | `npm test` | ❌ Wave 0 | ⬜ pending |
| 02-01-03 | 01 | 0 | NGR-06, NGR-07, NGR-08 | unit (selectors) | `npm test` | ❌ Wave 0 | ⬜ pending |
| 02-01-04 | 01 | 0 | NGR-12 | unit (effects) | `npm test` | ❌ Wave 0 | ⬜ pending |
| 02-01-05 | 01 | 0 | NGR-14 | unit (service) | `npm test` | ❌ Wave 0 | ⬜ pending |
| 02-02-01 | 02 | 1 | NGR-01..05 | unit (reducer) | `npm test` | ❌ Wave 0 | ⬜ pending |
| 02-02-02 | 02 | 1 | NGR-09, NGR-10 | unit (reducer optimistic) | `npm test` | ❌ Wave 0 | ⬜ pending |
| 02-02-03 | 02 | 1 | NGR-06, NGR-07, NGR-08 | unit (selectors) | `npm test` | ❌ Wave 0 | ⬜ pending |
| 02-02-04 | 02 | 2 | NGR-12 | unit (effects) | `npm test` | ❌ Wave 0 | ⬜ pending |
| 02-02-05 | 02 | 2 | NGR-14 | unit (service) | `npm test` | ❌ Wave 0 | ⬜ pending |
| 02-02-06 | 02 | 3 | NGR-11 | unit (integration) | `npm test` | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/app/core/store/actions/task.actions.ts` — all 15 actions (NGR-01 through NGR-05, NGR-13)
- [ ] `src/app/core/store/reducers/task.reducer.ts` — createFeature + entity adapter (NGR-09, NGR-10, NGR-11)
- [ ] `src/app/core/store/reducers/task.reducer.spec.ts` — reducer pure function tests (NGR-01..05, NGR-09, NGR-10, NGR-11)
- [ ] `src/app/core/store/selectors/task.selectors.ts` — factory selectors (NGR-06, NGR-07, NGR-08)
- [ ] `src/app/core/store/selectors/task.selectors.spec.ts` — projector tests (NGR-06, NGR-07, NGR-08)
- [ ] `src/app/core/store/effects/task.effects.ts` — loadTasks$ + moveTask$ effects (NGR-12)
- [ ] `src/app/core/store/effects/task.effects.spec.ts` — effect failure path test (NGR-12)
- [ ] `src/app/core/services/task-mock.service.ts` — delay + configurable failure (NGR-14)
- [ ] `src/app/core/services/task-mock.service.spec.ts` — service unit tests (NGR-14)
- [ ] `src/app/core/services/mock-data.ts` — Board/Column/Task seed data
- [ ] `src/app/core/store/index.ts` — updated barrel re-exporting all store symbols
- [ ] `src/app/core/constants.ts` — add `DONE_COLUMN_ID` constant
- [ ] `src/app/app.config.ts` — add `provideStore`, `provideEffects`, `provideStoreDevtools`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Action type strings follow `[Source] Verb Noun` convention | NGR-13 | Convention review, not runtime behavior | Review all `createAction` type strings in `task.actions.ts` during code review |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
