# hackaton-justice

App pour comprendre et gérer un conflit : simulation, mise en situation, apprentissage.
Specs : [`docs/CDC.md`](docs/CDC.md) et [`docs/PARCOURS_UTILISATEURS.md`](docs/PARCOURS_UTILISATEURS.md).

**Stack** : Next.js 16 · TypeScript · Tailwind CSS 4 · shadcn · lucide-react · framer-motion ·
react-hook-form + zod · Prisma 7 + PostgreSQL 18 · ESLint + Prettier · Husky + lint-staged.

## Prérequis

- Node 24 et npm 12 (imposés par `devEngines` : `nvm use` lit `.nvmrc`, puis `npm i -g npm@12`)
- Docker + Docker Compose
- VS Code : installer les extensions recommandées (popup à l'ouverture, ou `@recommended` dans l'onglet Extensions)

## Lancer le projet en dev (Docker)

Deux conteneurs : `app` (Next.js, hot reload) et `db` (PostgreSQL 18).

```bash
cp .env.example .env     # puis remplir les valeurs
npm install              # sur ta machine aussi : hooks Husky, autocomplétion VS Code
docker compose up --build
# -> http://localhost:3000
```

- Lancements suivants : `docker compose up` · arrêt : `docker compose down` (les données de la base sont gardées).
- Après un changement de dépendances (`package.json`) : `docker compose up --build --renew-anon-volumes`.
- Commande dans le conteneur : `docker compose exec app npx prisma migrate dev`.
- Le conteneur tourne avec l'UID 1000 : si `id -u` donne autre chose chez toi, les fichiers générés (`.next`, `src/generated`) peuvent poser des soucis de droits.

## Lancer sans Docker pour l'app

```bash
npm install              # installe les deps, génère le client Prisma, active les hooks Husky
cp .env.example .env     # puis remplir les valeurs
npm run db:up            # lance seulement PostgreSQL 18 dans Docker
npm run db:migrate       # applique les migrations Prisma
npm run dev              # http://localhost:3000
```

## Structure du code

À lire avant de coder : [`docs/STRUCTURE.md`](docs/STRUCTURE.md) et [`docs/TESTING.md`](docs/TESTING.md). Pour écrire du contenu (lexique, FAQ, quiz…) : [`src/shared/README.md`](src/shared/README.md).

## Scripts

| Script                                     | Rôle                                                                                        |
| ------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `dev` / `build` / `start`                  | Next.js                                                                                     |
| `lint`                                     | ESLint                                                                                      |
| `typecheck`                                | Génère les types de routes Next puis `tsc`                                                  |
| `format` / `format:check`                  | Prettier (écrit / vérifie)                                                                  |
| `content:check`                            | Valide tous les contenus de `src/shared/` (lancé aussi au build et au commit)               |
| `test` / `test:watch`                      | Tests unitaires et composants (Vitest)                                                      |
| `test:e2e`                                 | Tests end-to-end + accessibilité (Playwright, 1re fois : `npx playwright install chromium`) |
| `db:up`                                    | Démarre le conteneur PostgreSQL                                                             |
| `db:migrate` / `db:studio` / `db:generate` | Prisma : migrations, interface web, client typé                                             |

Au commit, Husky lance lint-staged : ESLint `--fix`, Prettier et les tests liés aux fichiers stagés. Sur chaque PR, la CI GitHub lance toutes les vérifications, le build et les tests e2e.
