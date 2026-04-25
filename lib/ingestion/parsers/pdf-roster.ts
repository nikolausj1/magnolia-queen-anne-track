import { readFile } from "node:fs/promises";
import { PDFParse } from "pdf-parse";

export type RosterEntry = {
  lastName: string;
  firstName: string;
};

const TX_CODES = "AN|AF|AT|AV|AW|AH|AC|AD|AL|AM|AY|PA|TR|TV|RV|RP|CV|PH|PN|WA";

// Collapsed-whitespace pattern. Each row is anchored by:
//   <num> <Lastname...>, <Firstname> <TxCode> 1 <Age>.<...>
// Names allow letters, hyphens, apostrophes, and internal spaces.
const ROW_RE = new RegExp(
  String.raw`(?<![\w.])(\d{1,3})\s+` +
    String.raw`([A-Za-z][A-Za-z' -]+?),\s+` +
    String.raw`([A-Za-z][A-Za-z' -]*?)\s+` +
    `(?:${TX_CODES})\\s+1\\s+\\d+\\.\\d+\\s+[MFXOmfxo]`,
  "g",
);

export async function parseRosterPdf(path: string): Promise<RosterEntry[]> {
  const buffer = await readFile(path);
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  await parser.destroy();

  // Strip the repeating header noise so it doesn't sit between
  // wrapped name lines and stop our regex from matching across them.
  const cleaned = result.text
    .replace(/2026 Youth Track & Field[^\n]*\n?/g, " ")
    .replace(/Activity Roster[^\n]*\n?/g, " ")
    .replace(/Page \d+ of \d+[^\n]*\n?/g, " ")
    .replace(/Apr 9, 2026[^\n]*\n?/g, " ")
    .replace(/2:03 PM[^\n]*\n?/g, " ")
    .replace(/Effective Date:[^\n]*\n?/g, " ")
    .replace(/\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}:\d{2}\s+(?:AM|PM)/g, " ");

  // Collapse all whitespace to single spaces — line breaks within a
  // row's cells (wrapped names, multi-line emails, etc.) become benign.
  const flat = cleaned.replace(/\s+/g, " ");

  const entries: RosterEntry[] = [];
  const seen = new Set<string>();

  for (const m of flat.matchAll(ROW_RE)) {
    const lastName = m[2].trim().replace(/\s+/g, " ");
    const firstName = m[3].trim().replace(/\s+/g, " ");
    const key = `${lastName.toLowerCase()}|${firstName.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    entries.push({ lastName, firstName });
  }

  return entries;
}
