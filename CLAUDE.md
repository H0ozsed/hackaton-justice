# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

This repository currently contains **only planning documentation** — no application code, `package.json`, or build tooling exists yet. Before running any build/lint/test command, check whether the scaffolding has since been created; if not, scaffolding the app (per the stack below) is likely the actual task.

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
