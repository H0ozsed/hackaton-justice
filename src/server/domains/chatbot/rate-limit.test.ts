import { describe, expect, it } from 'vitest'

import { createRateLimiter } from './rate-limit'

describe('createRateLimiter', () => {
  it('allows up to the limit within the window, then refuses', () => {
    const allow = createRateLimiter({ limit: 2, windowMs: 1000 })
    expect([allow('a', 0), allow('a', 10), allow('a', 20)]).toEqual([true, true, false])
  })

  it('allows again once the window has passed', () => {
    const allow = createRateLimiter({ limit: 1, windowMs: 1000 })
    allow('a', 0)
    expect(allow('a', 999)).toBe(false)
    expect(allow('a', 1000)).toBe(true)
  })

  it('counts each client separately', () => {
    const allow = createRateLimiter({ limit: 1, windowMs: 1000 })
    expect([allow('a', 0), allow('b', 0)]).toEqual([true, true])
  })
})
