---
agent: appian-test-analyst
description: 'Re-analyse a scope after an Appian release'
---

The scope **${input:scope}** changed in the latest release. Release notes / story: ${input:changes:paste notes or ADO work item ID}.

Re-explore only the affected parts, then update `specs/analysis/<scope>.md`: mark added/changed/removed fields, rules and scenarios with `NEW`/`CHANGED`/`REMOVED`, and list which existing test cases are likely impacted.
