# CLAUDE.md

Project memory for Claude Code. This file auto-loads at the start of every session.

## Project

Static website for the Magnolia CC Youth Track & Field / Queen Anne Quicksters youth track and field program. Next.js, TypeScript, Tailwind, deployed to Vercel from `main`. Domain `magnoliaqueenannetrackandfield.com` via Porkbun. No backend, no database.

Source of truth for what to build: `PRD.md` at the project root. Source of truth for deployment and stack conventions: `Web Deployment Guide.md` at the project root.

## Commands

```
npm install           # once
npm run dev           # localhost:3000
npm run build         # production build
npm run lint          # eslint
npm run typecheck     # tsc --noEmit
npm test              # if tests exist; not required for v1
```

Deploy: push to `main`. Vercel auto-deploys within about a minute. There are no staging branches.

## Folder conventions

- `app/` — Next.js App Router pages. One folder per route.
- `components/` — reusable UI. PascalCase filenames.
- `data/` — typed JSON data. See schemas in `PRD.md` under Data Model.
- `content/` — text content rendered by pages (currently just `faq.md`).
- `inbox/` — source files for data ingestion. Do not touch these directly; re-run ingestion instead.
- `public/` — static assets. `public/logos/` for team logos, `public/photos/` for approved photos.
- `lib/` — parsers, utilities, data loaders.

## Code style

- Functional React components, hooks for state.
- Tailwind classes inline; no CSS modules unless necessary.
- Use the Next.js `<Image>` component for all photos.
- Prefer server components where possible; mark client components explicitly.
- Imports absolute from project root via tsconfig paths.

## Data ingestion operations

The project ingests results, athletes, and meet data from files in `inbox/`. Schemas are defined in `PRD.md`. This section covers how to run ingestion and how to handle messy source data.

### Source files

- `inbox/2026 Track and Field Schedule.docx` — seeds `data/meets.json`.
- `inbox/Track Roster As of 4-9-26.pdf` — Queen Anne athlete roster.
- `inbox/2026 TRACK TIMES & DISTANCES.xlsx` — **single source of truth** for athletes and results.
- `inbox/2026 T&F order of events.docx` — event/division reference used for FAQ answers.

The QA roster PDF that lived in `inbox/` is no longer used; it's archived in `inbox/z_archived/` for reference. Team data (Magnolia vs. Queen Anne) is no longer tracked per athlete — the names "Magnolia" and "Queen Anne" only appear at the program level (header wordmark, footer registration links, FAQ Q1).

### Extraction rules

- BENCHMARK sheets (e.g. `BENCHMARK APRIL 8`) are real meets — Apr 8 was held at Queen Anne Bowl Playfield as the season's first event. The sheet-name → meet-id resolver (`lib/ingestion/extract-results.ts`) accepts either `MEET` or `BENCHMARK` as the prefix; the date encoded in the sheet name has to match a record in `data/meets.json`.
- Extract from meet sheets: `BENCHMARK APRIL 8`, `1ST MEET APRIL 18`, `2ND MEET APRIL 25`, and subsequent meet sheets. Sheet titles encode the meet date.
- Pivot each row from wide format (one row per athlete, one column per event) to long format (one row per result). Skip blank cells.
- Cell may contain a mark only (`:18.78`), a mark plus a place annotation (`:08 1st`), or a mark plus a parenthetical note (`:22 (fell)`). Split into `mark`, `place`, `note` fields.
- Omit relay columns (4X100, 4X400) for v1.
- Normalize names: uppercase → title case, trim whitespace, standardize last-initial punctuation (`SAM L` → `Sam L.`).

### Mark parsers

Time formats: `:18`, `:18.78`, `11.9`, `1:19` (min:sec). Parse to total seconds for sort.
Distance formats: `6'4"`, `33'8"`, `13'00"`. Parse to total inches for sort.

### Ingestion run flow

The xlsx is trusted upstream — the coach maintains consistent name spellings week-to-week. Replaces the old 3-tier flag-walk with a strict + log model:

1. **Tier 1 silent fixes** — whitespace, casing, last-initial trailing punctuation (period or comma → period). See `lib/ingestion/normalize.ts`.
2. **Strict matching pass 1** (names with last initial): exact match by `firstName + lastInitial`. On miss, **promote** an existing bare-firstname record (add the lastInitial, keep the id) so prior results don't orphan. Otherwise create new.
3. **Strict matching pass 2** (names without last initial): match if exactly one existing athlete shares that firstName. Multiple candidates → skip the row + emit warning.
4. **Ghost filter** — at the end, drop any athlete in `data/athletes.json` who is not referenced by the current xlsx. Per the "xlsx is the only source" rule, legacy entries with no current xlsx row are stale.
5. **Tier 3 blockers** — broken xlsx structure, missing NAME column → exit 2.

