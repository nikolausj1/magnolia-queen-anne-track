import type { Meet } from "@/lib/data";

type Props = {
  meets: Meet[];
};

const WEEKDAY_SHORT = new Intl.DateTimeFormat("en-US", { weekday: "short" });
const MONTH_DAY_YEAR = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export function UpcomingList({ meets }: Props) {
  if (meets.length === 0) {
    return (
      <div className="rounded-lg border border-divider bg-white p-6 text-sm text-muted">
        No more meets scheduled.
      </div>
    );
  }

  return (
    <ul className="rounded-lg border-x border-t border-divider bg-white overflow-hidden">
      {meets.map((meet) => {
        const dt = new Date(`${meet.date}T00:00:00`);
        const weekday = WEEKDAY_SHORT.format(dt).toUpperCase();
        const dateLine = MONTH_DAY_YEAR.format(dt).toUpperCase();
        const weatherText = meet.weather ? meet.weather.summary : "—";

        return (
          <li
            key={meet.id}
            className="px-5 py-3 sm:py-4 border-b border-divider"
          >
            {/* Mobile compact: 2 lines (date+time, location+weather). */}
            <div className="sm:hidden flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {weekday}
                </span>
                <span className="text-sm font-bold uppercase tracking-tight text-ink">
                  {dateLine}
                </span>
                <span className="ml-auto text-sm font-bold tabular-nums whitespace-nowrap text-magnolia-navy">
                  {meet.startTime}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3 text-xs">
                <span className="text-ink truncate">{meet.location}</span>
                <span className="text-muted whitespace-nowrap">
                  {weatherText}
                </span>
              </div>
            </div>

            {/* Desktop grid: separated columns aligned to the date baseline. */}
            <div className="hidden sm:grid sm:grid-cols-[140px_100px_1fr_auto] sm:gap-x-5 items-end">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted leading-none mb-1">
                  {weekday}
                </span>
                <span className="text-sm md:text-base font-bold uppercase tracking-tight text-ink leading-none">
                  {dateLine}
                </span>
              </div>
              <span className="text-base font-bold tabular-nums leading-none text-magnolia-navy">
                {meet.startTime}
              </span>
              <span className="text-sm text-ink leading-none">
                {meet.location}
              </span>
              <span className="text-sm text-muted whitespace-nowrap text-right leading-none">
                {weatherText}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
