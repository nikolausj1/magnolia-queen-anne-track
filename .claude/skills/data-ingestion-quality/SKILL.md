---
name: data-ingestion-quality
description: Retired. The 3-tier flag / decisions-file workflow this skill described has been replaced by the simpler strict-match + log model documented in CLAUDE.md ("Ingestion run flow"). Do not invoke.
---

# Retired

This skill described a 3-tier auto-fix / flag / block taxonomy and an interactive flag-walk against a decisions JSON file. That model was retired in April 2026 in favor of a simpler approach where the xlsx is the single source of truth and ingestion runs unattended each week.

The current ingestion contract lives in `CLAUDE.md` under "Ingestion run flow". Read that, not this file.

If you find yourself wanting to add a flag-walk or a decisions file back, talk to Justin first — there's a deliberate reason it was removed.
