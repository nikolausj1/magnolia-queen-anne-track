import { describe, it, expect } from "vitest";
import {
  type Athlete,
  type Meet,
  type Result,
  sortMeetsNewestFirst,
  indexAthletesById,
  filterResultsByMeet,
  filterResultsByAthlete,
} from "@/lib/data";

const MEETS: Meet[] = [
  {
    id: "2026-04-18-west-seattle",
    date: "2026-04-18",
    startTime: "10:00 am",
    location: "West Seattle Stadium",
    type: "Invitational",
  },
  {
    id: "2026-05-23-west-seattle",
    date: "2026-05-23",
    startTime: "10:00 am",
    location: "West Seattle Stadium",
    type: "Championships",
  },
  {
    id: "2026-04-25-west-seattle",
    date: "2026-04-25",
    startTime: "10:00 am",
    location: "West Seattle Stadium",
    type: "Invitational",
  },
];

const ATHLETES: Athlete[] = [
  { id: "sam-l", firstName: "Sam", lastInitial: "L.", team: "magnolia" },
  { id: "addie", firstName: "Addie", team: "queen-anne" },
];

const RESULTS: Result[] = [
  {
    meetId: "2026-04-18-west-seattle",
    athleteId: "sam-l",
    event: "100m",
    mark: "13.2",
    place: 2,
  },
  {
    meetId: "2026-04-18-west-seattle",
    athleteId: "addie",
    event: "Long jump",
    mark: "10'4\"",
  },
  {
    meetId: "2026-04-25-west-seattle",
    athleteId: "sam-l",
    event: "200m",
    mark: "27.5",
    note: "fell",
  },
];

describe("sortMeetsNewestFirst", () => {
  it("sorts by date descending", () => {
    const sorted = sortMeetsNewestFirst(MEETS);
    expect(sorted.map((m) => m.date)).toEqual([
      "2026-05-23",
      "2026-04-25",
      "2026-04-18",
    ]);
  });

  it("returns a new array, leaving the input untouched", () => {
    const before = MEETS.map((m) => m.date);
    sortMeetsNewestFirst(MEETS);
    expect(MEETS.map((m) => m.date)).toEqual(before);
  });

  it("handles empty input", () => {
    expect(sortMeetsNewestFirst([])).toEqual([]);
  });
});

describe("indexAthletesById", () => {
  it("indexes athletes by id", () => {
    const dict = indexAthletesById(ATHLETES);
    expect(dict["sam-l"].firstName).toBe("Sam");
    expect(dict.addie.team).toBe("queen-anne");
  });

  it("handles empty input", () => {
    expect(indexAthletesById([])).toEqual({});
  });
});

describe("filterResultsByMeet", () => {
  it("returns only results for the given meet", () => {
    const filtered = filterResultsByMeet(RESULTS, "2026-04-18-west-seattle");
    expect(filtered).toHaveLength(2);
    expect(filtered.every((r) => r.meetId === "2026-04-18-west-seattle")).toBe(
      true,
    );
  });

  it("returns empty when no match", () => {
    expect(filterResultsByMeet(RESULTS, "nope")).toEqual([]);
  });
});

describe("filterResultsByAthlete", () => {
  it("returns all results for an athlete across meets", () => {
    const filtered = filterResultsByAthlete(RESULTS, "sam-l");
    expect(filtered).toHaveLength(2);
  });

  it("scopes to a single meet when meetId is given", () => {
    const filtered = filterResultsByAthlete(
      RESULTS,
      "sam-l",
      "2026-04-25-west-seattle",
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].event).toBe("200m");
  });

  it("returns empty for an unknown athlete", () => {
    expect(filterResultsByAthlete(RESULTS, "nobody")).toEqual([]);
  });
});
