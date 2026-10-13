// Light / dark theme (#132). By default the site follows the system preference
// (`prefers-color-scheme`); the header toggle stores an explicit choice on the device
// (localStorage, nothing sent anywhere). The `dark` class on <html> switches the
// colors (src/styles/globals.css).

export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'theme'

const DARK_QUERY = '(prefers-color-scheme: dark)'

/** A stored value we understand, or null (nothing stored, or anything else). */
export function parseStoredTheme(value: string | null | undefined): Theme | null {
  return value === 'light' || value === 'dark' ? value : null
}

/** The explicit choice wins; otherwise the system preference. */
export function resolveTheme(stored: Theme | null, systemPrefersDark: boolean): Theme {
  return stored ?? (systemPrefersDark ? 'dark' : 'light')
}

export function readStoredTheme(): Theme | null {
  try {
    return parseStoredTheme(localStorage.getItem(THEME_STORAGE_KEY))
  } catch {
    return null
  }
}

export function storeTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Storage blocked (private mode...): the choice lasts until the page is left.
  }
}

export function systemPrefersDark() {
  return typeof matchMedia === 'function' && matchMedia(DARK_QUERY).matches
}

/** Calls `onChange` when the system preference changes; returns the unsubscribe. */
export function watchSystemTheme(onChange: (prefersDark: boolean) => void) {
  if (typeof matchMedia !== 'function') return () => {}
  const query = matchMedia(DARK_QUERY)
  const listener = (event: MediaQueryListEvent) => onChange(event.matches)
  query.addEventListener('change', listener)
  return () => query.removeEventListener('change', listener)
}

export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement) {
  root.classList.toggle('dark', theme === 'dark')
}

/**
 * Inline script of _document.tsx: sets the theme before the first paint, so a dark
 * page never flashes white. Plain ES5, no import: it runs before the app's bundle.
 * Same rules as `resolveTheme`.
 */
export const THEME_SCRIPT = `(function(){try{var s=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});var d=s==='dark'||(s!=='light'&&window.matchMedia(${JSON.stringify(
  DARK_QUERY,
)}).matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})()`
