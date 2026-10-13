import { z } from 'zod'

import type { ConflictType } from '@/shared/simulation'

import { CONFLICT_TYPE_FIELD, CONFLICT_TYPE_STEP_ID } from './conflict-type'
import { RadioGroupField } from './form-fields'
import type { SimulationStep } from './types'

// What is shown under the label of a conflict type: its description, then its examples.
function describe(type: ConflictType) {
  const examples = type.examples.length > 0 ? `Exemples : ${type.examples.join(', ')}.` : ''
  return [type.description, examples].filter(Boolean).join(' ')
}

/**
 * "Conflict type" step (#13): the first step. The person picks the nature of their conflict among
 * the content conflict types; that choice drives the next steps (follow-up questions, losses).
 * It follows the contract of `conflict-type.ts`: step id `conflict-type`, answer field `type`.
 * The conflict types are a parameter so that tests can use their own; the registry passes the
 * real ones.
 */
export function createConflictTypeStep(types: readonly ConflictType[]): SimulationStep {
  if (types.length === 0) throw new Error('Simulation: no conflict type to choose from.')
  const slugs = types.map((type) => type.slug) as [string, ...string[]]
  const options = types.map((type) => ({
    value: type.slug,
    label: type.label,
    description: describe(type),
  }))

  function Fields() {
    return (
      <RadioGroupField
        name={CONFLICT_TYPE_FIELD}
        legend="Quel type de conflit correspond le mieux à votre situation ?"
        hint="Si plusieurs vous concernent, choisissez celui qui vous pèse le plus. Votre choix permet de vous proposer les bons interlocuteurs."
        options={options}
      />
    )
  }

  return {
    id: CONFLICT_TYPE_STEP_ID,
    title: 'Type de conflit',
    description:
      'Choisissez la situation qui ressemble le plus à la vôtre : la suite du parcours s’adapte à votre choix.',
    schema: z.object({
      [CONFLICT_TYPE_FIELD]: z.enum(slugs, {
        error: 'Choisissez le type de conflit qui correspond le mieux à votre situation.',
      }),
    }),
    Fields,
  }
}
