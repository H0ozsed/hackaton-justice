import { conflictTypes } from '@/shared/simulation'

import { createConflictTypeStep } from './conflict-type-step'
import { createFollowUpStep } from './follow-up-step'
import type { SimulationStep } from './types'

// Registry of the simulation steps, in the order they are asked.
// Adding a step = one step file + one line here (see README.md).
// Conflict type (#13), then its follow-up questions when it has some (#13): only what changes the
// result (the amount, for the mandatory amicable attempt of art. 750-1 CPC). The losses and the
// openness steps were removed (coherence review of 13 Oct 2026): they changed nothing. The result
// (#16) always leads to an amicable agreement (conciliation or mediation).
export const SIMULATION_STEPS: SimulationStep[] = [
  createConflictTypeStep(conflictTypes.all),
  createFollowUpStep(conflictTypes.all),
]
