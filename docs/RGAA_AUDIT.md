# RGAA self-assessment

Accessibility self-assessment of the site (#24), against [`RGAA.pdf`](RGAA.pdf) (RGAA 4.1,
based on WCAG 2.1 A/AA). It is **not** an official conformity audit: it does not give a
conformity rate. The public statement is `/accessibilite` (`src/pages/accessibilite.tsx`), status
**non conforme** until a full audit of the 106 criteria is done.

Update this file when a page or a journey changes, and re-run the checks below.

## Scope and method

**Pages**: `/`, `/simulation`, `/mise-en-situation`, `/apprendre`, `/apprendre/lexique`,
`/mentions-legales`, `/confidentialite`, `/cookies`, `/accessibilite`.

**States** (not only page load): mobile menu open, FAQ answer open, IRIS chat widget open,
simulation (error state, every step, result), role-play (every scene and choice, ending, results,
definition popover), quiz (error, feedback, definition popover, score), glossary search with no
result.

| Check | How | Where |
| --- | --- | --- |
| Automatic rules (WCAG 2.1 A/AA) | axe-core on every page and every state, desktop and mobile | `tests/e2e/a11y-journeys.spec.ts`, `navigation.spec.ts`, `glossary.spec.ts` (CI) |
| Reflow and text at 200 % | no horizontal scroll at 320 / 375 / 768 / 1280 px, at 100 % and 200 % text | `tests/e2e/responsive.spec.ts` (CI, #26) |
| Keyboard | Tab through every page; focus visible on each focusable element; journeys playable with the keyboard | component tests + manual check |
| Structure | headings, landmarks, lists, page titles, `lang` | E2E + code inspection |
| Screen readers | **not done**: no NVDA / JAWS / VoiceOver test yet | to do by a human |

Result at the time of writing: **0 axe violation** in 83 states, no horizontal scroll, focus
visible everywhere.

## Results by RGAA theme

Legend: ✅ checked, no issue found · ⚠️ issue or limit · 👤 needs a human check · — not applicable

| # | Theme | Status | Notes |
| --- | --- | --- | --- |
| 1 | Images | ✅ | One informative image: the Ministère de la Justice bloc-marque of the header (#143), with its text as alternative. Icons are decorative and hidden from assistive tech (`aria-hidden`). The pixel-art role-play (stage, sprites, opening shots, choice animations, effects) is decorative SVG hidden with `aria-hidden`: the scene heading, the speech bubbles and captions (real text over the picture) and the life gauges in text carry all the information. |
| 2 | Frames | — | No `<iframe>`. |
| 3 | Colours | ✅ | Theme contrasts checked (`src/styles/globals.css`, ratios in comments): text ≥ 4.5:1, UI components ≥ 3:1, in the light and the dark theme (#132; dark pages and states scanned by `tests/e2e/dark-theme.spec.ts`). Information never by colour alone (quiz and role-play results use text + icon). axe `color-contrast` passes in every state. |
| 4 | Multimedia | ✅ | No video. Role-play animations are decorative and turned off with `prefers-reduced-motion`. Role-play 8-bit sounds are optional, off by default, switched by a "Son" button (`aria-pressed`, 4.10) and never carry information. |
| 5 | Tables | — | No data table. |
| 6 | Links | ✅ 👤 | Every link has an accessible name; links opening a new window say so ("nouvelle fenêtre"). 👤 Check that link texts make sense out of context. |
| 7 | Scripts | ✅ 👤 | Interactive components use native elements or Radix (accordion, popover, radio group, checkbox) with correct roles and states (`aria-expanded`, `aria-current`, `aria-invalid`). Status messages in live regions (glossary count, IRIS). Focus moved on new content (quiz feedback, role-play scenes, simulation errors). 👤 Check announcements with a screen reader. |
| 8 | Mandatory elements | ✅ 👤 | `lang="fr"`, unique and relevant `<title>` per page. 👤 Validate the generated HTML (W3C validator) once. |
| 9 | Structure | ✅ | One `h1` per page, no skipped heading level, landmarks (`header`, `nav`, `main`, `footer`), lists marked up as lists, glossary as a definition list. |
| 10 | Presentation | ✅ | Focus always visible (RGAA 10.7). Reflow from 320 px and text at 200 % without horizontal scroll (#26). Content readable without CSS order issues. |
| 11 | Forms | ✅ 👤 | Labels bound to fields, related fields grouped in `fieldset` + `legend` (simulation, quiz), required fields indicated, errors visible, starting with "Erreur", bound with `aria-describedby`, error summary focused (simulation). 👤 Check the error messages are clear for users. |
| 12 | Navigation | ⚠️ | Skip link first (12.7), consistent menu with current page (`aria-current`), sub-pages keep their journey current. **12.1 not met: only one navigation system** (main menu). Fix: add a site map page linked from the footer. |
| 13 | Consultation | ✅ 👤 | No time limit, no automatic redirection, no flashing content, no download. Progressive text in the role-play can be skipped ("Tout afficher") and is instant with reduced motion. The role-play scene title card is decorative, non-blocking and lasts under 2 s (not shown with reduced motion); no effect flashes more than 3 times per second. Opening captions and choice animations can be skipped ("Suivant", "Commencer"); choice animations are not played with reduced motion. 👤 IRIS answers are AI-generated: their clarity cannot be guaranteed (listed in the statement). |

## To do

- [ ] **Site map page** (`/plan-du-site`, linked from the footer) → meets 12.1 (two navigation systems)
- [ ] **Screen reader pass** (NVDA + Firefox, VoiceOver + Safari) on the 3 journeys and IRIS
- [ ] Validate the HTML of each page (W3C validator)
- [x] Fill in the publisher, date and contact of `/accessibilite`, same information as `/mentions-legales` and `/confidentialite` (#25); the site address remains to be added once the domain is known
- [ ] Full RGAA audit (106 criteria) if the site goes live, to replace "non conforme" with a real status and rate

## Re-running the checks

```bash
npm run test:e2e                                  # all E2E, including axe on every journey state
npx playwright test tests/e2e/a11y-journeys.spec.ts   # accessibility journeys only
```
