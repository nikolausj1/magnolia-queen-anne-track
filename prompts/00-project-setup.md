# 00 · Project setup

**Section:** Setup

## Context

Fresh project folder. `PRD.md`, `CLAUDE.md`, and `Web Deployment Guide.md` are all here. No code yet. The build uses Next.js App Router + TypeScript + Tailwind, deployed to Vercel from `main`, with the domain `magnoliaqueenannetrackandfield.com` via Porkbun.

## Goal

Scaffold a working Next.js + TypeScript + Tailwind project in this folder, initialize git, create the GitHub repo, and connect Vercel. At the end of this prompt, `npm run dev` should serve the Next.js default "hello world" page at `localhost:3000`, and a push to `main` should deploy to Vercel.

## Testable success criteria

- `npm run dev` serves the app at `localhost:3000` with no type or lint errors.
- `npm run build` completes successfully.
- GitHub repo `nikolausj1/magnolia-queen-anne-track` exists and `main` tracks this folder.
- Vercel project is connected to the repo and has deployed at least the scaffolded default page.
- `.gitignore` covers `node_modules`, `.next`, `.vercel`, `.env`, `.DS_Store`. (It already does; verify.)

## Verification steps

1. Run `npm run dev`. Open `localhost:3000`. Confirm the Next.js default page renders.
2. Run `npm run typecheck` and `npm run lint`. No errors.
3. Run `git log` to confirm a clean initial commit.
4. Confirm the Vercel dashboard shows the deployed URL. Domain wiring comes later (prompt 11).

## References

- `Web Deployment Guide.md` for the exact `gh repo create` command, Vercel import steps, and Dropbox ignore setup.
- `CLAUDE.md` → Commands for `npm run` scripts.
- `CLAUDE.md` → Folder conventions for the `app/` + `components/` + `lib/` layout.

## Plan mode

**Enable plan mode.** This prompt touches many files and external services (git, GitHub, Vercel). Walk through the plan before executing.
