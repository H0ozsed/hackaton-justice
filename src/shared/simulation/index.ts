import { assertReferences, defineCollection } from '@/lib/content'

import { channelsData, conflictTypesData } from './data'
import { channelSchema, conflictTypeSchema, type LossKind } from './schema'

export type { Channel, ConflictType, LossKind, Question } from './schema'
export { lossKindSchema, questionSchema } from './schema'

export const conflictTypes = defineCollection(
  'conflict types',
  conflictTypeSchema,
  conflictTypesData,
)
export const channels = defineCollection('channels', channelSchema, channelsData)

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
  health: 'Santé',
  relationship: 'Relations',
}

export { answerSchema, followUpAnswersSchema, type FollowUpAnswers } from './answers'
