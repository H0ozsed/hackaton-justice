import { describe, expect, it } from 'vitest'

import { CONFLICT_TYPE_STEP_ID } from './conflict-type'
import { assertValidSteps } from './engine'
import { FOLLOW_UP_STEP_ID } from './follow-up'
import { LOSS_FREQUENCY_STEP_ID } from './loss-frequency-step'
import { SIMULATION_STEPS } from './steps'

// Guards the registry itself (not the content of its steps), so that a step added with an empty or
// duplicate id, or in the wrong place, fails here with a clear message.
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

  it('asks the conflict type first: the steps that depend on it come after it', () => {
    const ids = SIMULATION_STEPS.map((step) => step.id)
    expect(ids[0]).toBe(CONFLICT_TYPE_STEP_ID)
    for (const dependent of [FOLLOW_UP_STEP_ID, LOSS_FREQUENCY_STEP_ID]) {
      expect(ids).toContain(dependent)
      expect(ids.indexOf(dependent)).toBeGreaterThan(ids.indexOf(CONFLICT_TYPE_STEP_ID))
    }
  })
})
