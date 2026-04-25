import { Badge } from "@/components/Badge";
import { EventPill } from "@/components/EventPill";
import type { EventGroup } from "@/components/ResultsTypes";

type Props = { groups: EventGroup[] };

export function EventResults({ groups }: Props) {
  return (
    <div className="flex flex-col gap-10">
      {groups.map((group) => (
        <section key={group.event} className="flex flex-col gap-3">
          <header className="flex items-baseline justify-between gap-3">
            <div className="flex items-center gap-3">
              <h3 className="text-[18px] font-medium text-ink">
                {group.event}
              </h3>
              <EventPill category={group.category} />
            </div>
            <span className="text-sm text-muted">
              {group.rows.length} {group.rows.length === 1 ? "result" : "results"}
            </span>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[12px] uppercase tracking-wide text-muted">
                  <th scope="col" className="py-2 pr-3 font-medium">Athlete</th>
                  <th scope="col" className="py-2 px-3 text-center font-medium">Place</th>
                  <th scope="col" className="py-2 pl-3 text-right font-medium">Mark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {group.rows.map((row) => (
                  <tr key={`${row.athleteId}-${row.mark}-${row.place ?? ""}`}>
                    <th scope="row" className="py-3 pr-3 align-top">
                      <div className="font-semibold text-ink">{row.display}</div>
                      {(row.division || row.team) && (
                        <div className="mt-1 flex items-center gap-2 text-[12px] text-muted">
                          {row.division ? <span>{row.division}</span> : null}
                          {row.division && row.team ? <span aria-hidden>·</span> : null}
                          {row.team ? <Badge team={row.team} /> : null}
                        </div>
                      )}
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
