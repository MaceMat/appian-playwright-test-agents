import { test as setup } from '@fixtures';
import { storageStateFor } from '@config/paths';
import { env } from '@config/env';

/**
 * Logs in once per role from APPIAN_ROLES with credentials from .env (local) or
 * pipeline secret variables (CI) and stores each session for reuse by tests.
 */
for (const role of env.roles) {
  setup(`authenticate as ${role}`, async ({ loginPage, appEnv, page }) => {
    await setup.step('Given the Appian login page is open', async () => {
      await loginPage.goto();
    });

    await setup.step(`When the ${role} signs in`, async () => {
      await loginPage.login(appEnv.credentials(role));
    });

    await page.context().storageState({ path: storageStateFor(role) });
  });
}
