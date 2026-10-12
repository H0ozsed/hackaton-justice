import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import {
  assertValidSteps,
  getPreviousAnswers,
  goBack,
  initialState,
  resolveCurrentStepId,
  resolveFlow,
  restart,
  submitStep,
} from './engine'
import type { SimulationStep } from './types'

// Neutral fixture steps: the engine is tested through its behaviour, not through real content.
const step = (id: string, isActive?: SimulationStep['isActive']): SimulationStep => ({
  id,
  title: id,
  schema: z.looseObject({}),
  isActive,
  Fields: () => null,
})

// a: always asked. b: asked if a.go is "yes". c: asked if b.go is "yes" (a chain).
const a = step('a')
const b = step('b', (answers) => answers.a?.go === 'yes')
const c = step('c', (answers) => answers.b?.go === 'yes')
const steps = [a, b, c]

const ids = (list: SimulationStep[]) => list.map((s) => s.id)

describe('assertValidSteps', () => {
  it('accepts a registry with unique, non-empty ids', () => {
    expect(() => assertValidSteps(steps)).not.toThrow()
  })

  it('rejects a duplicate id', () => {
    expect(() => assertValidSteps([step('x'), step('x')])).toThrow(/duplicate step id "x"/)
  })

  it('rejects an empty id', () => {
    expect(() => assertValidSteps([step('  ')])).toThrow(/empty id/)
  })
})

describe('initialState', () => {
  it('starts on the first active step with nothing answered', () => {
    expect(initialState(steps)).toEqual({
      answers: {},
      drafts: {},
      currentStepId: 'a',
      completed: false,
      navigated: false,
    })
  })

  it('is completed straight away when no step is active', () => {
    const state = initialState([step('x', () => false)])
    expect(state.currentStepId).toBeNull()
    expect(state.completed).toBe(true)
  })
})

describe('submitStep', () => {
  it('moves on to the next active step', () => {
    const state = submitStep(steps, initialState(steps), 'a', { go: 'yes' })
    expect(state.currentStepId).toBe('b')
    expect(state.completed).toBe(false)
    expect(state.navigated).toBe(true)
  })

  it('skips the steps that the answers make inactive, and completes', () => {
    const state = submitStep(steps, initialState(steps), 'a', { go: 'no' })
    expect(state.completed).toBe(true)
    expect(resolveFlow(steps, state.answers).effective).toEqual({ a: { go: 'no' } })
  })

  it('walks through every step when each answer activates the next one', () => {
    let state = initialState(steps)
    state = submitStep(steps, state, 'a', { go: 'yes' })
    state = submitStep(steps, state, 'b', { go: 'yes' })
    expect(state.currentStepId).toBe('c')

    state = submitStep(steps, state, 'c', { value: 1 })
    expect(state.completed).toBe(true)
    expect(Object.keys(resolveFlow(steps, state.answers).effective)).toEqual(['a', 'b', 'c'])
  })

  it('recomputes the active steps when an earlier answer changes', () => {
    const state = submitStep(steps, initialState(steps), 'a', { go: 'yes' })
    expect(ids(resolveFlow(steps, state.answers).active)).toEqual(['a', 'b'])

    const changed = submitStep(steps, state, 'a', { go: 'no' })
    expect(ids(resolveFlow(steps, changed.answers).active)).toEqual(['a'])
  })

  it('never completes while an active step has no validated answer', () => {
    const withGap = [a, step('z')]
    const state = submitStep(withGap, initialState(withGap), 'a', { go: 'x' })
    expect(state.currentStepId).toBe('z')
    expect(state.completed).toBe(false)
  })

  it('discards the draft of the step that was just validated', () => {
    const base = { ...initialState(steps), drafts: { a: { go: 'draft' } } }
    expect(submitStep(steps, base, 'a', { go: 'yes' }).drafts.a).toBeUndefined()
  })
})

describe('goBack', () => {
  it('returns to the previous active step and keeps its validated answer', () => {
    const atB = submitStep(steps, initialState(steps), 'a', { go: 'yes' })
    const back = goBack(steps, atB, { note: 'draft' })

    expect(back.currentStepId).toBe('a')
    expect(back.navigated).toBe(true)
    expect(back.answers.a).toEqual({ go: 'yes' })
  })

  it('keeps the in-progress input of the step left as a draft, never as an answer', () => {
    const atB = submitStep(steps, initialState(steps), 'a', { go: 'yes' })
    const back = goBack(steps, atB, { note: 'draft' })

    expect(back.drafts.b).toEqual({ note: 'draft' })
    expect(back.answers.b).toBeUndefined()
    expect(resolveFlow(steps, back.answers).effective).toEqual({ a: { go: 'yes' } })
  })

  it('does nothing on the first step', () => {
    const state = initialState(steps)
    expect(goBack(steps, state, { go: 'x' })).toBe(state)
  })
})

