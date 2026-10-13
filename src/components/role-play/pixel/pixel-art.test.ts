import { describe, expect, it } from 'vitest'

import { paint, pixelRuns, textSprite, withOutline } from './pixel-art'

describe('pixelRuns', () => {
  it('merges same-colour pixels of a row into one run and skips transparent ones', () => {
    const runs = pixelRuns({ rows: ['aab.a', '.bb..'], colors: { a: '#a', b: '#b' } })
    expect(runs).toEqual([
      { x: 0, y: 0, width: 2, color: '#a' },
      { x: 2, y: 0, width: 1, color: '#b' },
      { x: 4, y: 0, width: 1, color: '#a' },
      { x: 1, y: 1, width: 2, color: '#b' },
    ])
  })

  it('treats characters missing from the palette as transparent', () => {
    expect(pixelRuns({ rows: ['xa'], colors: { a: '#a' } })).toEqual([
      { x: 1, y: 0, width: 1, color: '#a' },
    ])
  })
})

describe('withOutline', () => {
  it('surrounds opaque pixels with an outline, without diagonals', () => {
    expect(withOutline(['a'])).toEqual(['.o.', 'oao', '.o.'])
  })

  it('keeps the inside untouched and grows the grid by one pixel on each side', () => {
    const out = withOutline(['ab', '.c'])
    expect(out).toEqual(['.oo.', 'oabo', '.oco', '..o.'])
  })
})

describe('paint', () => {
  it('overwrites pixels and ignores those outside the grid', () => {
    const rows = ['....', '....']
    expect(
      paint(rows, [
        [1, 0, 'x'],
        [3, 1, 'y'],
        [9, 9, 'z'],
      ]),
    ).toEqual(['.x..', '...y'])
    expect(rows).toEqual(['....', '....'])
  })
})

describe('textSprite', () => {
  it('draws 3 × 5 letters separated by one column, with an outline', () => {
    const sprite = textSprite('TOC', '#fff')
    // 3 letters of 3 columns + 2 gaps, + 2 for the outline.
    expect(sprite.rows).toHaveLength(7)
    expect(sprite.rows[0]).toHaveLength(13)
    expect(sprite.rows[1]).toBe('oXXXoXXXoXXXo')
    expect(sprite.colors).toEqual({ X: '#fff', o: '#1e1f33' })
  })

  it('is case-insensitive and skips unknown characters', () => {
    expect(textSprite('zz§', '#fff').rows).toEqual(textSprite('ZZ', '#fff').rows)
  })

  it('has digits and the punctuation of the onomatopoeias', () => {
    for (const text of ['17', 'OK !', 'ALLO ?', '...'])
      expect(textSprite(text, '#fff').rows.join(''), text).toContain('X')
  })
})
