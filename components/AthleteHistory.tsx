import type { EventCategory } from "@/lib/events";
import type { HistoryRow } from "@/lib/athletes";

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
    <section className="border border-divider rounded-md overflow-hidden">
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
              {events.map((e) => (
                <th
                  key={e.event}
                  scope="col"
                  className={`py-2 px-3 font-semibold whitespace-nowrap text-right ${HEADER_TINT[e.category]}`}
                >
                  {e.event}
                </th>
              ))}
              <th
                scope="col"
                className="py-2 pl-3 pr-5 font-medium whitespace-nowrap"
              >
                Meet
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-divider">
            {history.map((row) => {
              const dt = new Date(`${row.meetDate}T00:00:00`);
              const dateStr = FORMAT_DATE.format(dt);
              return (
                <tr key={row.meetId}>
                  <td className="py-3 pl-5 pr-3 align-middle text-ink whitespace-nowrap tabular-nums font-medium">
                    {dateStr}
                  </td>
                  {events.map((e) => {
                    const value = row.marksByEvent[e.event];
                    return (
                      <td
                        key={e.event}
                        className="py-3 px-3 align-middle text-right tabular-nums whitespace-nowrap"
                      >
                        {value ? (
                          <span className="text-base font-medium text-ink">
                            {value}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="py-3 pl-3 pr-5 align-middle text-muted whitespace-nowrap">
                    {row.meetLocation}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
