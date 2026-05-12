import type { Metadata } from "next";
import { MeetCard } from "@/components/MeetCard";
import { UpcomingSection } from "@/components/UpcomingSection";
import type {
  AthleteGroup,
  AthleteEventRow,
  EventGroup,
  EventRow,
  RowLabel,
} from "@/components/ResultsTypes";
import {
  type Athlete,
  type Meet,
  type Result,
  getAthletesById,
  getMeets,
  getResultsByMeet,
} from "@/lib/data";
import { categorizeEvent } from "@/lib/events";
import { compareMarks } from "@/lib/marks";
import { eventSortKey } from "@/lib/display";
import { getForecast } from "@/lib/weather-forecast";

export const metadata: Metadata = {
  title: "Meets",
  description:
    "Schedule and meet results for Magnolia CC Youth Track & Field and Queen Anne Quicksters, spring 2026 season.",
  alternates: { canonical: "/meets" },
};

// 6-hour ISR matches the forecast cache so the upcoming weather and the
// page itself stay roughly in sync. Next.js 16 requires this export to be a
// literal — don't replace with `60 * 60 * 6`.
export const revalidate = 21600;

const SECTION_HEADING_CLASS =
  "text-[28px] md:text-[32px] font-semibold tracking-tight";

export default async function MeetsPage() {
  const allMeets = getMeets();
  const athletesById = getAthletesById();

  const today = new Date().toISOString().slice(0, 10);

  // getMeets() sorts newest-first; partition then re-sort upcoming oldest-first
  // so the soonest meet is first in the Upcoming list.
  const upcomingMeets = allMeets
    .filter((m) => m.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Past meets stay newest-first.
  const pastMeets = allMeets.filter((m) => m.date < today);

  // Forecast-enrich upcoming meets in parallel. Past meets keep their
  // historical weather already on meets.json.
  const enrichedUpcoming: Meet[] = await Promise.all(
    upcomingMeets.map(async (meet) => {
      if (meet.weather) return meet;
      const weather = await getForecast(meet.date, meet.startTime);
      return weather ? { ...meet, weather } : meet;
    }),
  );

  const [nextMeet, ...restUpcoming] = enrichedUpcoming;

  // Build per-meet payloads for past meets — those with results render the
  // full MeetCard, those without render the pending variant.
  const pastEntries = pastMeets.map((meet) => {
    const results = getResultsByMeet(meet.id);
    return { meet, results };
  });

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-12 md:py-16">
      {enrichedUpcoming.length > 0 ? (
        <section className="mb-12 md:mb-16">
          <h2 className={`${SECTION_HEADING_CLASS} mb-6`}>Upcoming</h2>
          <UpcomingSection nextMeet={nextMeet} restMeets={restUpcoming} />
        </section>
      ) : null}

      <section id="results">
        <h2 className={`${SECTION_HEADING_CLASS} mb-2`}>Results</h2>
        <p className="text-muted mb-10">Spring 2026 season</p>

        {pastEntries.length === 0 ? (
          <p className="text-base text-ink leading-relaxed">
            Results will be posted here as the season unfolds.
          </p>
        ) : (
          <div className="flex flex-col gap-6 md:gap-8">
            {pastEntries.map(({ meet, results }, index) => {
              if (results.length === 0) {
                return (
                  <MeetCard
                    key={meet.id}
                    meet={meet}
                    formattedDate={formatMeetDate(meet.date)}
                    eventGroups={[]}
                    athleteGroups={[]}
                    athleteCount={0}
                    pending
                  />
                );
              }
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
                  initiallyExpanded={false}
                  isMostRecent={index === 0}
                />
              );
            })}
          </div>
        )}
      </section>
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
      ...(r.relay ? { relay: true as const } : {}),
    };
    const list = byEvent.get(r.event);
    if (list) list.push(row);
    else byEvent.set(r.event, [row]);
  }

  const groups: EventGroup[] = [];
  for (const [event, rows] of byEvent) {
    const category = categorizeEvent(event);
    rows.sort((a, b) => {
      const cmp = compareMarks(a.mark, b.mark, event);
      if (cmp !== 0) return cmp;
      // Stable, deterministic ordering when marks tie (e.g. relay teammates).
      return a.display.localeCompare(b.display);
    });
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
      ...(r.relay ? { relay: true as const } : {}),
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
