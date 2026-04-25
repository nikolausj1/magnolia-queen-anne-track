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
- `inbox/2026 TRACK TIMES & DISTANCES.xlsx` — canonical results source; also contributes to athlete roster (see team inference rule).
- `inbox/2026 T&F order of events.docx` — event/division reference used for FAQ answers.

### Team inference rule

No standalone Magnolia roster exists. Use this heuristic on athlete name merges:

1. Athletes in the Queen Anne roster PDF → `team: "queen-anne"`.
2. Athletes in the xlsx but not in the Queen Anne roster PDF → `team: "magnolia"`.

Apply the rule after merging the name sets from both sources.

### Extraction rules

- Skip the `BENCHMARK APRIL 8` sheet in the xlsx. Pre-season time trials, not meet results.
- Extract from meet sheets: `1ST MEET APRIL 18`, `2ND MEET APRIL 25`, and subsequent meet sheets. Sheet titles encode the meet date.
- Pivot each row from wide format (one row per athlete, one column per event) to long format (one row per result). Skip blank cells.
- Cell may contain a mark only (`:18.78`), a mark plus a place annotation (`:08 1st`), or a mark plus a parenthetical note (`:22 (fell)`). Split into `mark`, `place`, `note` fields.
- Omit relay columns (4X100, 4X400) for v1.
- Normalize names: uppercase → title case, trim whitespace, standardize last-initial punctuation (`SAM L` → `Sam L.`).

### Mark parsers

Time formats: `:18`, `:18.78`, `11.9`, `1:19` (min:sec). Parse to total seconds for sort.
Distance formats: `6'4"`, `33'8"`, `13'00"`. Parse to total inches for sort.

### Ingestion quality policy

See the `data-ingestion-quality` skill in `.claude/skills/` for the full auto-fix / flag / block taxonomy and canonical run flow. Apply that policy on every ingestion run.

Short version:

- **Auto-fix silently:** whitespace, case, period on last initials.
- **Flag for review:** fuzzy name match, new first name, new event name, outlier mark, ambiguous team assignment, disambiguation drift.
- **Block (hard error):** required field missing, unparseable mark after cleanup, xlsx structure changed.

Every run: summary → walk flags one at a time with Justin → diff → commit on go-ahead.

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

`data/athletes.json` is the source of truth for athlete identity. Every `Result` references `athleteId`, never a raw name. Match incoming names in this order:

1. Exact match on first name (plus last initial if present) → use existing `athleteId`.
2. Fuzzy match above a similarity threshold → flag for confirmation.
3. No match → flag as potentially new; on confirmation, add with inferred team and division.

## Claude Code patterns

- **Plan mode** triggers on any prompt that touches more than one file, any ingestion run, any DNS or Vercel operation, and any change to `athletes.json` (canonical identity).
- **Skills to invoke:** `data-ingestion-quality` on every ingestion run. `ui-design` on every visual component task. `stop-and-ask` is always on; do not make unilateral decisions on ambiguous spec points.
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
- "SAM" versus "SAM R" ambiguity happens across weeks; always flag, never auto-merge.
- Parks and Rec may quietly add or remove an athlete; that's why ingestion re-extracts from scratch every run.
- Image files in `public/` must be referenced by absolute path in JSX (`/logos/magnolia-cc.png`, not relative).
- The Open-Meteo archive API has a ~5-day lag for recent dates; if a same-day lookup returns nothing, try again tomorrow rather than blocking.

## What not to do

- Do not edit `data/*.json` by hand for typo fixes. Fix in the xlsx upstream and re-run ingestion.
- Do not add scheduling, calendar, forms, or user accounts. Explicitly out of scope per `PRD.md`.
- Do not expose `info@magnoliaqueenannetrackandfield.com` outside the Privacy page.
- Do not add social media links to the footer in v1 (accounts do not exist).
- Do not use relay (4X100, 4X400) data in v1.
