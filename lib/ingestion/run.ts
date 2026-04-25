import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { Meet } from "@/lib/data";
import { parseRosterPdf } from "./parsers/pdf-roster";
import { parseMeetsXlsx } from "./parsers/xlsx-meets";
import { extractAthletes } from "./extract-athletes";
import { extractResults } from "./extract-results";
import type { Decisions } from "./flags";

const PDF_PATH = "inbox/Track Roster As of 4-9-26.pdf";
const XLSX_PATH = "inbox/2026 TRACK TIMES & DISTANCES.xlsx";
const MEETS_JSON = "data/meets.json";
const ATHLETES_JSON = "data/athletes.json";
const RESULTS_JSON = "data/results.json";
const REPORT_PATH = "lib/ingestion/.cache/report.json";

async function main() {
  const args = new Set(process.argv.slice(2));
  const apply = args.has("--apply");
  const decisionsArg = process.argv.find((a) => a.startsWith("--decisions="));
  const decisionsPath = decisionsArg?.split("=", 2)[1];

  const decisions: Decisions = decisionsPath
    ? JSON.parse(await readFile(decisionsPath, "utf8"))
    : { athletes: {}, cells: {} };

  const meets = JSON.parse(await readFile(MEETS_JSON, "utf8")) as Meet[];

  console.error("→ Parsing roster PDF…");
  const roster = await parseRosterPdf(PDF_PATH);
  console.error(`  ${roster.length} QA roster entries`);

  console.error("→ Parsing meet xlsx…");
  const sheets = await parseMeetsXlsx(XLSX_PATH);
  console.error(`  ${sheets.length} sheet(s)`);

  // Collect raw xlsx names from any sheet that looks like a meet sheet.
  const rawNames = new Set<string>();
  for (const sheet of sheets) {
    if (/BENCHMARK/i.test(sheet.sheetName)) continue;
    const headers = sheet.headers.map((h) => (h ?? "").trim().toUpperCase());
    const nameCol = headers.findIndex((h) => h === "NAME" || h === "ATHLETE");
    if (nameCol === -1) continue;
    for (const row of sheet.rows) {
      const v = row[nameCol];
      if (v && v.trim() !== "") rawNames.add(v);
    }
  }
  console.error(`  ${rawNames.size} unique athlete names in xlsx`);

  const athleteResult = extractAthletes(
    roster,
    [...rawNames].sort(),
    decisions.athletes,
  );

  const resultsResult = extractResults(
    sheets,
    meets,
    athleteResult.byRawName,
  );

  const summary = {
    sources: { pdf: PDF_PATH, xlsx: XLSX_PATH },
    counts: {
      qaRoster: roster.length,
      xlsxNames: rawNames.size,
      athletes: athleteResult.athletes.length,
      results: resultsResult.results.length,
      tier1Fixes: athleteResult.fixes.length + resultsResult.fixes.length,
      tier2Flags: athleteResult.flags.length + resultsResult.flags.length,
      tier3Errors: resultsResult.errors.length,
    },
    meetSheets: resultsResult.meetSheets,
    flags: [...athleteResult.flags, ...resultsResult.flags],
    errors: resultsResult.errors,
    fixes: [...athleteResult.fixes, ...resultsResult.fixes],
    proposed: {
      athletes: athleteResult.athletes,
      results: resultsResult.results,
    },
  };

  await mkdir(path.dirname(REPORT_PATH), { recursive: true });
  await writeFile(REPORT_PATH, JSON.stringify(summary, null, 2));

  console.error("");
  console.error("Summary:");
  console.error(`  Athletes: ${summary.counts.athletes}`);
  console.error(`  Results:  ${summary.counts.results}`);
  console.error(`  Tier 1 auto-fixes: ${summary.counts.tier1Fixes}`);
  console.error(`  Tier 2 flags:       ${summary.counts.tier2Flags}`);
  console.error(`  Tier 3 errors:      ${summary.counts.tier3Errors}`);
  console.error(`  Meet sheets resolved: ${resultsResult.meetSheets.map((m) => `${m.sheetName} → ${m.meetId ?? "(none)"}`).join(", ")}`);
  console.error("");
  console.error(`Report written to ${REPORT_PATH}`);

  if (resultsResult.errors.length > 0) {
    console.error("");
    console.error("✗ Tier 3 blockers — fix upstream and rerun:");
    for (const e of resultsResult.errors) {
      console.error(`  [${e.kind}] ${e.message}\n    context: ${e.context}`);
    }
    process.exit(2);
  }

  if (!apply) {
    console.error("");
    console.error("(--dry-run / default) — not writing data files.");
    if (summary.counts.tier2Flags > 0) {
      console.error(
        `${summary.counts.tier2Flags} flags need review before --apply.`,
      );
    } else {
      console.error("No flags. Re-run with --apply to write data files.");
    }
    return;
  }

  if (summary.counts.tier2Flags > 0 && !decisionsPath) {
    console.error(
      "✗ Refusing to --apply with unresolved Tier 2 flags. Provide --decisions=<file>.",
    );
    process.exit(3);
  }

  await writeFile(
    ATHLETES_JSON,
    JSON.stringify(athleteResult.athletes, null, 2) + "\n",
  );
  await writeFile(
    RESULTS_JSON,
    JSON.stringify(resultsResult.results, null, 2) + "\n",
  );
  console.error("✓ Wrote", ATHLETES_JSON, "and", RESULTS_JSON);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
