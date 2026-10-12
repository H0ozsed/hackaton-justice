import { describe, expect, it } from 'vitest'

import {
  glossaryLetter,
  groupGlossaryByLetter,
  normalizeForSearch,
  searchGlossary,
  type GlossaryTerm,
} from '.'

const term = (slug: string, name: string, aliases: string[] = []): GlossaryTerm => ({
  slug,
  term: name,
  definition: '...',
  aliases,
  related: [],
})

const TERMS = [
  term('mediation', 'Médiation', ['médiateur', 'médiatrice']),
  term('ecrit', 'Écrit'),
  term('conciliation', 'Conciliation'),
  term('avocat', 'avocat'),
  term('code', '« Code » civil'),
]

describe('normalizeForSearch', () => {
  it('removes accents and case', () => {
    expect(normalizeForSearch('  Médiatrice ')).toBe('mediatrice')
  })
})

describe('searchGlossary', () => {
  it('returns every term, sorted the French way, for an empty query', () => {
    expect(searchGlossary('', TERMS).map((t) => t.slug)).toEqual([
      'code',
      'avocat',
      'conciliation',
      'ecrit',
      'mediation',
    ])
  })

  it('ignores accents and case', () => {
    expect(searchGlossary('MEDIATION', TERMS).map((t) => t.slug)).toEqual(['mediation'])
    expect(searchGlossary('écr', TERMS).map((t) => t.slug)).toEqual(['ecrit'])
  })

  it('matches aliases', () => {
    expect(searchGlossary('mediatrice', TERMS).map((t) => t.slug)).toEqual(['mediation'])
  })

  it('matches inside the term', () => {
    expect(searchGlossary('cili', TERMS).map((t) => t.slug)).toEqual(['conciliation'])
  })

  it('returns nothing when no term matches', () => {
    expect(searchGlossary('xyz', TERMS)).toEqual([])
  })

  it('does not reorder the source array', () => {
    const source = [...TERMS]
    searchGlossary('', source)
    expect(source).toEqual(TERMS)
  })
})

describe('glossaryLetter', () => {
  it('files accented and lowercase terms under their base letter, the rest under #', () => {
    expect(glossaryLetter('Écrit')).toBe('E')
    expect(glossaryLetter('avocat')).toBe('A')
    expect(glossaryLetter('« Code » civil')).toBe('#')
  })
})

describe('groupGlossaryByLetter', () => {
  it('groups sorted terms by letter, in order', () => {
    const groups = groupGlossaryByLetter(searchGlossary('', TERMS))
    expect(groups.map((g) => [g.letter, g.terms.map((t) => t.slug)])).toEqual([
      ['#', ['code']],
      ['A', ['avocat']],
      ['C', ['conciliation']],
      ['E', ['ecrit']],
      ['M', ['mediation']],
    ])
  })
})
