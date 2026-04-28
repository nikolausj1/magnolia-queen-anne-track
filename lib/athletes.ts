// Server-only query helpers for the athlete card pages.

import {
  type Athlete,
  type Meet,
  type Result,
  getAthletesById,
  getMeets,
  getResultsByAthlete,
} from "@/lib/data";
import { categorizeEvent, type EventCategory } from "@/lib/events";
import { compareMarks } from "@/lib/marks";
import { eventSortKey } from "@/lib/display";

export type PersonalBest = {
  event: string;
  category: EventCategory;
  mark: string;
  meetId: string;
  meetDate: string;
};

export type HistoryRow = {
  meetId: string;
  meetDate: string;
  meetType: string;
  meetLocation: string;
  // Marks indexed by event name (only events the athlete has competed in
  // across the whole season).
  marksByEvent: Record<string, string>;
};

export type AthleteDetail = {
  athlete: Athlete;
  displayName: string;
  meetsAttended: Meet[];
  eventCount: number;
  personalBests: PersonalBest[];
  // Column order for the history table — events the athlete has done,
  // sorted by category + canonical event order.
  historyEvents: { event: string; category: EventCategory }[];
  history: HistoryRow[];
};

const CATEGORY_ORDER: Record<EventCategory, number> = {
  running: 0,
  jumping: 1,
  throwing: 2,
};

export function displayAthleteName(a: Athlete): string {
  return a.lastInitial ? `${a.firstName} ${a.lastInitial}` : a.firstName;
}

export function getAllAthleteIds(): string[] {
  return Object.keys(getAthletesById());
}

export function getAthleteDetail(id: string): AthleteDetail | null {
  const athletesById = getAthletesById();
  const athlete = athletesById[id];
  if (!athlete) return null;

  const allMeets = getMeets();
  const meetsById = Object.fromEntries(allMeets.map((m) => [m.id, m]));
  const results = getResultsByAthlete(id);

  // Group results by meet.
  const byMeet = new Map<string, Result[]>();
  for (const r of results) {
    const list = byMeet.get(r.meetId);
    if (list) list.push(r);
    else byMeet.set(r.meetId, [r]);
  }

  const meetsAttended = [...byMeet.keys()]
    .map((mid) => meetsById[mid])
    .filter((m): m is Meet => Boolean(m))
    .sort((a, b) => b.date.localeCompare(a.date));

  // Personal bests — best mark per event across all meets the athlete competed in.
  const bestByEvent = new Map<string, PersonalBest>();
  for (const r of results) {
    const meet = meetsById[r.meetId];
    if (!meet) continue;
    const cat = categorizeEvent(r.event);
    const candidate: PersonalBest = {
      event: r.event,
      category: cat,
      mark: r.mark,
      meetId: r.meetId,
      meetDate: meet.date,
    };
    const current = bestByEvent.get(r.event);
    if (!current) {
      bestByEvent.set(r.event, candidate);
      continue;
    }
    try {
      if (compareMarks(candidate.mark, current.mark, r.event) < 0) {
        bestByEvent.set(r.event, candidate);
      }
    } catch {
      // unparseable mark — keep current
    }
  }

  const personalBests = sortByCategoryAndEvent(
    [...bestByEvent.values()],
    (pb) => pb.category,
    (pb) => pb.event,
  );

  // History event columns — the union of events from the personal-bests
  // set, in the same canonical order.
  const historyEvents = personalBests.map((pb) => ({
    event: pb.event,
    category: pb.category,
  }));

  // History rows — one per attended meet, with marks per event.
  const history: HistoryRow[] = meetsAttended.map((meet) => {
    const rs = byMeet.get(meet.id) ?? [];
    const marks: Record<string, string> = {};
    for (const r of rs) {
      const noteSuffix = r.note ? ` (${r.note})` : "";
      marks[r.event] = `${r.mark}${noteSuffix}`;
    }
    return {
      meetId: meet.id,
      meetDate: meet.date,
      meetType: meet.type,
      meetLocation: meet.location,
      marksByEvent: marks,
    };
  });

  return {
    athlete,
    displayName: displayAthleteName(athlete),
    meetsAttended,
    eventCount: bestByEvent.size,
    personalBests,
    historyEvents,
    history,
  };
}

function sortByCategoryAndEvent<T>(
  items: T[],
  cat: (t: T) => EventCategory,
  ev: (t: T) => string,
): T[] {
  return [...items].sort((a, b) => {
    const ca = CATEGORY_ORDER[cat(a)];
    const cb = CATEGORY_ORDER[cat(b)];
    if (ca !== cb) return ca - cb;
    const ka = eventSortKey(ev(a));
    const kb = eventSortKey(ev(b));
    if (ka !== kb) return ka - kb;
    return ev(a).localeCompare(ev(b));
  });
}
