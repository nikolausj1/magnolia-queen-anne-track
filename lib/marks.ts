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

const DISTANCE_RE = /^(?:(\d+)')?\s*(?:(\d+(?:\.\d+)?)")?$/;

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

// Display formatters. Inputs come from data/results.json which preserves the
// coach's literal xlsx entry (":17", "1:46", "6'", "47'7\""). These produce a
// consistent on-screen format without rewriting source data:
//   times   < 60s →  :SS.HH      (track convention; drops leading 0:)
//   times   ≥ 60s →  M:SS.HH
//   distance      →  F' I"       (always with the inches component)
// Half-up to hundredths for time; integer inches for distance. On parse
// failure, return the input unchanged rather than crash the render.

export function formatTime(mark: string): string {
  let totalSeconds: number;
  try {
    totalSeconds = parseTime(mark);
  } catch {
    return mark;
  }
  const rounded = Math.round(totalSeconds * 100) / 100;
  const minutes = Math.floor(rounded / 60);
  const remaining = rounded - minutes * 60;
  const wholeSec = Math.floor(remaining);
  const hundredths = Math.round((remaining - wholeSec) * 100);
  const ss = String(wholeSec).padStart(2, "0");
  const hh = String(hundredths).padStart(2, "0");
  if (minutes === 0) return `:${ss}.${hh}`;
  return `${minutes}:${ss}.${hh}`;
}

export function formatDistance(mark: string): string {
  let totalInches: number;
  try {
    totalInches = parseDistance(mark);
  } catch {
    return mark;
  }
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);
  return `${feet}' ${inches}"`;
}

export function formatMark(mark: string, eventName: string): string {
  const category = categorizeEvent(eventName);
  if (category === "running") return formatTime(mark);
  return formatDistance(mark);
}
