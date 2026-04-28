import type { PersonalBest } from "@/lib/athletes";
import type { EventCategory } from "@/lib/events";

type Props = {
  bests: PersonalBest[];
};

const CATEGORY_BG: Record<EventCategory, string> = {
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
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
      {bests.map((pb) => (
        <li
          key={pb.event}
          className={`${CATEGORY_BG[pb.category]} rounded-lg px-4 py-4 md:py-5 flex flex-col items-center justify-center gap-2 text-center min-h-[110px] md:min-h-[120px]`}
        >
          <span className="text-2xl md:text-3xl font-bold tabular-nums leading-none">
            {pb.mark}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide opacity-90">
            <CategoryIcon category={pb.category} />
            {pb.event}
          </span>
        </li>
      ))}
    </ul>
  );
}

function CategoryIcon({ category }: { category: EventCategory }) {
  if (category === "running") return <RunIcon />;
  if (category === "jumping") return <JumpIcon />;
  return <ThrowIcon />;
}

function RunIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="14" cy="4.5" r="1.5" />
      <path d="M9.5 21l2.5-5 -3-3 1-4 -3.5 2.5 -1 3" />
      <path d="M14 10l2.5 3 4 1" />
      <path d="M9 9l3 -2 3 1" />
    </svg>
  );
}

function JumpIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="13" cy="4" r="1.5" />
      <path d="M3 20l5 -3 4 -7 5 4 4 -2" />
      <path d="M11 11l3 -3" />
    </svg>
  );
}

function ThrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="6" cy="5" r="1.5" />
      <line x1="3" y1="20" x2="21" y2="4" />
      <path d="M7.5 7l2 4" />
    </svg>
  );
}
