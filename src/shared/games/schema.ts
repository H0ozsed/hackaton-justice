import { z } from 'zod'

import { isUnique, slugSchema } from '@/lib/content'
import { avatarSchema, locationSchema } from '@/shared/role-play'

// Mini-games of /apprendre (night work #80).

/**
 * Kind of a reply in "Désamorcer": non-violent communication (fact, feeling, need, request),
 * a judgement of the person, a threat, or avoiding the problem.
 */
export const replyKindSchema = z.enum(['nvc', 'judgement', 'threat', 'avoidance'])
export type ReplyKind = z.infer<typeof replyKindSchema>

export const rephraseRoundSchema = z
  .object({
    slug: slugSchema,
    /** The situation, in one sentence. */
    situation: z.string().min(1),
    /** What the player feels like saying. */
    impulse: z.string().min(1),
    /** Who the player speaks to (look and place of the little scene). */
    other: avatarSchema,
    location: locationSchema.optional(),
    replies: z
      .array(z.object({ id: slugSchema, text: z.string().min(1), kind: replyKindSchema }))
      .min(2),
    /** Why the non-violent reply works, shown after answering. */
    explanation: z.string().min(1),
  })
  .refine((r) => isUnique(r.replies.map((x) => x.id)), {
    message: 'reply ids must be unique',
    path: ['replies'],
  })
  .refine((r) => r.replies.filter((x) => x.kind === 'nvc').length === 1, {
    message: 'exactly one reply must be the non-violent one',
    path: ['replies'],
  })

export type RephraseRound = z.output<typeof rephraseRoundSchema>
export type RephraseRoundInput = z.input<typeof rephraseRoundSchema>

/** The people a statement of "Qui fait quoi ?" can be about. */
export const actorSchema = z.enum(['conciliator', 'mediator', 'judge'])
export type Actor = z.infer<typeof actorSchema>

export const whoStatementSchema = z.object({
  slug: slugSchema,
  /** A sentence about "il" (the conciliator, the mediator or the judge). */
  statement: z.string().min(1),
  /** Everyone the statement is true for. */
  actors: z.array(actorSchema).min(1).refine(isUnique, 'actors must be unique'),
  explanation: z.string().min(1),
})

export type WhoStatement = z.output<typeof whoStatementSchema>
export type WhoStatementInput = z.input<typeof whoStatementSchema>
