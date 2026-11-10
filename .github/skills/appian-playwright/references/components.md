# AppianComponents catalog (`src/appian/components.ts`)

| SAIL component | Helper | Example |
|---|---|---|
| Text / Integer / Decimal / Paragraph / Encrypted text | `textField(label)` | `await ui.textField('Amount').fill('45.50')` |
| Date / Date-time | `dateField(label)` | `await ui.dateField('Expense Date').fill(row.expenseDate)` |
| Dropdown (single) | `dropdown(label)` | `await ui.dropdown('Category').select('Travel')` |
| Radio buttons | `radio(groupLabel)` | `await ui.radio('Payment').choose('Card')` |
| Checkbox | `checkbox(label)` | `await ui.checkbox('I confirm').set(true)` |
| Button | `button(name)` | `await ui.button('Submit').click()` |
| Link / record link | `link(name)` | `await ui.link('EXP-0042').click()` |
| Read-only / editable grid | `grid(label)` | `await expect(ui.grid('Expenses').rowWith('Taxi')).toBeVisible()` |
| Section layout | `section(label)` + `within()` | `ui.within(ui.section('Approval')).textField('Comment')` |
| Heading / card title | `heading(text)` | `await expect(ui.heading('New Expense')).toBeVisible()` |
| Field validation | `expectFieldValidation(label, msg)` | `await ui.expectFieldValidation('Amount', 'Amount must be greater than 0')` |
| Form message / banner / confirmation | `expectMessage(msg)` | `await ui.expectMessage('Expense submitted')` |
| Busy state | `waitForIdle()` | called by every action helper |

Helpers marked `VERIFY` in the source have not yet been confirmed against your Appian version.

## Not covered yet (extend when first needed)
User/group picker, record picker, multiple dropdown, file upload, editable-grid cell editing,
rich text, tabs (button layout as tabs), wizard milestones, charts.

## Extending
1. Open the component in the app via `generator_setup_page` (seed of the right role) and `browser_snapshot`.
2. Find the accessible role/name structure; prefer `getByRole` / `getByLabel` on `this.root`.
3. Add a method returning `{ locator, <action>() }`, call `this.waitForIdle()` after state-changing actions.
4. Add the row to this catalog.
5. Replace any one-off locators for that component in page objects; run affected specs.
