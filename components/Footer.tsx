import Link from "next/link";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/results", label: "Results" },
  { href: "/join", label: "Join" },
  { href: "/faq", label: "FAQ" },
];

// TODO: replace with real Parks & Rec registration URLs (PRD Open Items).
const COMMUNITY_CENTERS = [
  { href: "#", label: "Magnolia Community Center" },
  { href: "#", label: "Queen Anne Community Center" },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-divider bg-surface">
      <div className="mx-auto max-w-[1100px] px-6 py-10 flex flex-col gap-6">
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-ink hover:text-magnolia-navy"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {COMMUNITY_CENTERS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-ink hover:text-magnolia-navy underline-offset-4 hover:underline"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex flex-col gap-1 text-sm text-muted">
          <p>Magnolia · Queen Anne · Seattle</p>
          <p>
            © {year} Magnolia &amp; Queen Anne Track &amp; Field ·{" "}
            <Link
              href="/privacy"
              className="hover:text-magnolia-navy underline-offset-4 hover:underline"
            >
              Privacy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
