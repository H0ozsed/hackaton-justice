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
  /** What to know first, shown at the top of the result (e.g. emergency numbers). */
  warning: z.string().min(1).optional(),
  /** Extra questions specific to this conflict type. */
  followUpQuestions: z
    .array(questionSchema)
    .default([])
    .refine((q) => isUnique(q.map((x) => x.id)), 'question ids must be unique'),
})

export type ConflictType = z.output<typeof conflictTypeSchema>
export type ConflictTypeInput = z.input<typeof conflictTypeSchema>

// ---- Channels (where the result sends the user) -------------------------------

/**
 * Family of a channel, the categories the user picks from (« J’ai un conflit ? », /apprendre):
 * talking directly, conciliation, mediation, other amicable recourse, the judge.
 */
export const channelFamilySchema = z.enum([
  'dialogue',
  'conciliation',
  'mediation',
  'other',
  'judge',
])
export type ChannelFamily = z.infer<typeof channelFamilySchema>

const sourceSchema = z.object({ label: z.string().min(1), href: z.url() })

export const channelSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  family: channelFamilySchema,
  description: z.string().min(1),
  /** « C'est pour vous si… »: lets the user decide whether this channel fits their situation. */
  forYouIf: z.string().min(1),
  /**
   * « Ce que dit la loi », shown first: the rules that frame this channel (status, conditions,
   * diploma…) and the legal texts they come from.
   */
  law: z
    .object({
      text: z.string().min(1),
      references: z.array(z.string().min(1)).min(1),
    })
    .optional(),
  /** Disputes it handles, and the ones it does not. */
  disputes: z.array(z.string().min(1)).default([]),
  excluded: z.array(z.string().min(1)).default([]),
  /** How to reach it. */
  access: z.string().min(1).optional(),
  /** true: amicable route (seeking an agreement), false: judicial route (a judge decides). */
  amicable: z.boolean(),
  free: z.boolean(),
  /** Who pays and how much, in a few words (shown next to the channel). */
  cost: z.string().min(1).optional(),
  /** What an agreement reached through this channel is worth, in a few words. */
  agreement: z.string().min(1).optional(),
  /** Conflict types this channel is meant for (slugs). Omitted: every conflict type. */
  conflictTypes: z.array(slugSchema).min(1).optional(),
  /** false: presented on /apprendre only (e.g. a step that only a judge can start). */
  inSimulation: z.boolean().default(true),
  contact: z
    .object({
      url: z.url().optional(),
      phone: z.string().min(1).optional(),
    })
    .refine((c) => c.url !== undefined || c.phone !== undefined, 'give a url and/or a phone')
    .optional(),
  /** Official pages the facts come from. */
  sources: z.array(sourceSchema).default([]),
})

export type Channel = z.output<typeof channelSchema>
export type ChannelInput = z.input<typeof channelSchema>

// ---- Free information shown on every result (#94) -----------------------------

export const freeInformationSchema = z.object({
  title: z.string().min(1),
  text: z.string().min(1),
  link: z.object({ label: z.string().min(1), href: z.url() }),
})
