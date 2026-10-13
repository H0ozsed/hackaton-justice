# Repository structure

**Mandatory reading before writing code in this repo** (humans and AI agents), together
with [`TESTING.md`](TESTING.md).
The two architecture rules below are enforced by ESLint (`eslint.config.mjs`): the lint
and the pre-commit hook fail if they are broken.

## Tree

```
src/
  pages/                  Front routes (Next.js Pages Router). Thin: compose components, no logic.
    api/                  API routes. Thin: validate the request (zod) → call src/server → respond.
  components/
    ui/                   shadcn components (generated, `npx shadcn add ...`).
    layout/               Site-wide layout: header, nav, footer, skip link, <PageTitle>.
    <domain>/             UI of one domain (e.g. components/glossary/definition.tsx).
  shared/
    <domain>/             Code used by BOTH the front and the API for one domain:
      schema.ts             zod schemas + inferred types.
      data.ts               static content (edited by the content team, see src/shared/README.md).
      index.ts              PUBLIC API of the domain: validated data, getters, helpers.
  server/                 Server-only code. Never imported by the front.
    prisma.ts               Prisma client.
    domains/<domain>/       Business logic (service) + database queries (repository).
  lib/                    Generic helpers with no domain knowledge (cn, fonts, site, content).
  styles/globals.css      Tailwind + shadcn theme (from docs/CHARTE_GRAPHIQUE.pdf).
  generated/              Prisma client output. Git-ignored, never edit.
postcss.config.mjs        Tailwind CSS through PostCSS (dev on Webpack, build on Turbopack, see #46).
scripts/                  Node scripts run with tsx (e.g. check-content.ts).
tests/e2e/                Playwright end-to-end tests (unit/component tests sit next to the code).
.github/workflows/        CI (lint, types, content, tests, build, E2E on every PR).
prisma/                   Prisma schema and migrations.
docs/                     Specs (CDC, user journeys), design charter, RGAA, RGPD, this file, TESTING.md, RGAA_AUDIT.md.
```

Current domains in `src/shared/`: `home` (home page explainer, « Par où commencer ? »
orientation, « À propos » and IRIS starter questions; its texts may link glossary terms with
`[[slug]]`), `glossary`, `faq`, `practical-info`, `games` (mini-games content, e.g. the rounds of
"Désamorcer"), `amicable` (practical guides of
`/demarches`: key figures, routes compared, step-by-step guides, checklist), `simulation`
(conflict types + channels, i.e. who can help, with their legal framework; rendered by `src/components/solutions` on the result and on `/apprendre`), `quiz`, `role-play` (scenarios of `/mise-en-situation` and the
pure game engine that plays them, and the life gauges; its pixel-art stage, sprites and sounds
live in `src/components/role-play/pixel`), `chatbot` (IRIS request/stream schemas and fixed texts; its
server side is `src/server/domains/chatbot`, its route `src/pages/api/chatbot.ts`).

Test files never go in `src/pages`: Next would serve them as routes. API route tests live next
to the service they exercise (e.g. `src/server/domains/chatbot/route.int.test.ts`).

## Rule 1: the front never talks to the database

```
front (pages, components) ──fetch──► src/pages/api/* ──► src/server/domains/* ──► Prisma
```

- `src/pages/**` (except `api/`), `src/components/**`, `src/shared/**` and `src/lib/**`
  must not import `@/server/*`, `@/generated/*` or `@prisma/*`.
- Only `src/pages/api/**` and `src/server/**` may.
- API routes validate their input with the zod schema from `src/shared/<domain>` (the
  same one the front form uses): never trust the client.

## Rule 2: a domain is reached only through its index

- Outside a domain: `import { glossary } from '@/shared/glossary'`.
  Never `@/shared/glossary/data` or `@/shared/glossary/schema`.
- Inside a domain: relative imports (`./schema`, `./data`).
- A domain may use another domain through its index (e.g. `quiz` checks its glossary
  references via `@/shared/glossary`).

## Static content

Content that does not change at runtime (glossary, FAQ, practical info, conflict types,
channels, quizzes) lives in `src/shared/<domain>/data.ts`, not in the database. The front
imports it directly from the domain index; no API round-trip.

- Each collection is validated when its module loads (`defineCollection` in
  `src/lib/content.ts`): zod schema, unique `slug`s, cross-references between domains.
- `npm run content:check` loads every domain. It runs before `next build` and in the
  pre-commit hook when a file in `src/shared/` changes. Register new domains in
  `scripts/check-content.ts`.
- Entries are identified by a kebab-case `slug`. Reference other content by slug, never
  by copying its text.

## Adding something

| I want to... | Where |
| --- | --- |
| Add a page | `src/pages/<route>.tsx`, with `<PageTitle>` and exactly one `h1`. Add it to `MAIN_NAV` in `src/lib/site.ts` if it belongs in the navbar. |
| Add a content type | New `src/shared/<domain>/` with `schema.ts`, `data.ts`, `index.ts` using `defineCollection`, then register it in `scripts/check-content.ts`. |
| Add a component for a domain | `src/components/<domain>/<name>.tsx`, data from `@/shared/<domain>`. |
| Read/write the database | `src/server/domains/<domain>/`, exposed through `src/pages/api/<route>.ts`, called from the front with `fetch`. |
| Add a shadcn component | `npx shadcn@latest add <component>` → `src/components/ui/`. |

## Naming

- Files: kebab-case (`site-header.tsx`). Components: PascalCase. Code identifiers and schema
  fields: English. User-facing text: French.
- One domain = one folder name, the same everywhere (`shared/quiz`, `components/quiz`,
  `server/domains/quiz`, `pages/api/quiz`).
