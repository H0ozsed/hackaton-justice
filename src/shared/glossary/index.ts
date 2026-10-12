import { assertReferences, defineCollection } from '@/lib/content'

import { glossaryData } from './data'
import { glossaryTermSchema } from './schema'

import type { GlossaryTerm } from './schema'

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

// ---- Search and alphabetical grouping (glossary page, #22) -------------------

/** Lowercase without accents: "Médiatrice" → "mediatrice". */
export function normalizeForSearch(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('fr')
    .trim()
}

/**
 * Terms whose name or one of its aliases contains the query, ignoring case and accents.
 * An empty query returns every term. Result sorted alphabetically (French rules).
 */
export function searchGlossary(query: string, terms: readonly GlossaryTerm[] = glossary.all) {
  const needle = normalizeForSearch(query)
  const matches = needle
    ? terms.filter((t) =>
        [t.term, ...t.aliases].some((v) => normalizeForSearch(v).includes(needle)),
      )
    : [...terms]
  return matches.sort((a, b) => a.term.localeCompare(b.term, 'fr', { sensitivity: 'base' }))
}

/** Letter a term is filed under: "Écrit" → "E"; anything that is not a letter → "#". */
export function glossaryLetter(term: string) {
  const first = normalizeForSearch(term).charAt(0).toUpperCase()
  return /[A-Z]/.test(first) ? first : '#'
}

/** Groups already-sorted terms by letter, keeping their order. */
export function groupGlossaryByLetter(terms: readonly GlossaryTerm[]) {
  const groups: { letter: string; terms: GlossaryTerm[] }[] = []
  for (const term of terms) {
    const letter = glossaryLetter(term.term)
    const last = groups.at(-1)
    if (last?.letter === letter) last.terms.push(term)
    else groups.push({ letter, terms: [term] })
  }
  return groups
}
