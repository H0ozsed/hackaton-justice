import { defineCollection } from '@/lib/content'

import { practicalInfoData } from './data'
import { practicalInfoSchema } from './schema'

export type { PracticalInfo } from './schema'

export const practicalInfo = defineCollection(
  'practical-info',
  practicalInfoSchema,
  practicalInfoData,
)

export function isExternalLink(href: string) {
  return !href.startsWith('/')
}
