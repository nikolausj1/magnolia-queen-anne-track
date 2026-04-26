import type { Metadata } from "next";
import { MeetCard } from "@/components/MeetCard";
import type {
  AthleteGroup,
  AthleteEventRow,
  EventGroup,
  EventRow,
  RowLabel,
} from "@/components/ResultsTypes";
import {
  type Athlete,
  type Result,
  getAthletesById,
  getMeets,
  getResultsByMeet,
} from "@/lib/data";
import { categorizeEvent } from "@/lib/events";
import { compareMarks } from "@/lib/marks";
import { eventSortKey } from "@/lib/display";

export const metadata: Metadata = {
  title: "Results",
  description:
    "Meet results for Magnolia CC Youth Track & Field and Queen Anne Quicksters, spring 2026 season at West Seattle Stadium.",
  alternates: { canonical: "/results" },
};

export default function ResultsPage() {
  const allMeets = getMeets();
  const athletesById = getAthletesById();

  // Build per-meet results, then keep only meets with real data. Future
  // meets and past-empty meets both fall away. They'll reappear once
  // results land in data/results.json.
  const meetsWithResults = allMeets
    .map((meet) => ({ meet, results: getResultsByMeet(meet.id) }))
    .filter(({ results }) => results.length > 0)
    // Newest meet first so the most recent expands by default.
    .sort((a, b) => b.meet.date.localeCompare(a.meet.date));

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-12 md:py-16">
      <h1 className="mb-2">Results</h1>
      <p className="text-muted mb-10">
        Spring 2026 season
      </p>

      {meetsWithResults.length === 0 ? (
        <p className="text-base text-ink leading-relaxed">
          Results will be posted here as the season unfolds.
        </p>
      ) : (
        <div className="flex flex-col gap-6 md:gap-8">
          {meetsWithResults.map(({ meet, results }, index) => {
            const eventGroups = buildEventGroups(results, athletesById);
            const athleteGroups = buildAthleteGroups(results, athletesById);
            const athleteCount = new Set(results.map((r) => r.athleteId)).size;
            return (
              <MeetCard
                key={meet.id}
                meet={meet}
                formattedDate={formatMeetDate(meet.date)}
                eventGroups={eventGroups}
                athleteGroups={athleteGroups}
                athleteCount={athleteCount}
                initiallyExpanded={index === 0}
                isMostRecent={index === 0}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatMeetDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function displayName(a: Athlete | undefined, fallback: string): string {
  if (!a) return fallback;
  return a.lastInitial ? `${a.firstName} ${a.lastInitial}` : a.firstName;
}

function buildRowLabel(
  athleteId: string,
  athletesById: Record<string, Athlete>,
): RowLabel {
  const a = athletesById[athleteId];
  return {
    athleteId,
    display: displayName(a, athleteId),
  };
}

function buildEventGroups(
  results: Result[],
  athletesById: Record<string, Athlete>,
): EventGroup[] {
  const byEvent = new Map<string, EventRow[]>();
  for (const r of results) {
    const label = buildRowLabel(r.athleteId, athletesById);
    const row: EventRow = {
      ...label,
      mark: r.mark,
      place: r.place,
      note: r.note,
    };
    const list = byEvent.get(r.event);
    if (list) list.push(row);
    else byEvent.set(r.event, [row]);
  }

  const groups: EventGroup[] = [];
  for (const [event, rows] of byEvent) {
    const category = categorizeEvent(event);
    rows.sort((a, b) => compareMarks(a.mark, b.mark, event));
    groups.push({ event, category, rows });
  }

  groups.sort((a, b) => {
    const catOrder = { running: 0, jumping: 1, throwing: 2 };
    const ca = catOrder[a.category];
    const cb = catOrder[b.category];
    if (ca !== cb) return ca - cb;
    const ka = eventSortKey(a.event);
    const kb = eventSortKey(b.event);
    if (ka !== kb) return ka - kb;
    return a.event.localeCompare(b.event);
  });

  return groups;
}

function buildAthleteGroups(
  results: Result[],
  athletesById: Record<string, Athlete>,
): AthleteGroup[] {
  const byAthlete = new Map<string, AthleteEventRow[]>();
  for (const r of results) {
    const row: AthleteEventRow = {
      event: r.event,
      category: categorizeEvent(r.event),
      mark: r.mark,
      place: r.place,
      note: r.note,
    };
    const list = byAthlete.get(r.athleteId);
    if (list) list.push(row);
    else byAthlete.set(r.athleteId, [row]);
  }

  const groups: AthleteGroup[] = [];
  for (const [athleteId, rows] of byAthlete) {
    const label = buildRowLabel(athleteId, athletesById);
    rows.sort((a, b) => {
      const catOrder = { running: 0, jumping: 1, throwing: 2 };
      const ca = catOrder[a.category];
      const cb = catOrder[b.category];
      if (ca !== cb) return ca - cb;
      const ka = eventSortKey(a.event);
      const kb = eventSortKey(b.event);
      if (ka !== kb) return ka - kb;
      return a.event.localeCompare(b.event);
    });
    groups.push({ ...label, rows });
  }

  groups.sort((a, b) =>
    a.display.toLowerCase().localeCompare(b.display.toLowerCase()),
  );
  return groups;
}
