import { z } from 'zod'

import type { ConflictType } from '@/shared/simulation'

import { CONFLICT_TYPE_FIELD, CONFLICT_TYPE_STEP_ID } from './conflict-type'
import { RadioGroupField } from './form-fields'
import type { SimulationStep } from './types'

// TEMPORARY PLACEHOLDER for the conflict type step (#13), so that the steps that depend on that
// choice (losses: #14) can be reached in the app. It follows the contract of `conflict-type.ts`
// (same step id, same field) and lists the conflict types of the shared content as they are
// (today: examples). #13 replaces this file with the real step.
export function createDemoConflictTypeStep(types: readonly ConflictType[]): SimulationStep {
  if (types.length === 0) throw new Error('Simulation: no conflict type to choose from.')
  const slugs = types.map((type) => type.slug) as [string, ...string[]]
  const options = types.map((type) => ({ value: type.slug, label: type.label }))

  function Fields() {
    return (
      <div className="space-y-6">
        <p className="rounded-md bg-secondary p-3 text-sm text-secondary-foreground">
          Étape technique de démonstration, temporaire : elle ne contient aucun conseil juridique.
        </p>
        <RadioGroupField
          name={CONFLICT_TYPE_FIELD}
          legend="Quel est le type de conflit ?"
          options={options}
        />
      </div>
    )
  }

  return {
    id: CONFLICT_TYPE_STEP_ID,
    title: 'Type de conflit (étape technique)',
    description: 'Sert à choisir le type de conflit dont dépendent les étapes suivantes.',
    schema: z.object({
      [CONFLICT_TYPE_FIELD]: z.enum(slugs, { error: 'Choisissez le type de conflit.' }),
    }),
    Fields,
  }
}
