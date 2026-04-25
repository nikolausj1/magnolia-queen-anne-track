type BadgeProps = {
  team: "magnolia" | "queen-anne";
};

const STYLES = {
  magnolia: {
    className: "bg-badge-magnoliaBg text-badge-magnoliaText",
    label: "Magnolia",
  },
  "queen-anne": {
    className: "bg-badge-queenAnneBg text-badge-queenAnneText",
    label: "Queen Anne",
  },
} as const;

export function Badge({ team }: BadgeProps) {
  const { className, label } = STYLES[team];
  return (
    <span
      className={`${className} inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium`}
    >
      {label}
    </span>
  );
}
