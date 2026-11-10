# Test analysis: <Scope name>

| Item | Value |
|---|---|
| Scope | e.g. "Submit Expense Request" action |
| Entry path | `/suite/sites/expenses/page/my-expenses` |
| Roles explored | submitter, approver |
| Appian version / env | |
| Source | user story / ADO work item #… |
| Analysed on | YYYY-MM-DD |
| Status | DRAFT / REVIEWED |

## 1. Business purpose
One paragraph: what this process achieves and for whom.

## 2. Entry points
- Site page → button/action …
- Record action / related action …

## 3. Interfaces and fields
### 3.1 <Interface name>
| Label (exact) | Component | Required | Default | Rules / format | Visible / enabled when |
|---|---|---|---|---|---|
| Amount | Decimal field | yes | – | > 0, max 2 decimals, ≤ 10 000 | always |

**Data partitions** (per field): valid / invalid classes and boundaries, e.g. Amount: `0` ✗, `0.01` ✓, `10000` ✓, `10000.01` ✗, text ✗.

## 4. Validations (observed)
| Trigger | Message (exact) | Where shown |
|---|---|---|
| Submit with empty Amount | "A value is required" | under field |

## 5. Flows and outcomes
- Main flow: …
- Alternative flows / branching: …
- Outcomes: confirmation text, record status, tasks to other roles.

## 6. Role matrix
| Capability | submitter | approver | viewer |
|---|---|---|---|

## 7. Scenario inventory
| ID | Title | Type (positive/negative/role/state) | Priority | Roles | Notes |
|---|---|---|---|---|---|
| EXP-S01 | Submit valid expense | positive | P1 | submitter | |

## 8. Locator notes
- Labels that are duplicated / ambiguous on the page.
- Components without accessible name (need component-helper extension).

## 9. Risks, assumptions, questions, suspected defects
- ASSUMPTION: …
- QUESTION: …
- DEFECT?: steps / expected / actual
