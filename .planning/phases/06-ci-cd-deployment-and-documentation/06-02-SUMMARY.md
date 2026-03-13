---
phase: 06-ci-cd-deployment-and-documentation
plan: "02"
subsystem: docs
tags: [readme, documentation, exercise-brief, vercel, architecture-decisions]

requires:
  - phase: 06-ci-cd-deployment-and-documentation
    provides: Live Vercel deployment URL in vercel-url.txt

provides:
  - EXERCISE.md — original exercise brief preserved verbatim
  - README.md — complete project README covering all DOC-01 through DOC-05 requirements
  - Live Demo link in README pointing to Vercel deployment

affects: []

tech-stack:
  added: []
  patterns:
    - "README as architectural record: Architecture Decisions section documents the 'why' behind every choice, sourced from STATE.md accumulated context"

key-files:
  created:
    - EXERCISE.md
  modified:
    - README.md

key-decisions:
  - "EXERCISE.md is a verbatim copy of the original README.md exercise brief — no content was modified"
  - "README.md Architecture Decisions section has 11 substantive entries with rationale, not just a list of choices"
  - "AI Usage Disclosure is transparent about GSD framework usage, distinguishing structured planning from vibe coding"
  - "Scalability Considerations section grounds each scenario in existing code seams (previousColumnId, concatMap, factory selectors)"

patterns-established:
  - "AI disclosure pattern: name the tool, name the framework, distinguish what AI generated vs what candidate designed"

requirements-completed:
  - DOC-01
  - DOC-02
  - DOC-03
  - DOC-04
  - DOC-05

duration: ~10min
completed: 2026-03-13
---

# Phase 6 Plan 02: README Rewrite Summary

**Project README with 11 substantive architecture decision rationales, transparent AI disclosure, and all five DOC requirements; original exercise brief archived as EXERCISE.md**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-13T15:14:50Z
- **Completed:** 2026-03-13
- **Tasks:** 2 of 2
- **Files modified:** 2

## Accomplishments

- Original exercise brief (`README.md`) copied verbatim to `EXERCISE.md` — the interviewer can still access the original spec
- `README.md` rewritten as a comprehensive project README covering all five DOC requirements (DOC-01 through DOC-05)
- Architecture Decisions section documents 11 specific choices with "why" rationale, sourced from STATE.md accumulated context across all six phases
- Scalability Considerations section grounds each of the four spec scenarios in existing code seams (`previousColumnId`, factory selectors, rollback path)
- AI Usage Disclosure is transparent and specific — names GSD, explains structured planning vs vibe coding, references `docs/gsd-framework-notes.md`
- Live Demo link (`https://carno-frontend-engineer-exercise.vercel.app/`) embedded at the top of README

## Task Commits

Each task was committed atomically:

1. **Task 1: Archive exercise brief as EXERCISE.md** - `bcd124b` (chore)
2. **Task 2: Write project README.md** - `9def6b8` (docs)

**Plan metadata:** (this commit — docs: complete plan)

## Files Created/Modified

- `EXERCISE.md` — verbatim copy of the original exercise brief; no content changes
- `README.md` — complete project README with Quick Start, Tech Stack, Architecture Decisions (11 entries), Scalability Considerations, AI Usage Disclosure, Conventional Commits, Project Structure, and Documentation cross-reference table

## Decisions Made

- Architecture Decisions section covers 11 choices: Angular 21, EntityAdapter, optimistic `moveTask` with `previousColumnId`, `concatMap` over `switchMap`, `signal()` vs `model()`, `store.selectSignal()` bridge, smart/dumb split, `untracked()` in DynamicWidgetOutletDirective, Vitest via `ng test`, Storybook 10, and `npm ci --legacy-peer-deps`.
- Scalability section deliberately references existing code seams (not theoretical): `previousColumnId` for undo, factory selector parameterisation for multi-board, rollback path for offline.
- AI disclosure explicitly names the GSD framework and explains the candidate-controlled architectural decisions, anticipating the interviewer's concern about "blindly completing the exercise".

## Deviations from Plan

None — plan executed exactly as written. One minor issue: the initial Task 2 commit was rejected by commitlint (`body-max-line-length` violation) — resolved by shortening bullet points. No impact on content.

## Issues Encountered

- Initial `git commit` for Task 2 failed commitlint validation: one bullet line exceeded 100 characters. Fixed by condensing bullet text. Resubmitted successfully.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Phase 6 Plan 02 is the final plan in the roadmap
- All DOC-01 through DOC-05 requirements fulfilled
- Project is complete: deployed, tested, documented

---
*Phase: 06-ci-cd-deployment-and-documentation*
*Completed: 2026-03-13*
