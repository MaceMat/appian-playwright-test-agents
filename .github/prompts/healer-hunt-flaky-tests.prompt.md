---
agent: playwright-test-healer
description: 'Find and fix flaky tests'
---

Run `${input:scope:tests/ or --grep @smoke}` with `--repeat-each=5 --workers=4`.

List tests that are not consistently green, find the root cause (race with Appian busy state, shared data, order dependence) and fix it without retries or longer global timeouts.
