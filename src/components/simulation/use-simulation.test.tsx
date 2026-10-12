import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import type { SimulationStep } from './types'
import { useSimulation } from './use-simulation'

// Neutral fixture steps. a: always asked. b: asked if a.go is "yes".
const step = (id: string, isActive?: SimulationStep['isActive']): SimulationStep => ({
  id,
  title: id,
  schema: z.looseObject({}),
  isActive,
  Fields: () => null,
})
const steps = [step('a'), step('b', (answers) => answers.a?.go === 'yes')]

const run = () => renderHook(() => useSimulation(steps))

// Restarting is tested here, on the hook that holds the state, after a real run: the engine's
// `restart` takes no state, so only a run can show that answers and drafts are really cleared.
describe('useSimulation: restart', () => {
  it('clears the answers and the drafts and goes back to the first step', () => {
    const { result } = run()

    act(() => result.current.submit({ go: 'yes' })) // answers a, now on b
    act(() => result.current.back({ note: 'draft' })) // draft of b, back on a
    act(() => result.current.submit({ go: 'yes' })) // on b again
    // There is something to clear: one validated answer and the draft of the current step.
    expect(result.current.currentStep?.id).toBe('b')
    expect(result.current.answers).toEqual({ a: { go: 'yes' } })
    expect(result.current.defaultValues).toEqual({ note: 'draft' })

    act(() => result.current.restart())

    expect(result.current.currentStep?.id).toBe('a')
    expect(result.current.completed).toBe(false)
    expect(result.current.answers).toEqual({})
    expect(result.current.result).toEqual({})
    expect(result.current.defaultValues).toBeUndefined()
    expect(result.current.navigated).toBe(true)
  })

  it('does not bring a cleared draft or answer back when the same steps are asked again', () => {
    const { result } = run()
    act(() => result.current.submit({ go: 'yes' }))
    act(() => result.current.back({ note: 'draft' }))
    act(() => result.current.submit({ go: 'yes' }))
    act(() => result.current.restart())

    act(() => result.current.submit({ go: 'yes' })) // on b again
    expect(result.current.currentStep?.id).toBe('b')
    expect(result.current.defaultValues).toBeUndefined()
    expect(result.current.answers).toEqual({ a: { go: 'yes' } })
  })

  it('goes from a completed run back to the first step, with an empty result', () => {
    const { result } = run()
    act(() => result.current.submit({ go: 'no' })) // b is skipped: completed
    expect(result.current.completed).toBe(true)
    expect(result.current.result).toEqual({ a: { go: 'no' } })

    act(() => result.current.restart())

    expect(result.current.completed).toBe(false)
    expect(result.current.currentStep?.id).toBe('a')
    expect(result.current.result).toEqual({})
    expect(result.current.answers).toEqual({})
  })
})
