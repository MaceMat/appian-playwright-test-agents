---
agent: appian-test-analyst
description: 'Compare behaviour across user roles'
---

For scope **${input:scope}** compare what these roles can see and do: **${input:roles:submitter, approver, viewer}**.

For each role log in, record visible sites/pages, available actions/related actions, editable vs read-only fields, and tasks received. Highlight access that looks wrong (security risk = P1). Add a *Role matrix* section and role-based scenarios to the analysis file.
