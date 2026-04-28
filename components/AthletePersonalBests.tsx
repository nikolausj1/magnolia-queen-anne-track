import type { PersonalBest } from "@/lib/athletes";

type Props = {
  bests: PersonalBest[];
};

const CATEGORY_BG: Record<PersonalBest["category"], string> = {
  running: "bg-pill-runBg text-pill-runText",
  jumping: "bg-pill-jumpBg text-pill-jumpText",
  throwing: "bg-pill-throwBg text-pill-throwText",
};

export function AthletePersonalBests({ bests }: Props) {
  if (bests.length === 0) {
    return (
      <p className="text-sm text-muted">No marks recorded yet this season.</p>
    );
  }
  return (
    <ul className="flex flex-wrap gap-2 sm:gap-3">
      {bests.map((pb) => (
        <li
          key={pb.event}
          className={`${CATEGORY_BG[pb.category]} rounded-md px-3 py-2 flex flex-col gap-0.5 min-w-[88px]`}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
            {pb.event}
          </span>
          <span className="text-base md:text-lg font-bold tabular-nums leading-none">
            {pb.mark}
          </span>
        </li>
      ))}
    </ul>
  );
}
