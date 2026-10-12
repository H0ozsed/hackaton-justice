import { describe, expect, it } from 'vitest'

import { glossary } from '@/shared/glossary'

import { glossarySegments } from './glossary-segments'

const mediation = glossary.find('mediation')

describe('glossarySegments', () => {
  it('returns the text as is when it names no glossary term', () => {
    expect(glossarySegments('Bonjour, comment ça va ?')).toEqual([
      { text: 'Bonjour, comment ça va ?' },
    ])
  })

  it.runIf(mediation)('marks a term, keeping its original spelling and case', () => {
    expect(glossarySegments('La Médiation est gratuite.')).toEqual([
      { text: 'La ' },
      { text: 'Médiation', slug: 'mediation' },
      { text: ' est gratuite.' },
    ])
  })

  it.runIf(mediation)('matches an alias and finds a term written without accents', () => {
    expect(glossarySegments('Contactez une médiatrice.')).toContainEqual({
      text: 'médiatrice',
      slug: 'mediation',
    })
    expect(glossarySegments('la mediation')).toContainEqual({
      text: 'mediation',
      slug: 'mediation',
    })
  })

  it.runIf(mediation)('marks only the first occurrence of a term', () => {
    const marked = glossarySegments('Médiation ou médiation ?').filter((s) => s.slug)
    expect(marked).toHaveLength(1)
  })

  it('never splits a word to find a term inside it', () => {
    const term = glossary.all[0].term
    expect(glossarySegments(`super${term}`).some((s) => s.slug)).toBe(false)
  })

  it('keeps every character of the text', () => {
    const text = `Conciliation, médiation et ${glossary.all[0].term} : trois pistes.`
    expect(
      glossarySegments(text)
        .map((s) => s.text)
        .join(''),
    ).toBe(text)
  })
})
