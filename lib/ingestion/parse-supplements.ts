// Per-athlete supplement files in inbox/. Used for marks/places that
// the coach won't enter in the xlsx (e.g. Chase's individual-event
// places — the coach only tags relays).
//
// File pattern: inbox/<athlete name> - places.{txt,rtf}
//   "chase n - places.txt"   → athleteName "chase n"
//   "chase n - places.rtf"   → same; RTF control words stripped
//
// Line format (after RTF stripping and comment removal):
//   <date>, <event>, <value> [, <value> ...]
//     date    e.g. "may 9", "april 18" — month + day matched against meets.json
//     event   case-insensitive: "javelin", "shot put", "100m", "4x100"
//     value   either a place ("1st place", "3rd", "5th place")
//             or a mark (":18.85", "59'5\"", "1:36.16", "15:13")
//
// Apply order in the runner: after manual-results overlay. For each
// entry the runner finds the matching (meetId, athleteId, event) row
// and augments place/mark; if no row exists and a mark is supplied,
// adds a new row.

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export type SupplementEntry = {
  source: string; // filename, for warnings
  lineNumber: number;
  athleteName: string; // "chase n" — case-insensitive match later
  rawDate: string; // "may 9"
  event: string; // canonical, e.g. "Javelin" or "100m"
  mark?: string;
  place?: number;
};

export type SupplementParseError = {
  source: string;
  lineNumber: number;
  message: string;
  raw: string;
};

export type SupplementParseResult = {
  entries: SupplementEntry[];
  errors: SupplementParseError[];
};

const FILENAME_RE = /^(.+?)\s*-\s*places\.(txt|rtf)$/i;
const PLACE_RE = /^(\d+)(?:st|nd|rd|th)(?:\s+place)?$/i;
const MONTHS: Record<string, string> = {
  january: "01", february: "02", march: "03", april: "04",
  may: "05", june: "06", july: "07", august: "08",
  september: "09", october: "10", november: "11", december: "12",
};

// Common typos seen in Justin's notes (e.g. "apil"). Add as needed.
const MONTH_TYPOS: Record<string, string> = {
  apil: "april",
};

export async function parseSupplementFiles(
  inboxDir: string,
): Promise<SupplementParseResult> {
  const entries: SupplementEntry[] = [];
  const errors: SupplementParseError[] = [];
  let dir: string[];
  try {
    dir = await readdir(inboxDir);
  } catch {
    return { entries, errors };
  }

  for (const file of dir.sort()) {
    const m = FILENAME_RE.exec(file);
    if (!m) continue;
    const athleteName = m[1].trim();
    const ext = m[2].toLowerCase();
    const filePath = path.join(inboxDir, file);
    const raw = await readFile(filePath, "utf8");
    const text = ext === "rtf" ? stripRtf(raw) : raw;
    const lines = text.split(/\r?\n/);
    lines.forEach((line, idx) => {
      const cleaned = line.replace(/\\$/, "").trim(); // strip trailing RTF "\"
      if (!cleaned || cleaned.startsWith("#")) return;
      const parsed = parseLine(cleaned, file, idx + 1, athleteName);
      if ("error" in parsed) {
        errors.push({
          source: file,
          lineNumber: idx + 1,
          message: parsed.error,
          raw: cleaned,
        });
      } else {
        entries.push(parsed.entry);
      }
    });
  }

  return { entries, errors };
}

function parseLine(
  line: string,
  source: string,
  lineNumber: number,
  athleteName: string,
):
  | { entry: SupplementEntry }
  | { error: string } {
  const parts = line.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 3) {
    return { error: `expected at least <date>, <event>, <value> — got ${parts.length} parts` };
  }
  const [rawDate, rawEvent, ...values] = parts;

  const event = canonicalEvent(rawEvent);
  if (!event) return { error: `unknown event "${rawEvent}"` };

  let mark: string | undefined;
  let place: number | undefined;
  for (const v of values) {
    const placeMatch = PLACE_RE.exec(v);
    if (placeMatch) {
      place = parseInt(placeMatch[1], 10);
    } else {
      // Treat anything else as a mark (time or distance literal).
      if (mark !== undefined) {
        return { error: `multiple marks given: "${mark}" and "${v}"` };
      }
      mark = v;
    }
  }
  if (place === undefined && mark === undefined) {
    return { error: "no place or mark recognized in values" };
  }

  return {
    entry: {
      source,
      lineNumber,
      athleteName,
      rawDate,
      event,
      ...(mark !== undefined ? { mark } : {}),
      ...(place !== undefined ? { place } : {}),
    },
  };
}

