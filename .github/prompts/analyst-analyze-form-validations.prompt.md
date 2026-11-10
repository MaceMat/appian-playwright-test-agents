---
agent: appian-test-analyst
description: 'Deep-dive validations and field rules of one form'
---

Focus only on the form **${input:form:e.g. New Expense form}** at `${input:startPath}` as role **${input:role:submitter}**.

For every field determine: component type, required, format/length/range rules, default, visibility/enable dependencies. Trigger each validation (empty, invalid format, below/above boundary) and record the exact message and its location. Propose equivalence partitions and boundary values per field. Update the existing analysis file for this scope (or create one).
