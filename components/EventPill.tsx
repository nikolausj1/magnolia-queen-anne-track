import type { EventCategory } from "@/lib/events";

type EventPillProps = {
  category: EventCategory;
};

const STYLES = {
  running: {
    className: "bg-pill-runBg text-pill-runText",
    label: "Running",
  },
  jumping: {
    className: "bg-pill-jumpBg text-pill-jumpText",
    label: "Jumping",
  },
  throwing: {
    className: "bg-pill-throwBg text-pill-throwText",
    label: "Throwing",
  },
} as const;

export function EventPill({ category }: EventPillProps) {
  const { className, label } = STYLES[category];
  return (
    <span
      className={`${className} inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium`}
    >
      {label}
    </span>
  );
}
