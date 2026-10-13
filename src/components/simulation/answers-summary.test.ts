import { describe, expect, it } from 'vitest'

import { questionSchema, type ConflictType, type Question } from '@/shared/simulation'

import { summarizeAnswers } from './answers-summary'

// Neutral fixtures (never the shared example content), questions built through the real schema.
const q = (input: Record<string, unknown>): Question =>
  questionSchema.parse({ id: 'q', label: 'Question', ...input })

const withEverything: ConflictType = {
  slug: 'tout',
  label: 'Type tout',
  description: 'Fixture',
  examples: [],
  followUpQuestions: [
    q({
      id: 'nature',
      kind: 'choice',
      label: 'Nature ?',
      options: [
        { value: 'bruit', label: 'Bruit' },
        { value: 'odeurs', label: 'Odeurs' },
      ],
    }),
    q({
      id: 'effects',
      kind: 'choice',
      multiple: true,
      required: false,
      label: 'Effets ?',
      options: [
        { value: 'a', label: 'Sommeil' },
        { value: 'b', label: 'Stress' },
      ],
    }),
    q({ id: 'amount', kind: 'number', label: 'Montant ?', unit: '€' }),
    q({ id: 'talked', kind: 'yesNo', label: 'En avez-vous parlé ?' }),
  ],
}
const moneyOnly: ConflictType = {
  ...withEverything,
  slug: 'argent',
  label: 'Type argent',
  followUpQuestions: [],
}
const types = [withEverything, moneyOnly]

const full = {
  'conflict-type': { type: 'tout' },
  'follow-up': { nature: 'odeurs', effects: ['a', 'b'], amount: 12.5, talked: 'no' },
}

const lines = (answers: Record<string, Record<string, unknown>>) =>
  summarizeAnswers(answers, types).map(({ label, value }) => `${label} = ${value}`)

describe('summarizeAnswers', () => {
  it('writes every answer, in the order of the steps, with the labels of the content', () => {
    expect(lines(full)).toEqual([
      'Type de conflit = Type tout',
      'Nature ? = Odeurs',
      'Effets ? = Sommeil, Stress',
      'Montant ? = 12,5 €',
      'En avez-vous parlé ? = Non',
    ])
  })

  it('gives nothing when nothing was answered', () => {
    expect(summarizeAnswers({}, types)).toEqual([])
  })

  it('writes zero and decimals', () => {
    const amount = (value: number) =>
      lines({ 'conflict-type': { type: 'tout' }, 'follow-up': { amount: value } }).slice(1)
    expect(amount(0)).toEqual(['Montant ? = 0 €'])
    expect(amount(0.5)).toEqual(['Montant ? = 0,5 €'])
  })

  describe('follow-up answers', () => {
    it('skips an optional question that was not answered', () => {
      const result = lines({ 'conflict-type': { type: 'tout' }, 'follow-up': { nature: 'bruit' } })
      expect(result).toEqual(['Type de conflit = Type tout', 'Nature ? = Bruit'])
    })

    it('skips an optional multiple choice left empty', () => {
      const result = lines({ 'conflict-type': { type: 'tout' }, 'follow-up': { effects: [] } })
      expect(result).toEqual(['Type de conflit = Type tout'])
    })

    it('writes the answers of the chosen conflict type only', () => {
      const result = lines({
        'conflict-type': { type: 'argent' },
        'follow-up': { nature: 'bruit' },
      })
      expect(result).toEqual(['Type de conflit = Type argent'])
    })
  })
})
