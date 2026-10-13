import { describe, expect, it } from 'vitest'

import {
  applyChoice,
  describeGaugeChange,
  GAUGE_MAX,
  gaugesAfter,
  INITIAL_GAUGES,
  scenarioSchema,
} from '.'

const scenario = scenarioSchema.parse({
  slug: 'test',
  title: 'Test',
  intro: 'Intro.',
  characters: [{ id: 'moi', name: 'Moi', role: 'Vous', avatar: 'player' }],
  startSceneId: 'a',
  scenes: [
    {
      id: 'a',
      lines: [{ text: 'Début.' }],
      choices: [
        {
          id: 'cher',
          label: 'Choix coûteux',
          next: 'b',
          quality: 'bad',
          feedback: '...',
          losses: { health: 3, relationship: 2, money: 150, time: 4 },
        },
        { id: 'gratuit', label: 'Choix gratuit', next: 'b', quality: 'good', feedback: '...' },
      ],
    },
    {
      id: 'b',
      lines: [{ text: 'Suite.' }],
      choices: [
        {
          id: 'pire',
          label: 'Encore pire',
          next: 'fin',
          quality: 'bad',
          feedback: '...',
          losses: { health: 20 },
        },
      ],
    },
    { id: 'fin', lines: [{ text: 'Fin.' }], ending: { title: 'Fin' } },
  ],
})

describe('gauges', () => {
  it('starts full, with nothing spent', () => {
    expect(gaugesAfter(scenario, [])).toEqual({
      health: GAUGE_MAX,
      relationship: GAUGE_MAX,
      money: 0,
      time: 0,
    })
  })

  it('applies the losses of every choice of the history', () => {
    expect(gaugesAfter(scenario, [{ sceneId: 'a', choiceId: 'cher' }])).toEqual({
      health: 7,
      relationship: 8,
      money: 150,
      time: 4,
    })
  })

  it('leaves the gauges unchanged for a choice without losses', () => {
    expect(gaugesAfter(scenario, [{ sceneId: 'a', choiceId: 'gratuit' }])).toEqual(INITIAL_GAUGES)
  })

  it('never goes below 0 points', () => {
    const after = gaugesAfter(scenario, [
      { sceneId: 'a', choiceId: 'cher' },
      { sceneId: 'b', choiceId: 'pire' },
    ])
    expect(after.health).toBe(0)
  })

  it('does not change the gauges it is given', () => {
    const before = { ...INITIAL_GAUGES }
    applyChoice(before, { losses: { health: 1 } })
    expect(before).toEqual(INITIAL_GAUGES)
  })
})

describe('describeGaugeChange', () => {
  it('describes every change in one French sentence', () => {
    const after = gaugesAfter(scenario, [{ sceneId: 'a', choiceId: 'cher' }])
    expect(describeGaugeChange(INITIAL_GAUGES, after)).toBe(
      'Bien-être moins 3, Relation moins 2, 150 euros dépensés, 4 heures perdues.',
    )
  })

  it('says nothing when nothing changed', () => {
    expect(describeGaugeChange(INITIAL_GAUGES, INITIAL_GAUGES)).toBe('')
  })
})
