# Data-driven spec pattern

```ts
// analysis:  specs/analysis/submit-expense.md
// testCases: specs/test-cases/submit-expense.yaml#EXP-TC01,EXP-TC02
// data:      test-data/submit-expense.json#validExpenses,invalidExpenses
// seed:      tests/seeds/seed.submitter.spec.ts
import { test } from '@fixtures';
import { loadData, resolveRow, type DataRow } from '@data/loadData';

type Row = DataRow & { amount: string; expectedMessage: string };
const rows = loadData<Row>('submit-expense', 'validExpenses');   // raw → stable titles

test.describe('Submit expense', { tag: '@regression' }, () => {
  for (const raw of rows) {
    test(`EXP-TC01 [${raw.id}] submitter can submit a valid expense – ${raw.case}`, {
      tag: ['@smoke', '@data-driven'],
      annotation: [
        { type: 'testCaseId', description: 'EXP-TC01' },   // ADO id once synced
        { type: 'dataRow', description: raw.id },
      ],
    }, async ({ newExpenseForm }) => {
      const row = resolveRow(raw);                          // placeholders per run
      await test.step('Given …', async () => { … });       // 1:1 with YAML steps, same wording
      await test.step('When …', async () => { … });
      await test.step(`Then …`, async () => { … });        // ≥1 assertion
    });
  }
});
```

Rules
- Header lines are mandatory; the healer and designer use them to find the source of a test.
- One spec file per test-case file (scope); one `for` loop per data-driven test case.
- Title format: `<TC-ID> [<row.id>] <title> – <row.case>`. Never put resolved placeholders in titles.
- Non-data-driven test case (`dataSet: null`): plain `test(...)` with the same header/annotations.
- `setup: api` preconditions: create via `appianApi` inside a `Given` step and clean up in the same test
  (try/finally) or a fixture.
- Multi-role: `const approver = await asRole('approver')` and construct page objects for that page via a fixture factory.
