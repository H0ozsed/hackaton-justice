import { z } from 'zod'

import { slugSchema } from '@/lib/content'

export const linkSchema = z.object({
  label: z.string().min(1),
  /** Absolute URL (external site) or internal path starting with "/". */
  href: z.union([z.url(), z.string().startsWith('/')]),
})

export const practicalInfoSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1),
  body: z.string().min(1),
  links: z.array(linkSchema).default([]),
})

export type PracticalInfo = z.output<typeof practicalInfoSchema>
export type PracticalInfoInput = z.input<typeof practicalInfoSchema>
