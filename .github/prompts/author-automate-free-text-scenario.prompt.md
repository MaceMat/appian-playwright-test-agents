---
agent: playwright-test-author
description: 'Automate a quick scenario without a YAML file'
---

Automate this scenario as role **${input:role:submitter}** starting at `${input:startPath}`:

${input:scenario:describe the steps and expected result}

State your assumptions first, verify the flow with Playwright MCP, then write the spec with Given/When/Then steps. Suggest how it should be captured in `specs/test-cases/` afterwards.
