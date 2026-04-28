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
      className="inline-flex items-center gap-2 text-base md:text-lg font-semibold text-magnolia-navy hover:underline underline-offset-2 decoration-2"
    >
      <span aria-hidden="true">←</span> Back to Meets
    </Link>
  );
}
