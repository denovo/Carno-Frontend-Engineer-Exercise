---
phase: 5
slug: testing-and-storybook
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x (via `@angular/build:unit-test`) |
| **Config file** | `angular.json` `test` architect block (no separate `vitest.config.ts`) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test && npx playwright test` |
| **Estimated runtime** | ~6s unit / ~30s unit+E2E |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test && npx playwright test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~6 seconds (unit only)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 0 | TOOL-06, TOOL-07 | manual | `npx storybook dev` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 0 | TOOL-08 | e2e | `npx playwright test` | ❌ W0 | ⬜ pending |
| 05-01-03 | 01 | 0 | TOOL-09 | integration | Push to main | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 1 | TOOL-03 | unit | `npm test` | ✅ Exists | ⬜ pending |
| 05-02-02 | 02 | 1 | TOOL-04 | unit | `npm test` | ✅ Exists | ⬜ pending |
| 05-02-03 | 02 | 1 | TOOL-05 | unit | `npm test` | ✅ Exists | ⬜ pending |
| 05-02-04 | 02 | 1 | TOOL-06 | manual | `npx storybook dev` | ❌ W0 | ⬜ pending |
| 05-02-05 | 02 | 1 | TOOL-07 | manual | `npx storybook dev` | ❌ W0 | ⬜ pending |
| 05-02-06 | 02 | 1 | TOOL-08 | e2e | `npx playwright test` | ❌ W0 | ⬜ pending |
| 05-02-07 | 02 | 2 | TOOL-09 | integration | Push to main | ❌ W0 | ⬜ pending |
| 05-02-08 | 02 | 2 | TOOL-10 | manual | `npx storybook dev` — A11y panel | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `playwright.config.ts` — webServer + baseURL config
- [ ] `.storybook/main.ts` — framework, stories glob, addons
- [ ] `.storybook/preview.ts` — global decorator with `provideAnimationsAsync()`
- [ ] `e2e/happy-path.spec.ts` — covers TOOL-08 happy path
- [ ] `e2e/rollback.spec.ts` — covers TOOL-08 rollback path
- [ ] `src/app/features/board/task-card/task-card.component.stories.ts` — covers TOOL-06
- [ ] `src/app/features/board/task-count-widget/task-count-widget.component.stories.ts` — covers TOOL-07
- [ ] `src/app/features/board/progress-widget/progress-widget.component.stories.ts` — covers TOOL-07
- [ ] `.github/workflows/ci.yml` — covers TOOL-09
- [ ] `data-testid` attributes on column containers, task cards, move select, add-task button

*Unit test infrastructure is fully in place — existing specs cover TOOL-03, TOOL-04, TOOL-05.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Storybook renders TaskCardComponent stories | TOOL-06 | Visual UI inspection | Run `npx storybook dev`, verify all states render correctly |
| Storybook renders widget stories | TOOL-07 | Visual UI inspection | Run `npx storybook dev`, verify TaskCount and Progress widgets render |
| A11y panel shows violations (non-blocking) | TOOL-10 | Requires Storybook UI | Run `npx storybook dev`, open A11y addon panel, verify warnings shown |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
