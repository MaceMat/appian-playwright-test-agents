# AGENTS.md – rules for every AI agent in this repo

Applies to the four custom agents, Playwright's official agents, and ad-hoc Copilot chats.
Appian-specific how-to lives in the **`appian-playwright` skill** (`.github/skills/appian-playwright/`) –
load it whenever you touch page objects, specs or the component layer.

## Project
Playwright + TypeScript E2E tests for an **Appian** low-code application.

| Path | Content | Written by |
|---|---|---|
| `specs/analysis/<scope>.md` | test analysis | appian-test-analyst |
| `specs/test-cases/<scope>.yaml`, `test-data/<scope>.json` | data-driven test cases + data | appian-test-designer |
| `src/appian/` | Appian component layer + Web API client | author / healer |
| `src/pages/<area>/` | page objects (extend `AppianPage`) | author / healer |
| `src/fixtures/index.ts` | fixtures (page objects, `asRole`, `appianApi`, `appEnv`) | author |
| `tests/<area>/<scope>.spec.ts` | specs | author / healer |
| `tests/seeds/seed.<role>.spec.ts` | agent entry points, logged in per role | humans only |

## Commands
- Type-check: `npx tsc --noEmit`
- Run one spec: `npx playwright test <path> --project=chromium`
- Stability: `npx playwright test <path> --project=chromium --repeat-each=3`
- Agent drift after a Playwright upgrade: `npm run agents:drift`

## Browser sessions (agents)
- Always start the browser with `planner_setup_page` / `generator_setup_page` using
  `seedFile: "tests/seeds/seed.<role>.spec.ts"` and `project: "seed"`. You are then logged in.
- **Never** type credentials into the browser and never read/print `.env` values.

## Hard rules
- ❌ No secrets, real personal data or environment data in code, test data, commits, logs or chat.
- ❌ No `page.waitForTimeout`, `waitForLoadState('networkidle')`, `force: true`, `test.only`, XPath,
  Appian-generated ids/classes.
- ❌ Never delete, loosen or invert an assertion to make a test pass; no global timeout/retry increases.
- ❌ No locator that was not seen in a browser snapshot or the generator log.
- ✅ Specs import `test`/`expect` from `@fixtures`; page objects interact via `this.ui`; actions wrapped in `step()`.
- ✅ Every spec file starts with the traceability header (see skill → `references/spec-pattern.md`).
- ✅ Keep diffs small and scoped to the request; explain each change in one line.
