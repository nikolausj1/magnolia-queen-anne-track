"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { EventResults } from "@/components/EventResults";
import { AthleteResults } from "@/components/AthleteResults";
import type { Meet } from "@/lib/data";
import type { EventGroup, AthleteGroup } from "@/components/ResultsTypes";

type View = "event" | "athlete";

type Props = {
  meet: Meet;
  formattedDate: string;
  eventGroups: EventGroup[];
  athleteGroups: AthleteGroup[];
};

export function MeetCard({
  meet,
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

  return (
    <article className="rounded-lg border border-divider bg-white overflow-hidden">
      <div className="relative h-32 md:h-40">
        <Image
          src="/photos/west-seattle-stadium.webp"
          alt="West Seattle Stadium track at sunset"
          fill
          sizes="(min-width: 768px) 1100px, 100vw"
          className="object-cover"
        />
      </div>

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
      </div>
    </article>
  );
}
