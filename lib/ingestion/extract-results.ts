// Result extraction. The xlsx is wide (one row per athlete, one column
// per event); we pivot to long (one Result per non-empty cell). Sheet
// names encode the meet date — we resolve sheet → meet by month/day
// suffix on the meet's ISO date. Both "MEET" and "BENCHMARK" prefixes
// count.
//
// Tier 1: silent fixes (whitespace cleanup on cells).
// Tier 3: structural failures (no NAME column, etc.) — return as
//   blocking errors and the runner exits non-zero.
//
// No Tier 2 flag system anymore — the simplified pipeline doesn't have a
// flag-walk loop. Anything that would have been a flag (unknown event
// header, place-only cell with no mark) is logged as a warning to stderr
// and otherwise skipped.

import type { Meet, Result } from "@/lib/data";
import type { Tier1Fix } from "./extract-athletes";
import type { ParsedSheet } from "./parsers/xlsx-meets";

const RELAY_EVENTS = new Set(["4X100", "4X400", "4X100M", "4X400M"]);
const KNOWN_EVENTS = new Set([
  "50M",
  "100M",
  "200M",
  "400M",
  "800M",
  "1500M",
  "3000M",
  "JAVELIN",
  "TURBO JAVELIN",
  "LONG JUMP",
  "HIGH JUMP",
  "TRIPLE JUMP",
  "SHOT PUT",
]);

const PLACE_SUFFIX = /\s+(\d+)(?:st|nd|rd|th)\b/i;
const PLACE_ONLY = /^(\d+)(?:st|nd|rd|th)\s*place\s*$/i;
const NOTE_PARENS = /\s*\(([^)]+)\)\s*$/;
const SHEET_DATE = /(?:MEET|BENCHMARK)\s+([A-Z]+)\s+(\d+)/i;

const MONTH_BY_NAME: Record<string, string> = {
  JANUARY: "01",
  FEBRUARY: "02",
  MARCH: "03",
  APRIL: "04",
  MAY: "05",
  JUNE: "06",
  JULY: "07",
  AUGUST: "08",
  SEPTEMBER: "09",
  OCTOBER: "10",
  NOVEMBER: "11",
  DECEMBER: "12",
};

export type Tier3Error = {
  kind:
    | "missing-name"
    | "missing-event"
    | "structure-changed"
    | "unparseable-mark";
  message: string;
  context: string;
};

export type Warning = {
  kind: "unknown-event" | "place-only" | "unresolved-sheet" | "incomplete-relay";
  message: string;
};

export type ExtractedResults = {
  results: Result[];
  fixes: Tier1Fix[];
  warnings: Warning[];
  errors: Tier3Error[];
  meetSheets: Array<{ sheetName: string; meetId: string | null }>;
};

