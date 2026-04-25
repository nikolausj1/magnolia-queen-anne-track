# 04 · Home page

**Section:** Pages

## Context

Shared layout (prompt 01) renders header and footer. Data loaders (prompt 02) and populated data (prompt 03) are ready. Home is the first full page and sets the tone for the site's "Two Teams, One Community" identity.

## Goal

Build `app/page.tsx` per the Home spec in `PRD.md`. Sections, top to bottom:

1. **Hero.** Headline conveying "Two Teams, One Community," subhead "Youth track and field, ages 5-17, Magnolia and Queen Anne," hero image (`/photos/home-hero-action.png`, priority loaded), two primary CTAs side by side: Register with Magnolia, Register with Queen Anne Quicksters (placeholder URLs until community center URLs are known; use `#` + TODO comment).

2. **Shared program block.** Short paragraph explaining the two teams practice together, share coaches, compete together, and register through their respective community centers.

3. **What to Expect.** Weeknight practices (Mon/Wed, 6:00-7:30 pm, QA Bowl), weekend meets at West Seattle Stadium, all skill levels welcome no cuts, ages 5-17 Seattle area.

4. **Team identity cards.** Side-by-side on desktop, stacked on mobile. Magnolia card uses `/logos/magnolia-cc.png`, navy/white palette, 2-3 sentence description, "Registered through Magnolia Community Center," Register button. Queen Anne card uses `/logos/queen-anne-quicksters.png`, red/black palette, 2-3 sentence description, "Registered through Queen Anne Community Center," Register button.

5. **Coaches section.** Scaffolded but hidden (render nothing, or return null) until coach data exists. Leave a clear TODO comment.

6. **Latest results teaser.** "Most recent meet: [date]. View all results" → links to `/results`. Uses the most recent meet from `getMeets()`.

7. **Secondary CTA.** Link to `/faq`.

## Testable success criteria

- Home renders on `/` at all breakpoints (375px, 768px, 1280px).
- Hero image uses `<Image>` with priority and descriptive alt text.
- Team identity cards visually distinct (Magnolia navy, Queen Anne red/black) and side-by-side ≥ 768px, stacked below.
- Latest results teaser pulls the newest meet dynamically from `meets.json`.
- Coaches section not rendered when no coach data exists; no empty header.
- Registration CTA buttons have `aria-label` describing the destination.
- Lighthouse performance score ≥ 90 on mobile; LCP under 2.5s.
- Lighthouse accessibility score ≥ 95.

## Verification steps

1. Visit `localhost:3000`. Verify all seven sections render as specified.
2. Resize to 375px; confirm hero, cards, and CTAs collapse correctly.
3. Tab through; focus visible on all interactive elements.
4. Lighthouse mobile audit: performance ≥ 90, accessibility ≥ 95.
5. View source / inspect: `<h1>` exists and is the Hero headline; no duplicate h1.

## References

- `PRD.md` → Functional requirements → Home.
- `PRD.md` → Visual and design spec → Palette, Typography, Imagery.
- `.claude/skills/ui-design/SKILL.md` (must read before writing JSX).
- `.claude/skills/nextjs-tailwind/SKILL.md` for Image, component, and routing conventions.

## Plan mode

**Enable plan mode.** Seven sections, two CTAs with pending URLs, and the hero image. Walk through the component breakdown (probably `TeamCard`, reused on Join) before writing.
