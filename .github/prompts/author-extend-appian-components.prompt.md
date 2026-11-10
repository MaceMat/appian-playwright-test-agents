---
agent: playwright-test-author
description: 'Add a new reusable Appian component helper'
---

The Appian component **${input:component:e.g. editable grid / user picker / file upload}** is not supported by `src/appian/components.ts` yet.

Inspect it in the app (`${input:startPath}`) with Playwright MCP, implement a label-based helper consistent with the existing ones (including `waitForIdle`), and refactor any one-off locators in page objects to use it. Run the affected specs.