describe('inactive steps', () => {
  // a=yes → b answered → back to a → a=no: b becomes inactive.
  const answeredThenDeactivated = () => {
    let state = submitStep(steps, initialState(steps), 'a', { go: 'yes' })
    state = submitStep(steps, state, 'b', { go: 'no' })
    state = { ...state, completed: false, currentStepId: 'a' }
    return submitStep(steps, state, 'a', { go: 'no' })
  }

  it('keeps the answer in memory but leaves it out of the result', () => {
    const state = answeredThenDeactivated()
    expect(state.answers.b).toEqual({ go: 'no' })
    expect(resolveFlow(steps, state.answers).effective).toEqual({ a: { go: 'no' } })
  })

  it('restores the kept answer if the step becomes active again', () => {
    const state = answeredThenDeactivated()
    const again = submitStep(steps, { ...state, completed: false }, 'a', { go: 'yes' })

    expect(again.currentStepId).toBe('b')
    expect(again.answers.b).toEqual({ go: 'no' })
  })

  it('does not let an inactive answer activate another step (no cascade)', () => {
    // b was answered "yes" (so c would be active), then a switched to "no": b is inactive.
    const answers = { a: { go: 'no' }, b: { go: 'yes' }, c: { value: 1 } }
    const { active, effective } = resolveFlow(steps, answers)

    expect(ids(active)).toEqual(['a'])
    expect(effective).toEqual({ a: { go: 'no' } })
  })

  it('only gives a step the answers of the active steps before it, not its own', () => {
    const seen: unknown[] = []
    const probe = step('probe', (answers) => {
      seen.push(Object.keys(answers))
      return true
    })
    resolveFlow([a, probe], { a: { go: 'yes' }, probe: { value: 1 } })

    expect(seen).toEqual([['a']])
  })

  it('does not let isActive alter the answers seen by the following steps', () => {
    const vandal = step('vandal', (answers) => {
      answers.a = { go: 'tampered' }
      return true
    })
    const reader = step('reader', (answers) => answers.a?.go === 'yes')
    const { active, effective } = resolveFlow([a, vandal, reader], { a: { go: 'yes' } })

    expect(ids(active)).toEqual(['a', 'vandal', 'reader'])
    expect(effective.a).toEqual({ go: 'yes' })
  })
})

describe('resolveCurrentStepId', () => {
  const d = step('d')

  it('keeps the current step when it is active', () => {
    expect(resolveCurrentStepId(steps, { a: { go: 'yes' } }, 'b')).toBe('b')
  })

  it('moves to the next active step when the current one became inactive', () => {
    expect(resolveCurrentStepId([a, b, c, d], { a: { go: 'no' } }, 'b')).toBe('d')
  })

  it('falls back on the last active step when none follows', () => {
    expect(resolveCurrentStepId([a, b], { a: { go: 'no' } }, 'b')).toBe('a')
  })

  it('falls back on the first active step for an unknown or missing id', () => {
    expect(resolveCurrentStepId(steps, {}, 'unknown')).toBe('a')
    expect(resolveCurrentStepId(steps, {}, null)).toBe('a')
  })
})

describe('getPreviousAnswers', () => {
  it('gives the answers of the active steps before the step, and nothing else', () => {
    const answers = { a: { go: 'yes' }, b: { go: 'yes' }, c: { value: 1 } }

    expect(getPreviousAnswers(steps, answers, 'a')).toEqual({})
    expect(getPreviousAnswers(steps, answers, 'b')).toEqual({ a: { go: 'yes' } })
    expect(getPreviousAnswers(steps, answers, 'c')).toEqual({
      a: { go: 'yes' },
      b: { go: 'yes' },
    })
  })

  it('leaves out the answer of an inactive step', () => {
    // b is inactive (a is "no"): c, if asked, must not see b's kept answer.
    const answers = { a: { go: 'no' }, b: { go: 'yes' } }
    const alwaysAsked = step('after')

    expect(getPreviousAnswers([a, b, alwaysAsked], answers, 'after')).toEqual({ a: { go: 'no' } })
  })

  it('leaves out the steps that have no answer yet', () => {
    expect(getPreviousAnswers(steps, { a: { go: 'yes' } }, 'c')).toEqual({ a: { go: 'yes' } })
  })
})

describe('restart', () => {
  it('clears every answer and draft and goes back to the first step', () => {
    let state = submitStep(steps, initialState(steps), 'a', { go: 'yes' })
    state = goBack(steps, state, { note: 'draft' })
    // Something to clear: one validated answer and one draft.
    expect(state.answers).toEqual({ a: { go: 'yes' } })
    expect(state.drafts).toEqual({ b: { note: 'draft' } })

    expect(restart(steps)).toEqual({
      answers: {},
      drafts: {},
      currentStepId: 'a',
      completed: false,
      navigated: true,
    })
  })
})
