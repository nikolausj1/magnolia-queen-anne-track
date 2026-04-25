import { categorizeEvent } from "@/lib/events";

export function parseTime(mark: string): number {
  const trimmed = mark.trim();
  if (trimmed.includes(":")) {
    const [minStr, secStr] = trimmed.split(":");
    const min = minStr === "" ? 0 : Number(minStr);
    const sec = Number(secStr);
    if (Number.isNaN(min) || Number.isNaN(sec)) {
      throw new Error(`Unparseable time: ${mark}`);
    }
    return min * 60 + sec;
  }
  const seconds = Number(trimmed);
  if (Number.isNaN(seconds)) {
    throw new Error(`Unparseable time: ${mark}`);
  }
  return seconds;
}

const DISTANCE_RE = /^(?:(\d+)')?\s*(?:(\d+)")?$/;

export function parseDistance(mark: string): number {
  const trimmed = mark.trim();
  const match = trimmed.match(DISTANCE_RE);
  if (!match || (match[1] === undefined && match[2] === undefined)) {
    throw new Error(`Unparseable distance: ${mark}`);
  }
  const feet = match[1] ? Number(match[1]) : 0;
  const inches = match[2] ? Number(match[2]) : 0;
  return feet * 12 + inches;
}

export function compareMarks(a: string, b: string, eventName: string): number {
  const category = categorizeEvent(eventName);
  if (category === "running") {
    return parseTime(a) - parseTime(b);
  }
  return parseDistance(b) - parseDistance(a);
}
