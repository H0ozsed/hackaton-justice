import { demoChoiceStep, demoTextStep } from './demo-steps'
import type { SimulationStep } from './types'

// Registry of the simulation steps, in the order they are asked.
// Adding a step = one step file + one line here (see README.md).
// For now: two TECHNICAL, temporary steps (#12), to be replaced by those of #13 to #15.
export const SIMULATION_STEPS: SimulationStep[] = [demoChoiceStep, demoTextStep]
