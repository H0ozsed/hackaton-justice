import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { clearBrowserStorage } from '@/shared/privacy'

// Erases what the site keeps in this browser (/cookies). The result is announced by a status
// region that is always in the DOM, so screen readers read the message when it appears.

const MESSAGES = {
  done: 'Les données du site ont été effacées de ce navigateur.',
  failed:
    'Votre navigateur bloque le stockage pour ce site : aucune donnée n’y est gardée, il n’y a rien à effacer.',
}

export function ClearBrowserStorage() {
  const [result, setResult] = useState<keyof typeof MESSAGES | null>(null)

  return (
    <div className="space-y-3">
      <Button
        type="button"
        className="h-auto py-2 whitespace-normal"
        onClick={() => setResult(clearBrowserStorage() ? 'done' : 'failed')}
      >
        Effacer les données du site sur cet appareil
      </Button>
      <p role="status" className="font-semibold">
        {result && MESSAGES[result]}
      </p>
    </div>
  )
}
