import { z } from 'zod'

import { slugSchema } from '@/lib/content'

// Inventory of the personal data the site handles (#25, docs/RGPD.pdf). Shown on
// /confidentialite (processings) and /cookies (browser storage). Every new piece of data the
// site collects or stores must be added here first, with its purpose: no purpose, no data.

/** A processing of personal data: what is handled, why, where and for how long. */
export const processingSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1),
  /** The data involved, as the visitor would name it. */
  data: z.string().min(1),
  purpose: z.string().min(1),
  /** GDPR art. 6 legal basis, or why none is needed (nothing leaves the device). */
  legalBasis: z.string().min(1),
  /** Where the data goes: the visitor's device only, or the site's server. */
  location: z.enum(['device', 'server']),
  retention: z.string().min(1),
})

/**
 * Something the site writes in the browser (cookie-like tracker, art. 82 of the French data
 * protection act). `key` is the exact storage key used in the code.
 */
export const browserStorageSchema = z.object({
  slug: slugSchema,
  key: z.string().min(1),
  storage: z.enum(['localStorage', 'sessionStorage']),
  purpose: z.string().min(1),
  retention: z.string().min(1),
})

export type Processing = z.output<typeof processingSchema>
export type ProcessingInput = z.input<typeof processingSchema>
export type BrowserStorage = z.output<typeof browserStorageSchema>
export type BrowserStorageInput = z.input<typeof browserStorageSchema>
