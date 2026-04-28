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
    <div className="overflow-x-auto -mx-6 md:mx-0">
      <table className="min-w-full text-sm border-collapse">
        <thead>
          <tr className="text-[11px] uppercase tracking-wide text-muted border-b border-divider">
            <th scope="col" className="text-left font-medium py-2 pl-6 md:pl-4 pr-3 whitespace-nowrap">
              Date
            </th>
            {events.map((e) => (
              <th
                key={e.event}
                scope="col"
                className={`text-right font-semibold py-2 px-3 whitespace-nowrap ${HEADER_TINT[e.category]}`}
              >
                {e.event}
              </th>
            ))}
            <th scope="col" className="text-left font-medium py-2 pl-3 pr-6 md:pr-4 whitespace-nowrap">
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
                <td className="py-3 pl-6 md:pl-4 pr-3 text-ink whitespace-nowrap tabular-nums">
                  {dateStr}
                </td>
                {events.map((e) => (
                  <td
                    key={e.event}
                    className="py-3 px-3 text-right tabular-nums text-ink whitespace-nowrap"
                  >
                    {row.marksByEvent[e.event] ?? (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                ))}
                <td className="py-3 pl-3 pr-6 md:pr-4 text-muted whitespace-nowrap">
                  {row.meetLocation}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
