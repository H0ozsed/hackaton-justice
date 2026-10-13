import { describe, expect, it } from 'vitest'

import { JOURNEYS } from '@/lib/site'
import { glossary } from '@/shared/glossary'

import { explainer, explainerText, journeyFor, orientation } from '.'

describe('journeyFor', () => {
  it('returns the journey of the home cards for each orientation path', () => {
    expect(journeyFor('/simulation')).toBe(JOURNEYS.find((j) => j.href === '/simulation'))
    expect(journeyFor('/apprendre').href).toBe('/apprendre')
  })

  it('throws on a path that is not a journey', () => {
    // @ts-expect-error -- a path the schema would reject
    expect(() => journeyFor('/inconnu')).toThrow('No journey for "/inconnu"')
  })
})

describe('orientation', () => {
  it('sends the visitor to every journey', () => {
    const targets = new Set(orientation.all.map((option) => option.journey))
    expect([...targets].sort()).toEqual(JOURNEYS.map((j) => j.href).sort())
  })
})

describe('explainerText', () => {
  it('removes the markup and keeps the displayed text of glossary terms', () => {
    const card = { slug: 'test', title: 'Test', body: 'Voir la [[mediation|médiation]].' }
    expect(explainerText(card)).toBe('Voir la médiation.')
  })

  it('writes a term without displayed text as in the glossary', () => {
    const card = { slug: 'test', title: 'Test', body: 'Voir [[mediation]].' }
    expect(explainerText(card)).toBe(`Voir ${glossary.get('mediation').term}.`)
  })

  it('is written for every card of the home page', () => {
    for (const card of explainer.all) expect(explainerText(card)).not.toMatch(/\[\[|\]\]/)
  })
})
