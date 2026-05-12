import Link from "next/link";
import { EventPill } from "@/components/EventPill";
import { PlaceChip } from "@/components/PlaceChip";
import { formatMark } from "@/lib/marks";
import type { AthleteGroup } from "@/components/ResultsTypes";

type Props = { groups: AthleteGroup[] };

export function AthleteResults({ groups }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => {
        const showPlace = group.rows.some((r) => r.place !== undefined);
        return (
          <section
            key={group.athleteId}
            className="border border-divider rounded-md overflow-hidden"
          >
            <header className="bg-surface px-5 py-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight">
                <Link
                  href={`/athletes/${group.athleteId}`}
                  className="text-ink hover:text-magnolia-navy hover:underline underline-offset-2 decoration-1"
                >
                  {group.display}
                </Link>
              </h3>
              <Link
                href={`/athletes/${group.athleteId}`}
                className="inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wide text-magnolia-navy hover:underline underline-offset-2 decoration-1"
              >
                View Season Stats
                <span aria-hidden="true">→</span>
              </Link>
            </header>

            <div className="overflow-x-auto">
              <table className="w-full text-left table-fixed">
                <thead>
                  <tr className="text-[12px] uppercase tracking-wide text-muted">
                    <th
                      scope="col"
                      className={`py-2 pl-5 pr-3 font-medium ${showPlace ? "w-[40%]" : ""}`}
                    >
                      Event
                    </th>
                    {showPlace ? (
                      <th
                        scope="col"
                        className="py-2 px-3 text-center font-medium w-[20%]"
                      >
                        Place
                      </th>
                    ) : null}
                    <th
                      scope="col"
                      className={`py-2 pl-3 pr-5 text-right font-medium ${showPlace ? "w-[40%]" : "w-32"}`}
                    >
                      Mark
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider">
                  {group.rows.map((row, idx) => (
                    <tr key={`${row.event}-${row.mark}-${idx}`}>
                      <th scope="row" className="py-3 pl-5 pr-3 align-middle">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-ink">
                            {row.event}
                          </span>
                          <EventPill category={row.category} />
                        </div>
                      </th>
                      {showPlace ? (
                        <td className="py-3 px-3 text-center align-middle">
                          {row.place ? <PlaceChip place={row.place} /> : null}
                        </td>
                      ) : null}
                      <td className="py-3 pl-3 pr-5 text-right align-middle">
                        <span className="text-[22px] font-medium tabular-nums text-ink">
                          {formatMark(row.mark, row.event)}
                        </span>
                        {row.note ? (
                          <span className="ml-1 text-sm text-muted">
                            ({row.note})
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
