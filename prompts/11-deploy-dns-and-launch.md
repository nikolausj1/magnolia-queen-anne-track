# 11 · Deploy, DNS, and launch

**Section:** Deploy

## Context

Site is build-clean and accessibility-clean. Vercel is connected from prompt 00 and auto-deploys on push. Domain `magnoliaqueenannetrackandfield.com` was registered via Porkbun on 2026-04-23. Now we wire the domain and ship.

The Porkbun API is used for DNS. API key and secret are in Justin's 1Password; prompt the user to paste them at runtime. Do not commit keys.

## Goal

1. **Set Porkbun DNS records** via the API (not the dashboard):
   - A record, root (`@`) → `76.76.21.21`
   - CNAME, `www` → `cname.vercel-dns.com`
2. **Add the domain in Vercel project settings.** Vercel will auto-issue the SSL certificate.
3. **Confirm the site is live** at `https://magnoliaqueenannetrackandfield.com` and `https://www.magnoliaqueenannetrackandfield.com` (both resolve; SSL valid).
4. **Final deploy check.** Push any pending changes. Confirm Vercel's latest deploy matches the latest `main` commit.
5. **Update the PRD.** Move the remaining Open Items that can be resolved at launch (logo availability already resolved; community center URLs still pending unless Justin has them). Tag the Launch Plan section with the actual launch date.

## Testable success criteria

- `dig magnoliaqueenannetrackandfield.com A` returns `76.76.21.21`.
- `dig www.magnoliaqueenannetrackandfield.com CNAME` returns a Vercel CNAME.
- `https://magnoliaqueenannetrackandfield.com` serves the site with a valid SSL certificate.
- `https://www.magnoliaqueenannetrackandfield.com` redirects or resolves to the same site.
- Vercel dashboard shows the custom domain attached and SSL valid.
- A fresh push to `main` triggers a Vercel deploy that succeeds and the site reflects the change.

## Verification steps

1. Claude Code calls the Porkbun API with the provided key/secret; verify the API response.
2. Run `dig` commands to confirm DNS records.
3. Visit both URLs in a browser. Confirm site renders, SSL valid (lock icon), no mixed content warnings.
4. Share the URL with someone on a different network; confirm they see the site.
5. Paste the URL into a link preview tool (Discord / Slack) and confirm the OG image renders.

## References

- `Web Deployment Guide.md` → Porkbun API for documentation URL and key storage convention.
- `PRD.md` → Technical constraints → Domain for the exact A and CNAME targets.
- `PRD.md` → Launch Plan.

## Plan mode

**Enable plan mode.** DNS changes are hard to reverse without patience (TTL) and affect reachability. Walk through the full sequence (fetch key from user, set A record, set CNAME, add to Vercel, wait for SSL, verify) before executing any API call.
