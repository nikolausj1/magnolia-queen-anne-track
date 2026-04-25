# Deployment Pipeline Guide

This is a reusable reference for Claude Code. Drop this file into any new project folder so Claude understands the preferred services, workflow, and deployment patterns. Project-specific details belong in the project's PRD.

## Services

| Service | Purpose | Account |
|---------|---------|---------|
| **GitHub** | Version control and CI trigger | `nikolausj1` |
| **Vercel** | Hosting and auto-deploy | Connected to GitHub |
| **Porkbun** | Domain registration and DNS | porkbun.com |
| **Dropbox** | Project file storage | Local sync to `~/Library/CloudStorage/Dropbox/_Projects/` |

## Preferred Tech Stack

- **Framework:** Next.js (latest stable)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **React:** Latest stable
- **Package manager:** npm
- **Static generation** preferred where possible

## New Project Setup

### 1. Create the GitHub repo

```bash
gh repo create nikolausj1/<repo-name> --public --source=. --remote=origin --push
```

### 2. Connect to Vercel

- Import the GitHub repo in the Vercel dashboard
- Vercel auto-detects Next.js and configures the build
- Set any required environment variables in Vercel project settings

### 3. Configure Porkbun DNS

Use the Porkbun API to add these DNS records for the domain:

| Type | Host | Value |
|------|------|-------|
| A | (root) | `76.76.21.21` |
| CNAME | www | `cname.vercel-dns.com` |

Claude Code should always use the Porkbun API (not the dashboard) to create and manage DNS records. See the Porkbun API section below for details.

Then add the domain in the Vercel project settings so Vercel can issue the SSL certificate.

### 4. Set up Dropbox ignore

Create `.dropboxignore` in the app directory (next to `package.json`):

```
node_modules
.next
.git
.vercel
out
build
coverage
```

If those directories already exist, also run:

```bash
xattr -w com.dropbox.ignored 1 node_modules
xattr -w com.dropbox.ignored 1 .next
xattr -w com.dropbox.ignored 1 .git
```

Optionally create a `.dropboxignore` at the project root level:

```
.DS_Store
```

## Deployment Workflow

1. Run `npm run dev` for local development (localhost:3000)
2. Make changes. Hot reload handles preview.
3. Commit to `main` with a descriptive message.
4. Push to GitHub. Vercel auto-deploys from `main` within about a minute.

There are no staging branches. All work goes directly to `main` and deploys to production.

### Images 

If you have issues with images not displaying, use absolute paths (e.g., `/sartell/product01.png`) instead of relative paths (e.g., `product01.png`) for image and asset references in HTML, as Vercel's routing may not resolve relative paths correctly depending on how the page URL is served.

## Git Conventions

- Commit messages should be descriptive and focus on "why" not "what"
- When Claude makes the commit, include: `Co-Authored-By: Claude <noreply@anthropic.com>`
- Stage specific files rather than using `git add -A`
- Do not commit `.env` files, credentials, or secrets

## Porkbun API

Porkbun has an API for DNS automation. API keys are stored separately and should be provided at runtime if needed. Do not commit API keys. Remind the user that the key and secret are stored in his 1Password Vault when you need them. 

Docs: https://porkbun.com/api/json/v3/documentation
