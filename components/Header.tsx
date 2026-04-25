"use client";

import Image from "next/image";
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-divider">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6 h-20 flex items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="Magnolia and Queen Anne home"
          className="flex items-center gap-3 min-w-0"
        >
          <Image
            src="/logos/magnolia-cc.png"
            alt=""
            width={2138}
            height={1682}
            className="h-9 md:h-11 w-auto object-contain"
            priority
          />
          <div className="flex flex-col leading-none">
            <span className="text-magnolia-navy text-sm md:text-base font-bold uppercase tracking-tight">
              Magnolia
            </span>
            <span className="text-magnolia-navy text-[10px] md:text-xs font-semibold uppercase tracking-wide opacity-80">
              Community Center
            </span>
          </div>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-7"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`text-xs uppercase tracking-wide transition-colors ${
                isActive(item.href)
                  ? "text-magnolia-navy font-semibold"
                  : "text-ink hover:text-magnolia-navy"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          aria-label="Queen Anne Quicksters"
          className="hidden md:flex items-center gap-3"
        >
          <div className="flex flex-col leading-none text-right">
            <span className="text-queenAnne-red text-sm md:text-base font-bold uppercase tracking-tight">
              Queen Anne
            </span>
            <span className="text-queenAnne-red text-[10px] md:text-xs font-semibold uppercase tracking-wide opacity-80">
              Quicksters · Track &amp; Field
            </span>
          </div>
          <Image
            src="/logos/queen-anne-quicksters.png"
            alt=""
            width={1254}
            height={1254}
            className="h-9 md:h-11 w-auto object-contain"
          />
        </Link>

        <button
          ref={buttonRef}
          type="button"
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md text-ink hover:bg-surface"
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

      {open && (
        <div
          id="mobile-nav"
          ref={panelRef}
          className="md:hidden border-t border-divider bg-white"
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
                className={`py-3 text-sm uppercase tracking-wide border-b border-divider last:border-0 ${
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
      )}
    </header>
  );
}
