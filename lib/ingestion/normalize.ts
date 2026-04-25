import type { Tier1Fix } from "./flags";

export type NormalizedName = {
  firstName: string;
  lastInitial?: string;
  raw: string;
  fixes: Tier1Fix[];
};

const LAST_INITIAL_RE = /^(.+?)\s+([A-Z])\.?$/;

export function titleCase(input: string): string {
  return input
    .toLowerCase()
    .split(/(\s+|-)/)
    .map((part) => {
      if (/^\s+$/.test(part) || part === "-") return part;
      if (part.length === 0) return part;
      return part[0].toUpperCase() + part.slice(1);
    })
    .join("");
}

export function normalizeName(raw: string): NormalizedName {
  const fixes: Tier1Fix[] = [];
  let working = raw;

  const trimmed = working.trim();
  if (trimmed !== working) {
    fixes.push({
      kind: "trim-whitespace",
      before: working,
      after: trimmed,
      context: raw,
    });
    working = trimmed;
  }

  const collapsed = working.replace(/\s+/g, " ");
  if (collapsed !== working) {
    fixes.push({
      kind: "collapse-internal-spaces",
      before: working,
      after: collapsed,
      context: raw,
    });
    working = collapsed;
  }

  // Detect last-initial form: "VIOLET R" / "CHARLIE H." / "SAMMY S"
  const initialMatch = LAST_INITIAL_RE.exec(working);
  let firstName: string;
  let lastInitial: string | undefined;

  if (initialMatch) {
    firstName = titleCase(initialMatch[1]);
    lastInitial = `${initialMatch[2]}.`;
    if (!/[A-Z]\.$/.test(working)) {
      fixes.push({
        kind: "last-initial-period",
        before: working,
        after: `${initialMatch[1]} ${initialMatch[2]}.`,
        context: raw,
      });
    }
  } else {
    firstName = titleCase(working);
  }

  if (firstName !== working && initialMatch === null) {
    fixes.push({
      kind: "title-case",
      before: working,
      after: firstName,
      context: raw,
    });
  }

  return { firstName, lastInitial, raw, fixes };
}

export function slug(firstName: string, lastInitial?: string): string {
  const base = firstName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (lastInitial) {
    const letter = lastInitial.replace(/\./g, "").toLowerCase();
    return `${base}-${letter}`;
  }
  return base;
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[m][n];
}
