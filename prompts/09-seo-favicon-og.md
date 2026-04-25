# 09 · SEO, favicon, OG image

**Section:** Polish

## Context

All five pages exist and work. Now we make the site discoverable and link-previewable.

## Goal

Add per-page `metadata` and site-wide SEO assets:

1. **Root `metadata`** in `app/layout.tsx`: title template, description, Open Graph defaults, Twitter card, canonical URL (`https://magnoliaqueenannetrackandfield.com`).

2. **Per-page `metadata`** on each `page.tsx`: page-specific title, description, OG-specific tweaks if relevant.

3. **Favicon.** Simplified Magnolia winged-shoe mark. Generate favicon files (`favicon.ico`, `icon.png`) from the Magnolia logo. Place in `app/` per Next.js conventions.

4. **OG image.** Generated tile with both team names on a dark background (navy), roughly 1200×630. Place at `public/og-image.png`. Reference from metadata.

5. **`sitemap.xml` and `robots.txt`.** Generate via `app/sitemap.ts` and `app/robots.ts` per Next.js conventions. Include all public pages.

## Testable success criteria

- Each page has a unique `<title>` and `<meta name="description">`.
- Titles include both team names, "Seattle," and "youth track and field" where relevant per the PRD SEO section.
- `/sitemap.xml` lists all public pages (Home, Results, Join, FAQ, Privacy).
- `/robots.txt` allows crawling.
- `/favicon.ico` returns a valid icon; browser tab shows the mark.
- OG image appears when the site URL is pasted into a link-preview tool (Discord / Slack / local preview).
- Lighthouse SEO ≥ 95.

## Verification steps

1. Inspect each page's `<head>`. Confirm unique title and description.
2. Visit `/sitemap.xml` and `/robots.txt`. Both valid and sensible.
3. Open the site in a browser tab; confirm favicon displays.
4. Preview the site URL in a link-preview tool; confirm OG image renders.
5. Run Lighthouse; SEO score ≥ 95.

## References

- `PRD.md` → SEO.
- `PRD.md` → Imagery → OG image.
- `.claude/skills/nextjs-tailwind/SKILL.md` → Metadata.

## Plan mode

Optional. Favicon and OG image generation may require briefly stopping to confirm the OG image treatment (text-only on navy, or include logos).
