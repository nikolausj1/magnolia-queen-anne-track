---
name: ui-design
description: Use when building any visual component or page. Prevents AI-slop aesthetic by enforcing discipline on layout, typography, color, and spacing against the project's Visual and Design Spec.
---

# UI Design Skill

Invoke this on every task that produces a visible UI: pages, components, layouts, styling changes. The goal is to avoid the default AI-slop aesthetic (cluttered, gradient-happy, inconsistent spacing, centered marketing-deck vibes) and instead produce something that looks designed.

## Before writing any JSX

Read `PRD.md` → "Visual and design spec" in full. That section is the ground truth for palette, typography, spacing, and imagery. Do not invent tokens. Do not pick colors by vibe.

If a value you need is not in the Visual and Design Spec, stop and ask the user. Do not guess hex values, font weights, or pixel sizes.

## Palette discipline

Use only the palette defined in `PRD.md`. Team colors (navy `#0B1F3A` for Magnolia, red approximately `#C8102E` with black `#000000` for Queen Anne), shared neutrals (`#FFFFFF`, `#111827`, `#6B7280`, `#F3F4F6`, `#E5E7EB`), team badges, event category pills.

No gradients unless explicitly specified. No unspecified accent colors. No drop shadows beyond the subtle hover shadow on cards.

## Typography discipline

System font stack. Sizes and weights from the spec:

- H1: 32/28px, weight 600
- H2: 24/22px, weight 600
- H3: 18px, weight 500
- Body: 16px, weight 400, line-height 1.5
- Secondary: 14px, weight 400, color `#6B7280`
- Marks: 22px, weight 500, tabular numerics, right-aligned

Do not mix weights arbitrarily. Do not use italic for emphasis. Do not add letter-spacing unless the spec calls for it.

## Spacing discipline

- Max content width 1100px.
- Section spacing 64px desktop, 48px mobile.
- Card internal padding 24px.
- Card border 1px `#E5E7EB`, radius 8px, no shadow at rest, subtle shadow on hover only.

Be consistent. If you need a new spacing value, match one already in use. Do not sprinkle `mb-3`, `mb-4`, `mb-5` across a page.

## Layout discipline

Mobile-first. Grid for side-by-side cards on desktop, stack on mobile. Use semantic HTML (`<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`, `<h1>`…`<h6>` in order).

No centered "everything is in a hero" pages. The Home page has a hero plus blocks; the other pages do not need dominant heroes.

## Imagery discipline

- Logos via Next.js `<Image>` with explicit `width` and `height`.
- Photos via Next.js `<Image>` with explicit dimensions; photo paths start with `/photos/` (absolute).
- Alt text on every image.
- Per-meet hero on Results uses the shared SVG track-lanes illustration; do not generate a new image per meet.

## Accessibility checks before done

- Keyboard tab order is sensible.
- Every image has descriptive alt text (not "image," not "photo").
- Color contrast WCAG AA for body and interactive states.
- Heading levels are sequential and semantic.
- Results tables use proper `<table>` / `<thead>` / `<tbody>` / `<th>` / `<td>` when they are tabular.

## Red flags in your own work

Stop and reconsider if you find yourself adding any of these:

- A gradient.
- A drop shadow that was not specified.
- A "pulse" or "glow" animation.
- Color that is not in the palette.
- Font weight 300 or 700 when the spec says 400/500/600.
- A centered section with oversized text.
- Rounded-full where rounded-lg belongs.

## Verification before marking done

- Screenshot in light mode on desktop width (1280px).
- Screenshot in light mode on mobile width (375px).
- Confirm against the relevant PRD section (Home, Results, etc.).
- Confirm palette and typography tokens.
