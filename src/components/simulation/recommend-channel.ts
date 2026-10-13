import type { Channel, ConflictType } from '@/shared/simulation'

import { CONFLICT_TYPE_FIELD, CONFLICT_TYPE_STEP_ID } from './conflict-type'
import { FOLLOW_UP_STEP_ID } from './follow-up'
import { getOpennessAnswers, type OpennessAnswers } from './openness'
import type { SimulationAnswers } from './types'

// Orientation rules of the simulation (#16): from the answers, which channel to recommend.
// A pure function, with no React and no I/O.
//
// These rules are PROVISIONAL: they say how the answers lean towards an amicable solution or not,
// they are not legal advice, and the team (content / legal) is expected to review and refine them.
// They are written on the ATTRIBUTES of the channels of the content (`amicable`, `contact`,
// `free`), never on their slugs, so that replacing the example channels keeps them working.
//
// Route, from the two answers of the openness step (the only answers the route depends on):
//
//   the person would not talk (no)                       -> judicial
//   the person would (yes) or might (maybe) talk, and
//     the other party seems willing (yes)                -> direct   (talk to the other party)
//     anything else (maybe, no, unknown)                 -> assisted (a neutral third party helps)
//
// A missing openness answer (the step always asks it) is read as the most prudent one: the person
// "maybe" would talk, the willingness of the other party is "unknown". Every combination of
// answers therefore leads to a route.

export type Route = 'direct' | 'assisted' | 'judicial'

export type Recommendation = {
  route: Route
  /** The recommended channel. */
  channel: Channel
  /** The other channels of the content, for "other options". */
  alternatives: Channel[]
  /** Why: what the answers say, then what the route means. */
  reasons: string[]
}

type RouteAnswers = Pick<OpennessAnswers, 'userOpenness' | 'otherPartyOpenness'>

export function routeFor(openness: RouteAnswers | undefined): Route {
  const user = openness?.userOpenness ?? 'maybe'
  const other = openness?.otherPartyOpenness ?? 'unknown'
  if (user === 'no') return 'judicial'
  return other === 'yes' ? 'direct' : 'assisted'
}

// The channels meant for fewer conflict types first (the most specific: a consumer mediator before
// the conciliator, who handles many kinds of disputes), then free channels, then content order.
const specificity = (channel: Channel) => channel.conflictTypes?.length ?? Number.POSITIVE_INFINITY
const freeFirst = (channels: Channel[]) =>
  [...channels].sort((a, b) => specificity(a) - specificity(b) || Number(b.free) - Number(a.free))

/** Channels meant for a conflict type (all of them when the type is unknown). */
export function channelsFor(slug: string | undefined, channels: readonly Channel[]) {
  if (slug === undefined) return [...channels]
  return channels.filter(
    (channel) => !channel.conflictTypes || channel.conflictTypes.includes(slug),
  )
}

/**
 * Channel for a route, chosen on the attributes of the channels:
 * - judicial: a channel where a judge decides (`amicable` is false);
 * - assisted: an amicable channel with contact details (an organisation to reach out to);
 * - direct: an amicable channel without contact details (talking to the other party).
 * When none matches, the closest one: any amicable channel, then any channel.
 */
export function pickChannel(route: Route, channels: readonly Channel[]): Channel | undefined {
  const amicable = freeFirst(channels.filter((channel) => channel.amicable))
  const pools: Record<Route, Channel[]> = {
    judicial: freeFirst(channels.filter((channel) => !channel.amicable)),
    assisted: amicable.filter((channel) => channel.contact !== undefined),
    direct: amicable.filter((channel) => channel.contact === undefined),
  }
  return pools[route][0] ?? amicable[0] ?? channels[0]
}

const USER_SENTENCES: Record<OpennessAnswers['userOpenness'], string> = {
  yes: 'Vous seriez prêt(e) à discuter avec l’autre partie.',
  maybe: 'Vous hésitez à discuter avec l’autre partie.',
  no: 'Vous ne souhaitez pas discuter avec l’autre partie.',
}

const OTHER_PARTY_SENTENCES: Record<OpennessAnswers['otherPartyOpenness'], string> = {
  yes: 'L’autre partie semble prête à discuter.',
  maybe: 'L’autre partie hésiterait à discuter.',
  no: 'L’autre partie ne semble pas prête à discuter.',
  unknown: 'Vous ne savez pas si l’autre partie est prête à discuter.',
}

const ROUTE_SENTENCES: Record<Route, string> = {
  direct:
    'Quand les deux parties sont prêtes à parler, en parler directement est la voie amiable la plus simple.',
  assisted:
    'Une discussion directe paraît difficile à engager : l’aide d’une personne neutre peut permettre de retrouver un dialogue, sans aller devant un juge.',
  judicial:
    'Sans volonté de discuter, la voie amiable a peu de chances d’aboutir : la voie judiciaire permet qu’un juge tranche.',
}

function reasonsFor(route: Route, channel: Channel, openness: OpennessAnswers | undefined) {
  const reasons: string[] = []
  if (openness) {
    reasons.push(USER_SENTENCES[openness.userOpenness])
    reasons.push(OTHER_PARTY_SENTENCES[openness.otherPartyOpenness])
  } else {
    reasons.push('Vous n’avez pas indiqué si vous seriez prêt(e) à discuter avec l’autre partie.')
  }
  reasons.push(ROUTE_SENTENCES[route])
  reasons.push(channel.free ? 'Ce canal est gratuit.' : 'Ce canal peut avoir un coût.')
  return reasons
}

/**
 * Recommends a channel from the answers of the simulation (the answers of the active steps, as the
 * result screen receives them). Total: every combination of answers leads to a recommendation, as
 * long as the content has at least one channel (otherwise there is nothing to recommend).
 */
export function recommendChannel(
  answers: SimulationAnswers,
  channels: readonly Channel[],
): Recommendation | undefined {
  const openness = getOpennessAnswers(answers)
  const route = routeFor(openness)
  const type = answers[CONFLICT_TYPE_STEP_ID]?.[CONFLICT_TYPE_FIELD]
  const relevant = channelsFor(typeof type === 'string' ? type : undefined, channels)
  const channel = pickChannel(route, relevant)
  if (!channel) return undefined

  return {
    route,
    channel,
    alternatives: relevant.filter((other) => other !== channel),
    reasons: reasonsFor(route, channel, openness),
  }
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
 * amount): the sentence to show, whatever the recommended route. Undefined otherwise.
 */
export function mandatoryAttemptNotice(
  conflictType: ConflictType | undefined,
  answers: SimulationAnswers,
): string | undefined {
  const rule = conflictType?.mandatoryAmicableAttempt
  if (!rule) return undefined
  const consequence =
    'une conciliation, une médiation ou une procédure participative, avant de saisir le juge. Sans cette tentative, le juge peut déclarer votre demande irrecevable (article 750-1 du code de procédure civile). Gardez une preuve de votre démarche.'
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
