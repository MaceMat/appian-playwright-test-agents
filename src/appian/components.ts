import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Label-based helpers for Appian SAIL components.
 *
 * Appian generates ids and CSS classes, so everything here is located by
 * accessible label / role / visible text. This is the ONE place that knows how
 * Appian renders components – when an Appian upgrade changes the DOM, fix it here.
 *
 * ⚠ v0.2: verify each helper against your Appian version with the Playwright MCP
 * (`author-extend-appian-components` prompt). Lines marked VERIFY are the likely spots.
 */

// VERIFY: Appian's "Working..." indicator / busy markers in your version.
// This is the only place where a non-semantic selector is tolerated; override via env if needed.
const BUSY_SELECTOR =
  process.env.APPIAN_BUSY_SELECTOR ?? '[aria-busy="true"], .appian-indicator-message';

export class AppianComponents {
  constructor(
    private readonly page: Page,
    private readonly root: Page | Locator = page,
  ) {}

  /** Scope all helpers to a part of the screen (e.g. a section with duplicated labels). */
  within(scope: Locator): AppianComponents {
    return new AppianComponents(this.page, scope);
  }

  /** Waits until Appian finished the server round-trip and re-rendered. */
  async waitForIdle(timeout = 15_000): Promise<void> {
    await expect(this.page.locator(BUSY_SELECTOR)).toHaveCount(0, { timeout });
  }

  // ---------- layout ----------

  /** Section layout by its label. VERIFY: Appian renders labelled sections as regions/headings. */
  section(label: string): Locator {
    return this.root
      .getByRole('region', { name: label, exact: true })
      .or(this.root.locator('section').filter({ has: this.page.getByRole('heading', { name: label, exact: true }) }))
      .first();
  }

  heading(text: string): Locator {
    return this.root.getByRole('heading', { name: text, exact: true });
  }

  // ---------- inputs ----------

  /** Text, integer, decimal, paragraph and encrypted text fields. */
  textField(label: string) {
    const input = this.root.getByLabel(label, { exact: true });
    return {
      locator: input,
      fill: async (value: string) => {
        await input.fill(value);
        await input.press('Tab'); // Appian saves the value on blur
        await this.waitForIdle();
      },
    };
  }

  /** Date field. Value must already be in the Appian user's date format. */
  dateField(label: string) {
    return this.textField(label); // VERIFY: date picker input accepts typed text in your version
  }

  /** Dropdown (single select). VERIFY: combobox role + option role in your Appian version. */
  dropdown(label: string) {
    const trigger = this.root.getByRole('combobox', { name: label, exact: true }).or(this.root.getByLabel(label, { exact: true })).first();
    return {
      locator: trigger,
      select: async (option: string) => {
        await trigger.click();
        await this.page.getByRole('option', { name: option, exact: true }).click();
        await this.waitForIdle();
      },
      expectValue: async (option: string) => {
        await expect(trigger).toContainText(option);
      },
    };
  }

  radio(groupLabel: string) {
    const group = this.root.getByRole('radiogroup', { name: groupLabel, exact: true });
    return {
      locator: group,
      choose: async (option: string) => {
        await group.getByRole('radio', { name: option, exact: true }).check();
        await this.waitForIdle();
      },
    };
  }

  checkbox(label: string) {
    const box = this.root.getByRole('checkbox', { name: label, exact: true });
    return {
      locator: box,
      set: async (checked: boolean) => {
        await box.setChecked(checked);
        await this.waitForIdle();
      },
    };
  }

  // ---------- actions ----------

  button(name: string) {
    const btn = this.root.getByRole('button', { name, exact: true });
    return {
      locator: btn,
      click: async () => {
        await btn.click();
        await this.waitForIdle();
      },
    };
  }

  link(name: string) {
    const lnk = this.root.getByRole('link', { name, exact: true });
    return {
      locator: lnk,
      click: async () => {
        await lnk.click();
        await this.waitForIdle();
      },
    };
  }

  // ---------- grids ----------

  /** Read-only / editable grid by its label. VERIFY: grid label is exposed as accessible name. */
  grid(label: string) {
    const table = this.root.getByRole('table', { name: label }).or(this.root.getByRole('grid', { name: label })).first();
    return {
      locator: table,
      rows: table.getByRole('row'),
      rowWith: (text: string) => table.getByRole('row').filter({ hasText: text }),
      expectRowCount: async (count: number) => {
        // +1 for the header row
        await expect(table.getByRole('row')).toHaveCount(count + 1);
      },
    };
  }

  // ---------- messages ----------

  /** Field-level validation message, found via the field's aria-describedby. */
  async expectFieldValidation(label: string, message: string | RegExp): Promise<void> {
    const input = this.root.getByLabel(label, { exact: true });
    await expect(input).toHaveAccessibleDescription(message);
  }

  /** Form-level validation / confirmation / banner text. */
  async expectMessage(message: string | RegExp): Promise<void> {
    await expect(this.root.getByText(message).first()).toBeVisible();
  }
}
