# 07 · FAQ page

**Section:** Pages

## Context

FAQ content lives in `content/faq.md` (already populated). The FAQ page renders that file. The page is new-parent oriented and is the last content page before Privacy.

## Goal

Build `app/faq/page.tsx` that reads `content/faq.md` and renders it as a page. Use a markdown renderer (Next.js MDX or `react-markdown` + `remark-gfm`). Structure:

1. Page title: "Frequently Asked Questions" (or similar; use whatever matches the site voice).
2. Each h2 in `faq.md` becomes a question section with the following paragraphs as the answer.
3. Optional closing line: "Still have questions?" — no link in v1.

## Testable success criteria

- `/faq` renders all nine questions and their full answers from `content/faq.md`.
- Question headings use `<h2>`; page title uses `<h1>`; lists inside answers render as `<ul>` / `<ol>`.
- Changes to `content/faq.md` are reflected after a rebuild (no inlined content in JSX).
- Anchor links per question (e.g., `/faq#age-divisions`) work; each question has a stable slug.
- Lighthouse accessibility ≥ 95.

## Verification steps

1. Visit `/faq`. Confirm all nine questions render with the full answer text.
2. Click a question heading's anchor if rendered; URL updates and scroll lands correctly.
3. Edit `content/faq.md` (add a sentence), rebuild, verify the change appears.
4. View source; confirm semantic heading hierarchy.

## References

- `content/faq.md` for the content.
- `PRD.md` → Functional requirements → FAQ.
- `.claude/skills/nextjs-tailwind/SKILL.md`.

## Plan mode

Skip unless the markdown rendering approach (MDX vs react-markdown) needs discussion. If so, propose one with rationale.
