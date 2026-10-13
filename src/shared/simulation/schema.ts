import { z } from 'zod'

import { isUnique, slugSchema } from '@/lib/content'

// ---- Adaptive questions -----------------------------------------------------
// A conflict type declares its own follow-up questions: the form engine (#12)
// renders them from this config, so new types need no code. `kind` is the
// discriminant: it tells which other fields the question has.

const questionBase = {
  /** Unique inside its conflict type; key of the answer. */
  id: slugSchema,
  label: z.string().min(1),
  /** Optional help text under the field. */
  help: z.string().min(1).optional(),
  /** false: the user may skip it. */
  required: z.boolean().default(true),
}

const choiceOptionSchema = z.object({ value: slugSchema, label: z.string().min(1) })

export const questionSchema = z.discriminatedUnion('kind', [
  z.object({
    ...questionBase,
    kind: z.literal('choice'),
    options: z
      .array(choiceOptionSchema)
      .min(2)
      .refine((o) => isUnique(o.map((x) => x.value)), 'option values must be unique'),
    /** true: several options can be picked (checkboxes), false: one (radios). */
    multiple: z.boolean().default(false),
  }),
  z
    .object({
      ...questionBase,
      kind: z.literal('number'),
      unit: z.string().min(1).optional(),
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .refine((q) => q.min === undefined || q.max === undefined || q.min <= q.max, {
      message: 'min must be <= max',
      path: ['min'],
    }),
  z.object({ ...questionBase, kind: z.literal('yesNo') }),
])

export type Question = z.output<typeof questionSchema>

// ---- Conflict types -----------------------------------------------------------

/** Kinds of loss the "losses" step can ask about. Fixed list: each one has its own UI. */
export const lossKindSchema = z.enum(['money', 'time', 'health', 'relationship'])
export type LossKind = z.infer<typeof lossKindSchema>

export const conflictTypeSchema = z.object({
  slug: slugSchema,
  label: z.string().min(1),
  description: z.string().min(1),
  examples: z.array(z.string().min(1)).default([]),
  /** Losses relevant to this conflict, asked in the "losses" step. */
  lossKinds: z.array(lossKindSchema).min(1).refine(isUnique, 'loss kinds must be unique'),
  /**
   * When the law requires an amicable attempt (conciliation, mediation or participatory
   * procedure) before going to court (art. 750-1 of the code de procédure civile):
   * `always` (e.g. abnormal neighbourhood disturbance), `up-to-5000` (claims of 5,000 € or less).
   */
  mandatoryAmicableAttempt: z.enum(['always', 'up-to-5000']).optional(),
  /** Extra questions specific to this conflict type. */
  followUpQuestions: z
    .array(questionSchema)
    .default([])
    .refine((q) => isUnique(q.map((x) => x.id)), 'question ids must be unique'),
})

export type ConflictType = z.output<typeof conflictTypeSchema>
export type ConflictTypeInput = z.input<typeof conflictTypeSchema>

// ---- Channels (where the result sends the user) -------------------------------

export const channelSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  description: z.string().min(1),
  /** true: amicable route (seeking an agreement), false: judicial route (a judge decides). */
  amicable: z.boolean(),
  free: z.boolean(),
  /** Who pays and how much, in a few words (shown next to the channel). */
  cost: z.string().min(1).optional(),
  /** What an agreement reached through this channel is worth, in a few words. */
  agreement: z.string().min(1).optional(),
  /** Conflict types this channel is meant for (slugs). Omitted: every conflict type. */
  conflictTypes: z.array(slugSchema).min(1).optional(),
  contact: z
    .object({
      url: z.url().optional(),
      phone: z.string().min(1).optional(),
    })
    .refine((c) => c.url !== undefined || c.phone !== undefined, 'give a url and/or a phone')
    .optional(),
})

export type Channel = z.output<typeof channelSchema>
export type ChannelInput = z.input<typeof channelSchema>

// ---- Free information shown on every result (#94) -----------------------------

export const freeInformationSchema = z.object({
  title: z.string().min(1),
  text: z.string().min(1),
  link: z.object({ label: z.string().min(1), href: z.url() }),
})
