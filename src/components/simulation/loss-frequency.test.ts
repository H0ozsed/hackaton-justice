import { describe, expect, it } from 'vitest'

import type { LossKind } from '@/shared/simulation'

import { lossFrequencySchema } from './loss-frequency'

const parse = (kinds: LossKind[], input: Record<string, unknown>) =>
  lossFrequencySchema(kinds).safeParse(input)

// Error messages by field, e.g. { money: "Le montant ne peut pas être négatif..." }.
const errorsOf = (kinds: LossKind[], input: Record<string, unknown>) => {
  const result = parse(kinds, input)
  if (result.success) return {}
  return Object.fromEntries(
    result.error.issues.map((issue) => [issue.path.join('.'), issue.message]),
  )
}

const ALL: LossKind[] = ['money', 'time', 'health', 'relationship']

describe('lossFrequencySchema', () => {
  describe('which fields are asked', () => {
    it('asks only the declared loss kinds, plus the frequency', () => {
      expect(Object.keys(errorsOf(['money'], {})).sort()).toEqual(['frequency', 'money'])
      expect(Object.keys(errorsOf(['time'], {})).sort()).toEqual(['frequency', 'time', 'timeUnit'])
      expect(Object.keys(errorsOf(['health', 'relationship'], {})).sort()).toEqual([
        'frequency',
        'health',
        'relationship',
      ])
    })

    it('asks every field when every loss kind is declared', () => {
      expect(Object.keys(errorsOf(ALL, {})).sort()).toEqual([
        'frequency',
        'health',
        'money',
        'relationship',
        'time',
        'timeUnit',
      ])
    })

    it('drops the answers of loss kinds that are not declared', () => {
      const result = parse(['health'], {
        health: 'low',
        frequency: 'daily',
        money: '500',
        time: '3',
        timeUnit: 'hours',
      })
      expect(result.data).toEqual({ health: 'low', frequency: 'daily' })
    })
  })

  describe('valid values', () => {
    it('turns typed numbers into numbers, with a French comma or a point', () => {
      const result = parse(['money', 'time'], {
        money: '149,90',
        time: '2.5',
        timeUnit: 'hours',
        frequency: 'monthly',
      })
      expect(result.data).toEqual({
        money: 149.9,
        time: 2.5,
        timeUnit: 'hours',
        frequency: 'monthly',
      })
    })

    it('accepts a number that is already a number (answer shown again when going back)', () => {
      expect(parse(['money'], { money: 150, frequency: 'once' }).data).toEqual({
        money: 150,
        frequency: 'once',
      })
    })

    it('accepts zero: a declared loss can be nil so far', () => {
      expect(
        parse(['money', 'time'], { money: '0', time: '0', timeUnit: 'days', frequency: 'once' })
          .success,
      ).toBe(true)
    })

    it('accepts thousands separated by spaces', () => {
      expect(parse(['money'], { money: '1 200', frequency: 'once' }).data).toMatchObject({
        money: 1200,
      })
    })

    it('accepts the upper bounds: one year in hours, one year in days', () => {
      const hours = { time: '8760', timeUnit: 'hours', frequency: 'daily' }
      const days = { time: '365', timeUnit: 'days', frequency: 'daily' }
      expect(parse(['time'], hours).success).toBe(true)
      expect(parse(['time'], days).success).toBe(true)
    })

    it('accepts every impact level and every frequency', () => {
      for (const level of ['none', 'low', 'moderate', 'high', 'very-high']) {
        expect(parse(['health'], { health: level, frequency: 'weekly' }).success).toBe(true)
      }
      for (const frequency of ['once', 'rarely', 'monthly', 'weekly', 'daily']) {
        expect(parse(['health'], { health: 'low', frequency }).success).toBe(true)
      }
    })
  })

  describe('money', () => {
    it.each([
      ['', /en chiffres, en euros/],
      ['abc', /en chiffres, en euros/],
      ['12 €', /en chiffres, en euros/],
      ['-5', /ne peut pas être négatif/],
      ['2000000', /trop élevé/],
      ['1,234', /au plus deux chiffres/],
    ])('refuses "%s" with a message that says how to fix it', (money, message) => {
      expect(errorsOf(['money'], { money, frequency: 'once' }).money).toMatch(message)
    })

    it('refuses a missing value', () => {
      expect(errorsOf(['money'], { frequency: 'once' }).money).toMatch(/en chiffres, en euros/)
    })
  })

  describe('time', () => {
    it.each([
      ['', /en chiffres/],
      ['beaucoup', /en chiffres/],
      ['-1', /ne peut pas être négative/],
    ])('refuses the duration "%s"', (time, message) => {
      expect(errorsOf(['time'], { time, timeUnit: 'hours', frequency: 'once' }).time).toMatch(
        message,
      )
    })

    it('requires a unit, and says which ones exist', () => {
      expect(errorsOf(['time'], { time: '3', frequency: 'once' }).timeUnit).toMatch(
        /heures ou jours/,
      )
    })

    it('refuses more than a year in hours, and suggests the unit "jours"', () => {
      const errors = errorsOf(['time'], { time: '8761', timeUnit: 'hours', frequency: 'once' })
      expect(errors.time).toMatch(/8 760 heures/)
      expect(errors.time).toMatch(/jours/)
    })

    it('refuses more than a year in days', () => {
      const errors = errorsOf(['time'], { time: '366', timeUnit: 'days', frequency: 'once' })
      expect(errors.time).toMatch(/365 jours/)
    })

    it('reports a duration too long for its unit together with the other errors', () => {
      const errors = errorsOf(['money', 'time'], { time: '400', timeUnit: 'days' })
      expect(errors.time).toMatch(/365 jours/)
      expect(errors.money).toBeDefined()
      expect(errors.frequency).toBeDefined()
    })

    it('judges the same number differently depending on the unit', () => {
      const base = { time: '400', frequency: 'once' }
      expect(parse(['time'], { ...base, timeUnit: 'hours' }).success).toBe(true)
      expect(parse(['time'], { ...base, timeUnit: 'days' }).success).toBe(false)
    })
  })

  describe('impact levels and frequency', () => {
    it('refuses a missing or unknown level', () => {
      expect(errorsOf(['health'], { frequency: 'once' }).health).toBe('Choisissez un niveau.')
      expect(
        errorsOf(['relationship'], { relationship: 'enormous', frequency: 'once' }).relationship,
      ).toBe('Choisissez un niveau.')
    })

    it('requires the frequency, even with no loss kind', () => {
      expect(errorsOf([], {}).frequency).toBe('Indiquez à quelle fréquence le conflit se produit.')
      expect(errorsOf([], { frequency: 'sometimes' }).frequency).toBeDefined()
    })
  })
})
