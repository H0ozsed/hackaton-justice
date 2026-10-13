# Site content

This folder holds all the static content of the site: glossary, FAQ, practical info,
conflict types, orientation channels, quizzes. **Only edit the `data.ts` files.**

Field names and comments are in English; the content itself is in French (it is what users
read on the site).

| Content                                    | File                                       |
| ------------------------------------------ | ------------------------------------------ |
| Glossary                                   | `glossary/data.ts`                         |
| FAQ                                        | `faq/data.ts`                              |
| Practical info                             | `practical-info/data.ts`                   |
| Conflict types (simulation)                | `simulation/data.ts` → `conflictTypesData` |
| Orientation channels (simulation result)   | `simulation/data.ts` → `channelsData`      |
| Quizzes                                    | `quiz/data.ts`                             |
| Role-play scenarios (`/mise-en-situation`) | `role-play/data.ts`                        |

The current entries are **examples** (prefixed `EXEMPLE`) to be replaced.

## Adding an entry

1. Copy an existing entry of the file and edit it.
2. Give it a unique `slug`: lowercase, words separated by dashes, no accents
   (`conciliateur-de-justice`). It is used to reference the entry elsewhere; do not change it
   once it is used.
3. In VS Code, autocompletion suggests the available fields and underlines in red what is
   missing or wrong (hover the underline to read the error).
4. Check with `npm run content:check`. This check also runs automatically on commit and on
   build: invalid content blocks them, with a message naming the entry and the field to fix.

## Things to know

- **References**: in the glossary (`related`) and quizzes (`glossary`), glossary terms are
  referenced by their `slug`. The referenced term must exist.
- **Conflict types**: `lossKinds` lists the losses to ask about (`money`, `time`, `health`,
  `relationship`); `followUpQuestions` adds questions specific to this type
  (`kind: 'choice'`, `'number'` or `'yesNo'`). The form adapts by itself, validation
  included. A question is required unless you set `required: false`.
- **Quizzes**: one id in `correctChoiceIds` → radio buttons; several → checkboxes.
- **Role-play scenarios**: a scenario is a set of `scenes`. Each scene has `lines` of
  dialogue (`speaker` = a character `id`, omitted for the narrator), then either `choices`
  or an `ending` (never both). Each choice says which scene comes `next`, its `quality`
  (`good`, `ok` or `bad`: 2, 1 or 0 points for the score), its `feedback` (the correction
  shown in the results) and its `losses` (`money` in €, `time` in hours, `health` and
  `relationship` in points). Every scene must be reachable from `startSceneId` and a scene
  cannot come back later in the same run (no loop): the check names the faulty scene.
  Staging, all optional (the pixel-art stage, #76): a scene can set its `location`
  (`bedroom`, `landing`, `stairwell`, `lobby`, `town-hall`, `courthouse`, `new-home`; a
  neutral room when omitted) and its `period` (`morning`, `day`, `evening`, `night`: the
  lighting). A line can set the `emotion` of its speaker (`neutral`, `happy`, `angry`,
  `sad`, `tired`, `surprised`) and an `effect` (`drums`, `knock`, `door`, `phone`,
  `paper`, `sleep`). These are decorative: the text must always say what happens. A
  character's `avatar` picks its sprite. A choice can set an `action` (`talk`, `broom`,
  `phone`, `letter`, `wait`, `agree`, `threaten`, `court`, `appointment`, `move`): a short
  animation of it plays before the next scene. A scenario can have an `opening`: shots
  (`street`, `cutaway`, `bedroom`) shown before the game, each with a caption `text`. Do not
  introduce characters there: they are discovered during the game (their `role` shows the
  first time they speak).
  To link a glossary term in a line, the intro or a feedback (not in a choice `label`), write `[[slug]]` (shows the glossary term) or
  `[[slug|texte affiché]]` (shows another spelling): `Envoyez une [[mise-en-demeure|mise en demeure]]`.
  `[[slug]]` shows the term with its glossary capital letter: in the middle of a sentence,
  give the text in lowercase.
- **FAQ**: `pages` says where the question is shown (`home` = home page, `learn` = `/apprendre`).

Technical structure of this folder: [`docs/STRUCTURE.md`](../../docs/STRUCTURE.md).
