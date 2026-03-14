---
status: testing
phase: 06-ci-cd-deployment-and-documentation
source: [06-01-SUMMARY.md, 06-02-SUMMARY.md, 06-03-SUMMARY.md]
started: 2026-03-13T00:00:00Z
updated: 2026-03-13T00:01:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 6
name: docs/store-structure.md Exists and Is Useful
expected: |
  Open docs/store-structure.md. It contains a folder layout tree for the NGRX store and rationale
  for each layer (actions naming, EntityAdapter, optimistic reducer, factory selectors, concatMap).
  Not just a file listing — substantive explanations.
awaiting: user response

## Tests

### 1. Live Vercel Deployment Loads
expected: Open https://carno-frontend-engineer-exercise.vercel.app/ in a browser. The Petello board app loads without a 404 or blank page. No major console errors. The board UI is visible.
result: issue
reported: "the state of the board doesn't persist when you refresh the browser"
severity: major

### 2. SPA Routing Works on Vercel
expected: Directly navigate to https://carno-frontend-engineer-exercise.vercel.app/board (paste the URL or refresh on that path). The Angular board page loads — no 404 from Vercel. The SPA rewrite rule in vercel.json is handling client-side routing.
result: issue
reported: "it doesn't route to the board the error: NG04002: 'board' — Angular router cannot match URL segment 'board'"
severity: major

### 3. README Has Live Demo Link
expected: Open README.md in the repo (or on GitHub). At or near the top there is a clickable Live Demo link pointing to https://carno-frontend-engineer-exercise.vercel.app/. Clicking it opens the deployed app.
result: pass

### 4. README Covers All Key Sections
expected: Scan README.md. It should contain: Quick Start instructions, Tech Stack list, Architecture Decisions section (with multiple entries explaining *why* choices were made), Scalability Considerations, AI Usage Disclosure, and a reference to the docs/ folder.
result: pass

### 5. EXERCISE.md Preserves Original Brief
expected: Open EXERCISE.md. It contains the original exercise brief verbatim — the same content that was in README.md before Phase 6. Nothing was modified from the original.
result: pass

### 6. docs/store-structure.md Exists and Is Useful
expected: Open docs/store-structure.md. It contains a folder layout tree for the NGRX store and rationale for each layer (actions naming, EntityAdapter, optimistic reducer, factory selectors, concatMap). Not just a file listing — substantive explanations.
result: [pending]

### 7. docs/interview-talking-points.md Covers Evaluation Areas
expected: Open docs/interview-talking-points.md. It has at least 5 sections corresponding to evaluation criteria (State Management, Signals, Dynamic Components, Architecture, Code Quality). Each section has specific implementation references, not generic statements.
result: [pending]

### 8. docs/gsd-framework-notes.md Explains AI Usage
expected: Open docs/gsd-framework-notes.md. It explains what the GSD framework is, how it was used in this project, and how it differs from unstructured AI/vibe coding. Clear enough for an engineering interviewer to understand the candidate's role.
result: [pending]

### 9. docs/data-flow-diagram.md Has Mermaid Diagrams
expected: Open docs/data-flow-diagram.md. It contains at least one Mermaid sequenceDiagram showing the moveTask optimistic update and rollback flow. Bonus: a contrast diagram for addTask (pessimistic). The diagrams reference the actual action prop names (newColumnId, previousColumnId).
result: [pending]

## Summary

total: 9
passed: 3
issues: 2
pending: 4
skipped: 0

## Gaps

- truth: "The board loads with its initial state intact after a browser refresh"
  status: failed
  reason: "User reported: the state of the board doesn't persist when you refresh the browser"
  severity: major
  test: 1
  artifacts: []
  missing: []
- truth: "Navigating directly to /board loads the Angular board page without a 404 or router error"
  status: failed
  reason: "User reported: NG04002: 'board' — Angular router cannot match URL segment 'board'"
  severity: major
  test: 2
  artifacts: []
  missing: []
