import { expect } from '@playwright/test';
import { AppianPage } from './AppianPage';
import { step } from '../utils/step';
import type { Credentials } from '../config/env';

/** Standard Appian login form. VERIFY labels if your environment uses SSO / a custom login page. */
export class AppianLoginPage extends AppianPage {
  protected readonly path = '/suite/portal/login.jsp';

  async expectLoaded(): Promise<void> {
    await expect(this.ui.button('Sign In').locator).toBeVisible();
  }

  async login({ username, password }: Credentials): Promise<void> {
    // Username may appear in the report; the password never goes into a step title.
    await step(`AppianLoginPage: sign in as "${username}"`, async () => {
      await this.page.getByLabel('Username').fill(username);
      await this.page.getByLabel('Password').fill(password);
      await this.ui.button('Sign In').click();
      await expect(this.page).not.toHaveURL(/login\.jsp/);
    });
  }
}
