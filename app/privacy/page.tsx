import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Privacy practices for the Magnolia / Queen Anne youth track and field site. No personal data collected; aggregate page views only.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

const CONTACT_EMAIL = "info@magnoliaqueenannetrackandfield.com";
const LAST_UPDATED = "April 24, 2026";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[760px] px-6 py-12 md:py-16 flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1>Privacy</h1>
        <p className="text-sm text-muted">Last updated {LAST_UPDATED}.</p>
      </header>

      <section aria-labelledby="collect-heading" className="flex flex-col gap-3">
        <h2 id="collect-heading">What we collect</h2>
        <p className="text-ink leading-relaxed">
          Nothing directly. The site has no forms, accounts, or comments.
        </p>
        <p className="text-ink leading-relaxed">
          We use Vercel Web Analytics, which records aggregate page views
          (such as how many people visited the Results page in a week). It
          does not set cookies, does not collect personal data, and does
          not track individuals across sites. There is no consent banner
          because there is nothing to consent to.
        </p>
      </section>

      <section aria-labelledby="photos-heading" className="flex flex-col gap-3">
        <h2 id="photos-heading">Photos</h2>
        <p className="text-ink leading-relaxed">
          Photos of athletes are published only with family consent, handled
          offline at registration time. Names beyond a first name (and a last
          initial when needed for disambiguation) are not published.
        </p>
        <p className="text-ink leading-relaxed">
          To request that a photo be removed, email{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-magnolia-navy underline underline-offset-4 hover:opacity-80"
          >
            {CONTACT_EMAIL}
          </a>
          . We will take it down without question and without explanation
          required.
        </p>
      </section>

      <section aria-labelledby="contact-heading" className="flex flex-col gap-3">
        <h2 id="contact-heading">Contact</h2>
        <p className="text-ink leading-relaxed">
          Questions about this policy or about how the site uses information?
          Email{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-magnolia-navy underline underline-offset-4 hover:opacity-80"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>
    </div>
  );
}
