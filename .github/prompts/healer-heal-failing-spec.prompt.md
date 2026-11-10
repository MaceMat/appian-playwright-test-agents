---
agent: playwright-test-healer
description: 'Run and heal one spec'
---

Run `${input:spec:tests/<area>/<scope>.spec.ts}` and heal the failures.

Classify each failure (locator drift / timing / data / environment / app defect), verify in the app with Playwright MCP, fix at the lowest shared level, and re-run with `--repeat-each=3`.
