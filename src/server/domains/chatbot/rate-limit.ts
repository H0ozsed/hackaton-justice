// Small in-memory limit per client: a local model answers one question at a time,
// so a burst from one visitor would slow everyone down. Not a security feature.

export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, number[]>()
  return (key: string, now = Date.now()) => {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
    const allowed = recent.length < limit
    if (allowed) recent.push(now)
    if (recent.length > 0) hits.set(key, recent)
    else hits.delete(key)
    return allowed
  }
}

/** 20 questions per minute and per client. */
export const chatRateLimit = createRateLimiter({ limit: 20, windowMs: 60_000 })
