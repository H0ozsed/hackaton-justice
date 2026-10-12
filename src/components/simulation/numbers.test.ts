import { describe, expect, it } from 'vitest'

import { hasAtMostTwoDecimals, parseDecimal } from './numbers'

describe('parseDecimal', () => {
  it.each([
    ['12', 12],
    ['12,5', 12.5],
    ['12.5', 12.5],
    [',5', 0.5],
    ['0', 0],
    ['-3', -3],
    ['  42  ', 42],
    ['1 200', 1200],
    ['1 200,50', 1200.5], // no-break space as thousands separator
    ['1 200', 1200], // narrow no-break space
  ])('reads "%s" as %s', (text, expected) => {
    expect(parseDecimal(text)).toBe(expected)
  })

  it('lets a number through', () => {
    expect(parseDecimal(149.9)).toBe(149.9)
  })

  it.each(['', '   ', 'abc', '12 €', '1,2,3', '1.234,56', '1e3', '--1', '12,', 'NaN'])(
    'refuses "%s" (NaN)',
    (text) => {
      expect(parseDecimal(text)).toBeNaN()
    },
  )

  it.each([undefined, null, {}, true])('refuses the non-text value %s (NaN)', (value) => {
    expect(parseDecimal(value)).toBeNaN()
  })
})

describe('hasAtMostTwoDecimals', () => {
  it.each([150, 149.9, 149.99, 0, 0.3, 0.1 + 0.2])('accepts %s', (value) => {
    expect(hasAtMostTwoDecimals(value)).toBe(true)
  })

  it.each([1.234, 1.005, 0.001])('refuses %s', (value) => {
    expect(hasAtMostTwoDecimals(value)).toBe(false)
  })
})
