---
agent: appian-test-designer
description: 'Review test-case coverage and gaps'
---

Review coverage of `${input:testCaseFile}` against `${input:analysisFile}`.

Produce a table: analysis scenario → covering test case/data row → status (covered / partially / missing). Flag duplicate rows, test cases that mix several flows, steps without verifiable expectations, and data containing real personal data. Suggest concrete fixes; apply them only if I confirm.
