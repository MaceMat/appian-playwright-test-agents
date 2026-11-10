---
agent: appian-test-designer
description: 'Generate boundary & equivalence data rows'
---

For test case **${input:testCaseId}** in `${input:testCaseFile}` generate additional data rows using equivalence partitioning and boundary value analysis for fields **${input:fields:e.g. Amount, Date}**.

Each row needs `id`, `description` and expected outputs. Avoid redundant rows (one per partition/boundary). Append to the existing data set in `test-data/`.
