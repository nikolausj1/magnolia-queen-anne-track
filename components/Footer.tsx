import Link from "next/link";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/meets", label: "Meets" },
  { href: "/join", label: "Join" },
  { href: "/faq", label: "FAQ" },
  { href: "/privacy", label: "Privacy" },
];

// TODO: replace with real Parks & Rec registration URLs (PRD Open Items).
const COMMUNITY_CENTERS = [
  { href: "#", label: "Magnolia Community Center" },
  { href: "#", label: "Queen Anne Community Center" },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 bg-magnolia-navy text-white">
      <div className="mx-auto max-w-[1200px] px-6 py-12 md:py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="flex flex-col gap-3">
            <p className="text-sm leading-relaxed text-white/85">
              Magnolia Community Center and Queen Anne Quicksters track and
              field programs serve youth ages 5–17 in Seattle.
            </p>
            <p className="text-sm leading-relaxed text-white/85">
              All abilities. All are welcome.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <FooterColumnHeading>Quick Links</FooterColumnHeading>
            <nav aria-label="Footer">
              <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-white/85 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="flex flex-col gap-3">
            <FooterColumnHeading>Register</FooterColumnHeading>
            <ul className="flex flex-col gap-2">
              {COMMUNITY_CENTERS.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/85 hover:text-white underline-offset-4 hover:underline"
                  >
                    {item.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs text-white/65">
          <p>
            © {year} Magnolia &amp; Queen Anne Track &amp; Field
          </p>
          <p>
            Created with love by{" "}
            <a
              href="https://practicalaiservices.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 hover:underline hover:text-white"
            >
              Practical AI Services
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-white">
        {children}
      </h2>
      <span
        className="block h-[2px] w-8 bg-accent-gold"
        aria-hidden="true"
      />
    </div>
  );
}
