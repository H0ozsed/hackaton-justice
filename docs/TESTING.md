# Testing

**Mandatory reading before writing code in this repo** (humans and AI agents), together
with [`STRUCTURE.md`](STRUCTURE.md).

**Rule: a PR that adds logic or interactive behaviour ships with its tests.** The table
below says which ones. A PR without the expected tests is not ready for review.

## Which test, when

| The change contains... | Expected test | Examples |
| --- | --- | --- |
| Pure logic: rules, scoring, state machines, data transforms | **Unit** — mandatory | orientation rules (#16), quiz scoring (#21), scenario engine (#17), step sequencing (#12), `src/lib/content.ts` |
| An interactive component: keyboard, open/close, form, feedback | **Component** | `<Definition>` (#9), multi-step form (#12), quiz UI (#21), game UI (#18), navbar |
| An API route (`src/pages/api`) | **API integration**, against the test database | from #6 on |
| A complete user journey | **E2E** + automatic accessibility scan | simulation end to end, one role-play run, navigation |
| A static page, purely visual component, content (`data.ts`) | **None** — content is already validated by `npm run content:check` | #5, legal pages |

When in doubt, ask: *"if this breaks, would anyone notice before the demo?"* If not, test it.

## Tools and where tests live

| Kind | Tool | File | Environment |
| --- | --- | --- | --- |
| Unit | Vitest | `foo.test.ts` **next to** `foo.ts` | Node |
| Component | Vitest + Testing Library | `foo.test.tsx` **next to** `foo.tsx` | happy-dom (simulated DOM) |
| API integration | Vitest | `route.int.test.ts` next to the route or service | Node + test database |
| E2E | Playwright + axe-core | `tests/e2e/<journey>.spec.ts` | real Chromium, desktop and mobile |

Config: `vitest.config.mts` (projects `unit`, `components`, `api`), `vitest.setup.ts`,
`playwright.config.ts`.

## Commands

```bash
npm test               # unit + component (Vitest, once)
npm run test:watch     # same, re-run on save
npm run test:e2e       # E2E: builds, then starts the production server on :3100 (like CI)
E2E_DEV=1 npm run test:e2e   # E2E on the dev server (faster)
npx playwright test --ui   # E2E with the interactive UI (debugging)
```

First E2E run on a machine: `npx playwright install chromium`.
(If a Chromium is already installed, `PLAYWRIGHT_CHROMIUM_PATH=/path/to/chrome` skips the download.)

A server already running on :3100 is reused: stop your own `next dev -p 3100` first, or the
tests run against it.

**Dev server on Webpack (#46)**: Next 16.4.0's Turbopack dev mode crashes some pages
(`/`, `/apprendre`) during hydration ("module factory is not available",
[vercel/next.js#99789](https://github.com/vercel/next.js/issues/99789)), so `npm run dev` runs
`next dev --webpack`, and `E2E_DEV=1` is reliable again. The default E2E run still uses the
production build (Turbopack), like CI. Switch `dev` back to plain `next dev` once a stable Next
release ships the fix (16.4.1 / 16.5).

## When tests run

- **Pre-commit** (lint-staged): `vitest related` runs only the tests related to the staged
  files. Fast; E2E are not run here.
- **CI** (`.github/workflows/ci.yml`, on every PR to `main`): lint, format, typecheck,
  `content:check`, unit + component tests, production build, E2E. A red CI blocks the merge.

## How to write them

- **Test behaviour, not implementation.** Components: query like a user does —
  `getByRole('button', { name: 'Ouvrir le menu' })`, `getByLabelText(...)` — never CSS
  classes or internal state. If an element cannot be found by role/label, it is probably not
  accessible either: fix the component.
- **Test accessibility where it matters**: `aria-expanded`, `aria-current`, focus moves,
  keyboard use (`userEvent.keyboard`), error messages announced. This is part of RGAA.
- **E2E**: every journey spec runs the axe scan (`@axe-core/playwright`, tags `wcag2a`,
  `wcag2aa`) and expects zero violations. It catches the obvious issues; it does not replace
  the manual RGAA audit (#24).
- **One behaviour per test**, named as a sentence: `it('closes the mobile menu after choosing a link')`.
- Mock only what you must (e.g. `next/router` in component tests). Never mock the code under test.
- Do not test static content or third-party libraries (zod, shadcn, Next itself).
- Test data built through the real schema (`questionSchema.parse(...)`) stays valid when
  the schema changes.

## Existing tests (examples to copy)

| File | Shows |
| --- | --- |
| `src/lib/content.test.ts` | unit tests of a helper, expected error messages |
| `src/shared/quiz/index.test.ts` | unit tests of business rules |
| `src/shared/simulation/answers.test.ts` | testing zod schemas built from config |
| `src/components/layout/site-header.test.tsx` | component test: roles, aria attributes, user clicks, mocking `next/router` |
| `tests/e2e/navigation.spec.ts` | E2E: titles, navigation desktop + mobile, keyboard, axe scan |
