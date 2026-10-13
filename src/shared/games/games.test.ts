import { describe, expect, it } from 'vitest'

import { rephraseRoundSchema } from './schema'

import { nextTension, rephraseRounds, TENSION_MAX } from '.'

describe('rephrase rounds', () => {
  it('have exactly one non-violent reply each, never always at the same place', () => {
    const positions = rephraseRounds.all.map((round) =>
      round.replies.findIndex((r) => r.kind === 'nvc'),
    )
    expect(positions.every((p) => p >= 0)).toBe(true)
    expect(new Set(positions).size).toBeGreaterThan(1)
  })

  it('refuses a round without, or with two, non-violent replies', () => {
    const round = {
      slug: 'r',
      situation: 'S.',
      impulse: 'I.',
      other: 'neighbor',
      replies: [
        { id: 'a', text: 'A.', kind: 'nvc' },
        { id: 'b', text: 'B.', kind: 'nvc' },
      ],
      explanation: 'E.',
    }
    expect(rephraseRoundSchema.safeParse(round).success).toBe(false)
    round.replies[1]!.kind = 'threat'
    expect(rephraseRoundSchema.safeParse(round).success).toBe(true)
  })
})

describe('nextTension', () => {
  it('goes down with a non-violent reply, up otherwise, within 0 and the maximum', () => {
    expect(nextTension(5, 'nvc')).toBe(3)
    expect(nextTension(5, 'avoidance')).toBe(6)
    expect(nextTension(5, 'judgement')).toBe(7)
    expect(nextTension(5, 'threat')).toBe(8)
    expect(nextTension(1, 'nvc')).toBe(0)
    expect(nextTension(TENSION_MAX - 1, 'threat')).toBe(TENSION_MAX)
  })
})