Default is dry-run; `--apply` writes data files. Every run prints a one-screen summary (matched / new / promoted / dropped / warnings) — Justin scans it in 30 seconds; if a "new" count is unexpectedly high or a row is dropped because the bare name is ambiguous, that's the signal to either fix the xlsx upstream or do a one-line manual fix in `data/athletes.json`.

### Weather enrichment

After meets are updated in `data/meets.json`, fetch historical weather from Open-Meteo and cache in the meet record. Runs once per meet.

- Endpoint: `https://archive-api.open-meteo.com/v1/archive`
- Params: `latitude=47.5721&longitude=-122.4064&start_date={date}&end_date={date}&hourly=temperature_2m,precipitation,weather_code,wind_speed_10m&timezone=America/Los_Angeles`
- No API key required.
- From the hourly series, pick the hour matching the meet's `startTime`.
- Translate `weather_code` to a short string per Open-Meteo WMO reference (0 = Clear, 1-3 = Partly cloudy / Overcast, 51-67 = Rain, 71-77 = Snow, 95-99 = Thunderstorm).
- Round temperature to whole °F (convert from Celsius); round wind to whole mph (convert from km/h).
- Compose `summary`: `{tempF}°F · {conditions}` plus ` · {windMph} mph wind` when wind ≥ 5 mph.
- On failure: leave `weather` undefined and log. The Results page renders the weather line conditionally.

### Week-to-week operational rhythm

- Justin drops the updated xlsx into `inbox/` after each Saturday meet.
- Run ingestion. Claude Code re-extracts from scratch so upstream corrections flow through.
- Typo fixes go in the xlsx, not the JSON. The xlsx stays the single source of truth.
- After ingestion, commit with a descriptive message and push. Vercel auto-deploys.

### Canonical athlete registry

`data/athletes.json` is rebuilt from the xlsx on every ingest. The schema is intentionally minimal:

```ts
type Athlete = { id: string; firstName: string; lastInitial?: string };
```

No team, no division, no extra metadata — what's not in the xlsx isn't tracked. The id is a slug derived from `firstName + lastInitial` (e.g. `anika-u`, `bo-m`); single-name athletes get just the first name (`abigail`). Collisions on the same slug get a numeric suffix (`sam-l-2`).

## Claude Code patterns

- **Plan mode** triggers on any prompt that touches more than one file, any ingestion run, any DNS or Vercel operation, and any change to `athletes.json` (canonical identity).
- **Skills to invoke:** `ui-design` on every visual component task. `stop-and-ask` is always on; do not make unilateral decisions on ambiguous spec points.
- **Slash commands:** `/clear` between unrelated tasks to keep context clean.

## Git workflow

Per `Web Deployment Guide.md`. Short form:

- Commit to `main` directly. No staging branches.
- Commit messages describe why, not what.
- Stage specific files; avoid `git add -A`.
- Include `Co-Authored-By: Claude <noreply@anthropic.com>` when Claude commits.
- Never commit `.env`, credentials, or anything in `inbox/` with PII beyond what's already public.

## Environment

- Local dev on `localhost:3000`.
- Vercel production on push.
- No environment variables required for v1. If Porkbun API access is needed, prompt the user for the key from 1Password (per `Web Deployment Guide.md`); do not commit.

## Known gotchas

- The xlsx has sheets named with varying conventions. Match on a date pattern, not a static list.
- A bare first name (e.g. `SAM`) matches an existing record automatically only if exactly one athlete has that firstName. With both `SAM L.` and `SAM R.` in the registry, a bare `SAM` row is dropped with a warning — fix in the xlsx (add the last initial) and re-run.
- Parks and Rec may quietly add or remove an athlete; that's why ingestion re-extracts from scratch every run, and the ghost filter prunes athletes who no longer appear in the xlsx.
- Image files in `public/` must be referenced by absolute path in JSX (`/logos/magnolia-cc.png`, not relative).
- The Open-Meteo archive API has a ~5-day lag for recent dates; if a same-day lookup returns nothing, try again tomorrow rather than blocking.

## What not to do

- Do not edit `data/*.json` by hand for typo fixes. Fix in the xlsx upstream and re-run ingestion.
- Do not add scheduling, calendar, forms, or user accounts. Explicitly out of scope per `PRD.md`.
- Do not expose `info@magnoliaqueenannetrackandfield.com` outside the Privacy page.
- Do not add social media links to the footer in v1 (accounts do not exist).
- Do not use relay (4X100, 4X400) data in v1.
