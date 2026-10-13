import { useCallback, useEffect, useRef, useState } from 'react'

import type { Avatar, Effect } from '@/shared/role-play'

// Optional 8-bit sounds of the role-play (#76), synthesised with the Web Audio API: no
// audio file to download. Off by default (RGAA 4.10: no sound without the user's
// action); the choice is remembered on the device. Everything the sounds tell is also
// written, so they are never needed.

/** Pitch of the text "blips" of each character, in Hz. */
const VOICES: Record<Avatar | 'narrator', number> = {
  narrator: 330,
  player: 620,
  neighbor: 220,
  relative: 520,
  clerk: 700,
  mediator: 260,
  official: 440,
  professional: 300,
}

const STORAGE_KEY = 'role-play-sound'

type Tone = {
  frequency: number
  /** Start, in seconds after now. */
  at?: number
  duration: number
  type?: OscillatorType
  volume?: number
  /** Frequency at the end (slide). */
  to?: number
}

/** Small synthesiser: a few oscillators and noise bursts. Silent when Web Audio is missing. */
export function createSynth() {
  let context: AudioContext | undefined

  const audio = () => {
    if (context) return context
    const Ctor = globalThis.AudioContext as typeof AudioContext | undefined
    if (!Ctor) return undefined
    context = new Ctor()
    return context
  }

  const tone = ({ frequency, at = 0, duration, type = 'square', volume = 0.06, to }: Tone) => {
    const ctx = audio()
    if (!ctx) return
    const start = ctx.currentTime + at
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(frequency, start)
    if (to) osc.frequency.exponentialRampToValueAtTime(to, start + duration)
    gain.gain.setValueAtTime(volume, start)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    osc.connect(gain).connect(ctx.destination)
    osc.start(start)
    osc.stop(start + duration)
  }

  const noise = (at: number, duration: number, volume = 0.08) => {
    const ctx = audio()
    if (!ctx) return
    const start = ctx.currentTime + at
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    const source = ctx.createBufferSource()
    const gain = ctx.createGain()
    source.buffer = buffer
    gain.gain.setValueAtTime(volume, start)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    source.connect(gain).connect(ctx.destination)
    source.start(start)
  }

  const effects: Record<Effect, () => void> = {
    drums: () => {
      for (const at of [0, 0.3, 0.6])
        tone({ frequency: 140, to: 45, at, duration: 0.2, type: 'sine', volume: 0.25 })
      for (const at of [0.15, 0.45, 0.75]) noise(at, 0.1)
    },
    knock: () => {
      for (const at of [0, 0.18])
        tone({ frequency: 180, to: 90, at, duration: 0.08, type: 'triangle', volume: 0.2 })
    },
    door: () => {
      noise(0, 0.15, 0.15)
      tone({ frequency: 90, to: 40, duration: 0.2, type: 'sine', volume: 0.2 })
    },
    phone: () => {
      for (const at of [0, 0.15, 0.6, 0.75]) tone({ frequency: 880, at, duration: 0.1 })
    },
    paper: () => noise(0, 0.25, 0.04),
    sleep: () => tone({ frequency: 300, to: 150, duration: 0.6, type: 'sine', volume: 0.05 }),
  }

  return {
    effect: (effect: Effect) => effects[effect](),
    blip: (voice: Avatar | 'narrator') =>
      tone({ frequency: VOICES[voice], duration: 0.04, volume: 0.03 }),
    select: () => {
      tone({ frequency: 660, duration: 0.06 })
      tone({ frequency: 990, at: 0.06, duration: 0.08 })
    },
    close: () => void context?.close(),
  }
}

export type Sound = {
  enabled: boolean
  toggle: () => void
  effect: (effect: Effect) => void
  blip: (voice: Avatar | 'narrator') => void
  select: () => void
}

/** Sound switch of the game, remembered on the device (when storage is available). */
export function useSound(): Sound {
  const [enabled, setEnabled] = useState(false)
  const synth = useRef<ReturnType<typeof createSynth>>(undefined)

  useEffect(() => {
    let saved = false
    try {
      saved = window.localStorage.getItem(STORAGE_KEY) === 'on'
    } catch {
      // Storage blocked: the sound stays off.
    }
    // Read after mount only, so the server and the client render the same button.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setEnabled(true)
    return () => synth.current?.close()
  }, [])

  const play = useCallback(
    (run: (s: ReturnType<typeof createSynth>) => void) => {
      if (!enabled) return
      synth.current ??= createSynth()
      run(synth.current)
    },
    [enabled],
  )

  return {
    enabled,
    toggle: () => {
      const next = !enabled
      setEnabled(next)
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off')
      } catch {
        // Not remembered, still switched for this visit.
      }
    },
    effect: useCallback((effect: Effect) => play((s) => s.effect(effect)), [play]),
    blip: useCallback((voice: Avatar | 'narrator') => play((s) => s.blip(voice)), [play]),
    select: useCallback(() => play((s) => s.select()), [play]),
  }
}
