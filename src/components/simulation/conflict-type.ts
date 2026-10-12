import type { ConflictType } from '@/shared/simulation'

import type { SimulationAnswers } from './types'

// Contract between the step that asks the conflict type (`conflict-type-step.tsx`, #13) and the
// steps that depend on that choice (follow-up questions: #13, losses: #14, ...). The conflict type
// step stores the chosen slug in this field under this id; the steps read it with
// `getChosenConflictType`.
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
