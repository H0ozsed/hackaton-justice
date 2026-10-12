# hackaton-justice

App to help people understand and handle a conflict: simulation, role-play, learning.
Specs: [`docs/CDC.md`](docs/CDC.md) and [`docs/PARCOURS_UTILISATEURS.md`](docs/PARCOURS_UTILISATEURS.md).

**Stack**: Next.js 16 · TypeScript · Tailwind CSS 4 · shadcn · lucide-react · framer-motion ·
react-hook-form + zod · Prisma 7 + PostgreSQL 18 · ESLint + Prettier · Husky + lint-staged ·
Vitest + Playwright.

## Requirements

- Node 24 and npm 12 (enforced by `devEngines`: `nvm use` reads `.nvmrc`, then `npm i -g npm@12`)
- Docker + Docker Compose
- VS Code: install the recommended extensions (prompt on opening, or `@recommended` in the Extensions tab)

## Run in dev (Docker)

Three containers: `app` (Next.js, hot reload), `db` (PostgreSQL 18) and `ollama` (local LLM for
the IRIS chatbot, see below).

```bash
cp .env.example .env     # then fill in the values
npm install              # on your machine too: Husky hooks, VS Code autocompletion
docker compose up --build
# -> http://localhost:3000
```

- Next runs: `docker compose up` · stop: `docker compose down` (database data is kept).
- After a dependency change (`package.json`): `docker compose up --build --renew-anon-volumes`.
- Command inside the container: `docker compose exec app npx prisma migrate dev`.
- The container runs as UID 1000: if `id -u` prints something else, generated files (`.next`, `src/generated`) may have permission issues.

### IRIS chatbot (Ollama)

IRIS answers from the site content only, with a model that runs locally (no external API).

- First `docker compose up`: the `ollama-models` service downloads the models (about 4 GB,
  once; they are kept in the `ollama` volume), then stops. Progress:
  `docker compose logs -f ollama-models`.
- Default models run without a GPU, on Linux and macOS: `qwen3:4b` (chat) and `bge-m3`
  (embeddings). With more RAM, set `OLLAMA_CHAT_MODEL=qwen3:8b` in `.env`.
- Ollama URL: `http://ollama:11434` from the containers, `http://localhost:11434` from your
  machine (`OLLAMA_URL` in `.env`, for `npm run dev` outside Docker).
- The site works without Ollama: IRIS then says it is unavailable.

## Run the app without Docker

```bash
npm install              # installs deps, generates the Prisma client, enables Husky hooks
cp .env.example .env     # then fill in the values
npm run db:up            # starts only PostgreSQL 18 in Docker
docker compose up -d ollama ollama-models   # optional: the IRIS chatbot
npm run db:migrate       # applies Prisma migrations
npm run dev              # http://localhost:3000
```

## Code structure

Read before coding: [`docs/STRUCTURE.md`](docs/STRUCTURE.md) and [`docs/TESTING.md`](docs/TESTING.md). To write content (glossary, FAQ, quizzes...): [`src/shared/README.md`](src/shared/README.md).

## Language

Everything is in English (code, comments, docs, commits, issues, PRs) **except the site content**
shown to users, which is in French.

## Scripts

| Script                                     | Purpose                                                                                      |
| ------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `dev` / `build` / `start`                  | Next.js                                                                                      |
| `lint`                                     | ESLint                                                                                       |
| `typecheck`                                | Generates Next route types, then `tsc` with `tsconfig.build.json` (ignores `.next/dev`)      |
| `format` / `format:check`                  | Prettier (write / check)                                                                     |
| `content:check`                            | Validates all content in `src/shared/` (also run on build and commit)                        |
| `test` / `test:watch`                      | Unit and component tests (Vitest)                                                            |
| `test:e2e`                                 | End-to-end + accessibility tests (Playwright; first time: `npx playwright install chromium`) |
| `db:up`                                    | Starts the PostgreSQL container                                                              |
| `db:migrate` / `db:studio` / `db:generate` | Prisma: migrations, web UI, typed client                                                     |

On commit, Husky runs lint-staged: ESLint `--fix`, Prettier and the tests related to the staged files. On every PR, GitHub CI runs all checks, the build and the E2E tests.

> **Known issue (#46)**: with Next 16.4.0, `npm run dev` can crash a page in the browser
> ("module factory is not available", Turbopack bug
> [vercel/next.js#99789](https://github.com/vercel/next.js/issues/99789)): today `/` and
> `/apprendre`. The production build works. To check these pages locally:
> `npm run build && npm run start`.
