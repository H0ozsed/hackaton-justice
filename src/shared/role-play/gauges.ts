import { resolveHistory, type Step } from './engine'
import type { Choice, Scenario } from './schema'

// Life gauges of the player during a run (#76), computed from the history only, like the
// results: what the stage shows is always consistent with the choices made.
// - health and relationship: points left out of GAUGE_MAX (each loss removes points)
// - money (€) and time (hours): what the conflict has cost so far

export const GAUGE_MAX = 10

export type Gauges = {
  health: number
  relationship: number
  money: number
  time: number
}

/** Labels shown in the HUD of the stage (French, shown to users). */
export const GAUGE_LABELS: Record<keyof Gauges, string> = {
  health: 'Santé',
  relationship: 'Relation',
  money: 'Argent dépensé',
  time: 'Temps perdu',
}

export const INITIAL_GAUGES: Gauges = {
  health: GAUGE_MAX,
  relationship: GAUGE_MAX,
  money: 0,
  time: 0,
}

/** Gauges after one more choice. Points never go below 0. */
export function applyChoice(gauges: Gauges, choice: Pick<Choice, 'losses'>): Gauges {
  const { health = 0, relationship = 0, money = 0, time = 0 } = choice.losses
  return {
    health: Math.max(0, gauges.health - health),
    relationship: Math.max(0, gauges.relationship - relationship),
    money: gauges.money + money,
    time: gauges.time + time,
  }
}

/** Gauges after every choice of the history. */
export function gaugesAfter(scenario: Scenario, history: readonly Step[]): Gauges {
  return resolveHistory(scenario, history).reduce(
    (gauges, { choice }) => applyChoice(gauges, choice),
    INITIAL_GAUGES,
  )
}

/** French sentence describing what a choice changed, for the live region ("" if nothing). */
export function describeGaugeChange(before: Gauges, after: Gauges): string {
  const parts: string[] = []
  const lost = (key: 'health' | 'relationship', label: string) => {
    const diff = before[key] - after[key]
    if (diff > 0) parts.push(`${label} moins ${diff}`)
  }
  lost('health', GAUGE_LABELS.health)
  lost('relationship', GAUGE_LABELS.relationship)
  if (after.money > before.money) parts.push(`${after.money - before.money} euros dépensés`)
  if (after.time > before.time) parts.push(`${after.time - before.time} heures perdues`)
  return parts.length > 0 ? `${parts.join(', ')}.` : ''
}
