# Hackaton Justice: settle everyday disputes without a judge

> A free, accessible web app that **orients** people in an everyday dispute towards the right
> amicable solution (conciliation, mediation), **explains** it in plain words, and lets them
> **practise** the conversation before the real one.
> Built during a hackathon (12–13 October 2026) by a team of five.

The site is in French: it is written for French citizens and follows the French state's design
charter, accessibility standard (RGAA) and data protection rules (RGPD).

---

## Why we built it

A neighbour who plays the drums every night. A parcel paid for and never delivered. A deposit
the landlord keeps. Most people know only two options: **put up with it, or go to court**.

There is a third one, free, fast, where the people involved decide: **the amicable route**.

- **Conciliators of justice** are free volunteers. In 2023, about **190,000 requests** went to
  them, and about one in two ended with an agreement.
- **Since 2023, the law requires an amicable attempt** before going to court for claims of
  5,000 € or less and for neighbourhood disturbances. Without it, the judge can declare the
  claim _irrecevable_ (inadmissible). Most people learn this too late.
- When people do meet a conciliator, they often arrive angry and unprepared. The agreement rate
  of direct requests fell from 57 % (2015) to 48 % (2023).

Official sites (justice.fr, service-public.gouv.fr) **inform**, one route per page, in legal
language. Nobody **orients** you from your own situation, and nobody **trains** you for the
conversation. That is the gap we wanted to fill.
Benchmark and sources: [`docs/BENCHMARK.md`](docs/BENCHMARK.md).

## What it does

Three journeys, one goal: settle the dispute without a judge.

| Journey                                          | What the user does                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **« J’ai un conflit ? »** (`/simulation`)        | Answers a few questions about the dispute and gets the conciliation and mediation options that fit it: who they are, how to reach them, what they cost, what the agreement is worth. The page also says when the law requires an amicable attempt.                                                                                                                                     |
| **« Mise en situation »** (`/mise-en-situation`) | Plays a Pokémon-style, pixel-art role-play: a noisy neighbour, a phantom parcel, a kept deposit, a family holiday dispute. Every choice has a visible cost (well-being, relationship, money, time). The results give a score, the corrections and what was lost. Levels change the point of view: first you suffer the trouble, then you are accused of it, then you are the mediator. |
| **« Apprendre »** (`/apprendre`)                 | A four-step path: understand the amicable route, compare it with going to court, find who can help (law first), then test yourself. It includes quizzes, mini-games (« Désamorcer », « Qui fait quoi ? »), a glossary, an FAQ and practical info.                                                                                                                                      |

Across the whole site:

- **IRIS**, an assistant that answers **only from the site's sourced content** with a local LLM
  (Ollama, no external API). It shows its sources and says when it does not know.
- **Difficult legal words** (_mise en demeure_, _homologation_…) open their definition in place
  and link to the glossary.
- **Accessible**: keyboard-only playable, screen-reader friendly, respects reduced motion,
  dark theme. Every journey state is scanned by axe in CI. RGAA self-assessment:
  [`docs/RGAA_AUDIT.md`](docs/RGAA_AUDIT.md).
- **Private**: no account, nothing sent. The simulation and the games run in the browser. Data
  inventory: [`docs/PRIVACY.md`](docs/PRIVACY.md).
- **Sourced**: every legal fact links to an official page (justice.fr, service-public, DGCCRF,
  Caf).
- **Frugal**: the pixel art is drawn in code, so the game needs no image assets.

## How we worked

- **Specs first.** We wrote the user journeys ([`docs/PARCOURS_UTILISATEURS.md`](docs/PARCOURS_UTILISATEURS.md)),
  the stack ([`docs/CDC.md`](docs/CDC.md)) and an architecture shared by everyone
  ([`docs/STRUCTURE.md`](docs/STRUCTURE.md)), then split the work into **80+ GitHub issues**
  across three milestones.
- **One PR per issue**, reviewed and merged by the team. CI checks every PR: lint, types,
  content, unit, component and end-to-end tests, and an accessibility scan.
- **Content as data.** Glossary, FAQ, quizzes and role-play scenarios live in typed, validated
  files (`src/shared/*/data.ts`). The content team edits them without touching the UI, and an
  invalid scenario (dead end, loop, unknown glossary term) fails the build.
- **Coaching by conciliators and mediators** on day two. Their feedback became issues (who pays,
  the value of an agreement, words that make a conflict worse…), then fixes before the pitch.
- **AI-assisted development**: each of us paired with Claude Code. It wrote code and tests
  under our direction; we kept the decisions, the reviews and the merges.

