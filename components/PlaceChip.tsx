// Youth-meet ribbon palette: 1st blue, 2nd red, 3rd white, 4th pink, 5th yellow.
// 3rd uses a border because white-on-white needs the outline to read.

const RIBBON_BY_PLACE: Record<number, string> = {
  1: "bg-ribbon-1Bg text-ribbon-1Text",
  2: "bg-ribbon-2Bg text-ribbon-2Text",
  3: "bg-ribbon-3Bg text-ribbon-3Text border border-ribbon-3Border",
  4: "bg-ribbon-4Bg text-ribbon-4Text",
  5: "bg-ribbon-5Bg text-ribbon-5Text",
};

const PLACE_LABEL: Record<number, string> = {
  1: "1st",
  2: "2nd",
  3: "3rd",
  4: "4th",
  5: "5th",
};

function placeLabel(place: number): string {
  return PLACE_LABEL[place] ?? `${place}th`;
}

function placeClass(place: number): string {
  return RIBBON_BY_PLACE[place] ?? "bg-surface text-ink border border-divider";
}

type Size = "sm" | "xs";

const SIZE_CLASS: Record<Size, string> = {
  sm: "min-w-[36px] px-2.5 py-0.5 text-xs",
  xs: "min-w-[28px] px-1.5 py-0.5 text-[10px]",
};

export function PlaceChip({
  place,
  size = "sm",
}: {
  place: number;
  size?: Size;
}) {
  return (
    <span
      className={`${placeClass(place)} ${SIZE_CLASS[size]} inline-flex items-center justify-center rounded-full font-bold tabular-nums uppercase tracking-wide`}
      aria-label={`${placeLabel(place)} place`}
    >
      {placeLabel(place)}
    </span>
  );
}
