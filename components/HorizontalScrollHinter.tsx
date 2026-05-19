"use client";

// Wraps a horizontally-scrolling region and feathers its edges with a
// gradient + a centered chevron button when there's content out of
// view. The chevron is clickable and scrolls the table about one
// viewport-width in that direction (smooth). Manual horizontal
// scrolling still works exactly as before — the chevron is an
// additional affordance, not a replacement.
//
// The fade overlay sits on top of the scroll area with
// pointer-events: none so swipes/drags fall through to the table;
// only the chevron button itself opts back in with pointer-events:
// auto. Both fade + chevron hide when there's nothing to scroll to
// in that direction.

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

  function nudge(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    // ~80% of the visible width — moves to roughly the next page of
    // columns while keeping a small overlap for orientation.
    const delta = Math.round(el.clientWidth * 0.8);
    el.scrollBy({
      left: direction === "right" ? delta : -delta,
      behavior: "smooth",
    });
  }

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
        aria-hidden={!canScrollLeft}
        className="absolute top-0 left-0 bottom-0 flex items-center justify-start pl-2"
        style={{
          ...fadeBase,
          opacity: canScrollLeft ? 1 : 0,
          background: `linear-gradient(to right, ${fadeColor} 40%, transparent)`,
        }}
      >
        <ChevronButton
          direction="left"
          onClick={() => nudge("left")}
          visible={canScrollLeft}
        />
      </div>
      <div
        aria-hidden={!canScrollRight}
        className="absolute top-0 right-0 bottom-0 flex items-center justify-end pr-2"
        style={{
          ...fadeBase,
          opacity: canScrollRight ? 1 : 0,
          background: `linear-gradient(to left, ${fadeColor} 40%, transparent)`,
        }}
      >
        <ChevronButton
          direction="right"
          onClick={() => nudge("right")}
          visible={canScrollRight}
        />
      </div>
    </div>
  );
}

function ChevronButton({
  direction,
  onClick,
  visible,
}: {
  direction: "left" | "right";
  onClick: () => void;
  visible: boolean;
}) {
  // The fade overlay above us is pointer-events:none, but the button
  // opts back in so clicks land here instead of falling through to
  // the table.
  const path =
    direction === "right" ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "right" ? "Scroll right" : "Scroll left"}
      tabIndex={visible ? 0 : -1}
      disabled={!visible}
      className="pointer-events-auto inline-flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-divider text-magnolia-navy transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-magnolia-navy disabled:cursor-default"
    >
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={path} />
      </svg>
    </button>
  );
}
