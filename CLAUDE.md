# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

Next.js 16 **Pages Router** app (`src/pages`, `@/*` alias), shadcn (radix) themed after `docs/CHARTE_GRAPHIQUE.pdf` in `src/styles/globals.css`. Shared layout (header/nav/footer, skip link) in `src/components/layout`, site name and nav links in `src/lib/site.ts`. Work is tracked in GitHub issues (milestones Phase 0/1/2).

- Dev runs in Docker: `docker compose up --build` (services `app` + `db` Postgres 18), see README.
- Commands: `npm run dev | build | lint | typecheck | format`, `npm run db:migrate | db:studio`.
- Pre-commit: Husky + lint-staged (ESLint --fix, Prettier). Prettier: no semicolons, single quotes, width 100. `docs/` is not formatted.
- RGAA matters: keep `aria-current`, a unique `<PageTitle>` and one `h1` per page.

## What this project is

"hackaton-justice" — a hackathon app to help users understand and navigate legal/justice-related conflicts, based on three user journeys described in `docs/PARCOURS_UTILISATEURS.md` (in French):

- `/` — landing page with navigation between the three journeys below, navbar, footer, practical info, FAQ, chatbot.
- `/simulation` — adaptive form flow: conflict type → loss/frequency estimation → willingness to discuss → routed to the right communication channel.
- `/mise-en-situation` — a Pokémon-like interactive scenario/demo: autonomous walkthrough, then a results summary (score %, corrections, losses), with inline definitions for difficult terms.
- `/apprendre` — learning hub: chatbot, evaluation quizzes, FAQ, practical info, glossary.

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

- `docs/CHARTE_GRAPHIQUE.pdf`, `docs/RGAA.pdf`, `docs/RGPD.pdf` — design charter and accessibility (RGAA) / data-privacy (RGPD) constraints the UI and data handling must respect.

Keep the two markdown docs in sync with any routing/feature changes made in code.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
