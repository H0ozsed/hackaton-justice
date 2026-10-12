import { assertReferences, defineCollection } from '@/lib/content'

import { glossaryData } from './data'
import { glossaryTermSchema } from './schema'

export type { GlossaryTerm } from './schema'

export const glossary = defineCollection('glossary', glossaryTermSchema, glossaryData)

assertReferences(
  'glossary',
  { name: 'glossary term', has: glossary.has },
  glossary.all.flatMap((t) => t.related.map((slug) => [`"${t.slug}".related`, slug] as const)),
)

/** Finds a term by its displayed text or one of its aliases (case-insensitive). */
export function findGlossaryTermByText(text: string) {
  const needle = text.trim().toLocaleLowerCase('fr')
  return glossary.all.find((t) =>
    [t.term, ...t.aliases].some((value) => value.toLocaleLowerCase('fr') === needle),
  )
}
