import { lossKindSchema, type LossKind } from '@/shared/simulation'

import { currentScene, resolveHistory, scorePercent, type RolePlayState } from './engine'
import type { Choice, Scenario, Scene } from './schema'

// Results of a run, computed only from the engine history: what the user sees is
// always consistent with the choices made.

export type Correction = {
  /** Position of the scene in the run (1 = first scene). */
  sceneNumber: number
  scene: Scene
  /** The choice made (quality 'ok' or 'bad'). */
  choice: Choice
  /** The good choices that were available in this scene. */
  better: Choice[]
}

export type RolePlayResults = {
  scorePercent: number
  decisions: number
  goodDecisions: number
  /** Final scene of the run, or undefined if the run is not over. */
  ending: Scene['ending']
  /** Every choice that was not the best, in the order of the run. */
  corrections: Correction[]
  /** Total of each loss over the run (0 when nothing was lost). */
  losses: Record<LossKind, number>
}

export function computeResults(scenario: Scenario, state: RolePlayState): RolePlayResults {
  const steps = resolveHistory(scenario, state.history)
  const choices = steps.map((s) => s.choice)

  const losses = Object.fromEntries(lossKindSchema.options.map((k) => [k, 0])) as Record<
    LossKind,
    number
  >
  for (const choice of choices) {
    for (const kind of lossKindSchema.options) losses[kind] += choice.losses[kind] ?? 0
  }

  return {
    scorePercent: scorePercent(choices),
    decisions: choices.length,
    goodDecisions: choices.filter((c) => c.quality === 'good').length,
    ending: currentScene(scenario, state).ending,
    corrections: steps.flatMap(({ scene, choice }, i) =>
      choice.quality === 'good'
        ? []
        : [
            {
              sceneNumber: i + 1,
              scene,
              choice,
              better: scene.choices.filter((c) => c.quality === 'good'),
            },
          ],
    ),
    losses,
  }
}

/** Display of a loss amount: "1 200 €", "3 h", or a level for health and relationship. */
export function formatLoss(kind: LossKind, value: number) {
  switch (kind) {
    case 'money':
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }).format(value)
    case 'time':
      return `${new Intl.NumberFormat('fr-FR').format(value)} h`
    case 'health':
    case 'relationship':
      return lossLevel(value)
  }
}

/** Points of health or relationship lost → level shown to the user. */
export function lossLevel(points: number) {
  if (points <= 0) return 'Aucune'
  if (points <= 2) return 'Faible'
  if (points <= 4) return 'Moyenne'
  return 'Forte'
}
