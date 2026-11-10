// Seed for the agents: starts the browser already logged in as "approver"
// (session from tests/auth/auth.setup.ts – no credentials ever reach the agent).
// Used via planner_setup_page / generator_setup_page with { seedFile, project: 'seed' }.
import { test, expect } from '@fixtures';
import { storageStateFor } from '@config/paths';
import { env } from '@config/env';

test.use({ storageState: storageStateFor('approver') });

test('seed: approver', async ({ page }) => {
  await page.goto(env.homePath);
  await expect(page).not.toHaveURL(/login\.jsp/);
});
