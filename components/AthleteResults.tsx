import { Badge } from "@/components/Badge";
import { EventPill } from "@/components/EventPill";
import type { AthleteGroup } from "@/components/ResultsTypes";

type Props = { groups: AthleteGroup[] };

export function AthleteResults({ groups }: Props) {
  return (
    <div className="flex flex-col gap-10">
      {groups.map((group) => (
        <section key={group.athleteId} className="flex flex-col gap-3">
          <header className="flex items-baseline justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-[17px] font-medium text-ink">
                {group.display}
              </h3>
              {group.division ? (
                <span className="text-sm text-muted">{group.division}</span>
              ) : null}
              {group.team ? <Badge team={group.team} /> : null}
            </div>
            <span className="text-sm text-muted">
              {group.rows.length} {group.rows.length === 1 ? "event" : "events"}
            </span>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[12px] uppercase tracking-wide text-muted">
                  <th scope="col" className="py-2 pr-3 font-medium">Event</th>
                  <th scope="col" className="py-2 px-3 text-center font-medium">Place</th>
                  <th scope="col" className="py-2 pl-3 text-right font-medium">Mark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {group.rows.map((row) => (
                  <tr key={`${row.event}-${row.mark}-${row.place ?? ""}`}>
                    <th scope="row" className="py-3 pr-3 align-top">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-ink">{row.event}</span>
                        <EventPill category={row.category} />
                      </div>
                    </th>
                    <td className="py-3 px-3 text-center align-top text-ink tabular-nums">
                      {row.place ?? "—"}
                    </td>
                    <td className="py-3 pl-3 text-right align-top">
                      <span className="text-[22px] font-medium tabular-nums text-ink">
                        {row.mark}
                      </span>
                      {row.note ? (
                        <span className="ml-1 text-sm text-muted">({row.note})</span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
