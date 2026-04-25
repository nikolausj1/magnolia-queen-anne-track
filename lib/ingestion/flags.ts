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

export type Tier2FlagKind =
  | "fuzzy-name-match"
  | "ambiguous-collision"
  | "new-athlete"
  | "new-event"
  | "place-only"
  | "unparseable-mark";

export type Tier2Flag = {
  kind: Tier2FlagKind;
  context: string;
  details: Record<string, unknown>;
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

export type AthleteDecision =
  | { kind: "use-existing"; athleteId: string }
  | { kind: "create-magnolia"; firstName: string; lastInitial?: string }
  | { kind: "create-queen-anne"; firstName: string; lastInitial?: string }
  | { kind: "create-unknown"; firstName: string; lastInitial?: string }
  | { kind: "skip" };

export type Decisions = {
  // Keyed by the raw xlsx name (e.g. "MIMI", "JIRAYA")
  athletes: Record<string, AthleteDecision>;
  // Keyed by `${meetSheet}::${rawName}::${event}`
  cells: Record<string, "skip" | "include">;
};
