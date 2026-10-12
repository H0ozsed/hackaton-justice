import { describe, expect, it } from 'vitest'

import {
  createInitialState,
  currentScene,
  isFinished,
  rolePlayReducer,
  scenarios,
  type RolePlayState,
  type Scenario,
} from '.'

/** Final state of every possible run of a scenario, by trying every choice. */
function allRuns(scenario: Scenario) {
  const finals: RolePlayState[] = []
  const walk = (state: RolePlayState) => {
    if (isFinished(scenario, state)) return void finals.push(state)
    const scene = currentScene(scenario, state)
    expect(scene.choices.length, `dead end in scene "${scene.id}"`).toBeGreaterThan(0)
    for (const choice of scene.choices) {
      walk(rolePlayReducer(scenario, state, { type: 'choose', choiceId: choice.id }))
    }
  }
  walk(createInitialState(scenario))
  return finals
}

describe.each(scenarios.all.map((s) => [s.slug, s] as const))('scenario "%s"', (_, scenario) => {
  it('ends on an ending through every path, without dead end', () => {
    for (const state of allRuns(scenario)) expect(isFinished(scenario, state)).toBe(true)
  })

  it('reaches every ending', () => {
    const reached = new Set(allRuns(scenario).map((s) => s.sceneId))
    const endings = scenario.scenes.filter((s) => s.ending).map((s) => s.id)
    expect([...reached].sort()).toEqual(endings.sort())
  })
})
