import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';
import { storageStateFor } from './src/config/paths';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: env.isCI,
  retries: env.isCI ? 2 : 0,
  workers: env.isCI ? 2 : undefined,
  timeout: 90_000, // Appian forms are slower than typical SPAs
  expect: { timeout: 10_000 },

  reporter: env.isCI
    ? [
        ['list'],
        ['html', { open: 'never' }],
        ['junit', { outputFile: 'test-results/junit.xml' }], // published to Azure DevOps
      ]
    : [['list'], ['html', { open: 'on-failure' }]],

  use: {
    baseURL: env.baseUrl,
    actionTimeout: 15_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      // Seed tests: entry points for the agents (planner_setup_page / generator_setup_page),
      // one per role, already logged in. Also acts as a per-role login smoke test.
      name: 'seed',
      testMatch: /seeds\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'chromium',
      testIgnore: /seeds\//,
      use: { ...devices['Desktop Chrome'], storageState: storageStateFor(env.defaultRole) },
      dependencies: ['setup'],
    },
    // Enable when needed:
    // { name: 'firefox', use: { ...devices['Desktop Firefox'], storageState: storageStateFor(env.defaultRole) }, dependencies: ['setup'] },
  ],
});
