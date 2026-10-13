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
  lossKinds: ['money', 'time', 'health', 'relationship'],
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
  lossKinds: ['money'],
  followUpQuestions: [],
}
const types = [withEverything, moneyOnly]

const full = {
  'conflict-type': { type: 'tout' },
  'follow-up': { nature: 'odeurs', effects: ['a', 'b'], amount: 12.5, talked: 'no' },
  'loss-frequency': {
    money: 149.9,
    time: 2.5,
    timeUnit: 'hours',
    health: 'high',
    relationship: 'none',
    frequency: 'weekly',
  },
  openness: { userOpenness: 'maybe', otherPartyOpenness: 'unknown' },
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
      'Argent = 149,9 €',
      'Temps = 2,5 heures',
      'Bien-être = Fort',
      'Relations = Aucun effet',
      'Fréquence du conflit = Une ou plusieurs fois par semaine',
      'Prêt(e) à discuter avec l’autre partie = Peut-être, cela dépend',
      'L’autre partie serait prête à discuter = Je ne sais pas',
    ])
  })

  it('gives nothing when nothing was answered', () => {
    expect(summarizeAnswers({}, types)).toEqual([])
  })

  describe('losses', () => {
    const losses = (loss: Record<string, unknown>) =>
      lines({ 'conflict-type': { type: 'tout' }, 'loss-frequency': loss }).slice(1)

    it('writes the time with the unit in the singular below 2, as in French', () => {
      expect(losses({ time: 1, timeUnit: 'hours' })).toEqual(['Temps = 1 heure'])
      expect(losses({ time: 1.5, timeUnit: 'days' })).toEqual(['Temps = 1,5 jour'])
      expect(losses({ time: 2, timeUnit: 'days' })).toEqual(['Temps = 2 jours'])
      expect(losses({ time: 0, timeUnit: 'hours' })).toEqual(['Temps = 0 heure'])
    })

    it('writes zero and decimals', () => {
      expect(losses({ money: 0 })).toEqual(['Argent = 0 €'])
      expect(losses({ money: 0.5 })).toEqual(['Argent = 0,5 €'])
    })

    it('only writes the loss kinds that the conflict type declares', () => {
      const result = lines({
        'conflict-type': { type: 'argent' },
        'loss-frequency': {
          money: 10,
          time: 3,
          timeUnit: 'hours',
          health: 'low',
          frequency: 'once',
        },
      })
      expect(result).toEqual([
        'Type de conflit = Type argent',
        'Argent = 10 €',
        'Fréquence du conflit = Une seule fois',
      ])
    })
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

  it('writes the openness answers even without a known conflict type', () => {
    expect(lines({ openness: { userOpenness: 'yes', otherPartyOpenness: 'no' } })).toEqual([
      'Prêt(e) à discuter avec l’autre partie = Oui',
      'L’autre partie serait prête à discuter = Non',
    ])
  })

  it('falls back on the raw value when a label is not found', () => {
    const result = lines({ openness: { userOpenness: 'sure', otherPartyOpenness: 'yes' } })
    expect(result[0]).toBe('Prêt(e) à discuter avec l’autre partie = sure')
  })
})
