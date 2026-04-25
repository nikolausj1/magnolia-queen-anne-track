---
name: stop-and-ask
description: Always on. Forbids unilateral decisions on ambiguous spec points. When the PRD is silent, vague, or contradictory on a decision that affects the output, stop and ask the user instead of guessing.
---

# Stop and Ask Skill

This skill is always on. It governs how Claude Code handles ambiguity.

## The rule

If a decision you are about to make is not clearly answered by `PRD.md`, `CLAUDE.md`, the referenced standards docs, or prior session memory, stop and ask the user before proceeding. Do not guess.

The cost of asking is one question. The cost of guessing wrong is a code change, a rebuild, and potentially a site that looks or behaves differently from what the user intended.

## What counts as ambiguity

- The spec says "X or Y" without picking one.
- The spec uses fuzzy language ("something like," "appropriate," "reasonable").
- Two spec sections contradict each other.
- The spec is silent on something you need to know.
- A placeholder exists in Open Items (bracketed TBD values, `[FLAG: ...]` markers, "TBD").
- A value is "approximate" or "pending extraction" (e.g., Queen Anne red hex pending logo extraction).

## What does not count as ambiguity

- The spec is specific and you disagree with it. Follow the spec.
- The spec is specific and you think a different choice would be nicer. Follow the spec.
- The spec is specific and you want to add a small improvement. Ship the spec; propose the improvement separately.

## How to ask

One question at a time. Include three things:

1. What decision is blocked.
2. What the spec says (or does not say).
3. A short proposal with rationale, so the user can say "yes" quickly if your proposal is fine.

Example:

> The PRD says "Queen Anne exact red/black hex values (exact hex TBD)." I need a specific red for the Queen Anne badge background and text. Proposal: extract the dominant red from `public/logos/queen-anne-quicksters.png` and use that as `#C8102E`-ish, adjusted for WCAG AA on a pure black background. Good, or do you have the exact hex handy?

## What to do after the answer

- Update the PRD if the decision is one the PRD should carry.
- Add a note to `CLAUDE.md` if the decision is operational and likely to come up again.
- Continue the task.

## When the user is away

If the user is not available to answer, do not guess. Stop work on that task and move to an unblocked one. Leave a note in the current commit or a TODO comment explaining what is blocked.

## Red flags in your own work

Stop and reconsider if you find yourself thinking:

- "I'll just pick something reasonable."
- "The user probably meant X."
- "I can revisit this later."
- "It's just a small thing."
- "The PRD is close enough."

These are all ways of saying "I am about to guess." Ask instead.
