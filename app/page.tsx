import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TeamCard } from "@/components/TeamCard";
import { getMeets, getResultsByMeet } from "@/lib/data";

export const metadata: Metadata = {
  title: {
    absolute: "Magnolia and Queen Anne Track and Field",
  },
  description:
    "Two Seattle youth track and field teams, one program. Ages 5–17, practicing at Queen Anne Bowl, competing weekend Saturdays at West Seattle Stadium.",
  alternates: { canonical: "/" },
};

const TODAY = "2026-04-25";

// TODO(prd-open-items): registration URLs — see PRD.md Open Questions.
const MAGNOLIA_REGISTER_URL =
  "https://anc.apm.activecommunities.com/seattle/activity/search?onlineSiteId=0&site_ids=317&activity_keyword=track&viewMode=list";
const QUEEN_ANNE_REGISTER_URL =
  "https://anc.apm.activecommunities.com/seattle/activity/search?onlineSiteId=0&site_ids=30&activity_keyword=track&viewMode=list";

type Coach = { name: string; bio: string; photoSrc?: string };

// TODO: wire to data/coaches.json when bios are ready (PRD Open Items).
const COACHES: Coach[] = [];

export default function HomePage() {
  const meets = getMeets();
  // Only point at meets that actually have results published — otherwise the
  // teaser links to a date that produces nothing on /results.
  const latestPastMeet = meets.find(
    (m) => m.date <= TODAY && getResultsByMeet(m.id).length > 0,
  );

  return (
    <>
      <HeroAndTeamCards />
      <SharedStrongerTogether />
      {COACHES.length > 0 ? <Coaches coaches={COACHES} /> : null}
      {latestPastMeet ? (
        <LatestResultsTeaser meetDate={latestPastMeet.date} />
      ) : null}
      <ReadyToJoin />
      <SecondaryCTA />
    </>
  );
}