// Resolve a "may 9" / "april 18" string to a meet id by matching MM-DD
// against meets.json dates. Returns null if no match.
export function resolveSupplementDate(
  rawDate: string,
  meets: { id: string; date: string }[],
): string | null {
  const m = /^([a-z]+)\s+(\d+)$/i.exec(rawDate.trim());
  if (!m) return null;
  const monthName = m[1].toLowerCase();
  const month = MONTHS[monthName] ?? MONTHS[MONTH_TYPOS[monthName] ?? ""];
  if (!month) return null;
  const day = m[2].padStart(2, "0");
  const monthDay = `${month}-${day}`;
  for (const meet of meets) {
    if (meet.date.endsWith(monthDay)) return meet.id;
  }
  return null;
}

// Match an athlete by the supplement-file basename (e.g. "chase n").
// Lookup is on firstName + (optional) lastInitial; case- and
// whitespace-insensitive. Returns null if no unique match.
export function resolveSupplementAthlete(
  athleteName: string,
  athletes: { id: string; firstName: string; lastInitial?: string }[],
): { id: string; ambiguous: boolean } | null {
  const tokens = athleteName.trim().toLowerCase().split(/\s+/);
  if (tokens.length === 0) return null;
  const first = tokens[0];
  const li = tokens[1] ? tokens[1].replace(/\.$/, "") : undefined;

  const matches = athletes.filter((a) => {
    if (a.firstName.toLowerCase() !== first) return false;
    if (!li) return true;
    return (a.lastInitial ?? "").replace(/\.$/, "").toLowerCase() === li;
  });

  if (matches.length === 0) return null;
  if (matches.length > 1) return { id: matches[0].id, ambiguous: true };
  return { id: matches[0].id, ambiguous: false };
}

// Canonicalize an event header to the form used in results.json.
// "javelin" → "Javelin", "100m" → "100m", "shot put" → "Shot Put",
// "4x100" → "4x100".
function canonicalEvent(raw: string): string | null {
  const s = raw.trim().toLowerCase();
  if (!s) return null;
  if (/^\d+\s*m$/.test(s)) return s.replace(/\s+/g, "");
  if (/^\dx\d+m?$/.test(s)) return s.replace(/m$/, "");
  return s
    .split(/\s+/)
    .map((w) => (w.length === 0 ? w : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}

// Strip RTF control words and group braces, leaving the visible text.
// Handles the simple subset that TextEdit produces. Not a full RTF parser.
function stripRtf(rtf: string): string {
  let s = rtf;
  // Remove \bin{N}{data} sequences (binary blobs). Not expected here.
  s = s.replace(/\\bin\d+\s*[\s\S]*?(?=[}\\])/g, "");
  // Drop entire {\fonttbl ...} {\colortbl ...} {\*\... ...} groups.
  s = s.replace(/\{\\fonttbl[^}]*\}/g, "");
  s = s.replace(/\{\\colortbl[^}]*\}/g, "");
  s = s.replace(/\{\\\*[^}]*\}/g, "");
  // RTF escapes \\ \{ \} → literal characters.
  s = s.replace(/\\([\\{}])/g, "$1");
  // Common control words that emit a character (\par newline, \tab tab).
  s = s.replace(/\\par\b/g, "\n");
  s = s.replace(/\\tab\b/g, "\t");
  // Drop remaining control words like \rtf1, \cf0, \fs24, \pard etc.
  s = s.replace(/\\[a-z]+-?\d*\s?/gi, "");
  // Strip braces that remain.
  s = s.replace(/[{}]/g, "");
  return s;
}
