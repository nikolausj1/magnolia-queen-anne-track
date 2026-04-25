import type { EventCategory } from "@/lib/events";

export type RowLabel = {
  athleteId: string;
  display: string;
};

export type EventRow = RowLabel & {
  place?: number;
  mark: string;
  note?: string;
};

export type EventGroup = {
  event: string;
  category: EventCategory;
  rows: EventRow[];
};

export type AthleteEventRow = {
  event: string;
  category: EventCategory;
  place?: number;
  mark: string;
  note?: string;
};

export type AthleteGroup = RowLabel & {
  rows: AthleteEventRow[];
};
