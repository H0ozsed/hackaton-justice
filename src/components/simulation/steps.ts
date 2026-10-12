import { conflictTypes } from '@/shared/simulation'

import { createConflictTypeStep } from './conflict-type-step'
import { createFollowUpStep } from './follow-up-step'
import { createLossFrequencyStep } from './loss-frequency-step'
import { opennessStep } from './openness-step'
import type { SimulationStep } from './types'

// Registry of the simulation steps, in the order they are asked.
// Adding a step = one step file + one line here (see README.md).
// Conflict type (#13), its follow-up questions when it has some (#13), losses and frequency (#14),
// then openness to discussion (#15). The result (#16) comes next.
export const SIMULATION_STEPS: SimulationStep[] = [
  createConflictTypeStep(conflictTypes.all),
  createFollowUpStep(conflictTypes.all),
  createLossFrequencyStep(conflictTypes.all),
  opennessStep,
]
