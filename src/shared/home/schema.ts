import { z } from 'zod'

import { slugSchema } from '@/lib/content'

/** The three journeys a visitor can be sent to (same paths as JOURNEYS in src/lib/site.ts). */
export const journeyPathSchema = z.enum(['/simulation', '/mise-en-situation', '/apprendre'])
export type JourneyPath = z.infer<typeof journeyPathSchema>

/**
 * One card of « L'amiable en 1 minute ». `body` may link glossary terms with `[[slug]]`
 * or `[[slug|displayed text]]`, like the role-play texts.
 */
export const explainerCardSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1),
  body: z.string().min(1),
})

/** One answer of « Par où commencer ? »: a situation the visitor recognises, and its journey. */
export const orientationOptionSchema = z.object({
  slug: slugSchema,
  /** First person, what the visitor would say (« Je vis un conflit en ce moment »). */
  situation: z.string().min(1),
  journey: journeyPathSchema,
  /** One sentence: what the visitor will find there. */
  hint: z.string().min(1),
})

/** What the site is for, for whom, and what it is not (#104). */
export const aboutSchema = z.object({
  /** One sentence, shown in the hero, the meta description and given to IRIS. */
  purpose: z.string().min(1),
  audiences: z.array(z.string().min(1)).min(1),
  differences: z.array(z.string().min(1)).min(1),
  limits: z.array(z.string().min(1)).min(1),
})

export type ExplainerCard = z.output<typeof explainerCardSchema>
export type ExplainerCardInput = z.input<typeof explainerCardSchema>
export type OrientationOption = z.output<typeof orientationOptionSchema>
export type OrientationOptionInput = z.input<typeof orientationOptionSchema>
export type About = z.output<typeof aboutSchema>
export type AboutInput = z.input<typeof aboutSchema>
