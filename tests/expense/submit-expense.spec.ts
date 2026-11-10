// analysis:  specs/analysis/submit-expense.md
// testCases: specs/test-cases/_TEMPLATE.yaml#EXP-TC01,EXP-TC02
// data:      test-data/submit-expense.json#validExpenses,invalidExpenses
// seed:      tests/seeds/seed.submitter.spec.ts
//
// REFERENCE SPEC (example app) – pattern: one test per data row, steps mirror the YAML Given/When/Then.
import { test } from '@fixtures';
import { loadData, resolveRow, type DataRow } from '@data/loadData';
type ExpenseRow = DataRow & {
  description: string;
  category: string;
  amount: string;
  expenseDate: string;
  expectedMessage: string;
};

const validRows = loadData<ExpenseRow>('submit-expense', 'validExpenses');
const invalidRows = loadData<ExpenseRow>('submit-expense', 'invalidExpenses');

test.describe('Submit expense', { tag: '@regression' }, () => {
  for (const raw of validRows) {
    test(
      `EXP-TC01 [${raw.id}] submitter can submit a valid expense – ${raw.case}`,
      {
        tag: ['@smoke', '@data-driven'],
        annotation: [
          { type: 'testCaseId', description: 'EXP-TC01' }, // replace with adoId after ADO sync
          { type: 'dataRow', description: raw.id },
        ],
      },
      async ({ newExpenseForm }) => {
        const row = resolveRow(raw);

        await test.step('Given the submitter opens the "New Expense" action', async () => {
          await newExpenseForm.goto();
        });

        await test.step('When the submitter fills and submits the expense', async () => {
          await newExpenseForm.fill(row);
          await newExpenseForm.submit();
        });

        await test.step(`Then the confirmation "${row.expectedMessage}" is shown`, async () => {
          await newExpenseForm.expectConfirmation(row.expectedMessage);
        });
      },
    );
  }

  for (const raw of invalidRows) {
    test(
      `EXP-TC02 [${raw.id}] invalid expense is rejected – ${raw.case}`,
      {
        tag: ['@data-driven', '@negative'],
        annotation: [
          { type: 'testCaseId', description: 'EXP-TC02' },
          { type: 'dataRow', description: raw.id },
        ],
      },
      async ({ newExpenseForm }) => {
        const row = resolveRow(raw);

        await test.step('Given the submitter opens the "New Expense" action', async () => {
          await newExpenseForm.goto();
        });

        await test.step('When the submitter submits invalid data', async () => {
          await newExpenseForm.fill(row);
          await newExpenseForm.submit();
        });

        await test.step(`Then validation "${row.expectedMessage}" is shown and the form stays open`, async () => {
          await newExpenseForm.expectRejected(row.expectedMessage);
        });
      },
    );
  }
});

/* Multi-role example (submitter creates via API, approver acts in the UI):

test('EXP-TC05 approver sees submitted expense in task list', async ({ appianApi, asRole }) => {
  const { id } = await appianApi.createExpense({ description: 'API seeded', category: 'Travel', amount: '10' });
  const approverPage = await asRole('approver');
  ... page objects created via fixtures for approverPage ...
  await appianApi.deleteExpense(id);
});
*/
