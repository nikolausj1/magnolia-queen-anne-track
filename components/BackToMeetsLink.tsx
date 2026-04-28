"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

// Prefer router.back() when the user actually navigated from another page
// in the app. Falls back to /meets#results if they landed on the athlete
// page directly (no in-app history).
export function BackToMeetsLink() {
  const router = useRouter();

  return (
    <Link
      href="/meets#results"
      onClick={(e) => {
        if (typeof window === "undefined") return;
        const sameOrigin =
          document.referrer.startsWith(window.location.origin);
        if (window.history.length > 1 && sameOrigin) {
          e.preventDefault();
          router.back();
        }
      }}
      className="inline-flex items-center gap-2 rounded-md border border-magnolia-navy bg-white px-4 py-2 text-sm md:text-base font-semibold uppercase tracking-wide text-magnolia-navy transition-colors hover:bg-magnolia-navy/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-magnolia-navy focus-visible:ring-offset-2"
    >
      <span aria-hidden="true">←</span> Back to Meets
    </Link>
  );
}
