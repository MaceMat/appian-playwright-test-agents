---
agent: playwright-test-author
description: 'Create a page object for an Appian interface'
---

Create a page object for the Appian interface **${input:interface:e.g. Approve Expense task}** at `${input:startPath}` as role **${input:role}**.

Use `browser_snapshot` to list all fields/buttons, implement intent-level methods through `this.ui` (AppianComponents) wrapped in `step()`, register a fixture, and add a tiny smoke test that opens the page and asserts it is loaded.
