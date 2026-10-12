import { describe, expect, it } from 'vitest'

import {
  createInitialState,
  currentScene,
  isFinished,
  resolveHistory,
  rolePlayReducer,
  scorePercent,
  type RolePlayState,
} from './engine'
import { scenarioSchema, type ScenarioInput } from './schema'

// start ─ a (good) ─► middle ─ c (ok) ──► end-1
//       └ b (bad) ─► end-2   └ d (good) ─► end-1
const input: ScenarioInput = {
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
          next: 'end-2',
          quality: 'bad',
          feedback: 'Non',
          losses: { money: 5 },
        },
      ],
    },
    {
      id: 'middle',
      lines: [{ speaker: 'me', text: 'Milieu' }],
      choices: [
        { id: 'c', label: 'C', next: 'end-1', quality: 'ok', feedback: 'Moyen' },
        { id: 'd', label: 'D', next: 'end-1', quality: 'good', feedback: 'Bien' },
      ],
    },
    { id: 'end-1', lines: [{ text: 'Fin 1' }], ending: { title: 'Fin 1' } },
    { id: 'end-2', lines: [{ text: 'Fin 2' }], ending: { title: 'Fin 2' } },
  ],
}
const scenario = scenarioSchema.parse(input)

const play = (...choiceIds: string[]) =>
  choiceIds.reduce<RolePlayState>(
    (state, choiceId) => rolePlayReducer(scenario, state, { type: 'choose', choiceId }),
    createInitialState(scenario),
  )

describe('rolePlayReducer', () => {
  it('starts on the start scene with an empty history', () => {
    const state = createInitialState(scenario)
    expect(currentScene(scenario, state).id).toBe('start')
    expect(state.history).toEqual([])
    expect(isFinished(scenario, state)).toBe(false)
  })

  it('moves to the scene of the chosen choice and records it', () => {
    const state = play('a')
    expect(state.sceneId).toBe('middle')
    expect(state.history).toEqual([{ sceneId: 'start', choiceId: 'a' }])
  })

  it('plays a scenario from start to end', () => {
    const state = play('a', 'd')
    expect(isFinished(scenario, state)).toBe(true)
    expect(currentScene(scenario, state).ending?.title).toBe('Fin 1')
    expect(state.history.map((s) => s.choiceId)).toEqual(['a', 'd'])
  })

  it('ignores a choice that is not offered by the current scene', () => {
    const state = play('a')
    expect(rolePlayReducer(scenario, state, { type: 'choose', choiceId: 'b' })).toBe(state)
  })

  it('ignores choices once the game is over', () => {
    const state = play('b')
    expect(rolePlayReducer(scenario, state, { type: 'choose', choiceId: 'a' })).toBe(state)
  })

  it('restarts from the beginning', () => {
    expect(rolePlayReducer(scenario, play('a', 'c'), { type: 'restart' })).toEqual(
      createInitialState(scenario),
    )
  })
})

describe('resolveHistory', () => {
  it('returns the scene and the choice of each step', () => {
    const steps = resolveHistory(scenario, play('a', 'c').history)
    expect(steps.map(({ scene, choice }) => [scene.id, choice.id])).toEqual([
      ['start', 'a'],
      ['middle', 'c'],
    ])
  })

  it('throws on a step that does not exist', () => {
    expect(() => resolveHistory(scenario, [{ sceneId: 'start', choiceId: 'z' }])).toThrow(
      'Unknown choice "z"',
    )
  })
})

describe('scorePercent', () => {
  const score = (...ids: string[]) =>
    scorePercent(resolveHistory(scenario, play(...ids).history).map((s) => s.choice))

  it('is 100 when every choice is good', () => {
    expect(score('a', 'd')).toBe(100)
  })

  it('counts an ok choice as half the points', () => {
    expect(score('a', 'c')).toBe(75)
  })

  it('is 0 when every choice is bad', () => {
    expect(score('b')).toBe(0)
  })

  it('is 100 with no choice made', () => {
    expect(scorePercent([])).toBe(100)
  })
})
