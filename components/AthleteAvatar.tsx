type Props = {
  firstName: string;
  lastInitial?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_CLASS: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-12 w-12 text-base",
  lg: "h-20 w-20 md:h-24 md:w-24 text-2xl md:text-3xl",
};

export function AthleteAvatar({
  firstName,
  lastInitial,
  size = "md",
  className = "",
}: Props) {
  const initials = `${firstName.charAt(0)}${lastInitial ? lastInitial.charAt(0) : ""}`.toUpperCase();
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-full bg-magnolia-navy text-white font-bold tracking-tight ${SIZE_CLASS[size]} ${className}`}
    >
      {initials}
    </span>
  );
}
