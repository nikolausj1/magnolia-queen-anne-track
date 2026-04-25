export type EventCategory = "running" | "jumping" | "throwing";

const JUMP = /\bjump\b/i;
const THROW = /\b(?:put|throw|discus|javelin)\b/i;

export function categorizeEvent(eventName: string): EventCategory {
  if (JUMP.test(eventName)) return "jumping";
  if (THROW.test(eventName)) return "throwing";
  return "running";
}
