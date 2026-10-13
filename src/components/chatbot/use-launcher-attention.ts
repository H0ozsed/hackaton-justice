import { useEffect, useState } from 'react'

// The IRIS launcher catches the eye each time a page opens (#133): a pulsing ring and a
// bubble, for a few seconds. Opening IRIS ends it. Nothing is stored.

/** How long the bubble stays. The ring itself stops after 3 pulses (4.5 s, RGAA 13.8). */
export const ATTENTION_MS = 8000

/** True while the launcher should catch the eye. */
export function useLauncherAttention(open: boolean) {
  const [active, setActive] = useState(false)

  // Starts after the first render: animations begin once the page is in the browser.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- starts once per page load
    setActive(true)
    const timer = setTimeout(() => setActive(false), ATTENTION_MS)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- opening IRIS ends it
    if (open) setActive(false)
  }, [open])

  return active
}
