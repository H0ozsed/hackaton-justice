import { z } from 'zod'

import { slugSchema } from '@/lib/content'

/** Pages that can display FAQ entries. */
export const faqPageSchema = z.enum(['home', 'learn'])
export type FaqPage = z.infer<typeof faqPageSchema>

export const faqEntrySchema = z.object({
  slug: slugSchema,
  question: z.string().min(1),
  answer: z.string().min(1),
  /** Where this question is shown. */
  pages: z.array(faqPageSchema).min(1),
})

export type FaqEntry = z.output<typeof faqEntrySchema>
export type FaqEntryInput = z.input<typeof faqEntrySchema>
