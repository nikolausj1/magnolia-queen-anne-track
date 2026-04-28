import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AthleteAvatar } from "@/components/AthleteAvatar";
import { AthleteHistory } from "@/components/AthleteHistory";
import { AthletePersonalBests } from "@/components/AthletePersonalBests";
import { BackToMeetsLink } from "@/components/BackToMeetsLink";
import { getAllAthleteIds, getAthleteDetail } from "@/lib/athletes";

type Props = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getAllAthleteIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const detail = getAthleteDetail(id);
  if (!detail) return { title: "Athlete" };
  return {
    title: detail.displayName,
    description: `Spring 2026 season results for ${detail.displayName} — meets, marks, and personal bests.`,
  };
}

export default async function AthletePage({ params }: Props) {
  const { id } = await params;
  const detail = getAthleteDetail(id);
  if (!detail) notFound();

  const meetCount = detail.meetsAttended.length;

  return (
    <div className="mx-auto max-w-[1100px] px-6 pt-5 md:pt-6 pb-12 md:pb-16">
      <div className="mb-10 md:mb-12">
        <BackToMeetsLink />
      </div>

      <header className="flex flex-row items-center gap-4 sm:gap-5 mb-10">
        <AthleteAvatar
          firstName={detail.athlete.firstName}
          lastInitial={detail.athlete.lastInitial}
          size="lg"
        />
        <div className="flex flex-col gap-3 min-w-0">
          <h1 className="text-magnolia-navy">{detail.displayName}</h1>
          <ul className="flex flex-wrap gap-2 uppercase tracking-wide">
            <Chip icon={<CalendarIcon />}>Spring 2026</Chip>
            <Chip icon={<ShoeIcon />}>
              {meetCount} {meetCount === 1 ? "Meet" : "Meets"}
            </Chip>
            <Chip icon={<ClipboardIcon />}>
              {detail.eventCount}{" "}
              {detail.eventCount === 1 ? "Event" : "Events"}
            </Chip>
          </ul>
        </div>
      </header>

      <section className="mb-10">
        <h2 className="text-base font-semibold uppercase tracking-wide text-magnolia-navy mb-3">
          Personal Bests
        </h2>
        <AthletePersonalBests bests={detail.personalBests} />
      </section>

      <section>
        <h2 className="text-base font-semibold uppercase tracking-wide text-magnolia-navy mb-3">
          Season Event History
        </h2>
        <AthleteHistory
          events={detail.historyEvents}
          history={detail.history}
        />
      </section>
    </div>
  );
}

function Chip({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <li className="inline-flex items-center gap-2 rounded-full border border-divider bg-surface px-3.5 py-1.5 text-xs md:text-sm font-semibold text-ink">
      <span className="text-magnolia-navy" aria-hidden="true">
        {icon}
      </span>
      {children}
    </li>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="8" y1="3" x2="8" y2="6" />
      <line x1="16" y1="3" x2="16" y2="6" />
    </svg>
  );
}

function ShoeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Sneaker outline: heel, sole, toebox + a couple of laces */}
      <path d="M2 16h18a2 2 0 0 0 2-2v-1a2 2 0 0 0-1.4-1.9l-5.1-1.6 -3-3 -3.5 1 -1 3.5 -4 1z" />
      <line x1="9" y1="11" x2="11" y2="9.5" />
      <line x1="11.5" y1="13" x2="13" y2="11" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <rect x="9" y="2.5" width="6" height="3.5" rx="1" />
      <line x1="8.5" y1="11" x2="15.5" y2="11" />
      <line x1="8.5" y1="14.5" x2="15.5" y2="14.5" />
      <line x1="8.5" y1="18" x2="13" y2="18" />
    </svg>
  );
}
