import { MoonIcon, SunIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  applyTheme,
  readStoredTheme,
  resolveTheme,
  storeTheme,
  systemPrefersDark,
  watchSystemTheme,
  type Theme,
} from '@/lib/theme'

// Light / dark switch of the header (#132). A toggle button: its name stays
// « Thème sombre » and aria-pressed says whether it is on (RGAA 7.1). The page
// already has the right theme before React loads (script in _document.tsx): this
// only reads it, then changes it on click.
export function ThemeToggle() {
  // Unknown on the server: rendered unpressed until the browser tells.
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the theme set before hydration
    setTheme(resolveTheme(readStoredTheme(), systemPrefersDark()))
    // Without an explicit choice, follow the system when it changes.
    return watchSystemTheme((prefersDark) => {
      if (readStoredTheme()) return
      const next = prefersDark ? 'dark' : 'light'
      applyTheme(next)
      setTheme(next)
    })
  }, [])

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    storeTheme(next)
    setTheme(next)
  }

  const dark = theme === 'dark'
  return (
    <Button variant="ghost" size="icon-lg" aria-pressed={dark} onClick={toggle}>
      {dark ? <MoonIcon aria-hidden /> : <SunIcon aria-hidden />}
      <span className="sr-only">Thème sombre</span>
    </Button>
  )
}
