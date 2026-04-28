import Image from "next/image";
import type { Meet } from "@/lib/data";

type Props = {
  meet: Meet;
};

const WEEKDAY_FULL = new Intl.DateTimeFormat("en-US", { weekday: "long" });
const MONTH_DAY_YEAR = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export function NextMeetHero({ meet }: Props) {
  const dt = new Date(`${meet.date}T00:00:00`);
  const weekday = WEEKDAY_FULL.format(dt).toUpperCase();
  const dateLine = MONTH_DAY_YEAR.format(dt).toUpperCase();

  return (
    <article className="relative overflow-hidden rounded-lg bg-magnolia-navy text-white min-h-[280px] md:min-h-[320px]">
      <Image
        src="/photos/nextMeetHeroBkg.png"
        alt=""
        fill
        sizes="(min-width: 768px) 360px, 100vw"
        className="object-cover"
        priority
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-magnolia-navy/85"
      />

      <div className="relative h-full p-6 md:p-7 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85">
            Next Meet
          </p>
          <CalendarIcon className="text-white/85 shrink-0" />
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-base md:text-lg font-semibold tracking-wide">
            {weekday}
          </p>
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
            {dateLine}
          </h3>
          <p className="mt-1 text-xl md:text-2xl font-bold tabular-nums tracking-tight text-accent-gold">
            {meet.startTime}
          </p>
        </div>

        <ul className="mt-auto flex flex-col gap-2 text-sm md:text-base">
          <li className="flex items-center gap-2.5">
            <PinIcon className="text-white/80 shrink-0" />
            <span>{meet.location}</span>
          </li>
          {meet.weather ? (
            <li className="flex items-center gap-2.5">
              <ThermometerIcon className="text-white/80 shrink-0" />
              <span>{meet.weather.summary}</span>
            </li>
          ) : null}
        </ul>
      </div>
    </article>
  );
}

function CalendarIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="8" y1="3" x2="8" y2="6" />
      <line x1="16" y1="3" x2="16" y2="6" />
    </svg>
  );
}

function PinIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

function ThermometerIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* Bulb at the bottom, stem going up, with a small marker for fill level. */}
      <path d="M14 14.5V5a2 2 0 1 0-4 0v9.5a3.5 3.5 0 1 0 4 0z" />
      <line x1="12" y1="9" x2="12" y2="14" />
    </svg>
  );
}
