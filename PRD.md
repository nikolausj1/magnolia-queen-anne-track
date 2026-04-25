---
title: "Magnolia / Queen Anne Youth Track & Field Website PRD"
created: 2026-04-24
modified: 2026-04-24
version: 1.0
author: Claude Opus 4.7 (claude-opus-4-7)
tags:
---

# Magnolia / Queen Anne Youth Track & Field Website PRD

## Problem and evidence

Two Seattle youth track and field teams, Magnolia CC Youth Track & Field and Queen Anne Quicksters, operate as a single program but have no current online presence. The previous Quicksters site at `https://quicksters.weebly.com/` is stale (last meaningful update circa 2019) and Magnolia has never had a site. Parents in both neighborhoods lack a way to understand that the teams are one practice group, to see which community center they should register through, to find practice and meet logistics, or to follow their athletes' results through the season.

## User context

Primary audience: parents of youth athletes aged 5 to 17 living in or near the Magnolia and Queen Anne neighborhoods of Seattle. Two sub-segments:

- **New parents** evaluating the program for the first time. They need to understand what the program is, what the commitment looks like, and which community center to register through.
- **Returning parents** whose athlete is already registered. They need quick access to the meet schedule, practice details, and meet results as the season progresses.

Secondary audience: coaches (use the site to share the program's public identity) and prospective coaches. Athletes themselves do not use the site directly in v1.

## Goals

Aspirational framing for what the site is trying to achieve.

- Establish a credible online presence for both teams.
- Communicate the "two teams, one community" identity.
- Help parents understand what the program is and how it works.
- Drive registrations to the correct community center for each team.
- Showcase meet results throughout the season.
- Provide a link to team merchandise when available.

## Success criteria

Testable assertions the site must meet.

- From any page, a parent can reach the correct community center's registration page in two clicks or fewer.
- Each completed meet's results appear on `/results` within 48 hours of the meet, without manual HTML editing (JSON edit plus redeploy is acceptable).
- The site loads in under two seconds on a mid-tier mobile device over a typical Seattle residential connection (Lighthouse performance score 90+ on mobile).
- The site passes a basic accessibility audit: keyboard navigable, all images have alt text, heading structure is semantic, color contrast meets WCAG AA for both team palettes.
- No raw athlete name strings appear as identifiers in results data; every result row references a canonical `athleteId` from `athletes.json`.
- Build-time first-name collision check surfaces last initials automatically; visible results never show ambiguous duplicate names.
- When an Open-Meteo weather lookup fails, the meet card renders without the weather line and the site does not error.

## Scope

### In scope for v1

Four top-nav pages (Home, Results, Join, FAQ) plus a Privacy page linked only from the footer. Season schedule seeded for 2026. Results for the April 18, 2026 meet at launch, with subsequent meets added weekly during the season. Weather enrichment on meet cards. Two-team visual identity throughout. Mobile-first responsive layout.

### Explicitly out of scope

- No scheduling or calendar system.
- No forms, user accounts, or backend.
- No database or CMS.
- No embedded merchandise store (link out if and when a store exists).
- No athlete self-service features (profile pages, private dashboards, personal records tracking).
- No email, SMS, or push notifications.
- No social media integration in the footer in v1 (accounts do not exist).
- No dedicated Teams, About, or Photos pages (team identity lives on Home and Join; photos are contextual).

### Deferred to v1.1+

- Season filtering and search on the Results page.
- Coaches section (scaffolded on Home, hidden until bios are ready).
- Merchandise link (4th Wall store URL).
- Social media links in the footer.
- A per-athlete page with season summary (if it becomes valuable).

## Functional requirements

Page-shaped structure. Cross-cutting concerns at the end.

### Header (every page)

Site branding lockup (treatment pending, see Open Questions), top nav with Home, Results, Join, FAQ. Mobile: hamburger with the same items. Header is sticky on scroll.

### Footer (every page)

Small nav (Home, Results, Join, FAQ), community center links (Magnolia Community Center, Queen Anne Community Center), Privacy link (small), tagline line "Magnolia - Queen Anne - Seattle," copyright year. No social icons in v1. No contact email in the footer.

### Home (`/`)

Hero section with a headline conveying "Two Teams, One Community," a subhead naming youth track and field, ages 5 to 17, Magnolia and Queen Anne, a hero image (see Visual and Design Spec for selection), and two primary CTAs side by side (Register with Magnolia, Register with Queen Anne Quicksters).

Shared program block: short paragraph explaining the two teams practice together, share coaches, compete together, and register through their respective community centers.

What to Expect block: weeknight practices Monday and Wednesday 6:00 to 7:30 pm at QA Bowl, weekend meets at West Seattle Stadium, all skill levels welcome with no cuts, ages 5 to 17 in the Seattle area.

Team identity cards: side-by-side on desktop, stacked on mobile. Magnolia card uses the Magnolia logo and navy/white palette with a 2-3 sentence description and Register button. Queen Anne card uses the Queen Anne Quicksters logo (now available) and red/black palette with a 2-3 sentence description and Register button. Both cards include the text "Registered through [community center name]."

Coaches section: scaffolded but hidden until coach info is ready. When populated, one shared section across both teams with a photo, name, and 1-2 sentence bio per coach.

Latest results teaser: "Most recent meet: [date]. View all results," linking to `/results`.

Secondary CTA: link to FAQ for parents who want more info before registering.

### Results (`/results`)

Meet cards, newest on top, single page for v1.

Each meet card has four components.

1. **Generated hero image.** SVG illustration of stylized track lanes on a dark navy/charcoal background, about 140px tall at full card width. Same asset reused across all meets for v1.

2. **Meet header.**
   - Primary: date as an h2 (e.g., "Saturday, April 18, 2026").
   - Secondary: location, right-aligned (e.g., "West Seattle Stadium").
   - Tertiary: weather summary line below the location when available (e.g., "62°F · Cloudy · 8 mph wind"), small muted text.
   - Meet names are intentionally not used; date plus location uniquely identifies each meet.

3. **View toggle.** Segmented control below the meet header with two options: "By event" and "By athlete." Default is By event. Per-meet state (each card has its own toggle).

4. **Results body.** Rendered based on toggle state.

**By event view.** Results grouped one section per event. Section header shows event name (18px, weight 500), a category pill (Running teal, Jumping purple, Throwing coral), and a right-aligned result count. Column headers: Athlete, Place, Mark. Rows sorted by mark (ascending for time events, descending for distance events). Athlete column has first name bold with a smaller secondary line showing division and team badge. Place column is center-aligned. Mark column is 22px right-aligned with tabular numerics.

**By athlete view.** Results grouped one section per athlete. Section header shows the athlete's first name (17px, weight 500), division, and team badge. Column headers: Event, Place, Mark. One row per event the athlete competed in at this meet.

**Event categorization.** Running: events not matching jump or throw keywords. Jumping: events containing "jump." Throwing: events containing "put," "throw," "discus," or "javelin."

**Athlete naming.** First name by default; last initial added only when two or more athletes share a first name across the visible dataset. Build-time check appends last initials automatically when a collision is detected.

### Join (`/join`)

Opening line: "Ready to join? Each team registers through its own community center."

Two prominent registration cards, larger than the ones on Home. Each card shows the team name, logo (Magnolia winged shoe for Magnolia, Queen Anne Quicksters logo for Queen Anne), which community center, and a Register button.

Quick-reference block: ages 5 to 17, age division table (seven divisions, 2026 birth years, see Content), season (intentionally ambiguous as "spring season"), practice (Mon/Wed 6:00 to 7:30 pm at QA Bowl), meets (weekends at West Seattle Stadium), what is included (practices, coaching, meet entries).

Questions block: link to FAQ. No `mailto` on this page.

### FAQ (`/faq`)

Nine questions listed; answers in `content/faq.md`. The page renders from that file. Optional closing line "Still have questions?" (no link for v1).

Questions covered: team difference, age divisions, experience and cuts, season timing, events per division, practice in rain, meets in rain, cleats and spikes, what to bring.

### Privacy (`/privacy`)

Linked only from the footer. What we collect (nothing directly; Vercel Web Analytics aggregate page views only, no cookies). Photos published with family consent; request removal via `info@magnoliaqueenannetrackandfield.com`. Contact address for removals and questions. Last updated date.

### Cross-cutting concerns

**SEO.** Title includes both team names, "Seattle," and "youth track and field." One-sentence description. Keywords woven into copy. Auto-generated `sitemap.xml` and `robots.txt` via Next.js. OG image: simple generated tile with both team names on a dark background.

**Accessibility.** Proper heading structure, alt text on all images, sufficient contrast for both team color schemes, keyboard navigable, Results tables semantically grouped.

**Navigation.** Sticky header on scroll. Mobile hamburger with the same nav items.

**Photos.** Stored in `/public/photos/`, rendered with Next.js `<Image>` component. Family consent handled offline; only approved photos published.

## Visual and design spec

Deliberately prescriptive. Implementation should match these values exactly.

### Palette

- **Magnolia.** Navy `#0B1F3A`, white `#FFFFFF`.
- **Queen Anne.** Red (exact hex pending logo extraction, approximate `#C8102E`), black `#000000`.
- **Shared neutrals.** Background `#FFFFFF`, text `#111827`, secondary text `#6B7280`, muted backgrounds `#F3F4F6`, dividers `#E5E7EB`.

### Team badges (used on Results)

- Magnolia: background `#E6F1FB`, text `#0C447C`.
- Queen Anne: background `#FCEBEB`, text `#791F1F`.

### Event category pills (used on Results)

- Running: background `#E1F5EE`, text `#085041`.
- Jumping: background `#EEEDFE`, text `#3C3489`.
- Throwing: background `#FAECE7`, text `#712B13`.

### Typography

System font stack for body. Strong hierarchy. Tabular numerics for marks and times.

- H1 (page titles): 32px desktop, 28px mobile, weight 600.
- H2 (meet dates, section headers): 24px desktop, 22px mobile, weight 600.
- H3 (event section headers): 18px, weight 500.
- Body: 16px, weight 400, line-height 1.5.
- Secondary / caption: 14px, weight 400, color `#6B7280`.
- Marks (Results): 22px, weight 500, tabular, right-aligned.

### Imagery

- **Magnolia logo.** Winged track shoe with arched "MAGNOLIA / COMMUNITY CENTER" text on navy. Available at `public/logos/magnolia-cc.*`.
- **Queen Anne Quicksters logo.** Winged track shoe with arched "Queen Anne / Quicksters" text, red on black. Available at `public/logos/queen-anne-quicksters.*`. (Resolved from v2.9 open item.)
- **Home hero.** Action photo of Magnolia and Queen Anne athletes at a meet, landscape, available at `public/photos/home-hero-action.*`.
- **Home alternate / story image.** Team huddle photo with Magnolia and Queen Anne tanks visible, available at `public/photos/home-huddle.*`.
- **Per-meet hero on Results.** Shared SVG track-lanes illustration, one asset reused.
- **Favicon.** Simplified Magnolia winged-shoe mark.
- **OG image.** Generated tile with both team names on a dark background.

### Layout and spacing

Mobile-first. Max content width 1100px. Generous spacing between sections (64px desktop, 48px mobile). Card components use 24px internal padding, 1px `#E5E7EB` border, 8px border-radius, and a subtle shadow on hover only.

### Style mood

Minimal, athletic, clean. Each team's identity visually distinct in side-by-side contexts (Magnolia navy/white versus Queen Anne red/black); unified areas use shared neutrals. No illustrative flourishes beyond the track-lane SVG.

### Results page visual reference

Athlinks race results page format (`https://www.athlinks.com/event/158854/results/Event/1098200/Results`). Card-per-meet layout, clean typography hierarchy, bold right-aligned numeric values, subtle dividers. Screenshot preserved at `inbox/Inspiration Meet Reults Screenshot 2026-04-23 at 3.11.32 PM.png`.

## Technical constraints

Deployment, stack, and operational conventions follow `Web Deployment Guide.md` at the project root. That file is the reusable standards reference for this author's projects; this PRD references it rather than restating.

- **Framework.** Next.js (latest stable), TypeScript, Tailwind CSS.
- **Hosting.** Vercel, auto-deploy from `main` on push.
- **Version control.** GitHub, account `nikolausj1`. Repo name `magnolia-queen-anne-track`.
- **Domain.** `magnoliaqueenannetrackandfield.com` (registered via Porkbun 2026-04-23). DNS managed via Porkbun API (A record root → `76.76.21.21`, CNAME www → `cname.vercel-dns.com`).
- **Analytics.** Vercel Web Analytics only. No Google Analytics, no cookies, no consent banner needed.
- **Data.** All results, athletes, and meets stored as typed JSON in `/data`. No database, no CMS. See `data/` schemas.
- **Weather enrichment.** Open-Meteo Archive API (no key). Fetched once per meet at ingestion time, cached in `meets.json`. Coordinates for West Seattle Stadium hardcoded (47.5721, -122.4064).
- **Update workflow.** Justin runs Claude Code locally, edits JSON files (or re-runs ingestion from `inbox/`), commits, and pushes. Vercel auto-deploys within about a minute.

Operational details (data extraction from `inbox/`, data ingestion quality rules, the auto-fix / flag / block taxonomy, the canonical athlete registry pattern, weekly ingestion run flow) live in `CLAUDE.md`. This PRD references that file rather than restating.

## Rationale and alternatives

Design decisions whose reasoning is non-obvious.

**Why two teams, one program presentation.** Magnolia and Queen Anne are administratively separate (distinct community centers handle registration) but operationally merged (one practice group, one coaching staff, one competitive unit). Presenting them as two identical teams would misrepresent the operational reality; presenting them as one team would misrepresent the registration split. "Two teams, one community" holds the tension honestly.

**Why static JSON over a database.** The data changes once a week at most (results after meets) and fits in a few hundred rows. A database adds hosting surface (migrations, backups, auth, costs) with no benefit. JSON plus git history is sufficient and keeps the project auditable.

**Why "Queen Anne" as the team badge, not "Quicksters".** Magnolia has no single-word mascot. Labeling one team "Quicksters" and the other "Magnolia" would make Magnolia read as the less-named team. Using community names on both sides preserves equal visual weight.

**Why no scheduling or calendar system.** Parks and Rec handles scheduling upstream. Duplicating it risks drift and creates an update burden. The site displays the meet list but is not the source of truth.

**Why cut Teams, About, and Photos pages.** Team identity is expressed on Home (side-by-side cards) and Join (registration CTA). A dedicated About page would duplicate Home content without adding substance. Photos are used contextually (hero on Home, action on Results) rather than aggregated into a gallery.

**Why no `mailto` except on Privacy.** Public inboxes attract spam. The `info@` address exists for photo removal requests and similar; surfacing it only on Privacy is adequate for its purpose and minimizes exposure.

**Why weather enrichment.** A meet's date plus weather gives the card more context with minimal effort. The Archive API is free, keyless, and cacheable. The feature fails gracefully if the API changes.

**Alternatives considered and rejected.** A SPA with client-side routing (rejected: slower first paint, harder SEO, no gain). A CMS like Contentful or Sanity (rejected: hosting surface and cost). Separate sites for each team (rejected: contradicts the "one program" identity).

## Open questions (v1 placeholders, not blocking)

- [ ] Magnolia team name/mascot beyond "Magnolia CC Youth Track & Field." "Magnolia Mustangs" under consideration.
- [ ] Header branding treatment: dual-logo lockup, combined wordmark, or alternating.
- [ ] Registration URLs for both community centers.
- [ ] Queen Anne exact red/black hex values (extract from logo during build).
- [ ] Neutral/shared color palette final values for unified sections.
- [ ] Social media accounts (Instagram, Facebook) - omitted from footer until they exist.
- [ ] 4th Wall store URL - merch link omitted until ready.
- [ ] Coaches info and bios - section scaffolded on Home, hidden until populated.
- [ ] Season start/end dates (FAQ #4 intentionally vague; revisit if parents ask for specifics).
- [x] Domain registered via Porkbun (2026-04-23).
- [x] Queen Anne Quicksters logo (resolved 2026-04-24: logo now available at `public/logos/queen-anne-quicksters.*`).

## References

- Athlinks race results page: `https://www.athlinks.com/event/158854/results/Event/1098200/Results`. Visual reference for the Results page layout.
- Previous Queen Anne Quicksters site (stale, 2019-era): `https://quicksters.weebly.com/`. Historical context only.
- `Web Deployment Guide.md` at project root. Deployment, stack, and git conventions.
- `CLAUDE.md` at project root. Operational context for Claude Code.
- `content/faq.md`. FAQ answer drafts rendered by the FAQ page.
