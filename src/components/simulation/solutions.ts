import {
  CHANNEL_FAMILY_LABELS,
  type Channel,
  type ChannelFamily,
  type ConflictType,
} from '@/shared/simulation'

import { CONFLICT_TYPE_FIELD, CONFLICT_TYPE_STEP_ID } from './conflict-type'
import { FOLLOW_UP_STEP_ID } from './follow-up'
import type { SimulationAnswers } from './types'

// Solutions of the simulation result: pure functions, no React and no I/O.
//
// The result does not pick a channel for the person (coaching feedback of 13 Oct 2026): it lists
// the solutions meant for their conflict type, grouped by family (talking, conciliation,
// mediation, other recourse, the judge), each with its « C'est pour vous si… », and the person
// chooses the one that fits their situation.

const FAMILY_ORDER = Object.keys(CHANNEL_FAMILY_LABELS) as ChannelFamily[]

/** Channels meant for a conflict type (all of them when the type is unknown). */
export function channelsFor(slug: string | undefined, channels: readonly Channel[]) {
  if (slug === undefined) return [...channels]
  return channels.filter(
    (channel) => !channel.conflictTypes || channel.conflictTypes.includes(slug),
  )
}

export type SolutionGroup = { family: ChannelFamily; label: string; channels: Channel[] }

/** Channels grouped by family, in the families' order then the content's; empty families left out. */
export function groupByFamily(channels: readonly Channel[]): SolutionGroup[] {
  return FAMILY_ORDER.map((family) => ({
    family,
    label: CHANNEL_FAMILY_LABELS[family],
    channels: channels.filter((channel) => channel.family === family),
  })).filter((group) => group.channels.length > 0)
}

/** The solutions offered on the result: channels shown in the simulation, for the chosen type. */
export function solutionsFor(answers: SimulationAnswers, channels: readonly Channel[]) {
  const type = answers[CONFLICT_TYPE_STEP_ID]?.[CONFLICT_TYPE_FIELD]
  const shown = channels.filter((channel) => channel.inSimulation)
  return groupByFamily(channelsFor(typeof type === 'string' ? type : undefined, shown))
}

/** Amount given in the follow-up question "montant" of the conflict type, if any. */
function amountOf(answers: SimulationAnswers): number | undefined {
  const value = answers[FOLLOW_UP_STEP_ID]?.montant
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

/** Threshold of art. 750-1 of the code de procédure civile. */
export const MANDATORY_ATTEMPT_MAX_AMOUNT = 5000

/**
 * When the law requires an amicable attempt before going to court for this conflict type (and
 * amount): the sentence to show. Undefined otherwise.
 */
export function mandatoryAttemptNotice(
  conflictType: ConflictType | undefined,
  answers: SimulationAnswers,
): string | undefined {
  const rule = conflictType?.mandatoryAmicableAttempt
  if (!rule) return undefined
  const consequence =
    'une conciliation par un conciliateur de justice, une médiation ou une procédure participative, avant de saisir le juge. Une simple discussion ne suffit pas. Sans cette tentative, le juge peut déclarer votre demande irrecevable (article 750-1 du code de procédure civile), sauf exception (urgence, aucun conciliateur disponible dans les 3 mois…). Gardez une preuve de votre démarche.'
  if (rule === 'always')
    return `Pour ce type de litige, la loi impose une tentative amiable : ${consequence}`
  const amount = amountOf(answers)
  if (amount !== undefined && amount > MANDATORY_ATTEMPT_MAX_AMOUNT) return undefined
  const intro =
    amount === undefined
      ? 'Si vous réclamez 5 000 € ou moins, la loi impose une tentative amiable'
      : 'Pour une somme de 5 000 € ou moins, la loi impose une tentative amiable'
  return `${intro} : ${consequence}`
}
