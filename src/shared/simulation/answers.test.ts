import { describe, expect, it } from 'vitest'

import { answerSchema, followUpAnswersSchema } from './answers'
import { questionSchema, type ConflictType, type Question } from './schema'

// Builds a question the way content files do (defaults applied by the schema).
const q = (input: Record<string, unknown>): Question =>
  questionSchema.parse({ id: 'q', label: 'Question', ...input })

const options = [
  { value: 'bruit', label: 'Bruit' },
  { value: 'odeurs', label: 'Odeurs' },
]

describe('answerSchema', () => {
  it('single choice: one of the option values', () => {
    const s = answerSchema(q({ kind: 'choice', options }))
    expect(s.safeParse('bruit').success).toBe(true)
    expect(s.safeParse('autre').success).toBe(false)
    expect(s.safeParse(undefined).success).toBe(false)
  })

  it('multiple choice: at least one option value when required', () => {
    const s = answerSchema(q({ kind: 'choice', options, multiple: true }))
    expect(s.safeParse(['bruit', 'odeurs']).success).toBe(true)
    expect(s.safeParse([]).success).toBe(false)
    expect(s.safeParse(['autre']).success).toBe(false)
  })

  it('number: respects min and max, refuses NaN (empty field)', () => {
    const s = answerSchema(q({ kind: 'number', min: 0, max: 100 }))
    expect(s.safeParse(50).success).toBe(true)
    expect(s.safeParse(-1).success).toBe(false)
    expect(s.safeParse(101).success).toBe(false)
    expect(s.safeParse(Number.NaN).success).toBe(false)
  })

  it('yesNo: "yes" or "no"', () => {
    const s = answerSchema(q({ kind: 'yesNo' }))
    expect(s.safeParse('no').success).toBe(true)
    expect(s.safeParse(true).success).toBe(false)
  })

  it('optional question: may be skipped', () => {
    const s = answerSchema(q({ kind: 'yesNo', required: false }))
    expect(s.safeParse(undefined).success).toBe(true)
  })

  it('gives a French message for a missing answer', () => {
    const result = answerSchema(q({ kind: 'yesNo' })).safeParse(undefined)
    expect(result.error?.issues[0]?.message).toBe('Ce champ est obligatoire')
  })
})

describe('followUpAnswersSchema', () => {
  const conflictType = {
    slug: 'voisinage',
    label: 'Voisinage',
    description: '...',
    examples: [],
    lossKinds: ['time'],
    followUpQuestions: [
      q({ id: 'nature', kind: 'choice', options, multiple: true }),
      q({ id: 'deja-parle', kind: 'yesNo' }),
    ],
  } satisfies ConflictType

  it('validates the answers keyed by question id', () => {
    const s = followUpAnswersSchema(conflictType)
    expect(s.safeParse({ nature: ['bruit'], 'deja-parle': 'yes' }).success).toBe(true)
  })

  it('reports each invalid answer under its question id', () => {
    const result = followUpAnswersSchema(conflictType).safeParse({ nature: [] })
    expect(result.error?.issues.map((i) => i.path.join('.'))).toEqual(['nature', 'deja-parle'])
  })
})
