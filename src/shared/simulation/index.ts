import { assertReferences, defineCollection } from '@/lib/content'

import { channelsData, conflictTypesData, freeInformationData } from './data'
import {
  channelSchema,
  conflictTypeSchema,
  freeInformationSchema,
  type ChannelFamily,
  type LossKind,
} from './schema'

export type { Channel, ChannelFamily, ConflictType, LossKind, Question } from './schema'
export { channelFamilySchema, lossKindSchema, questionSchema } from './schema'

export const conflictTypes = defineCollection(
  'conflict types',
  conflictTypeSchema,
  conflictTypesData,
)
export const channels = defineCollection('channels', channelSchema, channelsData)

export const freeInformation = freeInformationSchema.parse(freeInformationData)

assertReferences(
  'channels',
  { name: 'conflict type', has: conflictTypes.has },
  channels.all.flatMap((channel) =>
    (channel.conflictTypes ?? []).map((slug) => [`"${channel.slug}".conflictTypes`, slug] as const),
  ),
)

/** Display labels of the loss kinds (fixed list, see lossKindSchema). */
export const LOSS_KIND_LABELS: Record<LossKind, string> = {
  money: 'Argent',
  time: 'Temps',
  health: 'Bien-être',
  relationship: 'Relations',
}

/** What each loss kind measures, in one line (results of the role-play, simulation). */
export const LOSS_KIND_DESCRIPTIONS: Record<LossKind, string> = {
  money: 'Ce que le conflit coûte : frais, réparations, démarches payantes.',
  time: 'Le temps passé à cause du conflit : démarches, rendez-vous, attente.',
  health: 'Votre état personnel : stress, sommeil, fatigue, tension accumulée.',
  relationship: 'L’état de la relation avec l’autre partie et avec votre entourage.',
}

export { answerSchema, followUpAnswersSchema, type FollowUpAnswers } from './answers'

/** Display labels of the channel families, in the order they are shown. */
export const CHANNEL_FAMILY_LABELS: Record<ChannelFamily, string> = {
  dialogue: 'Se parler',
  conciliation: 'Conciliation',
  mediation: 'Médiation',
  other: 'Autres recours amiables',
  judge: 'Le juge',
}
