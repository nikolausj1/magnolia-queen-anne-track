import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TeamCard } from "@/components/TeamCard";
import { getMeets } from "@/lib/data";

export const metadata: Metadata = {
  title: {
    absolute:
      "Magnolia CC Youth Track & Field · Queen Anne Quicksters · Seattle",
  },
  description:
    "Two Seattle youth track and field teams, one program. Ages 5–17, practicing at Queen Anne Bowl, competing weekend Saturdays at West Seattle Stadium.",
  alternates: { canonical: "/" },
};

// PRD says today is 2026-04-24 for "latest meet" logic. Anchored here so
// the build is deterministic regardless of the build host's clock.
const TODAY = "2026-04-24";

// TODO(prd-open-items): registration URLs — see PRD.md Open Questions.
const MAGNOLIA_REGISTER_URL = "#";
const QUEEN_ANNE_REGISTER_URL = "#";

type Coach = { name: string; bio: string; photoSrc?: string };

// TODO: wire to data/coaches.json when bios are ready (PRD Open Items).
const COACHES: Coach[] = [];

export default function HomePage() {
  const meets = getMeets();
  const latestPastMeet = meets.find((m) => m.date <= TODAY);

  return (
    <div className="flex flex-col">
      <Hero />
      <SharedProgram />
      <WhatToExpect />
      <TeamCards />
      {COACHES.length > 0 ? <Coaches coaches={COACHES} /> : null}
      {latestPastMeet ? <LatestResultsTeaser meetDate={latestPastMeet.date} /> : null}
      <SecondaryCTA />
    </div>
  );
}

function Hero() {
  return (
    <section className="bg-magnolia-navy text-white">
      <div className="mx-auto max-w-[1100px] px-6 py-12 md:py-20 grid gap-10 md:grid-cols-2 md:items-center">
        <div className="flex flex-col gap-5">
          <h1 className="text-white">Two Teams, One Community</h1>
          <p className="text-base md:text-lg text-white/85 max-w-md">
            Youth track and field for ages 5–17 in Magnolia and Queen Anne, Seattle.
            Two community centers register the kids; one program runs the practice.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <a
              href={MAGNOLIA_REGISTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Register with Magnolia CC Youth Track & Field — opens external registration"
              className="inline-flex items-center justify-center rounded-md bg-white text-magnolia-navy px-5 py-3 text-sm font-medium hover:bg-white/90 transition-colors"
            >
              Register with Magnolia
            </a>
            <a
              href={QUEEN_ANNE_REGISTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Register with Queen Anne Quicksters — opens external registration"
              className="inline-flex items-center justify-center rounded-md bg-queenAnne-red text-white px-5 py-3 text-sm font-medium hover:bg-queenAnne-red/90 transition-colors"
            >
              Register with Queen Anne Quicksters
            </a>
          </div>
        </div>

        <div className="relative aspect-[16/9] overflow-hidden rounded-lg ring-1 ring-white/10">
          <Image
            src="/photos/home-hero-action.png"
            alt="Magnolia and Queen Anne athletes at a meet"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}

function SharedProgram() {
  return (
    <section className="mx-auto max-w-[1100px] px-6 py-12 md:py-16">
      <p className="mx-auto max-w-2xl text-center text-base md:text-lg text-ink">
        Magnolia and Queen Anne practice together, share coaches, and compete as one team.
        Each side registers through its own community center.
      </p>
    </section>
  );
}

function WhatToExpect() {
  const items = [
    {
      title: "Practice",
      body: "Mondays and Wednesdays, 6:00–7:30 pm at Queen Anne Bowl Playfield.",
    },
    {
      title: "Meets",
      body: "Saturday meets at West Seattle Stadium across the spring season.",
    },
    {
      title: "Open to all",
      body: "Ages 5–17. All skill levels welcome — no tryouts, no cuts.",
    },
  ];

  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-[1100px] px-6 py-12 md:py-16">
        <h2 className="mb-8">What to expect</h2>
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {items.map((item) => (
            <div key={item.title} className="flex flex-col gap-2">
              <h3>{item.title}</h3>
              <p className="text-sm text-ink/80 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamCards() {
  return (
    <section
      aria-labelledby="teams-heading"
      className="mx-auto max-w-[1100px] px-6 py-12 md:py-16"
    >
      <h2 id="teams-heading" className="sr-only">
        The two teams
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        <TeamCard
          team="magnolia"
          teamLabel="Magnolia"
          logoSrc="/logos/magnolia-cc.png"
          logoAlt="Magnolia CC Youth Track & Field winged-shoe logo"
          logoWidth={2138}
          logoHeight={1682}
          description="Track and field for kids ages 5–17 in Magnolia. We practice with Queen Anne Quicksters under the same coaches and compete as one team. Registration runs through Magnolia Community Center."
          registerUrl={MAGNOLIA_REGISTER_URL}
          registerAriaLabel="Register with Magnolia CC Youth Track & Field — opens external registration"
          communityCenterName="Magnolia Community Center"
        />
        <TeamCard
          team="queen-anne"
          teamLabel="Queen Anne Quicksters"
          logoSrc="/logos/queen-anne-quicksters.png"
          logoAlt="Queen Anne Quicksters winged-shoe logo"
          logoWidth={1254}
          logoHeight={1254}
          description="Track and field for kids ages 5–17 in Queen Anne. We practice with Magnolia under the same coaches and compete as one team. Registration runs through Queen Anne Community Center."
          registerUrl={QUEEN_ANNE_REGISTER_URL}
          registerAriaLabel="Register with Queen Anne Quicksters — opens external registration"
          communityCenterName="Queen Anne Community Center"
        />
      </div>
    </section>
  );
}

function Coaches({ coaches }: { coaches: Coach[] }) {
  return (
    <section className="mx-auto max-w-[1100px] px-6 py-12 md:py-16">
      <h2 className="mb-8">Coaches</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {coaches.map((c) => (
          <div key={c.name} className="flex flex-col gap-2">
            {c.photoSrc ? (
              <Image
                src={c.photoSrc}
                alt={`Photo of coach ${c.name}`}
                width={200}
                height={200}
                className="rounded-md"
              />
            ) : null}
            <h3>{c.name}</h3>
            <p className="text-sm text-ink/80 leading-relaxed">{c.bio}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function LatestResultsTeaser({ meetDate }: { meetDate: string }) {
  const formatted = new Date(`${meetDate}T00:00:00`).toLocaleDateString(
    "en-US",
    { weekday: "long", month: "long", day: "numeric", year: "numeric" },
  );

  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-[1100px] px-6 py-10 md:py-12">
        <p className="text-base text-ink">
          Most recent meet: <span className="font-medium">{formatted}</span>.{" "}
          <Link
            href="/results"
            className="text-magnolia-navy underline underline-offset-4 hover:opacity-80"
          >
            View all results →
          </Link>
        </p>
      </div>
    </section>
  );
}

function SecondaryCTA() {
  return (
    <section className="mx-auto max-w-[1100px] px-6 py-12 md:py-16">
      <p className="text-base text-ink">
        Have questions?{" "}
        <Link
          href="/faq"
          className="text-magnolia-navy underline underline-offset-4 hover:opacity-80"
        >
          Read the FAQ →
        </Link>
      </p>
    </section>
  );
}
