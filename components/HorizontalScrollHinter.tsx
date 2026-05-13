"use client";

// Wraps a horizontally-scrolling region and feathers its edges with a
// gradient AND a centered chevron icon when there's content out of
// view. The chevron is the load-bearing cue ("more this way"); the
// fade just reinforces it. Both disappear when scrolled to the
// corresponding edge — and stay hidden if the content fits without
// scrolling at all.

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** CSS color the fade resolves to at the edge — should match the card bg. */
  fadeColor?: string;
  /** CSS length for fade width. */
  fadeWidth?: string;
  className?: string;
};

export function HorizontalScrollHinter({
  children,
  fadeColor = "white",
  fadeWidth = "64px",
  className = "",
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function update() {
      if (!el) return;
      // 1px slack for sub-pixel rounding.
      setCanScrollLeft(el.scrollLeft > 1);
      setCanScrollRight(
        el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
      );
    }

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);

    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const fadeBase = {
    pointerEvents: "none" as const,
    width: fadeWidth,
    transition: "opacity 150ms ease",
  };

  return (
    <div className={`relative ${className}`}>
      <div ref={scrollRef} className="overflow-x-auto">
        {children}
      </div>
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 bottom-0 flex items-center justify-start pl-2"
        style={{
          ...fadeBase,
          opacity: canScrollLeft ? 1 : 0,
          background: `linear-gradient(to right, ${fadeColor} 40%, transparent)`,
        }}
      >
        <ChevronGlyph direction="left" />
      </div>
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 bottom-0 flex items-center justify-end pr-2"
        style={{
          ...fadeBase,
          opacity: canScrollRight ? 1 : 0,
          background: `linear-gradient(to left, ${fadeColor} 40%, transparent)`,
        }}
      >
        <ChevronGlyph direction="right" />
      </div>
    </div>
  );
}

function ChevronGlyph({ direction }: { direction: "left" | "right" }) {
  // 28px chevron, magnolia-navy stroke. Sits inside the opaque part of
  // the fade so it reads as a solid arrow, not a ghost.
  const path =
    direction === "right" ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6";
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-divider">
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-magnolia-navy"
      >
        <path d={path} />
      </svg>
    </span>
  );
}
