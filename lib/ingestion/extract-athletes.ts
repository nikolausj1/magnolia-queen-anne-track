import type { Athlete } from "@/lib/data";
import type { Tier1Fix, Tier2Flag, AthleteDecision } from "./flags";
import { type NormalizedName, levenshtein, normalizeName, slug } from "./normalize";
import type { RosterEntry } from "./parsers/pdf-roster";

export type RosterMatch = {
  raw: string;
  normalized: NormalizedName;
  // Index into the QA roster, or -1
  qaMatch: number | null;
  // Indices of multiple QA matches when ambiguous
  qaMatches?: number[];
  // Suggested fuzzy matches (already-known athletes by firstName)
  fuzzyCandidates?: string[];
  fixes: Tier1Fix[];
};

export type ExtractedAthletes = {
  athletes: Athlete[];
  byRawName: Map<string, string>; // raw xlsx name → athleteId
  fixes: Tier1Fix[];
  flags: Tier2Flag[];
};

const FUZZY_THRESHOLD = 2;

export function extractAthletes(
  qaRoster: RosterEntry[],
  xlsxRawNames: string[],
  decisions: Record<string, AthleteDecision> = {},
): ExtractedAthletes {
  const athletes: Athlete[] = [];
  const byRawName = new Map<string, string>();
  const allFixes: Tier1Fix[] = [];
  const flags: Tier2Flag[] = [];

  // Step 1: every QA roster entry → an athlete (queen-anne).
  // We build them lazily — only commit to the registry once we've seen
  // a match (in the xlsx) or we know we want them anyway. For v1 we
  // include all roster entries so the registry covers the whole team.

  type RosterAthlete = {
    athlete: Athlete;
    rosterIndex: number;
  };
  const rosterAthletes: RosterAthlete[] = qaRoster.map((entry, idx) => {
    const lastInitial = `${entry.lastName.charAt(0).toUpperCase()}.`;
    const id = slug(entry.firstName, lastInitial);
    return {
      athlete: {
        id,
        firstName: entry.firstName,
        lastInitial,
        team: "queen-anne",
      },
      rosterIndex: idx,
    };
  });

  // Disambiguate roster IDs (two athletes might share firstName + lastInitial).
  // Append a numeric suffix when needed.
  const idCounts = new Map<string, number>();
  for (const ra of rosterAthletes) {
    const seen = idCounts.get(ra.athlete.id) ?? 0;
    if (seen > 0) {
      ra.athlete.id = `${ra.athlete.id}-${seen + 1}`;
    }
    idCounts.set(ra.athlete.id, (idCounts.get(ra.athlete.id) ?? 0) + 1);
  }

  for (const ra of rosterAthletes) athletes.push(ra.athlete);

  // Step 2: walk xlsx names and match.
  for (const raw of xlsxRawNames) {
    const norm = normalizeName(raw);
    allFixes.push(...norm.fixes);

    if (decisions[raw]) {
      const d = decisions[raw];
      switch (d.kind) {
        case "skip":
          continue;
        case "use-existing":
          byRawName.set(raw, d.athleteId);
          continue;
        case "create-magnolia": {
          const id = ensureUniqueId(
            slug(d.firstName, d.lastInitial),
            athletes,
          );
          athletes.push({
            id,
            firstName: d.firstName,
            lastInitial: d.lastInitial,
            team: "magnolia",
          });
          byRawName.set(raw, id);
          continue;
        }
        case "create-queen-anne": {
          const id = ensureUniqueId(
            slug(d.firstName, d.lastInitial),
            athletes,
          );
          athletes.push({
            id,
            firstName: d.firstName,
            lastInitial: d.lastInitial,
            team: "queen-anne",
          });
          byRawName.set(raw, id);
          continue;
        }
        case "create-unknown": {
          const id = ensureUniqueId(
            slug(d.firstName, d.lastInitial),
            athletes,
          );
          athletes.push({
            id,
            firstName: d.firstName,
            lastInitial: d.lastInitial,
          });
          byRawName.set(raw, id);
          continue;
        }
      }
    }

    const exactQA = matchAgainstRoster(norm, qaRoster);

    if (exactQA.length === 1) {
      const idx = exactQA[0];
      const ra = rosterAthletes[idx];
      byRawName.set(raw, ra.athlete.id);
      // If the xlsx name has no last initial but the roster does,
      // we use the roster one for disambiguation.
      continue;
    }

    if (exactQA.length > 1) {
      flags.push({
        kind: "ambiguous-collision",
        context: `xlsx "${raw}" → ${exactQA.length} QA roster matches`,
        details: {
          rawName: raw,
          normalized: norm,
          candidates: exactQA.map((i) => ({
            athleteId: rosterAthletes[i].athlete.id,
            firstName: qaRoster[i].firstName,
            lastName: qaRoster[i].lastName,
          })),
        },
      });
      continue;
    }

    // No QA exact match. Look for fuzzy matches across QA roster.
    const fuzzy = findFuzzyMatches(norm.firstName, qaRoster);
    if (fuzzy.length > 0) {
      flags.push({
        kind: "fuzzy-name-match",
        context: `xlsx "${raw}" (normalized: ${displayName(norm)}) — possible nickname/typo`,
        details: {
          rawName: raw,
          normalized: norm,
          candidates: fuzzy.map((i) => ({
            athleteId: rosterAthletes[i].athlete.id,
            firstName: qaRoster[i].firstName,
            lastName: qaRoster[i].lastName,
          })),
        },
      });
      continue;
    }

    // No QA match and no fuzzy candidates → potential Magnolia athlete.
    flags.push({
      kind: "new-athlete",
      context: `xlsx "${raw}" — not in QA roster; likely Magnolia`,
      details: {
        rawName: raw,
        normalized: norm,
      },
    });
  }

  return { athletes, byRawName, fixes: allFixes, flags };
}

function ensureUniqueId(base: string, existing: Athlete[]): string {
  const taken = new Set(existing.map((a) => a.id));
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

function matchAgainstRoster(
  norm: NormalizedName,
  roster: RosterEntry[],
): number[] {
  const matches: number[] = [];
  const targetFirst = norm.firstName.toLowerCase();
  for (let i = 0; i < roster.length; i++) {
    const entry = roster[i];
    if (entry.firstName.toLowerCase() !== targetFirst) continue;
    if (norm.lastInitial) {
      const li = norm.lastInitial.replace(/\./g, "").toLowerCase();
      const rosterLi = entry.lastName.charAt(0).toLowerCase();
      if (li !== rosterLi) continue;
    }
    matches.push(i);
  }
  return matches;
}

function findFuzzyMatches(
  firstName: string,
  roster: RosterEntry[],
): number[] {
  const target = firstName.toLowerCase();
  const matches: number[] = [];
  for (let i = 0; i < roster.length; i++) {
    const entry = roster[i];
    const candidate = entry.firstName.toLowerCase();
    const dist = levenshtein(target, candidate);
    if (dist === 0) continue; // exact would have matched earlier
    if (dist <= FUZZY_THRESHOLD) {
      matches.push(i);
      continue;
    }
    // Substring/prefix: nicknames like "MIMI" → "Miriam", "CORA" → "Coraline"
    if (
      candidate.startsWith(target) ||
      target.startsWith(candidate) ||
      candidate.includes(target)
    ) {
      matches.push(i);
    }
  }
  return matches;
}

function displayName(norm: NormalizedName): string {
  return norm.lastInitial ? `${norm.firstName} ${norm.lastInitial}` : norm.firstName;
}
