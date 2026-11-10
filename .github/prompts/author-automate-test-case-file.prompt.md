---
agent: playwright-test-author
description: 'Automate all test cases from a YAML file'
---

Automate all test cases in `${input:testCaseFile:specs/test-cases/<scope>.yaml}` using data from `test-data/`.

Verify every label in the live app with Playwright MCP first, reuse/extend page objects and the Appian component layer, write a data-driven spec, run it and `--repeat-each=3`. Report the test case → test mapping.
