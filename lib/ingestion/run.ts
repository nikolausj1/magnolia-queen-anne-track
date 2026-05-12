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
import type { Athlete, Meet, Result } from "@/lib/data";
import { parseMeetsXlsx } from "./parsers/xlsx-meets";
import { extractAthletes } from "./extract-athletes";
import { extractResults } from "./extract-results";
import {
  parseSupplementFiles,
  resolveSupplementAthlete,
  resolveSupplementDate,
} from "./parse-supplements";

const INBOX_DIR = "inbox";
const XLSX_PATH = "inbox/2026 TRACK TIMES & DISTANCES.xlsx";
const MEETS_JSON = "data/meets.json";
const ATHLETES_JSON = "data/athletes.json";
const RESULTS_JSON = "data/results.json";
const MANUAL_RESULTS_JSON = "data/manual-results.json";

type ManualResult = {
  meetId: string;
  athleteId: string;
  event: string;
  mark: string;
  place?: number;
  note?: string;
  /** Why this entry exists outside the xlsx — for the operator (Justin), not rendered. */
  reason: string;
};

async function loadManualResults(): Promise<ManualResult[]> {
  try {
    const raw = await readFile(MANUAL_RESULTS_JSON, "utf8");
    return JSON.parse(raw) as ManualResult[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

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

  // Manual overrides — entries the coach may not maintain in the xlsx but
  // that should persist on the site every week. Only applied when the same
  // (meetId, athleteId, event) tuple isn't already in the extracted results,
  // so the xlsx still wins if it has its own value.
  const manualResults = await loadManualResults();
  const seenKey = new Set(
    resultsResult.results.map((r) => `${r.meetId}|${r.athleteId}|${r.event}`),
  );
  const applied: ManualResult[] = [];
  const shadowed: ManualResult[] = [];
  for (const m of manualResults) {
    const key = `${m.meetId}|${m.athleteId}|${m.event}`;
    if (seenKey.has(key)) {
      shadowed.push(m);
      continue;
    }
    const r: { meetId: string; athleteId: string; event: string; mark: string; place?: number; note?: string } = {
      meetId: m.meetId,
      athleteId: m.athleteId,
      event: m.event,
      mark: m.mark,
    };
    if (m.place !== undefined) r.place = m.place;
    if (m.note !== undefined) r.note = m.note;
    resultsResult.results.push(r);
    applied.push(m);
  }

  // Per-athlete supplement files in inbox/ (e.g. "chase n - places.txt").
  // For each parsed entry: augment the matching xlsx-extracted row with
  // place/mark; if no row exists and a mark is supplied, add a new row.
  const supplements = await parseSupplementFiles(INBOX_DIR);
  const supplementsByKey = new Map<string, Result>();
  for (const r of resultsResult.results) {
    supplementsByKey.set(`${r.meetId}|${r.athleteId}|${r.event}`, r);
  }
  type SupplementOutcome = {
    file: string;
    line: number;
    detail: string;
  };
  const augmented: SupplementOutcome[] = [];
  const added: SupplementOutcome[] = [];
  const supplementSkipped: SupplementOutcome[] = [];
  const supplementErrors: SupplementOutcome[] = supplements.errors.map((e) => ({
    file: e.source,
    line: e.lineNumber,
    detail: `${e.message}  (raw: "${e.raw}")`,
  }));

  for (const s of supplements.entries) {
    const meetId = resolveSupplementDate(s.rawDate, meets);
    if (!meetId) {
      supplementErrors.push({
        file: s.source,
        line: s.lineNumber,
        detail: `no meet matches date "${s.rawDate}"`,
      });
      continue;
    }
    const resolved = resolveSupplementAthlete(s.athleteName, athleteResult.athletes);
    if (!resolved) {
      supplementErrors.push({
        file: s.source,
        line: s.lineNumber,
        detail: `no athlete matches "${s.athleteName}" — check filename`,
      });
      continue;
    }
    if (resolved.ambiguous) {
      supplementErrors.push({
        file: s.source,
        line: s.lineNumber,
        detail: `ambiguous athlete "${s.athleteName}" — multiple matches`,
      });
      continue;
    }
    const key = `${meetId}|${resolved.id}|${s.event}`;
    const existing = supplementsByKey.get(key);
    if (existing) {
      // Augment: fill missing fields. Xlsx wins on mark conflicts.
      const detailParts: string[] = [];
      if (s.place !== undefined && existing.place === undefined) {
        existing.place = s.place;
        detailParts.push(`place=${s.place}`);
      } else if (s.place !== undefined && existing.place !== s.place) {
        detailParts.push(`place skipped (xlsx has ${existing.place})`);
      }
      if (s.mark !== undefined && existing.mark !== s.mark) {
        detailParts.push(`mark skipped (xlsx has "${existing.mark}")`);
      }
      if (detailParts.length > 0) {
        const label = `${resolved.id} / ${s.event} @ ${meetId}: ${detailParts.join(", ")}`;
        if (detailParts.some((p) => p.startsWith("place="))) {
          augmented.push({ file: s.source, line: s.lineNumber, detail: label });
        } else {
          supplementSkipped.push({
            file: s.source,
            line: s.lineNumber,
            detail: label,
          });
        }
      } else {
        supplementSkipped.push({
          file: s.source,
          line: s.lineNumber,
          detail: `${resolved.id} / ${s.event} @ ${meetId}: nothing to add`,
        });
      }
    } else {
      if (s.mark === undefined) {
        supplementErrors.push({
          file: s.source,
          line: s.lineNumber,
          detail: `${resolved.id} / ${s.event} @ ${meetId}: no xlsx row to augment and no mark supplied`,
        });
        continue;
      }
      const fresh: Result = {
        meetId,
        athleteId: resolved.id,
        event: s.event,
        mark: s.mark,
      };
      if (s.place !== undefined) fresh.place = s.place;
      resultsResult.results.push(fresh);
      supplementsByKey.set(key, fresh);
      const label = `${resolved.id} / ${s.event} @ ${meetId} = ${s.mark}${s.place !== undefined ? ` (place=${s.place})` : ""}`;
      added.push({ file: s.source, line: s.lineNumber, detail: label });
    }
  }

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
  if (applied.length > 0) {
    console.error(`  Manual additions applied: ${applied.length}`);
    for (const m of applied) {
      console.error(
        `    + ${m.athleteId} / ${m.event} @ ${m.meetId} = ${m.mark}`,
      );
      console.error(`        reason: ${m.reason}`);
    }
  }
  if (shadowed.length > 0) {
    console.error(
      `  Manual additions shadowed by xlsx (xlsx now has its own value): ${shadowed.length}`,
    );
    for (const m of shadowed) {
      console.error(
        `    ~ ${m.athleteId} / ${m.event} @ ${m.meetId} (manual mark "${m.mark}" — xlsx wins)`,
      );
    }
  }
  if (augmented.length > 0) {
    console.error(`  Supplement augments: ${augmented.length}`);
    for (const a of augmented) {
      console.error(`    ↳ ${a.detail}  (${a.file}:${a.line})`);
    }
  }
  if (added.length > 0) {
    console.error(`  Supplement adds: ${added.length}`);
    for (const a of added) {
      console.error(`    + ${a.detail}  (${a.file}:${a.line})`);
    }
  }
  if (supplementSkipped.length > 0) {
    console.error(`  Supplement skipped: ${supplementSkipped.length}`);
    for (const s of supplementSkipped) {
      console.error(`    · ${s.detail}  (${s.file}:${s.line})`);
    }
  }
  if (supplementErrors.length > 0) {
    console.error(`  Supplement errors: ${supplementErrors.length}`);
    for (const e of supplementErrors) {
      console.error(`    ! ${e.detail}  (${e.file}:${e.line})`);
    }
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
