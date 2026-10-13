import {
  AMICABLE_FAMILIES,
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
// « J'ai un conflit ? » leads to an amicable agreement, nothing else (feedback of 13 Oct 2026):
// the result shows, without any choice to make, the conciliation and mediation third parties meant
// for the person's conflict type. Talking directly, other recourse and the judge are explained on
// /apprendre only.

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

const isAmicableFamily = (family: ChannelFamily) =>
  (AMICABLE_FAMILIES as readonly ChannelFamily[]).includes(family)

/**
 * The solutions shown on the result: the conciliation and mediation third parties shown in the
 * simulation and meant for the chosen conflict type, conciliation first.
 */
export function solutionsFor(answers: SimulationAnswers, channels: readonly Channel[]) {
  const type = answers[CONFLICT_TYPE_STEP_ID]?.[CONFLICT_TYPE_FIELD]
  const shown = channels.filter(
    (channel) => channel.inSimulation && isAmicableFamily(channel.family),
  )
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
