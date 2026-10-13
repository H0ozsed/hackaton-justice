import { describe, expect, it } from 'vitest'

import { playerOf, scenarios } from '.'

describe('real scenarios', () => {
  it('each has a player, and a level and perspective', () => {
    for (const scenario of scenarios.all) {
      expect(playerOf(scenario), scenario.slug).toBeDefined()
      expect([1, 2, 3]).toContain(scenario.level)
    }
    expect(new Set(scenarios.all.map((s) => s.perspective))).toEqual(
      new Set(['complainant', 'respondent', 'mediator']),
    )
  })
})
