import { z } from 'zod'

import { slugSchema } from '@/lib/content'

// Practical guides to settle a dispute amicably (/demarches): key figures, the comparison of
// the ways to settle a dispute, step-by-step guides, the preparation checklist. Every fact
// carries its source (`sources`), shown to users.

export const sourceSchema = z.object({
  label: z.string().min(1),
  href: z.url(),
})

/** A figure with what it measures and where it comes from. */
export const keyFigureSchema = z.object({
  slug: slugSchema,
  value: z.string().min(1),
  label: z.string().min(1),
  source: sourceSchema,
})

/** One way to settle a dispute, described on the same criteria as the others. */
export const routeSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  amicable: z.boolean(),
  /** Who helps you. */
  helper: z.string().min(1),
  /** How to reach this route. */
  access: z.string().min(1),
  cost: z.string().min(1),
  /** Who decides the outcome. */
  decides: z.string().min(1),
  duration: z.string().min(1),
  /** What the agreement or decision is worth. */
  outcome: z.string().min(1),
  /** Its main advantage, then its main limit (conciliator vs mediator comparison, #108). */
  strengths: z.string().min(1),
  limits: z.string().min(1),
})

export const guideSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1),
  /** When this guide is the right one (one sentence). */
  when: z.string().min(1),
  steps: z.array(z.object({ title: z.string().min(1), text: z.string().min(1) })).min(2),
  /** Things to know (cost, limits…). */
  good: z.array(z.string().min(1)).default([]),
  sources: z.array(sourceSchema).min(1),
})

export const checklistItemSchema = z.object({
  slug: slugSchema,
  label: z.string().min(1),
  help: z.string().min(1).optional(),
})

export type KeyFigure = z.output<typeof keyFigureSchema>
export type Route = z.output<typeof routeSchema>
export type Guide = z.output<typeof guideSchema>
export type GuideInput = z.input<typeof guideSchema>
export type ChecklistItem = z.output<typeof checklistItemSchema>
export type Source = z.output<typeof sourceSchema>
