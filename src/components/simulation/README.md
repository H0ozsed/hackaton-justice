# Simulation: multi-step form engine (#12)

The engine knows no content: it chains the **steps** it is given and renders a **result screen**
provided by the page. Answers stay **in memory** (no database, no `localStorage`, no network call):
reloading the page starts over.

> Current state: the `steps.ts` registry holds two **technical demo steps** (`demo-steps.tsx`, to be
> replaced by the steps of #13 and #14) and the real openness to discussion step (#15). The end
> screen is a temporary `TechnicalRecap`, replaced by the result of #16.

## Files

| File                  | Role                                                                         |
| --------------------- | ---------------------------------------------------------------------------- |
| `simulation-form.tsx` | `<SimulationForm steps ResultView />`: the component to put in the page      |
| `step-panel.tsx`      | One react-hook-form + zod form per step, progress, focus, errors             |
| `engine.ts`           | Pure logic (active steps, next, back, restart), no React                     |
| `use-simulation.ts`   | Hook: in-memory state on top of the `engine.ts` functions                    |
| `form-fields.tsx`     | Accessible native HTML fields: `TextField`, `RadioGroupField`                |
| `step-progress.tsx`   | "Étape X sur N" indicator                                                    |
| `error-summary.tsx`   | Error summary (`role="alert"`, links to the fields)                          |
| `types.ts`            | `SimulationStep`, `SimulationAnswers`, `SimulationResult`, `ResultViewProps` |
| `steps.ts`            | **Registry** of the steps, in the order they are asked                       |
| `demo-steps.tsx`      | Two temporary technical steps                                                |
| `technical-recap.tsx` | Temporary result screen                                                      |
| `openness.ts`         | Rules, options and typed reader of the openness to discussion step (#15)     |
| `openness-step.tsx`   | The openness to discussion step itself                                       |
| `*.test.ts(x)`        | Unit tests of the engine and registry, component tests of `SimulationForm`   |

## Add a step

1. Create a step file (e.g. `conflict-type-step.tsx`). Texts shown to users are in French:

```tsx
const schema = z.object({ type: z.enum(['voisinage', 'travail'], { error: 'Choisissez un type.' }) })

function Fields() {
  return <RadioGroupField name="type" legend="Quel est votre conflit ?" options={...} />
}

export const conflictTypeStep: SimulationStep = {
  id: 'conflict-type', // unique and stable: key of the answers
  title: 'Votre conflit',
  schema,
  Fields,
  // isActive?: (answers) => boolean   // absent = always asked
}
```

2. Add it to `steps.ts`. That is all: navigation, validation, progress and focus are handled.

In `Fields`, read the form with react-hook-form's `useFormContext()`, or use the fields of
`form-fields.tsx` (bound label, `fieldset`/`legend`, error linked with `aria-describedby`).
Keep the schema simple: its output is also the initial value when going back, so avoid
transformations that change the shape of the values.

## Adaptive steps: behaviour

- A step is **active** when its `isActive` returns true (or when it has none). Active steps are
  recomputed whenever an answer changes, **including while typing**: the "Étape X sur N" progress
  updates live.
- `isActive(answers)` only receives the answers of the **active steps that come before it**: not
  its own, not those of an inactive step. While typing, the value of the current step is raw (not
  yet validated): read it defensively (`answers.x?.y === 'yes'`).
- **Retention**: the answer of a step that became inactive is kept in memory (the input is found
  again if the person goes back on their choice) but **ignored**: it is not in the result and
  does not influence any `isActive`. "Recommencer" clears everything.
- If the displayed step is no longer active, we move to the next active one (else the last one).
- We only complete once **every active step** has a validated answer.
- **Going back**: the in-progress input (even invalid) of the step being left is kept as a draft
  and restored on return; a draft is never an answer.

## Openness to discussion step (#15)

Always asked, whatever the conflict type. Two required questions, as radio buttons:

| Field                | Question                                           | Values                          |
| -------------------- | -------------------------------------------------- | ------------------------------- |
| `userOpenness`       | Would you be willing to talk with the other party? | `yes`, `maybe`, `no`            |
| `otherPartyOpenness` | Do you think the other party would be?             | `yes`, `maybe`, `no`, `unknown` |

- A missing answer is refused with a message for that question. `unknown` ("Je ne sais pas") is
  only offered for the other party: the person knows their own mind.
- The result screen (#16) gets the answers under the step id `openness`. `getOpennessAnswers(result)`
  reads and types them (it returns undefined if the step was not answered).
- The wording is **provisional UI copy**, not legal content. It lives in `openness.ts` and
  `openness-step.tsx` and can move to `src/shared/simulation` if the content team wants to own it.

## Accessibility (what is in place)

A single `h1` (the page), one `h2` per step that receives the focus on every step change (never on
page load), bound labels, `fieldset`/`legend` for radio buttons, `aria-required` fields, errors
linked to the field (`aria-invalid`, `aria-describedby`) and a `role="alert"` summary that takes
the focus, a `role="progressbar"` bar, colours from the charter tokens. This is not a full RGAA
audit (see #24).

## Result screen

The page passes `ResultView: ComponentType<{ result, onRestart }>`. `result` only contains the
answers of the active steps, keyed by step id. #16 provides the real screen.

## Tests

`npm test` runs them (see `docs/TESTING.md`): unit tests of `engine.ts`, a guard on the registry
and component tests of `SimulationForm` (navigation, validation, focus, accessibility with
Testing Library and axe-core). They define their own neutral steps and never rely on the demo
steps, so replacing the demo steps does not break them.
