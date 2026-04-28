import Link from "next/link";
import type { EventCategory } from "@/lib/events";
import type { EventGroup } from "@/components/ResultsTypes";

type Props = { groups: EventGroup[] };

const BANNER_BY_CATEGORY: Record<
  EventCategory,
  { bg: string; text: string; label: string }
> = {
  running: {
    bg: "bg-pill-runBg",
    text: "text-pill-runText",
    label: "Running",
  },
  jumping: {
    bg: "bg-pill-jumpBg",
    text: "text-pill-jumpText",
    label: "Jumping",
  },
  throwing: {
    bg: "bg-pill-throwBg",
    text: "text-pill-throwText",
    label: "Throwing",
  },
};

export function EventResults({ groups }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => {
        const banner = BANNER_BY_CATEGORY[group.category];
        return (
          <section
            key={group.event}
            className="border border-divider rounded-md overflow-hidden"
          >
            <header
              className={`${banner.bg} px-5 py-3 flex items-baseline justify-between gap-3`}
            >
              <div className="flex items-baseline gap-3">
                <h3
                  className={`${banner.text} text-xl md:text-2xl font-bold uppercase tracking-tight`}
                >
                  {group.event}
                </h3>
                <span
                  className={`${banner.text} text-xs font-semibold uppercase tracking-wide opacity-90`}
                >
                  {banner.label}
                </span>
              </div>
              <span className={`${banner.text} text-sm opacity-80`}>
                {group.rows.length}{" "}
                {group.rows.length === 1 ? "result" : "results"}
              </span>
            </header>

            <div className="overflow-x-auto">
              <table className="w-full text-left table-fixed">
                <thead>
                  <tr className="text-[12px] uppercase tracking-wide text-muted">
                    <th scope="col" className="py-2 pl-5 pr-3 font-medium">
                      Athlete
                    </th>
                    <th
                      scope="col"
                      className="py-2 pl-3 pr-5 text-right font-medium w-32"
                    >
                      Mark
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider">
                  {group.rows.map((row, idx) => (
                    <tr key={`${row.athleteId}-${row.mark}-${idx}`}>
                      <th scope="row" className="py-3 pl-5 pr-3 align-top">
                        <Link
                          href={`/athletes/${row.athleteId}`}
                          className="font-semibold text-ink hover:text-magnolia-navy hover:underline underline-offset-2 decoration-1"
                        >
                          {row.display}
                        </Link>
                      </th>
                      <td className="py-3 pl-3 pr-5 text-right align-top">
                        <span className="text-[22px] font-medium tabular-nums text-ink">
                          {row.mark}
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
