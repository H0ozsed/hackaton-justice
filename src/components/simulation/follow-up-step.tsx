import type { ConflictType } from '@/shared/simulation'

import { getChosenConflictType } from './conflict-type'
import { FOLLOW_UP_STEP_ID, followUpSchema } from './follow-up'
import { FollowUpFields } from './follow-up-fields'
import type { SimulationStep, StepFieldsProps } from './types'

/**
 * Follow-up questions step (#13): the extra questions that the chosen conflict type declares
 * (`followUpQuestions`), rendered from the content. It is only asked when that conflict type has
 * some. The conflict types are a parameter so that tests can use their own; the registry passes
 * the real ones.
 */
export function createFollowUpStep(types: readonly ConflictType[]): SimulationStep {
  function Fields({ answers }: StepFieldsProps) {
    const questions = getChosenConflictType(answers, types)?.followUpQuestions ?? []
    return <FollowUpFields questions={questions} />
  }

  return {
    id: FOLLOW_UP_STEP_ID,
    title: 'Précisions sur votre situation',
    description: 'Quelques questions propres à ce type de conflit.',
    isActive: (answers) =>
      (getChosenConflictType(answers, types)?.followUpQuestions.length ?? 0) > 0,
    schema: (previous) => followUpSchema(getChosenConflictType(previous, types)),
    Fields,
  }
}
