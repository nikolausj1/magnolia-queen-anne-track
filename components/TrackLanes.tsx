export function TrackLanes() {
  return (
    <svg
      viewBox="0 0 800 140"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="block w-full h-[120px] md:h-[140px]"
    >
      <rect width="800" height="140" fill="#0B1F3A" />
      <g stroke="rgba(255,255,255,0.18)" strokeWidth="1">
        <line x1="0" x2="800" y1="20" y2="20" />
        <line x1="0" x2="800" y1="40" y2="40" />
        <line x1="0" x2="800" y1="60" y2="60" />
        <line x1="0" x2="800" y1="80" y2="80" />
        <line x1="0" x2="800" y1="100" y2="100" />
        <line x1="0" x2="800" y1="120" y2="120" />
      </g>
      <rect x="60" y="0" width="2" height="140" fill="rgba(255,255,255,0.65)" />
    </svg>
  );
}
