---
name: appian-playwright
description: How to locate and drive Appian SAIL components in Playwright with this repo's AppianComponents layer, write Appian page objects, and build data-driven specs from the YAML test cases. Use whenever creating or fixing page objects, specs, or src/appian helpers for the Appian app.
---

# Appian + Playwright

## Why a component layer
Appian generates element ids and CSS classes (`ContentLayout---…`, `SideBySideItem---…`) that change
between deployments and versions, and re-renders parts of a form after each server round-trip.
So: locate by **visible label / role / text**, re-query instead of caching handles, and wait for
Appian to be idle after every action. All of this is encapsulated in `src/appian/components.ts`
(`this.ui` in page objects). Fix Appian DOM changes **there**, once.

## Component catalog → `references/components.md`
Which helper to use for each SAIL component, with examples.

## Writing a page object
```ts
export class ApproveExpenseTask extends AppianPage {
  protected readonly path = '/suite/tempo/tasks';          // or reached via navigation
  async expectLoaded() { await expect(this.ui.heading('Approve Expense')).toBeVisible(); }
  async approve(comment: string) {
    await step('ApproveExpenseTask: approve', async () => {
      await this.ui.textField('Comment').fill(comment);
      await this.ui.button('Approve').click();
    });
  }
}
```
- One class per interface/page; methods = business intent; no test data or assertions about the scenario outcome
  except `expect…` helpers specific to the page.
- Register as a fixture in `src/fixtures/index.ts`.
- Duplicate labels → scope: `this.ui.within(this.ui.section('Approval')).textField('Comment')`.

## Turning the generator log into page-object code
`generator_read_log` returns the Playwright code for what you did in the browser, with the locators Playwright
chose. Translate it – do not paste it:
| Log line | Write |
|---|---|
| `page.getByLabel('Amount').fill('45')` | `this.ui.textField('Amount').fill(...)` |
| `page.getByRole('combobox', { name: 'Category' }).click()` + `getByRole('option', …).click()` | `this.ui.dropdown('Category').select(...)` |
| `page.getByRole('button', { name: 'Submit' }).click()` | `this.ui.button('Submit').click()` |
| `expect(page.getByText('Expense submitted')).toBeVisible()` | `this.ui.expectMessage(...)` |
| a locator with no helper equivalent | add a helper to `components.ts` (see catalog → "Extending") |

## Data-driven specs → `references/spec-pattern.md`
Full template with traceability header, row loop, steps and annotations.

## Appian quirks checklist
- Values are saved on blur – helpers press Tab; don't bypass them with raw `fill()`.
- Dropdowns, pickers and dates are composite widgets – never `selectOption()` / plain `fill()` on them.
- Validation appears after blur or submit; assert with `expectFieldValidation(label, msg)` or `expectMessage(msg)`.
- Grids paginate – filter/search before asserting a row; never rely on row index.
- Tasks for other roles: use `asRole('<role>')` for a second logged-in page, not a re-login.
- Long processes (process model runs async): assert the user-visible result with a web-first assertion; if it can
  take longer than the default expect timeout, pass an explicit `{ timeout }` on that one assertion and comment why.
