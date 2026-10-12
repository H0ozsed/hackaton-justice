# Simulation: multi-step form engine (#12) and steps

The engine knows no content: it chains the **steps** it is given and renders a **result screen**
provided by the page. Answers stay **in memory** (no database, no `localStorage`, no network call):
reloading the page starts over.

> Current state: the `steps.ts` registry holds a **temporary** conflict type placeholder
> (`demo-conflict-type-step.tsx`, replaced by #13) followed by the real losses and frequency step
> (#14) and the real openness to discussion step (#15). The end screen is a temporary
> `TechnicalRecap`, replaced by the result of #16.

## Files

| File                          | Role                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------ |
| `simulation-form.tsx`         | `<SimulationForm steps ResultView />`: the component to put in the page        |
| `step-panel.tsx`              | One react-hook-form + zod form per step, progress, focus, errors               |
| `engine.ts`                   | Pure logic (active steps, next, back, restart), no React                       |
| `use-simulation.ts`           | Hook: in-memory state on top of the `engine.ts` functions                      |
| `form-fields.tsx`             | Accessible native HTML fields: `TextField`, `NumberField`, `RadioGroupField`   |
| `numbers.ts`                  | `parseDecimal`: "12,5", "12.5", "1 200" to a number (NaN if not a number)      |
| `step-progress.tsx`           | "Étape X sur N" indicator                                                      |
| `error-summary.tsx`           | Error summary (`role="alert"`, links to the fields)                            |
| `types.ts`                    | `SimulationStep`, `StepFieldsProps`, `SimulationAnswers`, `ResultViewProps`... |
| `steps.ts`                    | **Registry** of the steps, in the order they are asked                         |
| `conflict-type.ts`            | Contract with #13: conflict type step id and field, `getChosenConflictType`    |
| `loss-frequency.ts`           | Rules (zod) and options of the losses and frequency step (#14)                 |
| `loss-frequency-fields.tsx`   | Fields of that step: one block per declared loss kind, then the frequency      |
| `loss-frequency-step.tsx`     | `createLossFrequencyStep(conflictTypes)`: the step itself                      |
| `openness.ts`                 | Rules, options and typed reader of the openness to discussion step (#15)       |
| `openness-step.tsx`           | The openness to discussion step itself                                         |
| `demo-conflict-type-step.tsx` | TEMPORARY placeholder for the conflict type step (#13)                         |
| `technical-recap.tsx`         | Temporary result screen                                                        |
| `*.test.ts(x)`                | Unit tests (engine, numbers, rules, registry), component tests (form, step)    |

## Add a step

1. Create a step file (e.g. `openness-step.tsx`). Texts shown to users are in French:

```tsx
const schema = z.object({ open: z.enum(['yes', 'no'], { error: 'Choisissez une réponse.' }) })

function Fields() {
  return <RadioGroupField name="open" legend="Êtes-vous prêt à discuter ?" options={...} />
}

export const opennessStep: SimulationStep = {
  id: 'openness', // unique and stable: key of the answers
  title: 'Ouverture à la discussion',
  schema,
  Fields,
  // isActive?: (answers) => boolean   // absent = always asked
}
```

2. Add it to `steps.ts`. That is all: navigation, validation, progress and focus are handled.

In `Fields`, read the form with react-hook-form's `useFormContext()`, or use the fields of
`form-fields.tsx` (bound label, `fieldset`/`legend`, error linked with `aria-describedby`).
Keep the schema simple: its output is also the initial value when going back, so avoid
transformations that change the shape of the values (see "Numbers" below for the one exception).

### A step that depends on an earlier choice

`schema` can be a function of the answers of the active steps that come before, and `Fields`
receives the same answers in its `answers` prop:

```tsx
schema: (previous) => lossFrequencySchema(chosenType(previous).lossKinds),
Fields: ({ answers }) => <Blocks kinds={chosenType(answers).lossKinds} />,
```

Both only see the answers of **active steps before** the step, never an inactive one. Combine it
with `isActive` so that the step is only asked once the choice it depends on exists.

### Numbers

`NumberField` is a text input with a decimal keypad (not `type="number"`). The form keeps the
raw text; the schema turns it into a number with `z.preprocess(parseDecimal, z.number(...))`
(French comma or point, spaces as thousands separators) and gives the error messages. Zod then
outputs a number, and a number is accepted as input too, so going back shows it again.

## Contract with the conflict type step (#13)

Steps that depend on the conflict type read it from the answers (`conflict-type.ts`): the
conflict type step **must** use the id `CONFLICT_TYPE_STEP_ID` (`'conflict-type'`) and store the
chosen slug in the field `CONFLICT_TYPE_FIELD` (`'type'`). `getChosenConflictType(answers, types)`
finds the matching content entry.

## Losses and frequency step (#14)

Asked once a conflict type is chosen. It shows **only the loss kinds that conflict type declares**
(`lossKinds` of `@/shared/simulation`), each with its own UI, then the frequency (always).

| Loss kind      | Fields              | Rules                                                             |
| -------------- | ------------------- | ----------------------------------------------------------------- |
| `money`        | `money`             | number in euros, >= 0, at most 2 decimals, at most 1 000 000      |
| `time`         | `time` + `timeUnit` | number >= 0 with `hours` or `days`; at most one year in that unit |
| `health`       | `health`            | one impact level (`none` to `very-high`)                          |
| `relationship` | `relationship`      | one impact level (`none` to `very-high`)                          |
| (always)       | `frequency`         | `once`, `rarely`, `monthly`, `weekly` or `daily`                  |

- Answers only contain the declared kinds: zod drops the others (for example leftovers of a
  previously chosen conflict type, whose answers are kept as a draft but never reach the result).
- Zero is accepted: a declared loss can be nil so far. Negative, non-numeric, too many decimals and
  implausible values are refused with a message that says how to fix them.
- "Too long for its unit" involves two fields, so it is checked on the whole object with `when`,
  and shows up together with the other errors.
- The wording (labels, options, messages) is **provisional UI copy**, not legal content. It lives
  in `loss-frequency.ts` and `loss-frequency-fields.tsx` and can move to `src/shared/simulation`
  if the content team wants to own it.

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
page load), bound labels, `fieldset`/`legend` for radio buttons and loss blocks, `aria-required`
fields, errors linked to the field (`aria-invalid`, `aria-describedby`) and a `role="alert"`
summary that takes the focus, a `role="progressbar"` bar, colours from the charter tokens. This is
not a full RGAA audit (see #24).

## Result screen

The page passes `ResultView: ComponentType<{ result, onRestart }>`. `result` only contains the
answers of the active steps, keyed by step id. #16 provides the real screen.

## Tests

`npm test` runs them (see `docs/TESTING.md`): unit tests of the engine, the number parsing, the
losses and openness rules and the registry, and component tests of `SimulationForm`, of the losses
step and of the openness step (conditional blocks, refused values, kept answers, focus,
accessibility with Testing Library and axe-core). They define their own neutral steps and conflict types, and never rely on the
temporary placeholder or on the shared example content.
