# AGENTS.md

Portable project context for any compliant AI coding tool. Shares the core of `CLAUDE.md` without Claude-Code-specific affordances (skills, slash commands, plan-mode triggers).

## Project

Static website for the Magnolia CC Youth Track & Field / Queen Anne Quicksters youth track and field program. Next.js, TypeScript, Tailwind, deployed to Vercel from `main`. No backend, no database.

Source of truth for what to build: `PRD.md` at the project root. Source of truth for deployment and stack conventions: `Web Deployment Guide.md` at the project root.

## Commands

```
npm install
npm run dev           # localhost:3000
npm run build
npm run lint
npm run typecheck
```

Deploy: push to `main`. Vercel auto-deploys within about a minute. No staging branches.

## Folder conventions

- `app/` — Next.js App Router pages. One folder per route.
- `components/` — reusable UI, PascalCase filenames.
- `data/` — typed JSON. Schemas in `PRD.md` Data Model section.
- `content/` — text content rendered by pages (currently `faq.md`).
- `inbox/` — source files for ingestion. Do not edit directly.
- `public/` — static assets. `public/logos/` for team logos, `public/photos/` for approved photos.
- `lib/` — parsers, utilities, data loaders.

## Code style

- Functional React components, hooks for state.
- Tailwind classes inline.
- Next.js `<Image>` for all photos.
- Server components preferred; client components marked explicitly.
- Absolute imports via tsconfig paths.

## Data ingestion

The project ingests results, athletes, and meet data from files in `inbox/`.

**Team inference rule.** Athletes in the Queen Anne roster PDF → `queen-anne`. Athletes in the xlsx but not in the roster PDF → `magnolia`.

**Extraction rules.** Skip the `BENCHMARK APRIL 8` sheet. Pivot from wide to long format. Split place annotations and parenthetical notes into their own fields. Normalize uppercase names to title case. Omit relay columns for v1.

**Mark parsers.** Times (`:18.78`, `11.9`, `1:19`) to total seconds. Distances (`6'4"`, `33'8"`) to total inches.

**Ingestion quality.** Three-tier policy on every run: auto-fix safe things silently (whitespace, case, punctuation), flag suspicious things for human confirmation (fuzzy name matches, new events, outlier marks, ambiguous team assignment), block hard errors (required field missing, unparseable mark, xlsx structure changed). Print a summary, walk flags one at a time, show a diff, commit on confirmation.

**Weather enrichment.** After meet updates, fetch from Open-Meteo Archive API (`https://archive-api.open-meteo.com/v1/archive`) with coordinates `47.5721, -122.4064` (West Seattle Stadium) and cache in `meets.json`. No API key. Graceful degradation when lookup fails.

**Canonical athlete registry.** `data/athletes.json` is the source of truth for athlete identity. Results reference `athleteId`, never raw name strings.

**Week-to-week rhythm.** Updated xlsx dropped into `inbox/`, re-extract from scratch on each run, typo fixes go in the xlsx not the JSON.

## Git workflow

- Commit to `main` directly.
- Descriptive messages focused on why.
- Stage specific files.
- Never commit `.env`, credentials, or PII.

## Scope

In scope for v1: Home, Results, Join, FAQ, Privacy pages. Weather on meet cards. Two-team visual identity. Mobile-first responsive. Full scope and out-of-scope list in `PRD.md`.

Out of scope: scheduling, forms, user accounts, database, CMS, embedded merch store, athlete self-service, social media integration.

## Gotchas

- xlsx sheet names vary; match on date pattern.
- "SAM" vs "SAM R" ambiguity across weeks; always flag.
- Image paths in JSX must be absolute (`/logos/magnolia-cc.png`).
- Open-Meteo archive has ~5-day lag for recent dates.
