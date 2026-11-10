import type { Page } from '@playwright/test';
import { AppianComponents } from '../appian/components';
import { step } from '../utils/step';

/** Base for all Appian page objects. Interact via `this.ui`, never raw Appian classes/ids. */
export abstract class AppianPage {
  /** Path relative to BASE_URL, e.g. '/suite/sites/expenses/page/my-expenses'. */
  protected abstract readonly path: string;
  readonly ui: AppianComponents;

  constructor(protected readonly page: Page) {
    this.ui = new AppianComponents(page);
  }

  async goto(): Promise<void> {
    await step(`${this.constructor.name}: open`, async () => {
      await this.page.goto(this.path);
      await this.ui.waitForIdle();
      await this.expectLoaded();
    });
  }

  /** Each page defines what "loaded" means (usually a heading or key field). */
  abstract expectLoaded(): Promise<void>;
}
