# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Mandatory reading

**Before writing or moving any code, read [`docs/STRUCTURE.md`](docs/STRUCTURE.md) and [`docs/TESTING.md`](docs/TESTING.md).**

- `docs/STRUCTURE.md`: folder layout, where each kind of code goes, and the two architecture rules enforced by ESLint (the front never imports server code / Prisma, it goes through `src/pages/api`; a domain in `src/shared/` is only imported through its `index.ts`).
- `docs/TESTING.md`: which tests a change requires (unit / component / API integration / E2E + axe), where they live, how to run them. A PR that adds logic or interactive behaviour ships with its tests.

Keep both files up to date when the structure or the testing setup changes.

## Project state

Next.js 16 **Pages Router** app (`src/pages`, `@/*` alias), shadcn (radix) themed after `docs/CHARTE_GRAPHIQUE.pdf` in `src/styles/globals.css`. Shared layout (header/nav/footer, skip link) in `src/components/layout`, site name and nav links in `src/lib/site.ts`. Work is tracked in GitHub issues (milestones Phase 0/1/2).

- Dev runs in Docker: `docker compose up --build` (services `app` + `db` Postgres 18), see README.
- Commands: `npm run dev | build | lint | typecheck | format | content:check | test | test:e2e`, `npm run db:migrate | db:studio`. Static content lives in `src/shared/<domain>/data.ts` and is validated by `content:check` (also run by `build` and pre-commit).
- Pre-commit: Husky + lint-staged (ESLint --fix, Prettier, related Vitest tests). CI (`.github/workflows/ci.yml`) runs every check + build + E2E on each PR. Prettier: no semicolons, single quotes, width 100. `docs/` is not formatted.
- Language: everything in English (code, comments, docs, commits, issues, PRs) except the site content shown to users (page text, labels, aria-labels, content in `src/shared/*/data.ts`, URLs), which is French.
- RGAA matters: keep `aria-current`, a unique `<PageTitle>` and one `h1` per page. Self-assessment and remaining work in `docs/RGAA_AUDIT.md`; every journey state is scanned by `tests/e2e/a11y-journeys.spec.ts`.

## What this project is

"hackaton-justice" — a hackathon app to help users understand and navigate legal/justice-related conflicts, based on three user journeys described in `docs/PARCOURS_UTILISATEURS.md` (in French):

- `/` — landing page: explainer, « Par où commencer ? » to the three journeys below, about, links to the FAQ and practical info of `/apprendre`, chatbot.
- `/simulation` — « J’ai un conflit ? »: introduction screen, then the conflict type (and the amount at stake when it matters) → the conciliation and mediation third parties adapted to that conflict type, all shown with nothing to choose: for each, the essentials (who, how to reach, cost, value of the agreement), then what the law says.
- `/mise-en-situation` — a Pokémon-like interactive scenario/demo: autonomous walkthrough, then a results summary (score %, corrections, losses), with inline definitions for difficult terms.
- `/apprendre` — the one page that explains the amicable routes (it absorbed `/demarches`, which redirects to it): a four-step path (understand, who can help and how, test yourself, go further) with the mandatory attempt, the single comparison of the routes, key figures, every conciliator and mediator (law first), step-by-step guides, preparation checklist, quizzes, mini-games, glossary, FAQ, practical info; chatbot.

## Planned stack

Defined in `docs/CDC.md`:

- **Framework**: Next.js 16, TypeScript
- **Styling/UI**: Tailwind CSS, shadcn, lucide-react, framer-motion
- **Forms/validation**: react-hook-form + zod
- **Formatting**: prettier
- **Data**: Prisma ORM + PostgreSQL 18

When scaffolding, use these choices rather than substituting alternatives (e.g. don't swap in a different ORM, form lib, or CSS approach).

## Docs

- `docs/CDC.md` — cahier des charges (spec): stack and feature overview.
- `docs/PARCOURS_UTILISATEURS.md` — detailed user journeys per route, the source of truth for expected pages/flows.
- `docs/BENCHMARK.md` — existing services for amicable settlement, what they miss, our angle, sourced key figures.
- `docs/PRIVACY.md` — GDPR inventory of the data the site handles; new data is declared in `src/shared/privacy/data.ts` first.
- `docs/PITCH.md` — pitch arguments, 5-minute demo path, likely questions with answers, roadmap.

- `docs/CHARTE_GRAPHIQUE.pdf`, `docs/RGAA.pdf`, `docs/RGPD.pdf` — design charter and accessibility (RGAA) / data-privacy (RGPD) constraints the UI and data handling must respect.

Keep the two markdown docs in sync with any routing/feature changes made in code.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
