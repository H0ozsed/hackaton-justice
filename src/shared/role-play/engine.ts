import type { Choice, ChoiceQuality, Scenario, Scene } from './schema'

// Pure game engine: no React, no randomness. The UI keeps the state with useReducer
// and renders `currentScene`; the results (#20) are computed from `history`.

export type Step = { sceneId: string; choiceId: string }

export type RolePlayState = {
  sceneId: string
  /** Choices made so far, in order. */
  history: Step[]
}

export type RolePlayAction = { type: 'choose'; choiceId: string } | { type: 'restart' }

export function createInitialState(scenario: Scenario): RolePlayState {
  return { sceneId: scenario.startSceneId, history: [] }
}

/** Scene by id; throws if it does not exist (ids are checked by the schema). */
export function getScene(scenario: Scenario, sceneId: string): Scene {
  const scene = scenario.scenes.find((s) => s.id === sceneId)
  if (!scene) throw new Error(`Unknown scene "${sceneId}" in scenario "${scenario.slug}"`)
  return scene
}

export function currentScene(scenario: Scenario, state: RolePlayState) {
  return getScene(scenario, state.sceneId)
}

/** True when the current scene is an ending. */
export function isFinished(scenario: Scenario, state: RolePlayState) {
  return currentScene(scenario, state).ending !== undefined
}

/**
 * Applies an action. An unknown choice, or a choice once the game is over, is ignored
 * (the state is returned unchanged) so a stale click cannot break the game.
 */
export function rolePlayReducer(
  scenario: Scenario,
  state: RolePlayState,
  action: RolePlayAction,
): RolePlayState {
  switch (action.type) {
    case 'restart':
      return createInitialState(scenario)
    case 'choose': {
      const choice = currentScene(scenario, state).choices.find((c) => c.id === action.choiceId)
      if (!choice) return state
      return {
        sceneId: choice.next,
        history: [...state.history, { sceneId: state.sceneId, choiceId: choice.id }],
      }
    }
  }
}

/** Scene and choice of each step of the history. */
export function resolveHistory(scenario: Scenario, history: readonly Step[]) {
  return history.map((step) => {
    const scene = getScene(scenario, step.sceneId)
    const choice = scene.choices.find((c) => c.id === step.choiceId)
    if (!choice) throw new Error(`Unknown choice "${step.choiceId}" in scene "${step.sceneId}"`)
    return { scene, choice }
  })
}

/** Points earned by a choice: the best choice of a scene is worth MAX_POINTS. */
export const POINTS: Record<ChoiceQuality, number> = { good: 2, ok: 1, bad: 0 }
const MAX_POINTS = POINTS.good

/** Score in %, rounded: points earned / points the best choices would have earned. */
export function scorePercent(choices: readonly Pick<Choice, 'quality'>[]) {
  if (choices.length === 0) return 100
  const earned = choices.reduce((sum, c) => sum + POINTS[c.quality], 0)
  return Math.round((earned / (choices.length * MAX_POINTS)) * 100)
}
