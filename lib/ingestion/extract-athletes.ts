// Athlete extraction. The xlsx is the single source of truth.
//
// Matching strategy (two passes):
//
// Pass 1 — names that include a last initial.
//   If a registry entry exists with the same firstName + lastInitial,
//   reuse it. Otherwise, if a registry entry exists with the same
//   firstName but no lastInitial, *promote* it: add the lastInitial
//   to the existing record and reuse its id (so prior results don't
//   orphan). Otherwise create a new athlete.
//
// Pass 2 — names that lack a last initial.
//   If exactly one registry entry shares the firstName (with or
//   without lastInitial), match to it. If multiple registry entries
//   share the firstName (e.g. "Sam L." and "Sam R."), the bare name
//   is ambiguous: skip the row and emit a warning for the runner to
//   show Justin.
//
// The promote pass exists because of legacy data: earlier sheets in
// the xlsx sometimes wrote just "MIMI" while newer sheets write
// "MIMI A.". Going forward the coach is consistent, so promotes
// should drop to ~zero after the first rebuild.

import type { Athlete } from "@/lib/data";
import { type NormalizedName, normalizeName, slug } from "./normalize";

export type Tier1Fix = {
  kind:
    | "trim-whitespace"
    | "title-case"
    | "last-initial-period"
    | "collapse-internal-spaces";
  before: string;
  after: string;
  context: string;
};

export type Promotion = {
  id: string;
  firstName: string;
  addedLastInitial: string;
};

export type AmbiguousName = {
  rawName: string;
  firstName: string;
  candidates: string[]; // existing athleteIds
};

export type ExtractedAthletes = {
  athletes: Athlete[];
  byRawName: Map<string, string>; // raw xlsx name → athleteId
  fixes: Tier1Fix[];
  newAthleteIds: string[];
  promotions: Promotion[];
  ambiguous: AmbiguousName[];
  dropped: string[]; // ids of legacy athletes that the current xlsx no longer references
};

export function extractAthletes(
  existingAthletes: Athlete[],
  xlsxRawNames: string[],
): ExtractedAthletes {
  const athletes: Athlete[] = existingAthletes.map((a) => ({ ...a }));
  const byRawName = new Map<string, string>();
  const fixes: Tier1Fix[] = [];
  const newAthleteIds: string[] = [];
  const promotions: Promotion[] = [];
  const ambiguous: AmbiguousName[] = [];

  // Normalize once.
  const normed = xlsxRawNames.map((raw) => ({ raw, norm: normalizeName(raw) }));
  for (const { norm } of normed) fixes.push(...norm.fixes);

  // Pass 1: names with a last initial.
  for (const { raw, norm } of normed) {
    if (!norm.lastInitial) continue;

    const fullKey = athleteKey(norm.firstName, norm.lastInitial);
    const exact = athletes.find(
      (a) => athleteKey(a.firstName, a.lastInitial) === fullKey,
    );
    if (exact) {
      byRawName.set(raw, exact.id);
      continue;
    }

    // Promote a matching bare-firstname registry entry, if any.
    const promotable = athletes.find(
      (a) =>
        a.firstName.toLowerCase() === norm.firstName.toLowerCase() &&
        !a.lastInitial,
    );
    if (promotable) {
      promotable.lastInitial = norm.lastInitial;
      byRawName.set(raw, promotable.id);
      promotions.push({
        id: promotable.id,
        firstName: promotable.firstName,
        addedLastInitial: norm.lastInitial,
      });
      continue;
    }

    // Otherwise, mint a new athlete.
    const id = ensureUniqueId(slug(norm.firstName, norm.lastInitial), athletes);
    const fresh: Athlete = {
      id,
      firstName: norm.firstName,
      lastInitial: norm.lastInitial,
    };
    athletes.push(fresh);
    byRawName.set(raw, id);
    newAthleteIds.push(id);
  }

  // Pass 2: names without a last initial.
  for (const { raw, norm } of normed) {
    if (norm.lastInitial) continue;

    const candidates = athletes.filter(
      (a) => a.firstName.toLowerCase() === norm.firstName.toLowerCase(),
    );

    if (candidates.length === 1) {
      byRawName.set(raw, candidates[0].id);
      continue;
    }

    if (candidates.length === 0) {
      const id = ensureUniqueId(slug(norm.firstName), athletes);
      athletes.push({ id, firstName: norm.firstName });
      byRawName.set(raw, id);
      newAthleteIds.push(id);
      continue;
    }

    // Multiple candidates — bare name is ambiguous. Skip with a warning.
    ambiguous.push({
      rawName: raw,
      firstName: norm.firstName,
      candidates: candidates.map((a) => a.id),
    });
  }

  // Ghost-filter: drop any athlete that the current xlsx never resolved
  // to. Per project policy ("the xlsx is the only data source for
  // athletes"), legacy entries that no current xlsx row references are
  // garbage and should not survive.
  const referenced = new Set(byRawName.values());
  const filtered = athletes.filter((a) => referenced.has(a.id));
  const dropped = athletes
    .filter((a) => !referenced.has(a.id))
    .map((a) => a.id);

  return {
    athletes: filtered,
    byRawName,
    fixes,
    newAthleteIds,
    promotions,
    ambiguous,
    dropped,
  };
}

function athleteKey(firstName: string, lastInitial?: string): string {
  const li = lastInitial ? lastInitial.replace(/\./g, "").toLowerCase() : "";
  return `${firstName.toLowerCase()}|${li}`;
}

function ensureUniqueId(base: string, existing: Athlete[]): string {
  const taken = new Set(existing.map((a) => a.id));
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

export function displayName(norm: NormalizedName): string {
  return norm.lastInitial
    ? `${norm.firstName} ${norm.lastInitial}`
    : norm.firstName;
}
