---
agent: appian-test-analyst
description: 'Full test analysis of one Appian process/action'
---

Analyse the Appian scope **${input:scope:e.g. Submit Expense Request action}** starting at `${input:startPath:/suite/sites/...}` as role **${input:role:submitter}**.

Cover entry points, every form field (component type, required, conditions), validations, branching, outcomes and role differences. Do not submit irreversible actions. Write the result to `specs/analysis/` using the template and include the scenario inventory with priorities.
