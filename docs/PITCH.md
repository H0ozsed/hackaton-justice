# Pitch: arguments, demo path and Q&A

Material for the hackathon pitch (#27), prepared during the night work (#80). The analysis is in
English; the spoken script at the end is in French because it is presentation content. Figures
and sources: [`BENCHMARK.md`](BENCHMARK.md).

## The problem

- Everyday disputes (noise, an undelivered parcel, a deposit kept, money lent) poison daily life.
  Most people know only two options: put up with it, or "go to court".
- Free, fast amicable routes exist: conciliators of justice (2,888 volunteers, 189,790 requests in
  2023), mediation, consumer mediation. They are little known and misunderstood: who does what,
  is it free, who decides?
- Since 2023, the law **requires** an amicable attempt before going to court for claims of
  5,000 € or less and for neighbourhood disturbances. Without it, the claim can be declared
  inadmissible. Most people learn it too late.
- When people do go to a conciliator, they often arrive angry and unprepared: the agreement rate
  of direct requests fell from 57 % (2015) to 48 % (2023).

## Our answer, in one sentence

**A free, accessible site that orients you to the right amicable route, explains it in plain
words, and lets you practise before the real situation.**

## Three journeys, one goal

| Journey | What it does | Why it matters |
| --- | --- | --- |
| **Simulation** | A few questions → the right amicable channel for *your* dispute + "the law requires an amicable attempt" when it applies | Turns "I don't know where to go" into a next step |
| **Mise en situation** | Pixel-art role-play with levels: you suffer the trouble, you are accused of it, then you are the mediator; animated choices, life gauges, a score with corrections | People remember what they lived; seeing the other side de-escalates |
| **Apprendre** + **Démarches** | Quizzes, glossary, mini-games ("Désamorcer", "Qui fait quoi ?"), comparison of routes, step-by-step guides, checklist, amicable letter generator, IRIS chatbot | Know, compare, prepare, act |

## What makes it different (benchmark)

- Official sites **inform**, route by route; nobody **orients** from your situation or **trains**
  you. We do both, in one place.
- Practice from **three points of view**, including the mediator's. That is unique, and it is
  the heart of de-escalation.
- **Concrete tools**: a checklist and a letter that also prove the amicable attempt.
- **Accessible** (RGAA self-assessment, every state scanned), **private** (nothing sent or
  stored), **sourced** (every fact links to an official page), **frugal** (pixel art drawn in
  code, no images).

## Demo path (5 minutes)

Needs the night PRs merged (#81 to #87: simulation content, `/demarches`, levels, content, mini-games, letter).

| Time | Screen | What to show | What to say |
| --- | --- | --- | --- |
| 0:00 | `/` | The three journeys | "Three ways in, one goal: settle it without a judge." |
| 0:30 | `/simulation` | Neighbourhood conflict → result: **"Une tentative amiable est obligatoire"**, then the conciliator recommended | "In 1 minute, you know where to go, and that the law requires it." |
| 1:30 | `/mise-en-situation` | The list by level → "Le voisin du dessus": the opening shots, one bubble, **one animated choice**, the gauges, then the summary | "You live the conflict. Each choice has a cost, shown and explained." |
| 2:45 | Level 3 card | "Vous êtes le médiateur": one reformulation choice | "Then you take the mediator's seat, the best way to understand mediation." |
| 3:15 | `/demarches` | The comparison table, then **generate a letter** | "Compare, then act: the letter is also the proof of your attempt." |
| 3:50 | `/apprendre/desamorcer` | One round: the tension goes down | "Say it without attacking: the skill every conciliator wishes you had." |
| 4:20 | IRIS | "Le conciliateur est-il gratuit ?" → answer with sources | "Answers only from our sourced content, and says when it doesn't know." |
| 4:40 | Closing | — | Impact and next steps (below) |

Before the demo:
- clear the device storage (scores) or use a private window;
- keep the sound off;
- test IRIS beforehand, and keep the site usable if the model is down (it is designed for that).

## Likely questions, with answers

- **"Why not just justice.fr?"** It is the reference and we link to it everywhere. But it explains
  one route per page, in legal language, and never tells you which route fits your case or lets
  you practise. We are the step before.
- **"Can the chatbot be wrong?"** IRIS answers only from the site's content, shows its sources,
  says "I don't have this information" when nothing matches, and gives no personalised legal
  advice.
- **"Personal data?"** None is collected: the simulation and the games run in the browser, scores
  stay on the device, and the IRIS conversation stays in the tab only.
- **"Accessibility?"** RGAA self-assessment in `docs/RGAA_AUDIT.md`. Every journey state is
  scanned by axe in CI. It is keyboard-only playable and respects reduced motion; the
  decorative pixel art is hidden from screen readers.
- **"Is the legal content reliable?"** Every fact is sourced (justice.fr, service-public,
  DGCCRF, Caf, Infostat Justice). A legal proofreading is planned before going live.
- **"Who would run it?"** A natural fit for the Ministry of Justice's access-to-law network
  (CDAD, points-justice), municipalities hosting conciliators, consumer associations. Static
  content, no account, low hosting cost; scenarios are written as data, so partners can add
  their own without code.
- **"How do you measure impact?"** Without tracking individuals: anonymous counts of finished
  journeys and of clicks to conciliateurs.fr. Better still, partners could compare conciliation
  agreement rates for prepared users.

## Next steps (roadmap)

1. Legal proofreading of all content; real legal notice (#25).
2. Deployment and the demo checklist (#27).
3. More scenarios (work, family with a family mediator, co-ownership), written by partners.
4. A print-friendly letter and a downloadable "dossier" (checklist + letter).
5. Anonymous impact counters, with no personal data.

## Spoken script (French, ~1 min, for the opening)

> « Votre voisin fait du bruit tous les soirs. Le colis que vous avez payé n'est jamais arrivé.
> Que faites-vous ? La plupart d'entre nous connaissent deux options : subir, ou aller au
> tribunal. Il en existe une troisième, gratuite, rapide, où c'est vous qui décidez :
> l'amiable. En 2023, près de 190 000 personnes ont fait appel à un conciliateur de justice, et
> une sur deux a trouvé un accord. Mieux : pour un litige de moins de 5 000 euros ou un trouble
> de voisinage, la loi impose désormais de tenter l'amiable avant le juge. Le problème : presque
> personne ne le sait, et ceux qui y vont arrivent souvent sans préparation. Notre site vous
> oriente vers la bonne solution, vous l'explique simplement, et surtout vous entraîne : vous
> vivez le conflit, d'un côté, de l'autre, puis à la place du médiateur. »
