"use client";

// Wraps a horizontally-scrolling region and feathers its edges with a
// gradient when there's content out of view. The fades disappear when
// the user scrolls to the corresponding edge — and stay hidden if the
// content fits without scrolling at all.

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
  fadeWidth = "48px",
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
        className="absolute top-0 left-0 bottom-0"
        style={{
          ...fadeBase,
          opacity: canScrollLeft ? 1 : 0,
          background: `linear-gradient(to right, ${fadeColor}, transparent)`,
        }}
      />
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 bottom-0"
        style={{
          ...fadeBase,
          opacity: canScrollRight ? 1 : 0,
          background: `linear-gradient(to left, ${fadeColor}, transparent)`,
        }}
      />
    </div>
  );
}
