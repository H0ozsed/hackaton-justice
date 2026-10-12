import { demoChoiceStep, demoTextStep } from './demo-steps'
import { opennessStep } from './openness-step'
import type { SimulationStep } from './types'

// Registry of the simulation steps, in the order they are asked.
// Adding a step = one step file + one line here (see README.md).
// For now: two TECHNICAL, temporary steps (#12), to be replaced by those of #13 and #14, then the
// real openness to discussion step (#15).
export const SIMULATION_STEPS: SimulationStep[] = [demoChoiceStep, demoTextStep, opennessStep]
