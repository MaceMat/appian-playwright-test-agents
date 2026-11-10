---
agent: appian-test-designer
description: 'Design data-driven test cases from an analysis'
---

Design test cases from `${input:analysisFile:specs/analysis/<scope>.md}` for priorities **${input:priorities:P1,P2}**.

Merge scenarios with identical flow into one data-driven test case with several data rows. Write `specs/test-cases/<scope>.yaml` (follow the schema) and `test-data/<scope>.json`. End with the coverage table of analysis scenario IDs.
