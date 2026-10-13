import { afterEach, describe, expect, it, vi } from 'vitest'

import { createSynth } from './sound'

/** Minimal fake of the Web Audio API: counts the sounds started. */
function fakeAudio() {
  const started = { oscillators: 0, noises: 0 }
  const param = () => ({ setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() })
  const node = () => ({ connect: (next: unknown) => next })
  class FakeContext {
    currentTime = 0
    sampleRate = 8000
    destination = {}
    createOscillator = () => ({
      ...node(),
      type: 'square',
      frequency: param(),
      start: () => started.oscillators++,
      stop: vi.fn(),
    })
    createGain = () => ({ ...node(), gain: param() })
    createBuffer = (_: number, length: number) => ({
      getChannelData: () => new Float32Array(length),
    })
    createBufferSource = () => ({ ...node(), buffer: null, start: () => started.noises++ })
    close = vi.fn()
  }
  vi.stubGlobal('AudioContext', FakeContext)
  return started
}

afterEach(() => vi.unstubAllGlobals())

describe('createSynth', () => {
  it('stays silent without Web Audio', () => {
    vi.stubGlobal('AudioContext', undefined)
    const synth = createSynth()
    expect(() => {
      synth.effect('drums')
      synth.blip('player')
      synth.select()
      synth.close()
    }).not.toThrow()
  })

  it('plays drums as kicks and snares, and a blip as one short tone', () => {
    const started = fakeAudio()
    const synth = createSynth()
    synth.effect('drums')
    expect(started).toEqual({ oscillators: 3, noises: 3 })
    synth.blip('neighbor')
    expect(started.oscillators).toBe(4)
  })

  it('has a sound for every effect', () => {
    const started = fakeAudio()
    const synth = createSynth()
    for (const effect of ['drums', 'knock', 'door', 'phone', 'paper', 'sleep'] as const) {
      const before = started.oscillators + started.noises
      synth.effect(effect)
      expect(started.oscillators + started.noises, effect).toBeGreaterThan(before)
    }
  })
})
