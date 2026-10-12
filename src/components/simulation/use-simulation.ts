import { useState } from 'react'

import {
  assertValidSteps,
  goBack,
  initialState,
  resolveCurrentStepId,
  resolveFlow,
  restart,
  submitStep,
} from './engine'
import type { SimulationStep, StepValues } from './types'

// State of the simulation flow. Everything stays in memory (useState): no database, no
// localStorage, no network call. Reloading the page starts over.
export function useSimulation(steps: SimulationStep[]) {
  const [state, setState] = useState(() => {
    assertValidSteps(steps)
    return initialState(steps)
  })

  const { active, effective } = resolveFlow(steps, state.answers)
  const currentStepId = resolveCurrentStepId(steps, state.answers, state.currentStepId)
  const currentStep = active.find((step) => step.id === currentStepId) ?? null

  return {
    currentStep,
    completed: state.completed,
    /** True after the first navigation (so focus is not moved when the page loads). */
    navigated: state.navigated,
    /** Validated answers of every step (to compute the live progress). */
    answers: state.answers,
    /** Answers of the active steps only. */
    result: effective,
    /** Values shown in the step: the draft left when going back, else the answer. */
    defaultValues: currentStep
      ? (state.drafts[currentStep.id] ?? state.answers[currentStep.id])
      : undefined,
    submit: (values: StepValues) => {
      if (currentStep) setState((prev) => submitStep(steps, prev, currentStep.id, values))
    },
    back: (draft: StepValues) => setState((prev) => goBack(steps, prev, draft)),
    restart: () => setState(restart(steps)),
  }
}
