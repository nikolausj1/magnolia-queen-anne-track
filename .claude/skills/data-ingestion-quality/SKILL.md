---
name: data-ingestion-quality
description: Use on every ingestion run that reads from inbox/ source files and writes to data/*.json. Enforces the three-tier auto-fix / flag / block policy so bad data does not silently land in the site.
---

# Data Ingestion Quality Skill

Ingestion means reading a source file in `inbox/` (xlsx, pdf, docx), parsing it, and writing canonical JSON to `data/`. Every ingestion run is collaborative: print a summary, walk flags one at a time, show a diff, commit on confirmation. Claude Code does not silently pass through bad data.

## The three tiers

**Tier 1: auto-fix silently.** Safe, reversible, obvious. Apply without prompting. Report the count in the summary.

- Trim leading and trailing whitespace.
- Collapse internal double-spaces.
- Normalize uppercase names to title case (`NAOMI` → `Naomi`, `SAM L` → `Sam L.`).
- Standardize a period on last initials (`SAM L` → `Sam L.`).
- Parse mark formats to canonical strings.

**Tier 2: flag for review.** Ambiguous, risky, or semantically significant. Print each case with context and wait for the user to confirm, correct, or override.

- A first name fuzzy-matches an existing athlete (`SAMY` near `Sammy S.`, `NIAMH` near `NAOMI`). Propose the likely match; ask.
- An athlete's disambiguation varies run to run (`SAM` one week, `SAM R` the next). Ask which is canonical.
- A new first name appears with no existing match. Confirm the athlete is actually new before adding to the registry.
- A new event name that is not in the known events list (50m, 100m, 200m, 400m, 800m, 1500m, 3000m, Long jump, Shot put, Javelin / Turbo javelin, 4x100, 4x400).
- A mark's magnitude is far outside that athlete's benchmark or peer times (more than 30% off), suggesting a data entry error.
- A cell contains a place annotation with no parseable mark, or a mark with unexpected characters.
- An athlete's team assignment is ambiguous under the inference rule (appears in both sources, or neither).

**Tier 3: block.** Halt ingestion with a clear error message. Do not prompt; the user must fix upstream before rerunning.

- Required field missing (athlete name, meet sheet header, event, or mark).
- A mark cannot be parsed after reasonable cleanup and none of the flag cases apply.
- Source file structure has changed in a way the parser does not recognize (new columns, renamed required columns).

## Canonical athlete registry

`data/athletes.json` is the source of truth for athlete identity. Every result row references `athleteId`, never a raw name. Match incoming names in this order:

1. Exact match on first name (plus last initial if present) → use existing `athleteId`.
2. Fuzzy match above a similarity threshold → flag for confirmation (Tier 2).
3. No match → flag as potentially new athlete; on confirm, add to registry with inferred team (per team inference rule in `CLAUDE.md`) and division (prompt if unknown).

Never write a result that references a name not in the registry.

## Ingestion run flow

1. Read the source file.
2. Apply Tier 1 fixes. Count them.
3. Run matching and validation. Collect Tier 2 flags and Tier 3 blockers.
4. If any Tier 3 blockers exist: print them, halt, do not proceed.
5. Print the summary: `Reading [source]. Found N athletes, M results. K auto-fixes applied. X flags for review.`
6. Walk Tier 2 flags one at a time with the user, accepting a decision inline.
7. After all flags resolved, show a final diff of what will change in `data/*.json`.
8. On go-ahead, write JSON, commit with a descriptive message, and push. Vercel auto-deploys.
9. On a dry-run request, skip the commit step and leave the working tree dirty for inspection.

## Re-extraction principle

Always re-extract from scratch. Do not do incremental updates. Corrections to earlier entries upstream (typo fixes in the xlsx) must flow through on the next run. Typo fixes belong in the source file, not in the JSON downstream. The source file is the single source of truth.

## Do not

- Silently merge an ambiguous name match. Always flag.
- Invent a division for a Magnolia athlete with no roster. Flag for confirmation.
- Write partial data when a blocker fires. Halt.
- Commit without showing a diff first.
- Edit `data/*.json` by hand to paper over an ingestion issue. Fix the source or fix the parser.
