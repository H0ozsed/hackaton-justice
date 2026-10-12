import type { ConflictType } from '@/shared/simulation'

import type { SimulationAnswers } from './types'

// Contract between the step that asks the conflict type (#13) and the steps that depend on that
// choice (losses: #14, ...). The conflict type step must use this id and store the chosen slug in
// this field; the steps read it with `getChosenConflictType`.
export const CONFLICT_TYPE_STEP_ID = 'conflict-type'
export const CONFLICT_TYPE_FIELD = 'type'

/** Conflict type chosen in the answers, or undefined if none (or an unknown slug). */
export function getChosenConflictType(
  answers: SimulationAnswers,
  types: readonly ConflictType[],
): ConflictType | undefined {
  const slug = answers[CONFLICT_TYPE_STEP_ID]?.[CONFLICT_TYPE_FIELD]
  return typeof slug === 'string' ? types.find((type) => type.slug === slug) : undefined
}
