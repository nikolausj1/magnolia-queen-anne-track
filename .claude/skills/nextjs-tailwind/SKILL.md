---
name: nextjs-tailwind
description: Stack conventions for Next.js App Router + TypeScript + Tailwind CSS. Invoke when creating pages, components, layouts, or working with the data loaders. Complements Web Deployment Guide.md.
---

# Next.js + Tailwind Skill

Conventions for this project's stack. The authoritative reference for deployment and tooling is `Web Deployment Guide.md` at the project root. This skill covers project-local code patterns.

## Stack

- Next.js (latest stable), App Router.
- TypeScript strict mode.
- Tailwind CSS.
- No CSS modules unless necessary.
- No SCSS.
- No styled-components, emotion, etc.

## File layout

```
app/
  layout.tsx              # root layout, header + footer live here
  page.tsx                # Home
  results/
    page.tsx
  join/
    page.tsx
  faq/
    page.tsx
  privacy/
    page.tsx
components/
  Header.tsx
  Footer.tsx
  TeamCard.tsx
  MeetCard.tsx
  EventResults.tsx
  AthleteResults.tsx
  Badge.tsx
  EventPill.tsx
lib/
  data.ts                 # loaders for data/*.json
  marks.ts                # parsers for time / distance marks
  weather.ts              # Open-Meteo helpers
  ingestion/              # ingestion run code
data/
  athletes.json
  meets.json
  results.json
content/
  faq.md
public/
  logos/
  photos/
```

## Component conventions

- Default to server components. Mark client components with `"use client"` only when necessary (state, effects, event handlers).
- PascalCase filenames matching the export.
- Props typed explicitly; avoid `any`.
- One component per file unless a tightly coupled pair lives together.
- No `React.FC`. Use typed function signatures.

## Tailwind conventions

- Classes inline, no `clsx` abuse. If a class list gets long, extract to a variable inside the component, not a separate styles file.
- Mobile-first: default styles for mobile, `md:` / `lg:` for wider viewports.
- Use the spacing scale consistently; pick values that already appear in the codebase.
- Do not introduce arbitrary values (`w-[317px]`) unless the PRD calls for a specific pixel.
- Use Tailwind's `tabular-nums` for marks in the Results page.

## Data loading

- Data is static at build time. Load JSON directly with `import` or `fs.readFileSync` in a loader in `lib/data.ts`.
- Do not fetch data at runtime for results, athletes, or meets. Vercel rebuilds on push; that's the refresh mechanism.
- Weather is read from `meets.json` (cached at ingestion time), not fetched at render.

## Images

- Next.js `<Image>` for every image with explicit `width` and `height` and descriptive `alt`.
- Paths absolute from `/public`: `/logos/magnolia-cc.png`, `/photos/home-hero-action.png`.
- Set `priority` on the hero image for above-the-fold LCP.

## Typography and colors

All visual spec values live in `PRD.md` → Visual and Design Spec. Do not invent. See the `ui-design` skill for discipline around this.

This project uses **Tailwind v4**. Tokens live in `@theme` in `app/globals.css`, not in a `tailwind.config.ts` file (Tailwind v4 moved config into CSS). The generated class names match the v3 pattern one-to-one: `bg-magnolia-navy`, `text-queenAnne-red`, `bg-badge-magnoliaBg`, `text-pill-runText`, `border-divider`, etc.

Current tokens (see `app/globals.css` for the source of truth):

```css
@theme {
  --color-magnolia-navy: #0B1F3A;
  --color-queenAnne-red: #C8102E;   /* approximate; extract from logo */
  --color-queenAnne-black: #000000;

  --color-ink: #111827;
  --color-muted: #6B7280;
  --color-surface: #F3F4F6;
  --color-divider: #E5E7EB;

  --color-badge-magnoliaBg: #E6F1FB;
  --color-badge-magnoliaText: #0C447C;
  --color-badge-queenAnneBg: #FCEBEB;
  --color-badge-queenAnneText: #791F1F;

  --color-pill-runBg: #E1F5EE;  --color-pill-runText: #085041;
  --color-pill-jumpBg: #EEEDFE; --color-pill-jumpText: #3C3489;
  --color-pill-throwBg: #FAECE7; --color-pill-throwText: #712B13;
}
```

## Routing and linking

- Use `<Link>` from `next/link` for internal navigation.
- Registration links (to community center Parks and Rec pages) are external; use `<a target="_blank" rel="noopener noreferrer">`.
- Do not break server-side rendering with client-only navigation.

## Metadata

- Define `metadata` in each `page.tsx` for per-page title and description.
- Root `metadata` in `app/layout.tsx` covers site-wide title template, Open Graph, Twitter card, and favicon.
- `sitemap.xml` and `robots.txt` generated via Next.js conventions.

## Verification before marking done

- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run build` succeeds.
- Manual check on `localhost:3000` at desktop and mobile widths.
- Any new component is imported and used (no dead files).