export function extractResults(
  sheets: ParsedSheet[],
  meets: Meet[],
  athletesByRawName: Map<string, string>,
): ExtractedResults {
  const results: Result[] = [];
  const fixes: Tier1Fix[] = [];
  const warnings: Warning[] = [];
  const errors: Tier3Error[] = [];
  const meetSheets: Array<{ sheetName: string; meetId: string | null }> = [];

  for (const sheet of sheets) {
    const meetId = resolveMeetId(sheet.sheetName, meets);

    if (!meetId) {
      if (SHEET_DATE.test(sheet.sheetName)) {
        warnings.push({
          kind: "unresolved-sheet",
          message: `Sheet "${sheet.sheetName}" looks like a meet but no matching entry in meets.json`,
        });
      }
      continue;
    }

    meetSheets.push({ sheetName: sheet.sheetName, meetId });

    const headers = sheet.headers.map((h) => (h ?? "").trim().toUpperCase());
    const nameCol = headers.findIndex((h) => h === "NAME" || h === "ATHLETE");
    if (nameCol === -1) {
      errors.push({
        kind: "structure-changed",
        message: `Sheet "${sheet.sheetName}" has no NAME column`,
        context: headers.join(" | "),
      });
      continue;
    }

    const eventCols: { col: number; event: string; isRelay: boolean }[] = [];
    for (let c = 0; c < headers.length; c++) {
      if (c === nameCol) continue;
      const h = headers[c];
      if (!h) continue;
      const isRelay = RELAY_EVENTS.has(h);
      eventCols.push({ col: c, event: h, isRelay });
      if (!isRelay && !KNOWN_EVENTS.has(h)) {
        warnings.push({
          kind: "unknown-event",
          message: `Unknown event header "${h}" in "${sheet.sheetName}" — extracted anyway`,
        });
      }
    }

    // Track relay results emitted from this sheet so we can post-pass
    // and warn on teams that don't have exactly 4 athletes attached.
    const relayResultsBySheet: Result[] = [];

    for (const row of sheet.rows) {
      const rawName = row[nameCol];
      if (!rawName || rawName.trim() === "") continue;
      const athleteId = athletesByRawName.get(rawName);
      if (!athleteId) continue; // shouldn't happen — extractAthletes covers everything

      for (const { col, event, isRelay } of eventCols) {
        const cell = row[col];
        if (cell === undefined || cell === null) continue;
        const trimmed = cell.trim();
        if (trimmed === "") continue;

        const parsed = parseCell(trimmed);
        if (parsed.placeOnly) {
          warnings.push({
            kind: "place-only",
            message: `${sheet.sheetName} / "${rawName}" / ${event} → "${trimmed}" has no parseable mark — skipped`,
          });
          continue;
        }

        if (parsed.cleanedFromOriginal) {
          fixes.push({
            kind: "trim-whitespace",
            before: cell,
            after: trimmed,
            context: `${sheet.sheetName}/${rawName}/${event}`,
          });
        }

        const titleEvent = toTitleEvent(event);
        const result: Result = {
          meetId,
          athleteId,
          event: titleEvent,
          mark: parsed.mark,
        };
        if (parsed.place !== undefined) result.place = parsed.place;
        if (parsed.note !== undefined) result.note = parsed.note;
        if (isRelay) result.relay = true;
        results.push(result);
        if (isRelay) relayResultsBySheet.push(result);
      }
    }

    // Incomplete-relay warning. Within a sheet+event, a team is identified
    // by its mark (two teams clocking identical hundredths in the same
    // event is vanishingly rare; if it ever happens the count is harmlessly
    // doubled and the warning still surfaces).
    const teamsByKey = new Map<string, number>();
    for (const r of relayResultsBySheet) {
      const key = `${r.event}|${r.mark}`;
      teamsByKey.set(key, (teamsByKey.get(key) ?? 0) + 1);
    }
    for (const [key, size] of teamsByKey) {
      if (size === 4) continue;
      const [event, mark] = key.split("|");
      warnings.push({
        kind: "incomplete-relay",
        message: `${sheet.sheetName} / ${event}: team with mark ${mark} has ${size} runner${size === 1 ? "" : "s"} (expected 4)`,
      });
    }
  }

  return { results, fixes, warnings, errors, meetSheets };
}

function resolveMeetId(sheetName: string, meets: Meet[]): string | null {
  const m = SHEET_DATE.exec(sheetName);
  if (!m) return null;
  const monthName = m[1].toUpperCase();
  const day = m[2].padStart(2, "0");
  const month = MONTH_BY_NAME[monthName];
  if (!month) return null;
  const monthDay = `${month}-${day}`;
  for (const meet of meets) {
    if (meet.date.endsWith(monthDay)) return meet.id;
  }
  return null;
}

function parseCell(raw: string): {
  mark: string;
  place?: number;
  note?: string;
  placeOnly?: boolean;
  cleanedFromOriginal?: boolean;
} {
  let value = raw.trim();
  let note: string | undefined;
  let place: number | undefined;

  const placeOnlyMatch = PLACE_ONLY.exec(value);
  if (placeOnlyMatch) {
    return { mark: "", place: parseInt(placeOnlyMatch[1], 10), placeOnly: true };
  }

  const noteMatch = NOTE_PARENS.exec(value);
  if (noteMatch) {
    note = noteMatch[1].trim();
    value = value.slice(0, noteMatch.index).trim();
  }

  const placeMatch = PLACE_SUFFIX.exec(value);
  if (placeMatch) {
    place = parseInt(placeMatch[1], 10);
    value = value.slice(0, placeMatch.index).trim();
  }

  if (value === "" || /^place$/i.test(value)) {
    return { mark: "", placeOnly: true };
  }

  return {
    mark: value,
    place,
    note,
    cleanedFromOriginal: value !== raw,
  };
}

function toTitleEvent(eventUpper: string): string {
  if (/^\d+M$/.test(eventUpper)) return eventUpper.toLowerCase();
  if (/^\dX\d+M?$/i.test(eventUpper)) {
    return eventUpper.toLowerCase().replace(/m$/, "");
  }
  return eventUpper
    .toLowerCase()
    .split(" ")
    .map((w) => (w.length === 0 ? w : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}
