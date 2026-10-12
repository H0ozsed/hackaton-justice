import { z } from 'zod'

import { slugSchema } from '@/lib/content'

export const glossaryTermSchema = z
  .object({
    slug: slugSchema,
    /** The term as displayed. */
    term: z.string().min(1),
    definition: z.string().min(1),
    /** Other spellings matched by <Definition> (plural, feminine...). */
    aliases: z.array(z.string().min(1)).default([]),
    /** Slugs of related terms ("see also"). */
    related: z.array(slugSchema).default([]),
  })
  .refine((t) => !t.related.includes(t.slug), {
    message: 'a term cannot be related to itself',
    path: ['related'],
  })

export type GlossaryTerm = z.output<typeof glossaryTermSchema>
export type GlossaryTermInput = z.input<typeof glossaryTermSchema>
