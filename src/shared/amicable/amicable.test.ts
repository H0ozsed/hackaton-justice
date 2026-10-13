import { describe, expect, it } from 'vitest'

import { guides, keyFigures, routes } from '.'

describe('amicable content', () => {
  it('sources every figure and every guide with an official https link', () => {
    for (const figure of keyFigures.all) expect(figure.source.href).toMatch(/^https:\/\//)
    for (const guide of guides.all) expect(guide.sources.length).toBeGreaterThan(0)
  })

  it('compares amicable routes first, then the judge', () => {
    const amicable = routes.all.map((route) => route.amicable)
    expect(amicable.at(-1)).toBe(false)
    expect(amicable.indexOf(false)).toBe(amicable.length - 1)
  })
})
