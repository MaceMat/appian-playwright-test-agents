import { test as base, expect, type Page } from '@playwright/test';
import { env } from '../config/env';
import { storageStateFor } from '../config/paths';
import { AppianApi } from '../appian/api';
import { AppianLoginPage } from '../pages/AppianLoginPage';
import { NewExpenseForm } from '../pages/expense/NewExpenseForm';

type Fixtures = {
  /** Validated runtime config (.env locally, pipeline variables in CI). */
  appEnv: typeof env;
  /** Appian Web API client for test-data setup/cleanup (`setup: api` preconditions). */
  appianApi: AppianApi;
  /**
   * Opens a new, already-logged-in page for another role, e.g. `const approver = await asRole('approver')`.
   * Contexts are closed automatically after the test.
   */
  asRole: (role: string) => Promise<Page>;

  // ---- page objects (default role) ----
  loginPage: AppianLoginPage;
  newExpenseForm: NewExpenseForm;
};

export const test = base.extend<Fixtures>({
  appEnv: async ({}, use) => {
    await use(env);
  },

  appianApi: async ({ request }, use) => {
    await use(new AppianApi(request));
  },

  asRole: async ({ browser }, use) => {
    const contexts: Awaited<ReturnType<typeof browser.newContext>>[] = [];
    await use(async (role: string) => {
      if (!env.roles.includes(role)) {
        throw new Error(`Role "${role}" is not in APPIAN_ROLES (${env.roles.join(', ')}).`);
      }
      const ctx = await browser.newContext({ storageState: storageStateFor(role), baseURL: env.baseUrl });
      contexts.push(ctx);
      return ctx.newPage();
    });
    await Promise.all(contexts.map((c) => c.close()));
  },

  loginPage: async ({ page }, use) => {
    await use(new AppianLoginPage(page));
  },
  newExpenseForm: async ({ page }, use) => {
    await use(new NewExpenseForm(page));
  },
});

export { expect };
