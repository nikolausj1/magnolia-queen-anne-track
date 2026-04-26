"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAV = [
  { href: "/", label: "HOME" },
  { href: "/results", label: "RESULTS" },
  { href: "/join", label: "JOIN" },
  { href: "/faq", label: "FAQ" },
] as const;

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const firstLink = panelRef.current?.querySelector<HTMLAnchorElement>("a");
    firstLink?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-divider">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6 h-20 flex items-center justify-between gap-4">
          <Link
            href="/"
            aria-label="Magnolia and Queen Anne Track and Field home"
            className="flex items-center min-w-0"
          >
            <span className="text-base md:text-lg font-bold uppercase tracking-tight leading-tight">
              <span className="text-magnolia-navy">Magnolia</span>
              <span className="text-ink"> &amp; </span>
              <span className="text-queenAnne-red">Queen Anne</span>
              <span className="block text-gray-400">Youth Track and Field</span>
            </span>
          </Link>

          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-8"
          >
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`text-sm uppercase tracking-wide transition-colors ${
                  isActive(item.href)
                    ? "text-magnolia-navy font-semibold"
                    : "text-ink hover:text-magnolia-navy"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            ref={buttonRef}
            type="button"
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md text-ink hover:bg-surface relative z-50"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              viewBox="0 0 24 24"
              width={24}
              height={24}
              aria-hidden="true"
              className="stroke-current"
              fill="none"
              strokeWidth={2}
              strokeLinecap="round"
            >
              {open ? (
                <>
                  <line x1="5" y1="5" x2="19" y2="19" />
                  <line x1="19" y1="5" x2="5" y2="19" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile menu drawer — rendered outside <header> so position:fixed
          anchors to the viewport, not the header's backdrop-filter ICB. */}
      {open && (
        <>
          {/* Scrim — dims content below the header bar and closes the menu on tap. */}
          <div
            onClick={() => setOpen(false)}
            aria-hidden="true"
            className="md:hidden fixed inset-x-0 top-20 bottom-0 bg-black/40 z-30"
          />
          {/* Menu drawer — drops over the content, doesn't push it down. */}
          <div
            id="mobile-nav"
            ref={panelRef}
            className="md:hidden fixed top-20 inset-x-0 bg-white border-b border-divider shadow-lg z-40"
          >
            <nav
              aria-label="Primary mobile"
              className="mx-auto max-w-[1200px] px-4 py-4 flex flex-col"
            >
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`py-3 text-sm uppercase tracking-wide border-b border-divider last:border-0 outline-none focus-visible:ring-2 focus-visible:ring-magnolia-navy focus-visible:ring-inset rounded-sm ${
                    isActive(item.href)
                      ? "text-magnolia-navy font-semibold"
                      : "text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
