"use client";

import { useId, useState } from "react";
import { TrackLanes } from "@/components/TrackLanes";
import { EventResults } from "@/components/EventResults";
import { AthleteResults } from "@/components/AthleteResults";
import type { Meet } from "@/lib/data";
import type { EventGroup, AthleteGroup } from "@/components/ResultsTypes";

type View = "event" | "athlete";

type Props = {
  meet: Meet;
  isFuture: boolean;
  formattedDate: string;
  eventGroups: EventGroup[];
  athleteGroups: AthleteGroup[];
};

export function MeetCard({
  meet,
  isFuture,
  formattedDate,
  eventGroups,
  athleteGroups,
}: Props) {
  const [view, setView] = useState<View>("event");
  const tablistId = useId();
  const eventPanelId = `${tablistId}-event`;
  const athletePanelId = `${tablistId}-athlete`;
  const eventTabId = `${tablistId}-tab-event`;
  const athleteTabId = `${tablistId}-tab-athlete`;

  const hasResults = eventGroups.length > 0;
  const showPlaceholder = isFuture || !hasResults;

  return (
    <article className="rounded-lg border border-divider bg-white overflow-hidden">
      <TrackLanes />

      <div className="p-6 md:p-8 flex flex-col gap-6">
        <header className="flex items-start justify-between gap-4">
          <h2 className="text-ink">{formattedDate}</h2>
          <div className="text-right">
            <p className="text-sm text-ink">{meet.location}</p>
            {meet.weather ? (
              <p className="text-[12px] text-muted mt-0.5">
                {meet.weather.summary}
              </p>
            ) : null}
          </div>
        </header>

        {showPlaceholder ? (
          <p className="text-center text-muted py-6">
            Results will appear here after the meet.
          </p>
        ) : (
          <>
            <div
              role="tablist"
              aria-label="Results view"
              className="inline-flex rounded-md border border-divider bg-surface p-1 self-start"
            >
              <button
                type="button"
                role="tab"
                id={eventTabId}
                aria-selected={view === "event"}
                aria-controls={eventPanelId}
                onClick={() => setView("event")}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  view === "event"
                    ? "bg-white text-magnolia-navy shadow-sm font-medium"
                    : "text-muted hover:text-ink"
                }`}
              >
                By event
              </button>
              <button
                type="button"
                role="tab"
                id={athleteTabId}
                aria-selected={view === "athlete"}
                aria-controls={athletePanelId}
                onClick={() => setView("athlete")}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  view === "athlete"
                    ? "bg-white text-magnolia-navy shadow-sm font-medium"
                    : "text-muted hover:text-ink"
                }`}
              >
                By athlete
              </button>
            </div>

            <div
              role="tabpanel"
              id={eventPanelId}
              aria-labelledby={eventTabId}
              hidden={view !== "event"}
            >
              <EventResults groups={eventGroups} />
            </div>
            <div
              role="tabpanel"
              id={athletePanelId}
              aria-labelledby={athleteTabId}
              hidden={view !== "athlete"}
            >
              <AthleteResults groups={athleteGroups} />
            </div>
          </>
        )}
      </div>
    </article>
  );
}
