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

// One icon per category. PNG files in /public/icons are black-on-transparent
// so we use them as a CSS mask and let `currentColor` (the category text
// color) tint the visible pixels.
const CATEGORY_ICON: Record<EventCategory, string> = {
  running: "/icons/event-running.png",
  jumping: "/icons/event-long-jump.png",
  throwing: "/icons/event-javelin.png",
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
          className={`${CATEGORY_BG[pb.category]} rounded-lg px-4 py-5 md:py-6 flex flex-col items-center justify-between gap-3 text-center min-h-[170px] md:min-h-[180px]`}
        >
          <span className="text-sm md:text-base font-bold uppercase tracking-wide">
            {pb.event}
          </span>
          <CategoryIcon category={pb.category} />
          <span className="text-xl md:text-2xl font-bold tabular-nums leading-none">
            {pb.mark}
          </span>
        </li>
      ))}
    </ul>
  );
}

function CategoryIcon({ category }: { category: EventCategory }) {
  const url = CATEGORY_ICON[category];
  return (
    <span
      aria-hidden="true"
      className="block h-12 w-12 md:h-14 md:w-14 bg-current"
      style={{
        WebkitMaskImage: `url('${url}')`,
        maskImage: `url('${url}')`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}
