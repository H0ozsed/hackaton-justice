# Personal data inventory (GDPR)

Inventory of the personal data the site handles (#25, data flows #103, cookie policy #126), against [`RGPD.pdf`](RGPD.pdf) (the six
GDPR principles of the CNIL). The public pages are `/confidentialite` (privacy policy),
`/cookies` (cookie policy) and `/mentions-legales` (legal notice), all linked from the footer.

**Rule: no data without a purpose.** Anything new the site collects, sends to the server or
stores in the browser is first declared in `src/shared/privacy/data.ts` (what, why, legal
basis, where, how long). Both public pages are rendered from that file, and
`src/shared/privacy/index.test.ts` fails when the code uses a storage key that is not declared,
declares one the code does not use, or sets a cookie.

## Data flows (« où transitent les données », #103)

```
Browser ──────────────────────────────────────────────────────────────── stays here
  simulation answers, quiz / game / role-play choices   (React state, lost on reload)
  IRIS conversation, role-play best score and sound             (session/localStorage, below)

Browser ──POST /api/chatbot──► Next.js server ──► Ollama (same Docker stack) ──► answer back
           question + history     IP in memory ≤ 1 min      nothing stored, nothing logged

Browser ──► third parties: nothing (no analytics, no CDN, no external AI)
```

Shown to visitors in the « Où transitent vos données » section of `/confidentialite`.

## Decisions

**Simulation answers are not stored** (#103). Statistics and "resume later" are out of scope
for the hackathon. If they are ever added, before writing any code:

- statistics: anonymised and aggregated only (counts per conflict type and channel), no
  free text, no IP, no identifier, no timestamp finer than the day;
- resume later: in the visitor's browser (`localStorage`), not in the database;
- minimum fields, a retention period (e.g. 13 months for statistics), a legal basis (legitimate
  interest), a Prisma model reviewed against this file, and an update of
  `src/shared/privacy/data.ts` (the public pages follow).

**No consent banner.** Everything stored in the browser is strictly necessary for a service the
visitor asked for, or keeps one of their preferences: exempt from consent (art. 82 of the French
data protection act, CNIL guidelines). Adding any audience measurement or third-party content
(analytics, video embed, social button) requires a consent banner, unless it is a
CNIL-exempt analytics setup, and an update of `/cookies`.

## Forms and inputs

| Where | Data | Leaves the device? | Kept |
| --- | --- | --- | --- |
| `/demarches` amicable letter (`components/amicable/letter-generator.tsx`) | sender name, recipient name, facts, request, delay | No: built, copied or printed in the browser | Until the page is left or reloaded |
| `/simulation` (`components/simulation/use-simulation.ts`) | conflict type, follow-up answers, losses, frequency | No: React state only | Until the page is left or reloaded |
| `/mise-en-situation`, quizzes, `/apprendre` games | choices, scores | No: React state only | Until the page is left, except the best role-play score in `localStorage` (below) |
| IRIS chatbot (`pages/api/chatbot.ts`) | question + conversation history | Yes: `POST /api/chatbot`, answered by the local Ollama model | Not stored, not logged (only errors are logged, without the question) |

No account, no contact form, no newsletter.

## Server

- **Database**: PostgreSQL is provisioned but `prisma/schema.prisma` has **no model**: no
  personal data is stored. Adding a model that holds visitor data requires updating the
  inventory first.
- **IP address**: kept in memory for at most one minute by the IRIS rate limiter
  (`server/domains/chatbot/rate-limit.ts`, 20 questions per minute). Never written to disk.
- **LLM**: Ollama runs in the same Docker stack. Questions are not sent to any external AI
  service.
- **Host logs**: kept one year at most by the host (service du numérique du ministère de la
  Justice, in France).

## Browser storage (cookie policy)

No cookie. The only browser storage, all exempt from consent under art. 82 of the French data
protection act (strictly necessary for a service the visitor asked for, or a preference):

| Key | Storage | Purpose | Kept |
| --- | --- | --- | --- |
| `iris-conversation` | sessionStorage | keep the IRIS conversation across pages | until the tab is closed |
| `role-play-progress` | localStorage | best score per role-play scenario | until erased |
| `role-play-sound` | localStorage | sound on/off in the role-play | until erased |

`/cookies` has a button that erases exactly these keys (`clearBrowserStorage`).

## Third parties

None: fonts are self-hosted (`src/fonts`), no analytics, no embedded video, no social buttons,
no CDN script. Outgoing links (justice.fr, service-public.fr...) are plain links.

## Publisher and contacts

Publisher, host, contact form and data protection officer (dpd@justice.gouv.fr) come from the
legal notice and privacy pages of justice.gouv.fr. They live in `PUBLISHER` (`src/lib/site.ts`),
used by `/mentions-legales`, `/confidentialite` and `/accessibilite`.

## Before going live

- [ ] Confirm with the ministry the hosting and the host's log retention (one year at most
      assumed), and add the site address once the domain is known.
