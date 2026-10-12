import { conflictTypes } from '@/shared/simulation'

import { createDemoConflictTypeStep } from './demo-conflict-type-step'
import { createLossFrequencyStep } from './loss-frequency-step'
import { opennessStep } from './openness-step'
import type { SimulationStep } from './types'

// Registry of the simulation steps, in the order they are asked.
// Adding a step = one step file + one line here (see README.md).
// For now: a TEMPORARY conflict type placeholder (replaced by #13), then the real losses and
// frequency step (#14) and the real openness to discussion step (#15). The result (#16) comes next.
export const SIMULATION_STEPS: SimulationStep[] = [
  createDemoConflictTypeStep(conflictTypes.all),
  createLossFrequencyStep(conflictTypes.all),
  opennessStep,
]
