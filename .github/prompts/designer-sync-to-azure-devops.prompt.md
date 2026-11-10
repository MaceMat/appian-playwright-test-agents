---
agent: appian-test-designer
description: 'Push test cases with parameters to Azure DevOps'
---

Sync `${input:testCaseFile}` to Azure DevOps project **${input:project}**, test plan **${input:planId}**, suite **${input:suiteId}**.

Create or update one Test Case per YAML test case with steps + expected results; map data rows to test-case parameters. Write the returned work item IDs into `adoId` in the YAML. Report created/updated IDs.
