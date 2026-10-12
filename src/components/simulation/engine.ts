import type { SimulationAnswers, SimulationResult, SimulationStep, StepValues } from './types'

// =============================================================================
// Simulation form engine: pure functions, no React.
//
// Adaptive steps (chosen behaviour)
// - A step is ACTIVE when its `isActive` returns true (or when it has none). It only sees the
//   answers of the active steps that come before it: the answer of an inactive step never
//   influences the activation of another step (no cascade).
// - Active steps are recomputed whenever an answer changes. The order is the registry order;
//   the progress position and total follow from it.
// - Retention: the answer of a step that became inactive is KEPT in memory (if the person goes
//   back on their choice, their input is still there) but IGNORED: absent from the result
//   (`resolveFlow(...).effective`) and invisible to every `isActive`. `restart` clears everything.
// - If the current step is no longer active, we move to the next active one (else the last one).
// - We only complete once every active step has a validated answer.
// - Draft: when going back, the in-progress (unvalidated) input of the step being left is kept
//   apart. It never counts as an answer.
// =============================================================================

export type SimulationState = {
  /** Validated answers by step, including those of steps that became inactive. */
  answers: SimulationAnswers
  /** Raw input left behind when leaving a step with "Précédent". */
  drafts: Record<string, StepValues | undefined>
  currentStepId: string | null
  completed: boolean
  /** True after the first navigation: focus must not be stolen when the page loads. */
  navigated: boolean
}

type Flow = {
  /** Active steps, in registry order. */
  active: SimulationStep[]
  /** Answers of the active steps only. */
  effective: SimulationResult
}

/** Throws an explicit error if the registry is inconsistent (empty or duplicate id). */
export function assertValidSteps(steps: SimulationStep[]): void {
  const seen = new Set<string>()
  for (const { id } of steps) {
    if (id.trim() === '') throw new Error('Simulation: a step has an empty id.')
    if (seen.has(id)) throw new Error(`Simulation: duplicate step id "${id}".`)
    seen.add(id)
  }
}

export function resolveFlow(steps: SimulationStep[], answers: SimulationAnswers): Flow {
  const active: SimulationStep[] = []
  const effective: SimulationResult = {}
  for (const step of steps) {
    // Copy: an `isActive` cannot alter the answers seen by the following steps.
    if (step.isActive && !step.isActive({ ...effective })) continue
    active.push(step)
    const values = answers[step.id]
    if (values) effective[step.id] = values
  }
  return { active, effective }
}

/**
 * Answers of the active steps that come before `stepId`: what that step may depend on (its
 * `schema` function and its `Fields`). Never contains answers of inactive steps.
 */
export function getPreviousAnswers(
  steps: SimulationStep[],
  answers: SimulationAnswers,
  stepId: string,
): SimulationResult {
  const { active, effective } = resolveFlow(steps, answers)
  const previous: SimulationResult = {}
  for (const step of active) {
    if (step.id === stepId) break
    const values = effective[step.id]
    if (values) previous[step.id] = values
  }
  return previous
}

/**
 * Step to display: the current step if it is active, else the next active one in registry order,
 * else the last active one. `null` when no step is active.
 */
export function resolveCurrentStepId(
  steps: SimulationStep[],
  answers: SimulationAnswers,
  currentStepId: string | null,
): string | null {
  const { active } = resolveFlow(steps, answers)
  if (active.length === 0) return null
  if (currentStepId && active.some((step) => step.id === currentStepId)) return currentStepId

  const order = steps.map((step) => step.id)
  const from = currentStepId ? order.indexOf(currentStepId) : -1
  const following = active.find((step) => order.indexOf(step.id) > from)
  return (following ?? active[active.length - 1]).id
}

export function initialState(steps: SimulationStep[]): SimulationState {
  const currentStepId = resolveCurrentStepId(steps, {}, null)
  return {
    answers: {},
    drafts: {},
    currentStepId,
    completed: currentStepId === null,
    navigated: false,
  }
}

/** Records the validated values of the step and moves on (or completes). */
export function submitStep(
  steps: SimulationStep[],
  state: SimulationState,
  stepId: string,
  values: StepValues,
): SimulationState {
  const answers = { ...state.answers, [stepId]: values }
  const drafts = { ...state.drafts, [stepId]: undefined }
  const { active } = resolveFlow(steps, answers)

  const order = steps.map((step) => step.id)
  const index = active.findIndex((step) => step.id === stepId)
  const next =
    index === -1
      ? active.find((step) => order.indexOf(step.id) > order.indexOf(stepId))
      : active[index + 1]
  // Safeguard: never complete while an active step has no validated answer.
  const target = next ?? active.find((step) => !answers[step.id])

  return target
    ? { ...state, answers, drafts, currentStepId: target.id, completed: false, navigated: true }
    : { ...state, answers, drafts, currentStepId: stepId, completed: true, navigated: true }
}

/** Goes back to the previous active step, without validating, keeping the in-progress input. */
export function goBack(
  steps: SimulationStep[],
  state: SimulationState,
  draft: StepValues,
): SimulationState {
  const currentId = resolveCurrentStepId(steps, state.answers, state.currentStepId)
  const { active } = resolveFlow(steps, state.answers)
  const index = active.findIndex((step) => step.id === currentId)
  if (currentId === null || index <= 0) return state

  return {
    ...state,
    drafts: { ...state.drafts, [currentId]: draft },
    currentStepId: active[index - 1].id,
    completed: false,
    navigated: true,
  }
}

/** Clears every answer and goes back to the first active step. */
export function restart(steps: SimulationStep[]): SimulationState {
  return { ...initialState(steps), navigated: true }
}
