---
phase: 1
slug: project-scaffolding-and-tooling
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-11
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (Angular 21 native via `@angular/build:unit-test`) |
| **Config file** | none — Angular 21 native builder, no vitest.config.ts needed |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | MDL-01..05 | type-check | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | MDL-01..05 | type-check | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 1-01-03 | 01 | 2 | TOOL-01 | manual | git commit with bad message | ❌ W0 | ⬜ pending |
| 1-01-04 | 01 | 2 | TOOL-02 | manual | `npx oxfmt .` | ❌ W0 | ⬜ pending |
| 1-01-05 | 01 | 2 | — | unit | `npm test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/app/app.spec.ts` — trivial smoke test (exists after `ng new`, may need updating)
- [ ] TypeScript interfaces must exist before `tsc --noEmit` can validate them

*Wave 0 is the scaffold itself — `ng new` generates the baseline test infrastructure.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `ng serve` renders placeholder page | SC-1 | Browser render cannot be automated in CLI | Run `ng serve`, open http://localhost:4200, confirm page loads |
| Conventional Commits hook rejects bad message | TOOL-01 | Requires git commit attempt | Run `git commit -m "bad message"`, confirm hook exits non-zero |
| OXfmt formats TypeScript files | TOOL-02 | Formatter output requires visual/diff verification | Run `npx oxfmt .`, confirm no errors and files are reformatted |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
