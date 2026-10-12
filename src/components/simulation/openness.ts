import { z } from 'zod'

import type { SimulationAnswers } from './types'

// Rules of the "openness to discussion" step (#15): is the person willing to talk with the other
// party, and does the person think the other party is? These two answers are what the result (#16)
// uses to lean towards an amicable solution or not.
//
// Wording below is PROVISIONAL UI copy (no legal content). If the content team wants to own it,
// it can move to `src/shared/simulation` later.
//
// Answers:
//   userOpenness        'yes' | 'maybe' | 'no'
//   otherPartyOpenness  'yes' | 'maybe' | 'no' | 'unknown'  (the person may not know)

export const OPENNESS_STEP_ID = 'openness'

const USER_VALUES = ['yes', 'maybe', 'no'] as const
const OTHER_PARTY_VALUES = [...USER_VALUES, 'unknown'] as const

type UserValue = (typeof USER_VALUES)[number]
type OtherPartyValue = (typeof OTHER_PARTY_VALUES)[number]

// Records, not lists of labels: adding a value without its label does not compile.
const USER_LABELS: Record<UserValue, string> = {
  yes: 'Oui',
  maybe: 'Peut-être, cela dépend',
  no: 'Non',
}

const OTHER_PARTY_LABELS: Record<OtherPartyValue, string> = {
  ...USER_LABELS,
  unknown: 'Je ne sais pas',
}

export const USER_OPENNESS_OPTIONS = USER_VALUES.map((value) => ({
  value,
  label: USER_LABELS[value],
}))

export const OTHER_PARTY_OPENNESS_OPTIONS = OTHER_PARTY_VALUES.map((value) => ({
  value,
  label: OTHER_PARTY_LABELS[value],
}))

export const opennessSchema = z.object({
  userOpenness: z.enum(USER_VALUES, {
    error: 'Indiquez si vous seriez prêt(e) à discuter avec l’autre partie.',
  }),
  otherPartyOpenness: z.enum(OTHER_PARTY_VALUES, {
    error:
      'Indiquez si l’autre partie vous semble prête à discuter, ou répondez « Je ne sais pas ».',
  }),
})

export type OpennessAnswers = z.output<typeof opennessSchema>

/**
 * Typed answers of this step, read from the answers the result screen receives. Undefined if the
 * step was not answered (it is always asked, so this only happens before it is completed).
 */
export function getOpennessAnswers(answers: SimulationAnswers): OpennessAnswers | undefined {
  const parsed = opennessSchema.safeParse(answers[OPENNESS_STEP_ID])
  return parsed.success ? parsed.data : undefined
}
