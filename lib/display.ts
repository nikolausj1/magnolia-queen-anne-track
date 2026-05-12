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
  "4x100",
  "4x400",
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
