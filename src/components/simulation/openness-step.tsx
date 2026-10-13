import { RadioGroupField } from './form-fields'
import {
  OPENNESS_STEP_ID,
  OTHER_PARTY_OPENNESS_OPTIONS,
  USER_OPENNESS_OPTIONS,
  opennessSchema,
} from './openness'
import type { SimulationStep } from './types'

// "Openness to discussion" step (#15). Always asked, whatever the conflict type. Wording is
// provisional UI copy, see `openness.ts`.
function OpennessFields() {
  return (
    <div className="space-y-8">
      <RadioGroupField
        name="userOpenness"
        legend="Seriez-vous prêt(e) à discuter avec l’autre partie pour trouver un accord ?"
        hint="Directement ou avec l’aide d’une personne neutre, comme un conciliateur ou un médiateur."
        options={USER_OPENNESS_OPTIONS}
      />
      <RadioGroupField
        name="otherPartyOpenness"
        legend="Selon vous, l’autre partie serait-elle prête à en discuter ?"
        hint="Votre ressenti suffit. Répondez « Je ne sais pas » si vous ne pouvez pas le dire."
        options={OTHER_PARTY_OPENNESS_OPTIONS}
      />
    </div>
  )
}

export const opennessStep: SimulationStep = {
  id: OPENNESS_STEP_ID,
  title: 'Ouverture à la discussion',
  description:
    'Ces deux questions aident à savoir si une solution à l’amiable est envisageable. Il n’y a pas de mauvaise réponse.',
  schema: opennessSchema,
  Fields: OpennessFields,
}