function HeroAndTeamCards() {
  return (
    <section className="relative bg-white overflow-hidden">
      <div className="grid md:grid-cols-[1fr_1.4fr] gap-x-0 items-stretch relative">
        <div className="flex flex-col gap-6 px-6 md:pl-[max(1.5rem,calc((100vw-1200px)/2+1.5rem))] pt-12 md:pt-20 lg:pt-28 md:pr-4 pb-8 md:pb-24 lg:pb-32 relative z-10">
          <h1 className="text-magnolia-navy text-5xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight leading-[1.0] md:whitespace-nowrap">
            Two Teams.
            <br />
            One Community.
          </h1>
          <span
            className="block h-1 w-24 bg-accent-gold"
            aria-hidden="true"
          />
          <p className="text-base md:text-lg text-ink leading-relaxed max-w-md">
            Magnolia Community Center and Queen Anne Quicksters track and
            field programs bring kids together to build speed, strength,
            confidence, and friendships that last a lifetime.
          </p>
        </div>

        <div className="relative h-72 md:h-auto md:min-h-[28rem] lg:min-h-[34rem]">
          <Image
            src="/photos/home-hero-action.png"
            alt="Magnolia and Queen Anne athletes at a meet, in Magnolia navy and Queen Anne red jerseys"
            fill
            sizes="(min-width: 768px) 60vw, 100vw"
            className="object-cover"
            style={{ objectPosition: "center 30%" }}
            priority
          />
          {/* Left edge fade into the text column */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 md:w-1/4 bg-gradient-to-r from-white via-white/70 to-transparent"
          />
          {/* Bottom edge fade so the cards float over white */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-white to-transparent"
          />
        </div>
      </div>

      <div
        aria-labelledby="teams-heading"
        className="relative z-10 mt-8 md:-mt-12 lg:-mt-12"
      >
        <div className="mx-auto max-w-[1200px] px-6 pb-12 md:pb-20">
          <h2 id="teams-heading" className="sr-only">
            The two teams
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <TeamCard
              team="magnolia"
              teamLabel="Magnolia CC"
              teamSubLabel="Youth Track & Field"
              logoSrc="/logos/magnolia-cc-no-bg.png"
              logoAlt="Magnolia CC Youth Track & Field winged-shoe logo"
              logoWidth={2138}
              logoHeight={1682}
              description="Representing the Magnolia community with heart and hustle. We practice with Queen Anne Quicksters under the same coaches and compete together."
              registerUrl={MAGNOLIA_REGISTER_URL}
              registerLabel="Register with Magnolia CC"
              registerAriaLabel="Register with Magnolia CC Youth Track & Field — opens external registration"
              communityCenterName="Magnolia Community Center"
              surface="dark"
            />
            <TeamCard
              team="queen-anne"
              teamLabel="Queen Anne Quicksters"
              teamSubLabel="Track & Field"
              logoSrc="/logos/queen-anne-quicksters.png"
              logoAlt="Queen Anne Quicksters winged-shoe logo"
              logoWidth={1254}
              logoHeight={1254}
              description="Representing the Queen Anne community with pride and passion. We practice with Magnolia under the same coaches and compete together."
              registerUrl={QUEEN_ANNE_REGISTER_URL}
              registerLabel="Register with Queen Anne CC"
              registerAriaLabel="Register with Queen Anne Quicksters — opens external registration"
              communityCenterName="Queen Anne Community Center"
              surface="dark"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function SharedStrongerTogether() {
  const items = [
    {
      title: "Shared practices",
      body: "Athletes from both teams practice together at QA Bowl Mondays and Wednesdays.",
      icon: <PeopleIcon />,
    },
    {
      title: "Shared meets",
      body: "We compete together at Saturday meets at West Seattle Stadium.",
      icon: <TrophyIcon />,
    },
    {
      title: "One community",
      body: "Two neighborhoods. One track. Stronger together.",
      icon: <HeartIcon />,
    },
  ];

  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-[1200px] px-6 py-14 md:py-20 flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-ink text-2xl md:text-3xl font-bold uppercase tracking-wide text-center">
            Shared. Stronger together.
          </h2>
          <span
            className="block h-1 w-24 bg-accent-gold"
            aria-hidden="true"
          />
        </div>

        <div className="grid gap-8 md:grid-cols-3 w-full">
          {items.map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center text-center gap-3"
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white text-magnolia-navy">
                {item.icon}
              </div>
              <h3 className="text-magnolia-navy text-sm font-semibold uppercase tracking-wide">
                {item.title}
              </h3>
              <p className="text-sm text-ink leading-relaxed max-w-[16rem]">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Coaches({ coaches }: { coaches: Coach[] }) {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-14 md:py-16">
      <h2 className="text-ink text-2xl font-bold uppercase tracking-wide mb-8">
        Coaches
      </h2>
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
            <p className="text-sm text-ink leading-relaxed">{c.bio}</p>
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
    <section className="mx-auto max-w-[1200px] px-6 py-10 md:py-12 flex flex-col gap-8">
      <div className="flex flex-col items-center gap-3">
        <h2 className="text-magnolia-navy text-2xl md:text-3xl font-bold uppercase tracking-wide text-center">
          Latest Results
        </h2>
        <span
          className="block h-1 w-24 bg-accent-gold"
          aria-hidden="true"
        />
      </div>
      <Link
        href="/meets"
        aria-label={`View results — most recent meet: ${formatted}`}
        className="group block relative h-44 md:h-56 rounded-lg overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-magnolia-navy"
      >
        <Image
          src="/photos/west-seattle-stadium.webp"
          alt=""
          fill
          sizes="(min-width: 1200px) 1200px, 100vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(11,31,58,0.85), rgba(11,31,58,0.35))",
          }}
        />
        <div className="relative h-full px-6 md:px-10 flex flex-col justify-center gap-2">
          <p className="text-xs uppercase tracking-wide text-white/80 font-semibold">
            Most recent meet
          </p>
          <h3 className="text-white text-3xl md:text-4xl font-bold uppercase tracking-tight leading-tight">
            {formatted}
          </h3>
          <span className="mt-2 inline-flex items-center gap-2 text-white text-sm font-semibold uppercase tracking-wide self-start group-hover:gap-3 transition-all">
            View results
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </Link>
    </section>
  );
}

function ReadyToJoin() {
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-24 flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-magnolia-navy text-2xl md:text-3xl font-bold uppercase tracking-wide text-center">
            Ready to join?
          </h2>
          <span
            className="block h-1 w-24 bg-accent-gold"
            aria-hidden="true"
          />
        </div>
        <p className="text-base text-ink text-center max-w-xl leading-relaxed">
          Each team has a different registration through their local community
          center. Click your team to get started.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full sm:w-auto">
          <a
            href={MAGNOLIA_REGISTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Register with Magnolia CC Youth Track & Field — opens external registration"
            className="inline-flex items-center justify-center gap-3 rounded-md bg-magnolia-navy text-white px-6 py-4 text-sm font-semibold uppercase tracking-wide hover:bg-magnolia-navy/90 transition-colors min-w-[18rem]"
          >
            Join Magnolia CC →
          </a>
          <a
            href={QUEEN_ANNE_REGISTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Register with Queen Anne Quicksters — opens external registration"
            className="inline-flex items-center justify-center gap-3 rounded-md bg-queenAnne-red text-white px-6 py-4 text-sm font-semibold uppercase tracking-wide hover:bg-queenAnne-red/90 transition-colors min-w-[18rem]"
          >
            Join Queen Anne Quicksters →
          </a>
        </div>
      </div>
    </section>
  );
}

function SecondaryCTA() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-10 md:py-12">
      <p className="text-sm text-muted text-center">
        Have questions?{" "}
        <Link
          href="/faq"
          className="text-magnolia-navy font-medium underline underline-offset-4 hover:opacity-80"
        >
          Read the FAQ →
        </Link>
      </p>
    </section>
  );
}

function PeopleIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9H4a2 2 0 0 1-2-2V5h4" />
      <path d="M18 9h2a2 2 0 0 0 2-2V5h-4" />
      <path d="M6 5v6a6 6 0 0 0 12 0V5" />
      <path d="M9 21h6" />
      <path d="M12 17v4" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