## My contribution

I ([@H0ozsed](https://github.com/H0ozsed)) owned the **« Mise en situation »** journey's
foundations, plus shared components and tooling:

- **Scenario format and game engine.**
  - A zod schema describes a scenario: characters, scenes, choices with their quality, feedback
    and losses.
  - Checks run when the content loads: unknown scenes, unreachable scenes and loops are
    rejected, so **every run is guaranteed to reach an ending**.
  - The engine is a pure reducer, unit-tested on every path of every scenario.
- **Game interface.**
  - A dialogue box with skippable progressive text, choices as real buttons and focus moved to
    each new scene.
  - Lines are announced to screen readers, and animations stop when the user prefers reduced
    motion.
- **Results screen.** It is computed only from the choice history: score, corrections with the
  better choice, total losses.
- **The first demo scenario**, « Le voisin du dessus », with its glossary terms.
- **`<Definition>`**, the accessible popover for difficult terms, used across the site.
- **The `/apprendre` hub**: its first version, assembling quizzes, glossary, FAQ and practical
  info.
- **Tooling and reliability.**
  - Fixed `typecheck` and `build` failing after a dev run.
  - Diagnosed a Next.js 16.4 Turbopack dev-mode crash, a known upstream bug
    ([vercel/next.js#99789](https://github.com/vercel/next.js/issues/99789)), and made the local
    end-to-end tests run on the production build.
  - Fixed flaky accessibility scans that caught text in the middle of an animation.

The pixel-art stage, the levels and the later scenarios were then built on top of this engine
by [@nathaniel-ep](https://github.com/nathaniel-ep).

## Team

|                                                      |                                                                                                                                  |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| [@nathaniel-ep](https://github.com/nathaniel-ep)     | Foundations (layout, Docker, content format), pixel-art stage, levels and scenarios, mini-games, real content, coaching feedback |
| [@aurelien-loyer](https://github.com/aurelien-loyer) | Home page, IRIS assistant (Ollama), dark theme, Ministry of Justice branding                                                     |
| [@Jsamuel79](https://github.com/Jsamuel79)           | « J’ai un conflit ? » simulation                                                                                                 |
| [@Infamous97440](https://github.com/Infamous97440)   | Legal notice, privacy and cookie policies (GDPR)                                                                                 |
| [@H0ozsed](https://github.com/H0ozsed)               | Role-play engine, UI and results, `<Definition>`, learning hub, tooling                                                          |

## Tech stack

Next.js 16 (Pages Router) · TypeScript · Tailwind CSS 4 · shadcn/ui (Radix) · lucide-react ·
framer-motion · react-hook-form + zod · Prisma 7 + PostgreSQL 18 · Ollama (local LLM) ·
Vitest + Testing Library · Playwright + axe-core · ESLint + Prettier · Husky · GitHub Actions ·
Docker.

## Run it locally

Requirements: Node 24, npm 12, Docker.

```bash
cp .env.example .env
npm install
docker compose up --build      # app + PostgreSQL + Ollama (IRIS)
# -> http://localhost:3000
```

The first start downloads the IRIS models (about 4 GB, once). The site works without them; IRIS
then says it is unavailable.

| Command                                        | Purpose                                                                                                                  |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `npm run dev`                                  | Dev server (Webpack: Turbopack dev crashes in Next 16.4.0, see [#99789](https://github.com/vercel/next.js/issues/99789)) |
| `npm run build` / `start`                      | Production build and server                                                                                              |
| `npm test`                                     | Unit and component tests (Vitest)                                                                                        |
| `npm run test:e2e`                             | End-to-end and accessibility tests (Playwright; first time: `npx playwright install chromium`)                           |
| `npm run lint` / `typecheck` / `content:check` | Static checks; `content:check` validates all the site content                                                            |

To work on the code: [`docs/STRUCTURE.md`](docs/STRUCTURE.md) (architecture),
[`docs/TESTING.md`](docs/TESTING.md) (tests), [`src/shared/README.md`](src/shared/README.md)
(writing content).

## Status and limits

- **Hackathon prototype, not a public service.** The legal content is sourced but has not yet
  been proofread by a lawyer.
- The site informs and orients. It gives no personalised legal advice and files nothing on
  anyone's behalf.
- Pitch material, demo path and roadmap: [`docs/PITCH.md`](docs/PITCH.md).

## License

[MIT](LICENSE). © 2026 Aurélien Loyer and the hackaton-justice team.
