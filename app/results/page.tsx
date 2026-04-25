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
import { buildDisplayMap, eventSortKey } from "@/lib/display";

const TODAY = "2026-04-24";

export const metadata: Metadata = {
  title: "Results",
  description:
    "Meet results for Magnolia CC Youth Track & Field and Queen Anne Quicksters, spring 2026 season at West Seattle Stadium.",
  alternates: { canonical: "/results" },
};

export default function ResultsPage() {
  const meets = getMeets();
  const athletesById = getAthletesById();

  // Collect every athlete that appears in any rendered result, so the
  // collision map only disambiguates names that actually show up.
  const visibleAthleteIds = new Set<string>();
  const resultsByMeet: Record<string, Result[]> = {};
  for (const meet of meets) {
    const rs = getResultsByMeet(meet.id);
    resultsByMeet[meet.id] = rs;
    for (const r of rs) visibleAthleteIds.add(r.athleteId);
  }
  const visibleAthletes: Athlete[] = [...visibleAthleteIds]
    .map((id) => athletesById[id])
    .filter((a): a is Athlete => Boolean(a));
  const displayMap = buildDisplayMap(visibleAthletes);

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-12 md:py-16">
      <h1 className="mb-2">Results</h1>
      <p className="text-muted mb-10">
        Spring 2026 season · West Seattle Stadium
      </p>

      <div className="flex flex-col gap-12 md:gap-16">
        {meets.map((meet) => {
          const rs = resultsByMeet[meet.id];
          const isFuture = meet.date > TODAY;
          const eventGroups = buildEventGroups(rs, athletesById, displayMap);
          const athleteGroups = buildAthleteGroups(
            rs,
            athletesById,
            displayMap,
          );
          return (
            <MeetCard
              key={meet.id}
              meet={meet}
              isFuture={isFuture}
              formattedDate={formatMeetDate(meet.date)}
              eventGroups={eventGroups}
              athleteGroups={athleteGroups}
            />
          );
        })}
      </div>
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

function buildRowLabel(
  athleteId: string,
  athletesById: Record<string, Athlete>,
  displayMap: Map<string, string>,
): RowLabel {
  const a = athletesById[athleteId];
  return {
    athleteId,
    display: displayMap.get(athleteId) ?? a?.firstName ?? athleteId,
    team: a?.team,
    division: a?.division,
  };
}

function buildEventGroups(
  results: Result[],
  athletesById: Record<string, Athlete>,
  displayMap: Map<string, string>,
): EventGroup[] {
  const byEvent = new Map<string, EventRow[]>();
  for (const r of results) {
    const label = buildRowLabel(r.athleteId, athletesById, displayMap);
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
  displayMap: Map<string, string>,
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
    const label = buildRowLabel(athleteId, athletesById, displayMap);
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
