import { useSyncExternalStore } from 'react'

// Progress of the role-play scenarios on this device only (localStorage): which ones were
// finished and the best score. Nothing leaves the browser (RGPD); everything works without it
// (private browsing, blocked storage): the progress is then simply empty.

const KEY = 'role-play-progress'
const EVENT = 'role-play-progress'

export type Progress = Record<string, { best: number }>

let cache: { raw: string | null; value: Progress } = { raw: null, value: {} }

function read(): Progress {
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(KEY)
  } catch {
    return {}
  }
  if (raw === cache.raw) return cache.value
  let value: Progress = {}
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : {}
    if (parsed && typeof parsed === 'object') value = parsed as Progress
  } catch {
    // Unreadable: start again.
  }
  cache = { raw, value }
  return value
}

/** Records a finished run; keeps the best score. */
export function saveScore(slug: string, score: number) {
  const progress = read()
  const best = Math.max(score, progress[slug]?.best ?? 0)
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...progress, [slug]: { best } }))
    window.dispatchEvent(new Event(EVENT))
  } catch {
    // Storage blocked: not remembered.
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

const EMPTY: Progress = {}

/** Progress of every scenario; empty on the server and before hydration. */
export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, read, () => EMPTY)
}
