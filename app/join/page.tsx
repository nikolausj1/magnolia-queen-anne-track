import Link from "next/link";
import type { Metadata } from "next";
import { TeamCard } from "@/components/TeamCard";

export const metadata: Metadata = {
  title: "Join",
  description:
    "Register your athlete for Magnolia CC Youth Track & Field or Queen Anne Quicksters in Seattle. Ages 5–17, no tryouts, all skill levels welcome.",
  alternates: { canonical: "/join" },
};

// TODO(prd-open-items): registration URLs — see PRD.md Open Questions.
const MAGNOLIA_REGISTER_URL = "#";
const QUEEN_ANNE_REGISTER_URL = "#";

const DIVISIONS: Array<{ name: string; birthYears: string }> = [
  { name: "Flea", birthYears: "2020–2021" },
  { name: "Mosquito", birthYears: "2018–2019" },
  { name: "Bantam", birthYears: "2016–2017" },
  { name: "Gazelle", birthYears: "2014–2015" },
  { name: "Youth", birthYears: "2012–2013" },
  { name: "Intermediate", birthYears: "2010–2011" },
  { name: "Young Women / Young Men", birthYears: "2008–2009" },
];

const QUICK_REFERENCE: Array<{ label: string; body: string }> = [
  { label: "Ages", body: "5 to 17." },
  {
    label: "Season",
    body: "Spring season — weeknight practices leading into weekend meets.",
  },
  {
    label: "Practice",
    body: "Mondays and Wednesdays, 6:00–7:30 pm at Queen Anne Bowl Playfield.",
  },
  {
    label: "Meets",
    body: "Saturdays at West Seattle Stadium.",
  },
  {
    label: "What's included",
    body: "Practices, coaching, and meet entries through the season.",
  },
];

export default function JoinPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-6 py-12 md:py-16 flex flex-col gap-12 md:gap-16">
      <header className="flex flex-col gap-3">
        <h1>Join</h1>
        <p className="text-base md:text-lg text-ink max-w-2xl">
          Ready to join? Each team registers through its own community center.
        </p>
      </header>

      <section aria-labelledby="register-heading" className="flex flex-col gap-6">
        <h2 id="register-heading" className="sr-only">
          Register
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
            variant="large"
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
            variant="large"
          />
        </div>
      </section>

      <section aria-labelledby="quick-reference-heading" className="flex flex-col gap-6">
        <h2 id="quick-reference-heading">Quick reference</h2>

        <dl className="grid gap-4 md:grid-cols-2">
          {QUICK_REFERENCE.map((item) => (
            <div
              key={item.label}
              className="rounded-md border border-divider p-4 flex flex-col gap-1"
            >
              <dt className="text-[12px] uppercase tracking-wide text-muted">
                {item.label}
              </dt>
              <dd className="text-sm text-ink leading-relaxed">{item.body}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-col gap-3">
          <h3>Age divisions (2026 birth years)</h3>
          <div className="overflow-x-auto rounded-md border border-divider">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[12px] uppercase tracking-wide text-muted bg-surface">
                  <th scope="col" className="py-2 px-4 font-medium">
                    Division
                  </th>
                  <th scope="col" className="py-2 px-4 font-medium">
                    Birth years
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {DIVISIONS.map((d) => (
                  <tr key={d.name}>
                    <th scope="row" className="py-2 px-4 font-medium text-ink">
                      {d.name}
                    </th>
                    <td className="py-2 px-4 text-ink tabular-nums">
                      {d.birthYears}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section aria-labelledby="questions-heading" className="flex flex-col gap-3">
        <h2 id="questions-heading">Questions?</h2>
        <p className="text-base text-ink">
          See the{" "}
          <Link
            href="/faq"
            className="text-magnolia-navy underline underline-offset-4 hover:opacity-80"
          >
            FAQ
          </Link>{" "}
          for the most common ones — practice in the rain, what to bring,
          how events work by division, and more.
        </p>
      </section>
    </div>
  );
}
