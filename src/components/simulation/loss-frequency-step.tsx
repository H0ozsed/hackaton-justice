import type { ConflictType } from '@/shared/simulation'

import { getChosenConflictType } from './conflict-type'
import { lossFrequencySchema } from './loss-frequency'
import { LossFrequencyFields } from './loss-frequency-fields'
import type { SimulationStep, StepFieldsProps } from './types'

export const LOSS_FREQUENCY_STEP_ID = 'loss-frequency'

/**
 * "Losses and frequency" step (#14). It is only asked once a conflict type has been chosen, and
 * it only shows (and validates) the loss kinds that conflict type declares. The conflict types are
 * a parameter so that tests can use their own; the registry passes the real ones.
 */
export function createLossFrequencyStep(types: readonly ConflictType[]): SimulationStep {
  function Fields({ answers }: StepFieldsProps) {
    const lossKinds = getChosenConflictType(answers, types)?.lossKinds ?? []
    return <LossFrequencyFields lossKinds={lossKinds} />
  }

  return {
    id: LOSS_FREQUENCY_STEP_ID,
    title: 'Ce que le conflit vous coûte',
    description:
      'Estimez ce que le conflit vous coûte et à quelle fréquence il se produit. Une estimation approximative suffit.',
    isActive: (answers) => getChosenConflictType(answers, types) !== undefined,
    schema: (previous) =>
      lossFrequencySchema(getChosenConflictType(previous, types)?.lossKinds ?? []),
    Fields,
  }
}
