---
agent: appian-test-analyst
description: 'Break the whole Appian app into analysable scopes'
---

Explore the Appian application from `${input:startPath:/suite/sites/}` as role **${input:role:submitter}** **without going deep**.

List every site → page → record type → record/related action → start-process action you can reach. Output a prioritised scope backlog table (scope, entry path, roles, business criticality, estimated complexity) to `specs/analysis/_scope-map.md`. Do not write a detailed analysis yet.
