import { describe, expect, it } from 'vitest'

import { parseStoredTheme, resolveTheme, THEME_SCRIPT, THEME_STORAGE_KEY } from './theme'

describe('resolveTheme', () => {
  it('follows the system preference when nothing is stored', () => {
    expect(resolveTheme(null, true)).toBe('dark')
    expect(resolveTheme(null, false)).toBe('light')
  })

  it('keeps the choice stored with the toggle over the system preference', () => {
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })
})

describe('parseStoredTheme', () => {
  it('ignores anything that is not a theme', () => {
    expect(parseStoredTheme('dark')).toBe('dark')
    expect(parseStoredTheme('light')).toBe('light')
    expect(parseStoredTheme('blue')).toBeNull()
    expect(parseStoredTheme(null)).toBeNull()
  })
})

/** Runs the inline script of _document.tsx and returns the classes it sets on <html>. */
function runThemeScript(stored: string | null, systemDark: boolean) {
  const classes = new Set<string>()
  const env = {
    localStorage: { getItem: (key: string) => (key === THEME_STORAGE_KEY ? stored : null) },
    window: { matchMedia: () => ({ matches: systemDark }) },
    document: {
      documentElement: {
        classList: {
          toggle: (name: string, on: boolean) => (on ? classes.add(name) : classes.delete(name)),
        },
      },
    },
  }
  new Function('localStorage', 'window', 'document', THEME_SCRIPT)(
    env.localStorage,
    env.window,
    env.document,
  )
  return classes.has('dark') ? 'dark' : 'light'
}

describe('THEME_SCRIPT (set before the first paint)', () => {
  it.each([
    [null, true],
    [null, false],
    ['light', true],
    ['dark', false],
    ['nonsense', true],
  ] as const)('stored %s, system dark %s: same theme as resolveTheme', (stored, systemDark) => {
    expect(runThemeScript(stored, systemDark)).toBe(
      resolveTheme(parseStoredTheme(stored), systemDark),
    )
  })
})
