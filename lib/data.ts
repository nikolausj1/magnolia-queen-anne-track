import athletesData from "@/data/athletes.json";
import meetsData from "@/data/meets.json";
import resultsData from "@/data/results.json";

export type Athlete = {
  id: string;
  firstName: string;
  lastInitial?: string;
};

export type Weather = {
  tempF: number;
  conditions: string;
  windMph?: number;
  summary: string;
};

export type Meet = {
  id: string;
  date: string;
  startTime: string;
  location: string;
  type: string;
  weather?: Weather;
  /**
   * Optional venue photo filename inside `public/photos/`. Defaults to
   * the West Seattle Stadium hero when undefined.
   */
  photo?: string;
};

export type Result = {
  meetId: string;
  athleteId: string;
  event: string;
  mark: string;
  place?: number;
  note?: string;
  relay?: true;
};

const athletes = athletesData as unknown as Athlete[];
const meets = meetsData as unknown as Meet[];
const results = resultsData as unknown as Result[];

export function sortMeetsNewestFirst(input: readonly Meet[]): Meet[] {
  return [...input].sort((a, b) => b.date.localeCompare(a.date));
}

export function indexAthletesById(
  input: readonly Athlete[],
): Record<string, Athlete> {
  return Object.fromEntries(input.map((a) => [a.id, a]));
}

export function filterResultsByMeet(
  input: readonly Result[],
  meetId: string,
): Result[] {
  return input.filter((r) => r.meetId === meetId);
}

export function filterResultsByAthlete(
  input: readonly Result[],
  athleteId: string,
  meetId?: string,
): Result[] {
  return input.filter(
    (r) => r.athleteId === athleteId && (meetId === undefined || r.meetId === meetId),
  );
}

export function getMeets(): Meet[] {
  return sortMeetsNewestFirst(meets);
}

export function getAthletesById(): Record<string, Athlete> {
  return indexAthletesById(athletes);
}

export function getResultsByMeet(meetId: string): Result[] {
  return filterResultsByMeet(results, meetId);
}

export function getResultsByAthlete(
  athleteId: string,
  meetId?: string,
): Result[] {
  return filterResultsByAthlete(results, athleteId, meetId);
}
