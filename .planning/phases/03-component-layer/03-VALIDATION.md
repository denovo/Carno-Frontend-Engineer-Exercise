---
phase: 3
slug: component-layer
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (@analogjs/vitest-angular) |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=dot` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=dot`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 0 | APP-01 | unit | `npx vitest run --reporter=dot` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | SIG-01, SIG-02 | unit | `npx vitest run --reporter=dot` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | SIG-03, SIG-04 | unit | `npx vitest run --reporter=dot` | ❌ W0 | ⬜ pending |
| 03-01-04 | 01 | 1 | APP-01, SIG-05 | unit | `npx vitest run --reporter=dot` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 2 | APP-02, APP-03 | unit | `npx vitest run --reporter=dot` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 2 | APP-04, APP-05 | unit | `npx vitest run --reporter=dot` | ❌ W0 | ⬜ pending |
| 03-02-03 | 02 | 2 | APP-06, APP-07 | unit | `npx vitest run --reporter=dot` | ❌ W0 | ⬜ pending |
| 03-02-04 | 02 | 2 | APP-08, SIG-06 | unit | `npx vitest run --reporter=dot` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 3 | SIG-07, SIG-08 | unit | `npx vitest run --reporter=dot` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/app/board/board-page.component.spec.ts` — stubs for APP-01 through APP-08
- [ ] `src/app/board/task-card/task-card.component.spec.ts` — stubs for SIG-01 through SIG-05
- [ ] `src/app/board/task-form/task-form.component.spec.ts` — stubs for SIG-06 through SIG-08

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Optimistic move shows spinner/pending state | APP-08 | Requires timing/network simulation inspection | Open board, move task, verify card shows pending indicator before mock delay resolves |
| MatDialog renders with animations | APP-02 | Animation rendering is visual | Open create task dialog, verify it animates in correctly |
| Rollback on failure visually correct | APP-08 | Requires triggering simulated failure | Force mock error, verify task returns to original column |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
