import type { Athlete } from "./data";

export const EVENT_ORDER = [
  "50m",
  "100m",
  "200m",
  "400m",
  "800m",
  "1500m",
  "3000m",
  "Mile",
  "Hurdles",
  "Long Jump",
  "High Jump",
  "Triple Jump",
  "Shot Put",
  "Javelin",
  "Discus",
] as const;

const EVENT_INDEX: ReadonlyMap<string, number> = new Map(
  EVENT_ORDER.map((e, i) => [e, i]),
);

export function eventSortKey(event: string): number {
  return EVENT_INDEX.get(event) ?? Number.MAX_SAFE_INTEGER;
}

export function buildDisplayMap(
  visibleAthletes: readonly Athlete[],
): Map<string, string> {
  const counts = new Map<string, number>();
  for (const a of visibleAthletes) {
    const key = a.firstName.toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const map = new Map<string, string>();
  for (const a of visibleAthletes) {
    const key = a.firstName.toLowerCase();
    const collides = (counts.get(key) ?? 0) > 1;
    if (!collides) {
      map.set(a.id, a.firstName);
      continue;
    }
    if (a.lastInitial) {
      map.set(a.id, `${a.firstName} ${a.lastInitial}`);
    } else {
      console.warn(
        `[display] athlete ${a.id} (${a.firstName}) shares first name but has no lastInitial — rendering plain firstName`,
      );
      map.set(a.id, a.firstName);
    }
  }
  return map;
}
