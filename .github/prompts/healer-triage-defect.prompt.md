---
agent: playwright-test-healer
description: 'Decide: test bug or app defect?'
---

Test **${input:testTitle}** fails with:

${input:error:paste error}

Determine with evidence (trace, screenshot, live app via Playwright MCP, test case + analysis files) whether this is a test problem or an application defect. If defect: write a reproducible bug report (title, steps, expected, actual, environment, evidence). Do not change the test unless it is a test problem.
