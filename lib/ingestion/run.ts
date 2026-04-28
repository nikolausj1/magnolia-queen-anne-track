// Simplified ingestion runner.
//
// Inputs: the xlsx (single source of truth for athlete identity and
// every result). The roster PDF is no longer used.
//
// Defaults to dry-run; pass `--apply` to write data files. The summary
// printed to stderr is the human-facing diff log — Justin reads it once
// after each weekly run.
//
// Tier 3 errors (broken xlsx structure, no NAME column, etc.) exit 2.

import { readFile, writeFile } from "node:fs/promises";
import type { Athlete, Meet } from "@/lib/data";
import { parseMeetsXlsx } from "./parsers/xlsx-meets";
import { extractAthletes } from "./extract-athletes";
import { extractResults } from "./extract-results";

const XLSX_PATH = "inbox/2026 TRACK TIMES & DISTANCES.xlsx";
const MEETS_JSON = "data/meets.json";
const ATHLETES_JSON = "data/athletes.json";
const RESULTS_JSON = "data/results.json";

async function main() {
  const args = new Set(process.argv.slice(2));
  const apply = args.has("--apply");

  const meets = JSON.parse(await readFile(MEETS_JSON, "utf8")) as Meet[];
  const existingAthletes = JSON.parse(
    await readFile(ATHLETES_JSON, "utf8"),
  ) as Athlete[];

  console.error("→ Parsing meet xlsx…");
  const sheets = await parseMeetsXlsx(XLSX_PATH);
  console.error(`  ${sheets.length} sheet(s)`);

  const rawNames = new Set<string>();
  for (const sheet of sheets) {
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
    existingAthletes,
    [...rawNames].sort(),
  );
  const resultsResult = extractResults(
    sheets,
    meets,
    athleteResult.byRawName,
  );

  // Find which meets gained/lost results vs. the current data on disk.
  const currentResults = JSON.parse(
    await readFile(RESULTS_JSON, "utf8"),
  ) as Array<{ meetId: string }>;
  const currentByMeet = new Map<string, number>();
  for (const r of currentResults) {
    currentByMeet.set(r.meetId, (currentByMeet.get(r.meetId) ?? 0) + 1);
  }
  const proposedByMeet = new Map<string, number>();
  for (const r of resultsResult.results) {
    proposedByMeet.set(r.meetId, (proposedByMeet.get(r.meetId) ?? 0) + 1);
  }

  // Summary log
  console.error("");
  console.error("Summary:");
  console.error(
    `  Athletes: ${athleteResult.athletes.length} total (${athleteResult.newAthleteIds.length} new, ${athleteResult.promotions.length} promoted)`,
  );
  if (athleteResult.newAthleteIds.length > 0) {
    for (const id of athleteResult.newAthleteIds) {
      const a = athleteResult.athletes.find((x) => x.id === id);
      const display = a?.lastInitial
        ? `${a.firstName} ${a.lastInitial}`
        : a?.firstName ?? id;
      console.error(`    + ${display}  (id: ${id})`);
    }
  }
  if (athleteResult.promotions.length > 0) {
    console.error(`  Promotions (added last initial to existing athlete):`);
    for (const p of athleteResult.promotions) {
      console.error(
        `    ↑ ${p.firstName} → ${p.firstName} ${p.addedLastInitial}  (id: ${p.id})`,
      );
    }
  }
  if (athleteResult.ambiguous.length > 0) {
    console.error(
      `  Ambiguous bare names skipped (multiple existing athletes share firstName):`,
    );
    for (const a of athleteResult.ambiguous) {
      console.error(
        `    ? "${a.rawName}" — could be: ${a.candidates.join(", ")}`,
      );
    }
  }
  if (athleteResult.dropped.length > 0) {
    console.error(
      `  Dropped (legacy athlete ids not referenced by current xlsx): ${athleteResult.dropped.length}`,
    );
    for (const id of athleteResult.dropped) {
      console.error(`    × ${id}`);
    }
  }
  console.error(`  Results:  ${resultsResult.results.length} total`);
  for (const ms of resultsResult.meetSheets) {
    if (!ms.meetId) continue;
    const before = currentByMeet.get(ms.meetId) ?? 0;
    const after = proposedByMeet.get(ms.meetId) ?? 0;
    const delta = after - before;
    const arrow = delta === 0 ? "=" : delta > 0 ? `+${delta}` : `${delta}`;
    console.error(
      `    ${ms.sheetName} → ${ms.meetId}: ${after} marks (${arrow} vs current)`,
    );
  }
  console.error(`  Auto-fixes: ${athleteResult.fixes.length + resultsResult.fixes.length}`);
  for (const f of [...athleteResult.fixes, ...resultsResult.fixes].slice(0, 10)) {
    console.error(`    ${f.kind}: "${f.before}" → "${f.after}"`);
  }
  if (athleteResult.fixes.length + resultsResult.fixes.length > 10) {
    console.error(
      `    … and ${athleteResult.fixes.length + resultsResult.fixes.length - 10} more`,
    );
  }
  if (resultsResult.warnings.length > 0) {
    console.error(`  Warnings: ${resultsResult.warnings.length}`);
    for (const w of resultsResult.warnings) {
      console.error(`    [${w.kind}] ${w.message}`);
    }
  }

  if (resultsResult.errors.length > 0) {
    console.error("");
    console.error("✗ Tier 3 blockers — fix upstream and re-run:");
    for (const e of resultsResult.errors) {
      console.error(`  [${e.kind}] ${e.message}`);
      console.error(`    context: ${e.context}`);
    }
    process.exit(2);
  }

  if (!apply) {
    console.error("");
    console.error(
      "(dry-run) — not writing data files. Re-run with --apply to commit.",
    );
    return;
  }

  await writeFile(
    ATHLETES_JSON,
    JSON.stringify(athleteResult.athletes, null, 2) + "\n",
  );
  await writeFile(
    RESULTS_JSON,
    JSON.stringify(resultsResult.results, null, 2) + "\n",
  );
  console.error("");
  console.error(`✓ Wrote ${ATHLETES_JSON} and ${RESULTS_JSON}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
