---
phase: 06-ci-cd-deployment-and-documentation
plan: "01"
subsystem: infra
tags: [vercel, deployment, angular-spa, rewrite-rules]

requires:
  - phase: 05-testing-and-storybook
    provides: built Angular app ready for production deployment

provides:
  - vercel.json with SPA rewrite rule routing all paths to index.html
  - Live public Vercel deployment of the Petello Angular application
  - vercel-url.txt recording the canonical deployment URL for Plan 06-02

affects:
  - 06-02 (README needs the live demo URL)

tech-stack:
  added: [vercel]
  patterns:
    - "SPA rewrite: all paths route to index.html so Angular Router handles client-side navigation"
    - "Vercel project settings (not vercel.json) carry build/output config — avoids conflicts on free tier"

key-files:
  created:
    - vercel.json
    - .planning/phases/06-ci-cd-deployment-and-documentation/vercel-url.txt
  modified: []

key-decisions:
  - "vercel.json contains only the rewrites rule — build command and output directory configured in Vercel dashboard, not in file, to avoid free-tier conflicts"
  - "Install command set to npm ci --legacy-peer-deps — required because Storybook 10 has peer dep conflicts with Angular 21 that fail plain npm ci"
  - "Output directory set to dist/petello/browser — Angular 17+ outputs to the /browser subdirectory, not dist/petello/"

patterns-established:
  - "SPA Vercel deploy: vercel.json rewrites + dashboard build settings (not vercel.json buildCommand) for Angular apps"

requirements-completed:
  - DOC-01

duration: ~5min
completed: 2026-03-13
---

# Phase 6 Plan 01: Vercel Deployment Summary

**Angular SPA deployed to Vercel at https://carno-frontend-engineer-exercise.vercel.app/ with SPA rewrite rule enabling direct /board navigation**

## Performance

- **Duration:** ~5 min (split across human-action checkpoint)
- **Started:** 2026-03-13
- **Completed:** 2026-03-13
- **Tasks:** 2 of 2
- **Files modified:** 2

## Accomplishments

- `vercel.json` created at repo root with SPA rewrite rule (`/(.*) -> /index.html`) enabling Angular Router to handle all paths
- Application successfully deployed to Vercel; public URL is https://carno-frontend-engineer-exercise.vercel.app/
- Deployment URL recorded in `vercel-url.txt` for Plan 06-02 README to reference as the live demo link

## Task Commits

Each task was committed atomically:

1. **Task 1: Create vercel.json with SPA rewrite rule** - `20c3780` (chore)
2. **Task 2: Connect repo to Vercel and deploy** - (human action — no local files; URL recorded in `2be514d`)

**Plan metadata:** (this commit — docs: complete plan)

## Files Created/Modified

- `vercel.json` — SPA rewrite rule (`/(.*) -> /index.html`); no build config to avoid free-tier conflicts
- `.planning/phases/06-ci-cd-deployment-and-documentation/vercel-url.txt` — canonical deployment URL for Plan 06-02

## Decisions Made

- `vercel.json` contains only the `rewrites` rule. Build command (`npm run build`) and output directory (`dist/petello/browser`) were set in the Vercel project dashboard under Build & Development Settings. Putting them in `vercel.json` can conflict with Vercel's free-tier auto-detection.
- Install command set to `npm ci --legacy-peer-deps` — required because Storybook 10 introduces peer dependency conflicts with Angular 21 that cause a plain `npm ci` to fail in the Vercel build environment.
- Output directory configured as `dist/petello/browser` — Angular 17+ changed the output structure to include a `/browser` subdirectory for SSR split; Vercel must point there specifically.

## Deviations from Plan

None — plan executed exactly as written. Task 2 was a human-action checkpoint by design; human completed it and provided the URL.

## Issues Encountered

None.

## User Setup Required

The user performed the Vercel project connection manually (Vercel web UI project creation has no CLI equivalent for fresh accounts). Steps completed:
1. Imported the GitHub repository at vercel.com/new
2. Set Install Command to `npm ci --legacy-peer-deps`
3. Set Output Directory to `dist/petello/browser`
4. Deployed — deployment completed successfully

## Next Phase Readiness

- Live deployment URL (`https://carno-frontend-engineer-exercise.vercel.app/`) is available in `vercel-url.txt` for Plan 06-02 README rewrite
- No blockers

---
*Phase: 06-ci-cd-deployment-and-documentation*
*Completed: 2026-03-13*
