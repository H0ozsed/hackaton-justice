import { describe, expect, it } from 'vitest'

import { assertValidSteps } from './engine'
import { SIMULATION_STEPS } from './steps'

// Guards the registry itself (not the content of its steps), so that a step added by #13 to #15
// with an empty or duplicate id fails here with a clear message.
describe('SIMULATION_STEPS', () => {
  it('is a valid registry: non-empty, unique, non-empty ids', () => {
    expect(SIMULATION_STEPS.length).toBeGreaterThan(0)
    expect(() => assertValidSteps(SIMULATION_STEPS)).not.toThrow()
  })

  it('gives every step a title and fields to render', () => {
    for (const step of SIMULATION_STEPS) {
      expect(step.title.trim()).not.toBe('')
      expect(typeof step.Fields).toBe('function')
    }
  })
})
