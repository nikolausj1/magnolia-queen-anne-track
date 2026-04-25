import Image from "next/image";

type TeamCardProps = {
  team: "magnolia" | "queen-anne";
  teamLabel: string;
  logoSrc: string;
  logoAlt: string;
  logoWidth: number;
  logoHeight: number;
  description: string;
  registerUrl: string;
  registerAriaLabel: string;
  communityCenterName: string;
  variant?: "compact" | "large";
};

export function TeamCard({
  team,
  teamLabel,
  logoSrc,
  logoAlt,
  logoWidth,
  logoHeight,
  description,
  registerUrl,
  registerAriaLabel,
  communityCenterName,
  variant = "compact",
}: TeamCardProps) {
  const isMagnolia = team === "magnolia";

  const surface = isMagnolia
    ? "bg-magnolia-navy text-white"
    : "bg-queenAnne-black text-white";

  const button = isMagnolia
    ? "bg-white text-magnolia-navy hover:bg-white/90"
    : "bg-queenAnne-red text-white hover:bg-queenAnne-red/90";

  const padding = variant === "large" ? "p-8 md:p-10" : "p-6 md:p-8";
  const logoBox =
    variant === "large" ? "h-32 md:h-36" : "h-24 md:h-28";

  return (
    <article
      className={`${surface} ${padding} rounded-lg flex flex-col gap-5`}
    >
      <div className={`${logoBox} flex items-center`}>
        <Image
          src={logoSrc}
          alt={logoAlt}
          width={logoWidth}
          height={logoHeight}
          className="h-full w-auto object-contain"
        />
      </div>

      <h3 className="text-xl font-semibold">{teamLabel}</h3>

      <p className="text-sm leading-relaxed text-white/85">{description}</p>

      <a
        href={registerUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={registerAriaLabel}
        className={`${button} inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors`}
      >
        Register with {teamLabel}
      </a>

      <p className="text-xs text-white/70 mt-auto">
        Registered through {communityCenterName}.
      </p>
    </article>
  );
}
