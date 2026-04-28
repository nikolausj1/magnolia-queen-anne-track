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
    <div className="mx-auto max-w-[1100px] px-6 py-12 md:py-16">
      <div className="mb-6">
        <BackToMeetsLink />
      </div>

      <header className="flex flex-col sm:flex-row sm:items-center gap-5 mb-10">
        <AthleteAvatar
          firstName={detail.athlete.firstName}
          lastInitial={detail.athlete.lastInitial}
          size="lg"
        />
        <div className="flex flex-col gap-3 min-w-0">
          <h1 className="text-magnolia-navy">{detail.displayName}</h1>
          <ul className="flex flex-wrap gap-2 text-xs uppercase tracking-wide">
            <Chip>Spring 2026</Chip>
            <Chip>{meetCount} {meetCount === 1 ? "Meet" : "Meets"}</Chip>
            <Chip>
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

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <li className="inline-flex items-center rounded-full border border-divider bg-surface px-3 py-1 text-[11px] font-semibold text-ink">
      {children}
    </li>
  );
}
