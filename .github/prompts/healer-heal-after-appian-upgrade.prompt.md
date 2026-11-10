---
agent: playwright-test-healer
description: 'Fix the suite after an Appian upgrade'
---

We upgraded Appian to **${input:version}**. Run the full suite and group failures by root cause.

Prefer fixing shared patterns in `src/appian/components.ts` (e.g. changed DOM of dropdowns/grids/busy indicator) over touching individual page objects. Report which fixes were global vs local.
