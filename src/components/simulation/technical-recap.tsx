import { Button } from '@/components/ui/button'

import type { ResultViewProps } from './types'

// TEMPORARY end screen (#12): lists the answers of the active steps, as the engine provides
// them. It is not the final result (routing to a channel: #16), which will replace it.
export function TechnicalRecap({ result, onRestart }: ResultViewProps) {
  const entries = Object.entries(result)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Récapitulatif technique</h2>
      <p className="rounded-md bg-secondary p-3 text-sm text-secondary-foreground">
        Écran de démonstration, temporaire : il liste les réponses des étapes actives, rien de plus.
        Ce n’est pas un résultat de simulation.
      </p>
      {entries.length === 0 ? (
        <p>Aucune réponse.</p>
      ) : (
        <dl className="space-y-3">
          {entries.map(([stepId, values]) => (
            <div key={stepId}>
              <dt className="font-medium">{stepId}</dt>
              <dd className="break-all text-muted-foreground">{JSON.stringify(values)}</dd>
            </div>
          ))}
        </dl>
      )}
      <Button type="button" variant="outline" size="lg" onClick={onRestart}>
        Recommencer
      </Button>
    </div>
  )
}
