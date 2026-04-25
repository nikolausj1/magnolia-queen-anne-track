# 02 · Data model, parsers, and loaders

**Section:** Data

## Context

The site displays meet results read from `data/*.json`. Schemas are defined in `PRD.md` → Data Model. The mark format is string-native (`":18.78"`, `"6'4\""`, `"1:19"`) but the Results page sorts numerically, so parsers are needed. Loaders read the three JSON files at build time.

The seed `data/meets.json` already has the six 2026 meets (no weather yet). `data/athletes.json` and `data/results.json` are empty arrays, to be populated by prompt 03.

## Goal

Create three TypeScript modules in `lib/`.

1. **`lib/data.ts`** — load `athletes.json`, `meets.json`, `results.json`. Export typed `Athlete`, `Meet`, `Result` and helper functions: `getMeets()` (sorted newest first), `getAthletesById()`, `getResultsByMeet(meetId)`, `getResultsByAthlete(athleteId, meetId?)`.

2. **`lib/marks.ts`** — parse mark strings. `parseTime(mark)` accepts `:18`, `:18.78`, `11.9`, `1:19` → total seconds (number). `parseDistance(mark)` accepts `6'4"`, `33'8"`, `13'00"` → total inches (number). Export `compareMarks(a, b, unit)` that returns the correct comparator given `unit: "time" | "distance"` (time ascending, distance descending).

3. **`lib/events.ts`** — event categorization. `categorizeEvent(eventName)` returns `"running" | "jumping" | "throwing"` per the rules in `PRD.md` (keyword-based).

## Testable success criteria

- All three modules compile with TypeScript strict mode.
- `parseTime(":18.78")` returns `18.78`. `parseTime("1:19")` returns `79`. `parseTime("11.9")` returns `11.9`.
- `parseDistance("6'4\"")` returns `76`. `parseDistance("13'00\"")` returns `156`.
- `compareMarks("12.3", "11.9", "time")` sorts 11.9 first. `compareMarks("6'4\"", "5'10\"", "distance")` sorts 6'4" first.
- `categorizeEvent("Long jump")` returns `"jumping"`. `categorizeEvent("Shot put")` returns `"throwing"`. `categorizeEvent("400m")` returns `"running"`.
- Unit tests exist under `lib/__tests__/` for each parser, covering the examples above and at least one edge case per function.

## Verification steps

1. Run the unit tests. All pass.
2. Run `npm run typecheck`. Clean.
3. Run `npm run build`. No runtime errors from loaders (they should gracefully handle empty arrays).

## References

- `PRD.md` → Data Model for the schemas.
- `PRD.md` → Functional requirements → Results → Event categorization for the category rules.
- `CLAUDE.md` → Mark parsers for the format spec.
- `.claude/skills/nextjs-tailwind/SKILL.md` → Data loading for conventions.

## Plan mode

**Enable plan mode.** Three new modules plus tests; confirm the test framework choice (Vitest recommended for Next.js) before writing.
