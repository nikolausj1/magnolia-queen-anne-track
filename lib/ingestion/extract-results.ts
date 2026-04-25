import type { Meet, Result } from "@/lib/data";
import type { Tier1Fix, Tier2Flag, Tier3Error } from "./flags";
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
const NOTE_PARENS = /\s*\(([^)]+)\)\s*$/;
const SHEET_DATE = /MEET\s+([A-Z]+)\s+(\d+)/i;
const BENCHMARK = /BENCHMARK/i;

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

export type ExtractedResults = {
  results: Result[];
  fixes: Tier1Fix[];
  flags: Tier2Flag[];
  errors: Tier3Error[];
  // Sheets recognized as meets and the meetId they resolved to (or null)
  meetSheets: Array<{ sheetName: string; meetId: string | null }>;
};

export function extractResults(
  sheets: ParsedSheet[],
  meets: Meet[],
  athletesByRawName: Map<string, string>,
): ExtractedResults {
  const results: Result[] = [];
  const fixes: Tier1Fix[] = [];
  const flags: Tier2Flag[] = [];
  const errors: Tier3Error[] = [];
  const meetSheets: Array<{ sheetName: string; meetId: string | null }> = [];

  for (const sheet of sheets) {
    if (BENCHMARK.test(sheet.sheetName)) continue;
    const meetId = resolveMeetId(sheet.sheetName, meets);

    if (!meetId) {
      // Sheet name doesn't match any meet — only flag if it looks like a meet sheet.
      if (SHEET_DATE.test(sheet.sheetName)) {
        flags.push({
          kind: "new-event",
          context: `Sheet "${sheet.sheetName}" looks like a meet but no matching meet in meets.json`,
          details: { sheetName: sheet.sheetName },
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

    const eventCols: { col: number; event: string }[] = [];
    for (let c = 0; c < headers.length; c++) {
      if (c === nameCol) continue;
      const h = headers[c];
      if (!h) continue;
      if (RELAY_EVENTS.has(h)) continue; // skip relays per PRD v1
      eventCols.push({ col: c, event: h });
      if (!KNOWN_EVENTS.has(h)) {
        flags.push({
          kind: "new-event",
          context: `Unknown event header in "${sheet.sheetName}"`,
          details: { event: h, sheet: sheet.sheetName },
        });
      }
    }

    for (const row of sheet.rows) {
      const rawName = row[nameCol];
      if (!rawName || rawName.trim() === "") continue;
      const athleteId = athletesByRawName.get(rawName);
      if (!athleteId) continue; // unresolved name → skip, athlete-extraction flags will surface it

      for (const { col, event } of eventCols) {
        const cell = row[col];
        if (cell === undefined || cell === null) continue;
        const trimmed = cell.trim();
        if (trimmed === "") continue;

        const parsed = parseCell(trimmed);
        if (parsed.placeOnly) {
          flags.push({
            kind: "place-only",
            context: `${sheet.sheetName} / "${rawName}" / ${event} → "${trimmed}" has no parseable mark`,
            details: { sheet: sheet.sheetName, rawName, event, value: trimmed },
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
        results.push(result);
      }
    }
  }

  return { results, fixes, flags, errors, meetSheets };
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

  // If only a place annotation remains (e.g. "3RD PLACE"), value will be empty.
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
  return eventUpper
    .toLowerCase()
    .split(" ")
    .map((w) => (w.length === 0 ? w : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}
