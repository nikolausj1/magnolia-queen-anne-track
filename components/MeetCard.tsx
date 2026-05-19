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
  athleteCount: number;
  initiallyExpanded?: boolean;
  isMostRecent?: boolean;
  /**
   * When true, the card renders the photo header but disables the
   * expand/collapse interaction and replaces the View Results CTA with a
   * muted "Results pending" pill. Used for past meets whose results
   * haven't been ingested yet.
   */
  pending?: boolean;
};

export function MeetCard({
  meet,
  formattedDate,
  eventGroups,
  athleteGroups,
  athleteCount,
  initiallyExpanded = false,
  isMostRecent = false,
  pending = false,
}: Props) {
  const [view, setView] = useState<View>("athlete");
  const [expanded, setExpanded] = useState<boolean>(initiallyExpanded);
  const tablistId = useId();
  const eventPanelId = `${tablistId}-event`;
  const athletePanelId = `${tablistId}-athlete`;
  const eventTabId = `${tablistId}-tab-event`;
  const athleteTabId = `${tablistId}-tab-athlete`;
  const bodyId = `${tablistId}-body`;
  const headerLabelId = `${tablistId}-label`;

  return (
    <article className="rounded-lg border border-divider bg-white overflow-hidden">
      <button
        type="button"
        onClick={pending ? undefined : () => setExpanded((v) => !v)}
        disabled={pending}
        aria-expanded={pending ? undefined : expanded}
        aria-controls={pending ? undefined : bodyId}
        aria-labelledby={headerLabelId}
        className={`group relative block w-full min-h-44 md:min-h-56 text-left overflow-hidden ${
          pending
            ? "cursor-default"
            : "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2"
        }`}
      >
        <Image
          src={meet.photo ? `/photos/${meet.photo}` : "/photos/west-seattle-stadium.webp"}
          alt={meet.photo ? `${meet.location} venue photo` : "West Seattle Stadium track at sunset"}
          fill
          sizes="(min-width: 1200px) 1100px, 100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0 transition-opacity group-hover:opacity-90"
          style={{
            background:
              "linear-gradient(to right, rgba(11,31,58,0.85) 0%, rgba(11,31,58,0.45) 50%, rgba(11,31,58,0.8) 100%)",
          }}
          aria-hidden="true"
        />
        <div className="relative min-h-44 md:min-h-56 px-6 md:px-10 py-5 md:py-6 flex flex-col gap-4 justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="flex flex-col gap-1.5 min-w-0">
              <p className="text-xs uppercase tracking-wide text-white/80 font-semibold">
                {isMostRecent
                  ? "Most recent meet"
                  : meet.type === "Invitational"
                    ? "Meet"
                    : meet.type === "Championships"
                      ? "Championship Meet"
                      : meet.type}
              </p>
              <h2
                id={headerLabelId}
                className="text-white text-2xl md:text-3xl font-bold uppercase tracking-tight leading-tight"
              >
                {formattedDate}
              </h2>
            </div>
            <div className="flex flex-col gap-0.5 sm:text-right shrink-0">
              <p className="text-sm md:text-base font-semibold text-white whitespace-nowrap">
                {meet.location}
              </p>
              {meet.weather ? (
                <p className="text-xs md:text-sm text-white/85 whitespace-nowrap">
                  {meet.weather.summary}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex items-end justify-between gap-4">
            {pending ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90">
                Results pending
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-white text-sm font-semibold uppercase tracking-wide">
                {expanded ? "Hide results" : "View results"}
                <svg
                  className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                  width="14"
                  height="14"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" />
                </svg>
              </span>
            )}
            {pending ? (
              <span aria-hidden="true" />
            ) : (
              <p className="inline-flex items-center gap-1.5 text-xs md:text-sm text-white/85 whitespace-nowrap">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM3 17a7 7 0 1114 0H3z" />
                </svg>
                <span className="tabular-nums">
                  {athleteCount} {athleteCount === 1 ? "athlete" : "athletes"}
                </span>
              </p>
            )}
          </div>
        </div>
      </button>

      <div id={bodyId} hidden={pending || !expanded}>
        <div className="p-6 md:p-8 flex flex-col gap-6">
          <div
            role="tablist"
            aria-label="Results view"
            className="inline-flex rounded-md border border-divider bg-surface p-1 self-start"
          >
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
      </div>
    </article>
  );
}
