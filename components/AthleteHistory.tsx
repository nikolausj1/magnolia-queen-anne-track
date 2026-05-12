import type { EventCategory } from "@/lib/events";
import type { HistoryRow } from "@/lib/athletes";
import { PlaceChip } from "@/components/PlaceChip";
import { formatMark } from "@/lib/marks";

type Props = {
  events: { event: string; category: EventCategory }[];
  history: HistoryRow[];
};

const HEADER_TINT: Record<EventCategory, string> = {
  running: "text-pill-runText",
  jumping: "text-pill-jumpText",
  throwing: "text-pill-throwText",
};

const FORMAT_DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function AthleteHistory({ events, history }: Props) {
  if (history.length === 0) {
    return null;
  }
  return (
    <section className="-mx-6 sm:mx-0 border-y border-divider sm:border-x sm:rounded-md sm:overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[12px] uppercase tracking-wide text-muted bg-surface">
              <th
                scope="col"
                className="py-2 pl-5 pr-3 font-medium whitespace-nowrap"
              >
                Date
              </th>
              {events.map((e, idx) => (
                <th
                  key={e.event}
                  scope="col"
                  className={`py-2 px-3 font-semibold whitespace-nowrap text-right ${HEADER_TINT[e.category]} ${idx === events.length - 1 ? "pr-5" : ""}`}
                >
                  {e.event}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-divider">
            {history.map((row) => {
              const dt = new Date(`${row.meetDate}T00:00:00`);
              const dateStr = FORMAT_DATE.format(dt);
              return (
                <tr key={row.meetId}>
                  <td className="py-4 pl-5 pr-3 align-middle text-ink whitespace-nowrap tabular-nums text-base font-semibold">
                    {dateStr}
                  </td>
                  {events.map((e, idx) => {
                    const value = row.marksByEvent[e.event];
                    return (
                      <td
                        key={e.event}
                        className={`py-4 px-3 align-middle text-right tabular-nums whitespace-nowrap ${idx === events.length - 1 ? "pr-5" : ""}`}
                      >
                        {value ? (
                          <span className="inline-flex items-center gap-2">
                            {value.place ? (
                              <PlaceChip place={value.place} size="xs" />
                            ) : null}
                            <span className="text-[22px] font-medium text-ink">
                              {formatMark(value.mark, e.event)}
                              {value.note ? (
                                <span className="ml-1 text-sm text-muted">
                                  ({value.note})
                                </span>
                              ) : null}
                            </span>
                          </span>
                        ) : (
                          <span className="text-muted text-lg">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
