import { defineCollection } from '@/lib/content'

import { rephraseRoundsData } from './data'
import { rephraseRoundSchema, type ReplyKind } from './schema'

export type { RephraseRound, ReplyKind } from './schema'
export { replyKindSchema } from './schema'

export const rephraseRounds = defineCollection(
  'rephrase rounds',
  rephraseRoundSchema,
  rephraseRoundsData,
)

/** Tension of the conversation, from 0 (calm) to TENSION_MAX (breaking point). */
export const TENSION_MAX = 10
export const TENSION_START = 5

/** How a reply changes the tension. */
export const TENSION_CHANGE: Record<ReplyKind, number> = {
  nvc: -2,
  avoidance: 1,
  judgement: 2,
  threat: 3,
}

/** What each kind of reply does, in words (French, shown after answering). */
export const REPLY_KIND_LABELS: Record<ReplyKind, string> = {
  nvc: 'Vous décrivez les faits, ce que vous ressentez, votre besoin, et vous faites une demande précise.',
  judgement: 'C’est un jugement sur la personne : elle se sent attaquée et se défend.',
  threat: 'C’est une menace : elle ferme la discussion et fait monter la tension.',
  avoidance: 'Vous évitez le problème : il reste entier, et la frustration s’accumule.',
}

/** Tension after a reply, kept between 0 and TENSION_MAX. */
export function nextTension(tension: number, kind: ReplyKind) {
  return Math.min(TENSION_MAX, Math.max(0, tension + TENSION_CHANGE[kind]))
}
