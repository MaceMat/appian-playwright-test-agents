import { test } from '@playwright/test';

/**
 * Wraps a page-object action in a Playwright step so it appears (nested) in the
 * HTML report, trace viewer and Azure DevOps test results.
 * `box: true` makes failures point at the calling line in the spec, not inside the POM.
 */
export function step<T>(title: string, body: () => Promise<T>): Promise<T> {
  return test.step(title, body, { box: true });
}
