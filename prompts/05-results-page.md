# 05 · Results page (meet cards, By event, By athlete)

**Section:** Pages

## Context

Results is the most complex page. Each meet renders as a card with a toggle between "By event" and "By athlete" views. Athlinks is the visual reference (`https://www.athlinks.com/event/158854/results/Event/1098200/Results`; screenshot in `inbox/`).

Data is ready from prompt 03. The mark parsers and event categorizer are in place from prompt 02.

## Goal

Build `app/results/page.tsx` and the supporting components:

1. **`<MeetCard>`** — for each meet in `getMeets()`, newest first. Structure:
   - Generated SVG track-lanes hero (140px tall, dark navy/charcoal, reused across meets).
   - Meet header: date as `<h2>` (e.g., "Saturday, April 18, 2026"), location right-aligned, optional weather summary below location (small muted text) when `weather` is present.
   - Segmented control below the header: "By event" (default) / "By athlete." Per-card state.
   - Results body switches on the toggle.

2. **`<EventResults>`** (By event view) — results grouped one section per event. Section header: event name (18px, weight 500), category pill (Running teal / Jumping purple / Throwing coral), result count right-aligned. Columns: Athlete (first name bold, division + team badge on secondary line), Place (center, em-hyphen when missing), Mark (22px tabular right-aligned with unit suffix). Rows sorted by mark per category (time ascending, distance descending).

3. **`<AthleteResults>`** (By athlete view) — results grouped one section per athlete. Section header: first name (17px, weight 500), division, team badge. Columns: Event, Place, Mark. One row per event.

4. **`<Badge>`** and **`<EventPill>`** — reusable components for team badges and event category pills, using the tokens from `tailwind.config.ts`.

## Testable success criteria

- `/results` renders a card per meet in `meets.json`, newest first.
- Only meets with results show a populated body; future meets with no results render the card with a "Results posted after the meet" placeholder.
- The April 18 meet shows all its results correctly; toggling By athlete re-renders grouped by athlete.
- Weather line renders only when `weather` is present on the meet; its absence does not error.
- Event category pills use the spec hex colors. Team badges use the spec hex colors.
- First-name collisions in the visible dataset resolve to `Sam L.` / `Sam R.` automatically; no ambiguous duplicate names visible.
- Sorting: `:11.9` appears above `:12.3` in a 100m event; `6'4"` appears above `5'10"` in a long jump event.
- Em-hyphen renders when place is missing.
- Marks use tabular numerics.
- Toggle state is per-card, not global.
- Results page renders correctly on mobile (375px) with readable column alignment.

## Verification steps

1. Visit `/results`. Scroll all meet cards. Confirm visual match to spec and Athlinks reference screenshot.
2. Toggle By event / By athlete on multiple cards. State is independent per card.
3. Resize to 375px. Columns may wrap but stay readable.
4. Open one meet with weather. Confirm the summary line renders.
5. `npm run typecheck`, `npm run lint`, `npm run build` all clean.
6. Tab through the segmented controls. Focus visible; keyboard-actionable.

## References

- `PRD.md` → Functional requirements → Results.
- `PRD.md` → Visual and design spec for palette and typography tokens.
- `inbox/Inspiration Meet Reults Screenshot 2026-04-23 at 3.11.32 PM.png` for visual reference.
- `.claude/skills/ui-design/SKILL.md`.
- `.claude/skills/nextjs-tailwind/SKILL.md`.

## Plan mode

**Enable plan mode.** Multi-component page with per-card state and conditional rendering. Walk through the component breakdown (MeetCard, EventResults, AthleteResults, Badge, EventPill) and the state strategy (likely client components for the toggles, server components for data loading). Propose an SVG for the track-lanes hero and get confirmation before committing.
