import { describe, expect, it } from 'vitest'

import { questionSchema, type ConflictType, type Question } from '@/shared/simulation'

import { followUpSchema } from './follow-up'

// Questions built the way content files are (defaults applied by the schema); never the shared
// example content, which the content team will replace.
const q = (input: Record<string, unknown>): Question =>
  questionSchema.parse({ id: 'q', label: 'Question', ...input })

const options = [
  { value: 'bruit', label: 'Bruit' },
  { value: 'odeurs', label: 'Odeurs' },
]

const type = (followUpQuestions: Question[]): ConflictType => ({
  slug: 'fixture',
  label: 'Fixture',
  description: 'Fixture',
  examples: [],
  followUpQuestions,
})

const withAllKinds = type([
  q({ id: 'nature', kind: 'choice', options }),
  q({ id: 'effects', kind: 'choice', options, multiple: true }),
  q({ id: 'amount', kind: 'number', unit: '€', min: 0, max: 100 }),
  q({ id: 'talked', kind: 'yesNo' }),
])

const valid = { nature: 'bruit', effects: ['bruit', 'odeurs'], amount: '12,5', talked: 'yes' }

const parse = (conflictType: ConflictType | undefined, input: Record<string, unknown>) =>
  followUpSchema(conflictType).safeParse(input)

// Error messages by question, e.g. { amount: "Minimum : 0" }.
const errorsOf = (conflictType: ConflictType | undefined, input: Record<string, unknown>) => {
  const result = parse(conflictType, input)
  if (result.success) return {}
  return Object.fromEntries(
    result.error.issues.map((issue) => [issue.path.join('.'), issue.message]),
  )
}

describe('followUpSchema', () => {
  describe('valid answers', () => {
    it('accepts one answer per kind of question, with the number typed', () => {
      expect(parse(withAllKinds, valid).data).toEqual({
        nature: 'bruit',
        effects: ['bruit', 'odeurs'],
        amount: 12.5,
        talked: 'yes',
      })
    })

    it('accepts a number that is already a number (answer shown again when going back)', () => {
      expect(parse(withAllKinds, { ...valid, amount: 42 }).data).toMatchObject({ amount: 42 })
    })

    it('reads a French comma, a point and spaces in a number', () => {
      for (const [text, expected] of [
        ['12,5', 12.5],
        ['12.5', 12.5],
        ['1 2', 12],
      ] as const) {
        expect(parse(withAllKinds, { ...valid, amount: text }).data).toMatchObject({
          amount: expected,
        })
      }
    })

    it('drops the answers of questions that the conflict type does not ask', () => {
      const result = parse(withAllKinds, { ...valid, other: 'left over from another type' })
      expect(result.data).not.toHaveProperty('other')
    })

    it('accepts no answer at all when the conflict type has no question', () => {
      expect(parse(type([]), {}).data).toEqual({})
      expect(parse(undefined, {}).data).toEqual({})
    })
  })

  describe('required questions', () => {
    it('says a missing answer is required, for every kind of question', () => {
      const errors = errorsOf(withAllKinds, {})
      expect(Object.keys(errors)).toEqual(['nature', 'effects', 'amount', 'talked'])
      expect(Object.values(errors)).toEqual(Array(4).fill('Ce champ est obligatoire'))
    })

    it('refuses an empty list for a multiple choice', () => {
      expect(errorsOf(withAllKinds, { ...valid, effects: [] }).effects).toBe(
        'Ce champ est obligatoire',
      )
    })

    it('refuses a blank number like a missing one', () => {
      expect(errorsOf(withAllKinds, { ...valid, amount: '   ' }).amount).toBe(
        'Ce champ est obligatoire',
      )
    })

    it('refuses a value that is not one of the options', () => {
      expect(errorsOf(withAllKinds, { ...valid, nature: 'other' })).toHaveProperty('nature')
      expect(Object.keys(errorsOf(withAllKinds, { ...valid, effects: ['other'] }))[0]).toMatch(
        /^effects/,
      )
      expect(errorsOf(withAllKinds, { ...valid, talked: 'maybe' })).toHaveProperty('talked')
    })
  })

  describe('numbers', () => {
    it('refuses a number below the minimum and above the maximum, with the shared messages', () => {
      expect(errorsOf(withAllKinds, { ...valid, amount: '-1' }).amount).toBe('Minimum : 0')
      expect(errorsOf(withAllKinds, { ...valid, amount: '101' }).amount).toBe('Maximum : 100')
    })

    it('accepts the minimum and the maximum', () => {
      expect(parse(withAllKinds, { ...valid, amount: '0' }).success).toBe(true)
      expect(parse(withAllKinds, { ...valid, amount: '100' }).success).toBe(true)
    })

    it('says so when what was typed is not a number, instead of "required"', () => {
      for (const text of ['abc', '12 €', '1,2,3']) {
        expect(errorsOf(withAllKinds, { ...valid, amount: text }).amount).toBe(
          'Saisissez un nombre en chiffres (exemple : 12 ou 12,5).',
        )
      }
    })
  })

  describe('optional questions', () => {
    const optional = type([
      q({ id: 'witness', kind: 'yesNo', required: false }),
      q({ id: 'times', kind: 'number', required: false, min: 1 }),
      q({ id: 'tags', kind: 'choice', options, multiple: true, required: false }),
    ])

    it('may all be skipped', () => {
      const result = parse(optional, { times: '', tags: [] })
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ tags: [] })
    })

    it('treat null (what an unchecked group of radio buttons gives) as no answer', () => {
      const result = parse(optional, { witness: null, times: '', tags: [] })
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ tags: [] })
    })

    it('treat untouched checkboxes (no list at all) as an empty list', () => {
      for (const untouched of [undefined, false, '']) {
        const result = parse(optional, { tags: untouched })
        expect(result.success).toBe(true)
        expect(result.data).toEqual({ tags: [] })
      }
    })

    it('still ask for at least one box when the multiple choice is required', () => {
      for (const untouched of [undefined, false, '']) {
        expect(errorsOf(withAllKinds, { ...valid, effects: untouched }).effects).toBe(
          'Ce champ est obligatoire',
        )
      }
    })

    it('still refuse null for a required question', () => {
      expect(errorsOf(withAllKinds, { ...valid, talked: null }).talked).toBe(
        'Ce champ est obligatoire',
      )
    })

    it('are still checked when answered', () => {
      expect(errorsOf(optional, { times: '0' }).times).toBe('Minimum : 1')
      expect(errorsOf(optional, { times: 'abc' }).times).toMatch(/en chiffres/)
      expect(errorsOf(optional, { witness: 'maybe' })).toHaveProperty('witness')
    })
  })

  it('reports every error at once, not one by one', () => {
    expect(Object.keys(errorsOf(withAllKinds, { amount: 'abc', talked: 'maybe' }))).toEqual([
      'nature',
      'effects',
      'amount',
      'talked',
    ])
  })
})
