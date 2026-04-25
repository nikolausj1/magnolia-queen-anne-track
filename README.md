# Magnolia / Queen Anne Youth Track & Field

Static website for the Magnolia CC Youth Track & Field and Queen Anne Quicksters youth track and field program.

**Start here:** open `prompts-artifact.html` in your browser, then open Claude Code in this folder. `CLAUDE.md` loads automatically. Click through the prompts in order.

## What's in this folder

- `PRD.md` — what to build. Source of truth for the project spec.
- `CLAUDE.md` — how to work on this project with Claude Code.
- `AGENTS.md` — portable equivalent of `CLAUDE.md` for other AI coding tools.
- `Web Deployment Guide.md` — reusable deployment and stack conventions.
- `prompts/` — ordered execution prompts, one per task.
- `prompts-artifact.html` — click-to-copy interactive version of the prompts.
- `.claude/skills/` — pre-populated skills Claude Code uses during the build.
- `content/faq.md` — FAQ answer drafts the FAQ page renders.
- `data/` — typed JSON seeds for athletes, meets, and results.
- `inbox/` — source files (roster PDF, results xlsx, schedule docx) to extract data from.
- `public/` — static assets. Logos under `logos/`, photos under `photos/`.

## Tech stack

Next.js, TypeScript, Tailwind CSS, deployed to Vercel. Data stored as JSON in `data/`, no backend. Domain `magnoliaqueenannetrackandfield.com` via Porkbun. Full details in `Web Deployment Guide.md`.

## Running locally

```
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploying

Push to `main`. Vercel auto-deploys within about a minute. No staging branches.

## Updating results each week

1. Drop the updated `2026 TRACK TIMES & DISTANCES.xlsx` into `inbox/`.
2. Open Claude Code and say "refresh results."
3. Walk through any flags Claude Code raises.
4. Approve the diff. Claude Code commits and pushes; Vercel deploys.

Typo fixes go in the xlsx, not in the JSON files.
