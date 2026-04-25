# 10 · Accessibility pass and build check

**Section:** Polish

## Context

Site is feature-complete. Before deploying, an accessibility audit and a clean build check.

## Goal

Run a full accessibility pass across all pages, fix any issues found, and confirm the production build is clean.

## Testable success criteria

- Every page passes Lighthouse accessibility ≥ 95 on mobile (375px) and desktop (1280px).
- Every image has descriptive `alt` text (not "image," not the filename, not empty).
- Every interactive element is keyboard reachable; focus is visible on every tab stop.
- Heading structure is semantic and sequential (one h1 per page, no skipped levels).
- Color contrast meets WCAG AA for body text and interactive elements on both team palettes (test the Queen Anne red on black in particular; may need to adjust the exact hex).
- Results tables use semantic `<table>` / `<thead>` / `<tbody>` / `<th>` / `<td>` structure.
- `npm run build` completes with no warnings.
- `npm run typecheck` clean.
- `npm run lint` clean.
- No console errors on any page during `npm run dev`.

## Verification steps

1. Lighthouse on Home, Results, Join, FAQ, Privacy. Mobile and desktop. Record scores.
2. Keyboard-only nav through each page: tab through all interactive elements; Enter activates; focus visible.
3. Screen reader spot check: use VoiceOver (Cmd+F5) to read Home and Results. Confirm headings and meet cards announce sensibly.
4. Run axe DevTools browser extension. Address any critical or serious issues.
5. Run the build. No warnings.

## References

- `PRD.md` → Functional requirements → Accessibility.
- `.claude/skills/ui-design/SKILL.md` → Accessibility checks.

## Plan mode

Enable if the audit surfaces three or more issues that need deeper changes (e.g., restructuring table markup, introducing new ARIA attributes). Otherwise skip.
