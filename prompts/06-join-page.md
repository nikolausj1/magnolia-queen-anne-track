# 06 · Join page

**Section:** Pages

## Context

Shared layout, Home page, and Results page are in place. Join is the registration-focused page. `TeamCard` already exists from the Home prompt and can be reused at a larger size here.

## Goal

Build `app/join/page.tsx` per the Join spec in `PRD.md`. Sections:

1. **Opening line.** "Ready to join? Each team registers through its own community center."

2. **Two prominent registration cards** (larger than Home's versions). Each shows team name, logo/wordmark, which community center, Register button.

3. **Quick-reference block.** Ages (5 to 17), age division table (7 divisions with 2026 birth years per the FAQ content), season (intentionally ambiguous language), practice (Mon/Wed 6:00-7:30 pm QA Bowl), meets (weekends at West Seattle Stadium), what is included (practices, coaching, meet entries).

4. **Questions block.** Link to `/faq`. No `mailto`.

## Testable success criteria

- `/join` renders with all four sections in the order above.
- Registration cards are visibly larger than the Home variants but use the same `TeamCard` component with a size prop.
- Age division table renders all seven divisions with correct birth years.
- No `mailto` link anywhere on this page.
- Lighthouse accessibility ≥ 95.

## Verification steps

1. Visit `/join`. Confirm all sections render.
2. Confirm Register buttons link to the (placeholder) community center URLs.
3. Tab through; focus visible.
4. Visual check on 375px mobile width; cards stack cleanly.

## References

- `PRD.md` → Functional requirements → Join.
- `content/faq.md` → question 2 for the age division table data (or read from `PRD.md` → Rationale).
- `.claude/skills/ui-design/SKILL.md`.

## Plan mode

Optional. Single page, reuses existing components. Skip plan mode unless something nontrivial comes up.
