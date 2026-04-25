# 01 · Shared layout and Tailwind tokens

**Section:** Setup

## Context

Scaffold exists from prompt 00. Every page shares a sticky header and a footer. The visual spec in `PRD.md` defines the palette, typography, and spacing tokens. We set those up once, in the root layout and `tailwind.config.ts`, so every subsequent page prompt can rely on them.

## Goal

Build `app/layout.tsx` with a sticky `<Header>` (site lockup + top nav Home / Results / Join / FAQ, hamburger on mobile) and a `<Footer>` (small nav, community center links, Privacy link, tagline "Magnolia - Queen Anne - Seattle," copyright). Set up `tailwind.config.ts` with palette tokens (Magnolia navy, Queen Anne red, shared neutrals, badge tokens, pill tokens). Define system font stack and typography defaults in `globals.css`.

Placeholder header lockup is acceptable for v1 (wordmark or "M · QA Track & Field" text). Real lockup treatment is pending per Open Items.

## Testable success criteria

- `<Header>` renders on every page, sticks on scroll, collapses to hamburger under `md`.
- `<Footer>` renders on every page with the nav links, community center links (placeholder URLs until registration URLs are known — leave `#` and a TODO), Privacy link, tagline, year.
- Tailwind config exposes `magnolia.navy`, `queenAnne.red`, `badge.*`, `pill.*` tokens that match `PRD.md`.
- Body font is system stack, line-height 1.5; H1 / H2 / H3 sizes match spec at desktop and mobile breakpoints.
- Lighthouse accessibility score ≥ 95 on `localhost:3000` (keyboard nav works, focus visible, headings ordered).

## Verification steps

1. Open `localhost:3000`. Resize from 1280px to 375px. Header should collapse to a hamburger; footer should stack gracefully.
2. Tab through the page: focus should be visible on every interactive element.
3. Run `npm run typecheck` and `npm run lint`. Clean.
4. Inspect the DOM: `<header>`, `<main>`, `<footer>` are semantic elements, not plain divs.

## References

- `PRD.md` → Functional requirements → Header / Footer.
- `PRD.md` → Visual and design spec → Palette, Typography, Layout and spacing.
- `.claude/skills/ui-design/SKILL.md` for palette and typography discipline.
- `.claude/skills/nextjs-tailwind/SKILL.md` for the `tailwind.config.ts` tokens block.

## Plan mode

**Enable plan mode.** Layout + tailwind config changes touch files every other prompt will depend on.
