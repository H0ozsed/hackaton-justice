import { useEffect, useState } from 'react'

import { STORAGE_KEY } from './use-iris'

// The IRIS launcher catches the eye when a page opens (#133): a pulsing ring and a
// bubble. Not anymore once the visitor has opened IRIS in this tab, or when a
// conversation is going on. Kept in the tab only (sessionStorage), like the conversation.

export const OPENED_KEY = 'iris-opened'

/** How long the bubble stays. The ring itself stops after 3 pulses (4.5 s, RGAA 13.8). */
export const ATTENTION_MS = 8000

function alreadyEngaged() {
  try {
    return (
      sessionStorage.getItem(OPENED_KEY) !== null || sessionStorage.getItem(STORAGE_KEY) !== null
    )
  } catch {
    return false
  }
}

/** True while the launcher should catch the eye. */
export function useLauncherAttention(open: boolean) {
  const [active, setActive] = useState(false)

  // sessionStorage only exists in the browser: decide after the first render.
  useEffect(() => {
    if (alreadyEngaged()) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- starts once, in the browser
    setActive(true)
    const timer = setTimeout(() => setActive(false), ATTENTION_MS)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!open) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- opening IRIS ends it
    setActive(false)
    try {
      sessionStorage.setItem(OPENED_KEY, '1')
    } catch {
      // Storage blocked: the launcher will catch the eye again on the next page.
    }
  }, [open])

  return active
}
