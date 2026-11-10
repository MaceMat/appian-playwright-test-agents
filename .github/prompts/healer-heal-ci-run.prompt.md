---
agent: playwright-test-healer
description: 'Analyse failures from a CI run'
---

These tests failed in the Azure DevOps pipeline run **${input:runId}**:

${input:failures:paste failing test names + error snippets}

Reproduce locally, classify each failure, fix broken tests, and give me a defect summary for real application issues ready to paste into Azure DevOps.
