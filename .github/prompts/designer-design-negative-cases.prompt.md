---
agent: appian-test-designer
description: 'Design negative / validation test cases'
---

From `${input:analysisFile}` design **negative** test cases only: required fields, invalid formats, out-of-range values, forbidden role actions, invalid state transitions.

One data-driven test case per form validation flow, with exact expected messages from the analysis. If a message is missing in the analysis, list it as a gap instead of inventing it.
