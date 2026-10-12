import { describe, expect, it } from 'vitest'

import { createInitialState, rolePlayReducer, type RolePlayState } from './engine'
import { computeResults, formatLoss, lossLevel } from './results'
import { scenarioSchema } from './schema'

// start ─ a (good) ─────────────► middle ─ c (ok, 2 h, relation 1) ─► end
//       └ b (bad, 50 €, 3 h) ──►         └ d (good) ────────────────►
const scenario = scenarioSchema.parse({
  slug: 'test',
  title: 'Test',
  intro: 'Intro',
  characters: [{ id: 'me', name: 'Moi', role: 'Joueur', avatar: 'player' }],
  startSceneId: 'start',
  scenes: [
    {
      id: 'start',
      lines: [{ text: 'Début' }],
      choices: [
        { id: 'a', label: 'A', next: 'middle', quality: 'good', feedback: 'Bien' },
        {
          id: 'b',
          label: 'B',
          next: 'middle',
          quality: 'bad',
          feedback: 'Non',
          losses: { money: 50, time: 3 },
        },
      ],
    },
    {
      id: 'middle',
      lines: [{ text: 'Milieu' }],
      choices: [
        {
          id: 'c',
          label: 'C',
          next: 'end',
          quality: 'ok',
          feedback: 'Moyen',
          losses: { time: 2, relationship: 1 },
        },
        { id: 'd', label: 'D', next: 'end', quality: 'good', feedback: 'Bien' },
      ],
    },
    { id: 'end', lines: [{ text: 'Fin' }], ending: { title: 'La fin' } },
  ],
})

const play = (...choiceIds: string[]) =>
  choiceIds.reduce<RolePlayState>(
    (state, choiceId) => rolePlayReducer(scenario, state, { type: 'choose', choiceId }),
    createInitialState(scenario),
  )

describe('computeResults', () => {
  it('gives 100 %, no correction and no loss for a perfect run', () => {
    const results = computeResults(scenario, play('a', 'd'))
    expect(results).toMatchObject({
      scorePercent: 100,
      decisions: 2,
      goodDecisions: 2,
      corrections: [],
      losses: { money: 0, time: 0, health: 0, relationship: 0 },
      ending: { title: 'La fin' },
    })
  })

  it('computes the score from the choices made', () => {
    expect(computeResults(scenario, play('a', 'c')).scorePercent).toBe(75)
    expect(computeResults(scenario, play('b', 'c')).scorePercent).toBe(25)
  })

  it('lists each choice that was not the best, with the good alternatives', () => {
    const { corrections } = computeResults(scenario, play('b', 'c'))
    expect(
      corrections.map((c) => ({
        scene: c.sceneNumber,
        choice: c.choice.id,
        feedback: c.choice.feedback,
        better: c.better.map((b) => b.id),
      })),
    ).toEqual([
      { scene: 1, choice: 'b', feedback: 'Non', better: ['a'] },
      { scene: 2, choice: 'c', feedback: 'Moyen', better: ['d'] },
    ])
  })

  it('adds up the losses of every choice', () => {
    expect(computeResults(scenario, play('b', 'c')).losses).toEqual({
      money: 50,
      time: 5,
      health: 0,
      relationship: 1,
    })
  })

  it('has no ending while the run is not over', () => {
    expect(computeResults(scenario, play('a')).ending).toBeUndefined()
  })
})

describe('formatLoss', () => {
  it('formats money in euros and time in hours, in French', () => {
    expect(formatLoss('money', 1200).replace(/\s/g, ' ')).toBe('1 200 €')
    expect(formatLoss('time', 3)).toBe('3 h')
  })

  it('shows health and relationship as a level', () => {
    expect(formatLoss('relationship', 0)).toBe('Aucune')
    expect(formatLoss('health', 4)).toBe('Moyenne')
  })
})

describe('lossLevel', () => {
  it('maps points to a level', () => {
    expect([0, 1, 2, 3, 4, 5, 9].map(lossLevel)).toEqual([
      'Aucune',
      'Faible',
      'Faible',
      'Moyenne',
      'Moyenne',
      'Forte',
      'Forte',
    ])
  })
})
