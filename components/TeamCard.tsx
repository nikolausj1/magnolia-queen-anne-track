import Image from "next/image";

type TeamCardProps = {
  team: "magnolia" | "queen-anne";
  teamLabel: string;
  teamSubLabel?: string;
  logoSrc: string;
  logoAlt: string;
  logoWidth: number;
  logoHeight: number;
  description: string;
  registerUrl: string;
  registerLabel: string;
  registerAriaLabel: string;
  communityCenterName: string;
  variant?: "compact" | "large";
  surface?: "light" | "dark";
};

export function TeamCard({
  team,
  teamLabel,
  teamSubLabel,
  logoSrc,
  logoAlt,
  logoWidth,
  logoHeight,
  description,
  registerUrl,
  registerLabel,
  registerAriaLabel,
  communityCenterName,
  variant = "compact",
  surface = "light",
}: TeamCardProps) {
  const isMagnolia = team === "magnolia";
  const isDark = surface === "dark";

  const cardBg = isDark
    ? isMagnolia
      ? "bg-magnolia-navy"
      : "bg-black"
    : "bg-white border border-divider";

  const accent = isDark
    ? isMagnolia
      ? "bg-accent-gold"
      : "bg-queenAnne-red"
    : isMagnolia
      ? "bg-magnolia-navy"
      : "bg-queenAnne-red";

  const titleColor = isDark
    ? "text-white"
    : isMagnolia
      ? "text-magnolia-navy"
      : "text-queenAnne-red";

  const bodyColor = isDark ? "text-white/90" : "text-ink";
  const footerColor = isDark ? "text-white/60" : "text-muted";

  const button = isDark
    ? isMagnolia
      ? "bg-white text-magnolia-navy hover:bg-white/90"
      : "bg-queenAnne-red text-white hover:bg-queenAnne-red/90"
    : isMagnolia
      ? "bg-magnolia-navy text-white hover:bg-magnolia-navy/90"
      : "bg-queenAnne-red text-white hover:bg-queenAnne-red/90";

  const padding = variant === "large" ? "p-8 md:p-10" : "p-6 md:p-8";
  const logoSize = variant === "large" ? "h-28 md:h-32" : "h-20 md:h-24";

  return (
    <article
      className={`${padding} ${cardBg} rounded-lg transition-shadow hover:shadow-md flex flex-col gap-5`}
    >
      <div className="flex items-center gap-4">
        <Image
          src={logoSrc}
          alt={logoAlt}
          width={logoWidth}
          height={logoHeight}
          className={`${logoSize} w-auto object-contain`}
        />
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex flex-col">
            <span
              className={`${titleColor} text-xl md:text-2xl font-bold uppercase tracking-tight leading-tight`}
            >
              {teamLabel}
            </span>
            {teamSubLabel ? (
              <span
                className={`${titleColor} text-sm md:text-base font-semibold uppercase tracking-wide leading-tight ${isDark ? "opacity-90" : ""}`}
              >
                {teamSubLabel}
              </span>
            ) : null}
          </div>
          <span className={`${accent} h-[3px] w-12`} aria-hidden="true" />
        </div>
      </div>

      <p className={`text-sm md:text-base ${bodyColor} leading-relaxed`}>
        {description}
      </p>

      <a
        href={registerUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={registerAriaLabel}
        className={`${button} inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold uppercase tracking-wide transition-colors`}
      >
        {registerLabel}
        <ExternalLinkIcon />
      </a>

      <p className={`text-xs ${footerColor} leading-relaxed`}>
        Registration, schedules, and program details are managed by{" "}
        {communityCenterName}.
      </p>
    </article>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 3h6v6" />
      <path d="M10 14L21 3" />
      <path d="M21 14v7H3V3h7" />
    </svg>
  );
}
