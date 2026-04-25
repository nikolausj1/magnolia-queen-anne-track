# 08 · Privacy page

**Section:** Pages

## Context

Privacy is linked only from the footer, small text treatment. It's the only place the `info@magnoliaqueenannetrackandfield.com` address appears on the site.

## Goal

Build `app/privacy/page.tsx` per the spec in `PRD.md`. Short page covering:

- What we collect: nothing directly. Vercel Web Analytics runs in the background; aggregate page views, no cookies, no personal data.
- Photos: published with family consent. Contact `info@magnoliaqueenannetrackandfield.com` to request removal.
- Contact: the `info@` address. Include as a `mailto:` link (this page is the one exception to the no-mailto rule).
- Last updated date: today's date, hardcoded (update on future edits).

## Testable success criteria

- `/privacy` renders with all four sections.
- `info@magnoliaqueenannetrackandfield.com` appears as a `mailto:` link exactly twice (photo removal paragraph and contact paragraph).
- The address does not appear anywhere else on the site (verified by grep across `app/` and `components/`).
- Footer shows a small "Privacy" link pointing here; header does not link to this page.

## Verification steps

1. Visit `/privacy`. Confirm all four sections.
2. Click the `mailto:` link; default mail client opens with the address.
3. `grep -r "info@magnoliaqueenannetrackandfield" app/ components/` returns only the Privacy page (no leaks).
4. Confirm the footer Privacy link works from any other page.

## References

- `PRD.md` → Functional requirements → Privacy.

## Plan mode

Skip. Small static page.
