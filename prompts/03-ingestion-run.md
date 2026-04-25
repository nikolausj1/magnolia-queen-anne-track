# 03 · Ingestion run (athletes, meets, results, weather)

**Section:** Data

## Context

The canonical sources for athletes and results are in `inbox/`: `Track Roster As of 4-9-26.pdf` (Queen Anne roster), `2026 TRACK TIMES & DISTANCES.xlsx` (all results and the implicit combined roster), `2026 Track and Field Schedule.docx` (meet schedule, already seeded), `2026 T&F order of events.docx` (division event reference).

The `data-ingestion-quality` skill governs the auto-fix / flag / block policy. `CLAUDE.md` has the team inference rule, extraction rules, and weather enrichment details. Apply them exactly.

## Goal

Build the ingestion pipeline in `lib/ingestion/` and run it once to populate `data/athletes.json` and `data/results.json`, and to enrich `data/meets.json` with weather. The pipeline must be re-runnable (extracts from scratch every time).

Modules:

1. `lib/ingestion/extract-athletes.ts` — parse the Queen Anne PDF plus xlsx athlete names; apply the team inference rule; match against the existing athletes registry (empty on first run); emit the updated `athletes.json`.
2. `lib/ingestion/extract-results.ts` — parse each meet sheet in the xlsx (skip `BENCHMARK APRIL 8`); pivot wide to long; split inline place annotations and parenthetical notes; skip relay columns; reference athletes by `athleteId`; emit `results.json`.
3. `lib/ingestion/enrich-weather.ts` — for each meet in `meets.json` without a `weather` field, fetch from Open-Meteo Archive at West Seattle Stadium coordinates for the meet's date and `startTime` hour, compose the `summary` string, and write back.
4. `lib/ingestion/run.ts` — orchestrates all three. Prints the summary, walks Tier-2 flags with the user, shows a diff, commits on confirmation.

## Testable success criteria

- After the run, `data/athletes.json` contains every athlete appearing in the Queen Anne PDF plus every unique name in the xlsx, each with team assignment per the inference rule and division where available (Magnolia athletes flagged for division review, not guessed).
- `data/results.json` contains a result row for every populated non-relay cell in the `1ST MEET APRIL 18` sheet (the only populated meet at this point), each referencing an `athleteId`.
- `data/meets.json` has a `weather` object on the April 18 meet (other meets haven't happened yet; leave their `weather` undefined).
- No result row references a name that isn't in `athletes.json`.
- First-name collisions are resolved by last initials; every visible athlete in the dataset is uniquely identifiable.
- A dry run mode is available (`npm run ingest -- --dry-run`) that prints the diff without writing.

## Verification steps

1. Run `npm run ingest`. Confirm the summary reports sane counts (roughly: 30-50 athletes, 100-200 April 18 results).
2. Walk through any Tier-2 flags Claude Code surfaces. Do not auto-accept; think about each.
3. Review the final diff before committing.
4. Spot check: pick three athletes at random from the xlsx, confirm their results appear in `results.json` with correct marks and event assignments.
5. Confirm `meets.json` for April 18 has a populated `weather.summary` string.
6. `npm run typecheck` and `npm run lint` clean.

## References

- `CLAUDE.md` → Data ingestion operations for extraction rules, team inference, mark parsers, weather enrichment.
- `.claude/skills/data-ingestion-quality/SKILL.md` for the three-tier policy and canonical run flow.
- `PRD.md` → Data Model for the schemas.
- `inbox/` for the source files.

## Plan mode

**Enable plan mode.** Ingestion touches three data files and commits them. Walk through the extraction approach before running. Propose the xlsx and pdf parsing libraries you'll use (suggest: `xlsx` for the workbook, `pdf-parse` or similar for the PDF) and get confirmation.
