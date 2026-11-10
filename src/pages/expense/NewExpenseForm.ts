import { expect } from '@playwright/test';
import { AppianPage } from '../AppianPage';
import { step } from '../../utils/step';

/**
 * EXAMPLE page object for a fictional "New Expense" Appian action.
 * Shows the pattern the playwright-test-author agent follows – replace with your app.
 */
export type ExpenseInput = {
  description: string;
  category: string;
  amount: string;
  expenseDate: string;
};

export class NewExpenseForm extends AppianPage {
  protected readonly path = '/suite/sites/expenses/page/new-expense';

  async expectLoaded(): Promise<void> {
    await expect(this.ui.heading('New Expense')).toBeVisible();
  }

  async fill(data: ExpenseInput): Promise<void> {
    await step(`NewExpenseForm: fill "${data.category}" ${data.amount}`, async () => {
      await this.ui.textField('Description').fill(data.description);
      await this.ui.dropdown('Category').select(data.category);
      await this.ui.textField('Amount').fill(data.amount);
      await this.ui.dateField('Expense Date').fill(data.expenseDate);
    });
  }

  async submit(): Promise<void> {
    await step('NewExpenseForm: submit', async () => {
      await this.ui.button('Submit').click();
    });
  }

  async expectConfirmation(message: string): Promise<void> {
    await step('NewExpenseForm: confirmation shown', async () => {
      await this.ui.expectMessage(message);
    });
  }

  async expectRejected(message: string): Promise<void> {
    await step('NewExpenseForm: validation shown, form stays open', async () => {
      await this.ui.expectMessage(message);
      await this.expectLoaded();
    });
  }
}
