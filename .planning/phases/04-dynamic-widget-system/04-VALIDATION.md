---
phase: 4
slug: dynamic-widget-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest via @analogjs/vitest-angular |
| **Config file** | angular.json (test architect block) |
| **Quick run command** | `ng test --watch=false --include="**/*widget*" --include="**/dynamic-widget*"` |
| **Full suite command** | `ng test --watch=false` |
| **Estimated runtime** | ~30 seconds (quick), ~90 seconds (full) |

---

## Sampling Rate

- **After every task commit:** Run `ng test --watch=false --include="**/*widget*" --include="**/dynamic-widget*"`
- **After every plan wave:** Run `ng test --watch=false`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 4-01-01 | 01 | 0 | DYN-01..DYN-09 | unit stub | `ng test --watch=false --include="**/dynamic-widget-outlet*"` | ❌ W0 | ⬜ pending |
| 4-01-02 | 01 | 0 | WGT-02 | unit stub | `ng test --watch=false --include="**/task-count-widget*"` | ❌ W0 | ⬜ pending |
| 4-01-03 | 01 | 0 | WGT-03 | unit stub | `ng test --watch=false --include="**/progress-widget*"` | ❌ W0 | ⬜ pending |
| 4-01-04 | 01 | 0 | WGT-04 | unit stub | `ng test --watch=false --include="**/widget-bar*"` | ❌ W0 | ⬜ pending |
| 4-01-05 | 01 | 1 | DYN-01 | unit | `ng test --watch=false --include="**/dynamic-widget-outlet*"` | ❌ W0 | ⬜ pending |
| 4-01-06 | 01 | 1 | DYN-02 | unit | `ng test --watch=false --include="**/dynamic-widget-outlet*"` | ❌ W0 | ⬜ pending |
| 4-01-07 | 01 | 1 | DYN-03 | compile-time | `npx tsc --noEmit` | N/A | ⬜ pending |
| 4-01-08 | 01 | 1 | DYN-04 | unit | `ng test --watch=false --include="**/dynamic-widget-outlet*"` | ❌ W0 | ⬜ pending |
| 4-01-09 | 01 | 1 | DYN-05 | unit | `ng test --watch=false --include="**/dynamic-widget-outlet*"` | ❌ W0 | ⬜ pending |
| 4-01-10 | 01 | 1 | DYN-06 | unit | `ng test --watch=false --include="**/dynamic-widget-outlet*"` | ❌ W0 | ⬜ pending |
| 4-01-11 | 01 | 1 | DYN-07 | unit | `ng test --watch=false --include="**/dynamic-widget-outlet*"` | ❌ W0 | ⬜ pending |
| 4-01-12 | 01 | 1 | DYN-08 | unit | `ng test --watch=false --include="**/dynamic-widget-outlet*"` | ❌ W0 | ⬜ pending |
| 4-01-13 | 01 | 1 | DYN-09 | unit | `ng test --watch=false --include="**/dynamic-widget-outlet*"` | ❌ W0 | ⬜ pending |
| 4-02-01 | 02 | 2 | WGT-01 | compile-time | `npx tsc --noEmit` | N/A | ⬜ pending |
| 4-02-02 | 02 | 2 | WGT-02 | unit | `ng test --watch=false --include="**/task-count-widget*"` | ❌ W0 | ⬜ pending |
| 4-02-03 | 02 | 2 | WGT-03 | unit | `ng test --watch=false --include="**/progress-widget*"` | ❌ W0 | ⬜ pending |
| 4-02-04 | 02 | 2 | WGT-04 | unit | `ng test --watch=false --include="**/widget-bar*"` | ❌ W0 | ⬜ pending |
| 4-02-05 | 02 | 2 | WGT-05 | compile-time | `npx tsc --noEmit` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/app/core/directives/dynamic-widget-outlet.directive.spec.ts` — stubs for DYN-01 through DYN-09
- [ ] `src/app/features/board/widget-bar/widget-bar.component.spec.ts` — stubs for WGT-04
- [ ] `src/app/features/board/task-count-widget/task-count-widget.component.spec.ts` — stubs for WGT-02
- [ ] `src/app/features/board/progress-widget/progress-widget.component.spec.ts` — stubs for WGT-03

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Widget bar renders visually between toolbar and board columns | WGT-04 | Layout/visual verification | Load app in browser, confirm widget bar appears in correct position |
| Status colour dot changes colour at threshold boundaries | WGT-02 | Visual CSS verification | Manually set task count to 10, 11, 20, 21 and verify dot colour |
| Progress bar fills proportionally to Done tasks | WGT-03 | Visual verification | Move tasks to Done column, verify bar fills proportionally |
| Memory leak — no subscriptions after directive destroy | DYN-08, DYN-09 | Runtime leak detection | Use Chrome DevTools Memory tab; navigate away and back, confirm no growing heap |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
