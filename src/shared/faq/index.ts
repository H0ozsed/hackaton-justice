import { defineCollection } from '@/lib/content'

import { faqData } from './data'
import { faqEntrySchema, type FaqPage } from './schema'

export type { FaqEntry, FaqPage } from './schema'

export const faq = defineCollection('faq', faqEntrySchema, faqData)

/** Questions to show on a given page, in file order. */
export function getFaqForPage(page: FaqPage) {
  return faq.all.filter((entry) => entry.pages.includes(page))
}
