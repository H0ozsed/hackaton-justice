import { z } from 'zod'

import { RadioGroupField, TextField } from './form-fields'
import type { SimulationStep } from './types'

// TECHNICAL DEMO STEPS, TEMPORARY (issue #12).
// They only exist to exercise the engine (navigation, validation, conditional step).
// They contain no content and no legal advice, and will be replaced by the real steps of
// #13, #14 and #15.

function DemoNotice() {
  return (
    <p className="rounded-md bg-secondary p-3 text-sm text-secondary-foreground">
      Étape technique de démonstration, temporaire : elle ne contient aucun conseil juridique.
    </p>
  )
}

const choiceSchema = z.object({
  showSecondStep: z.enum(['yes', 'no'], {
    error: 'Choisissez « oui » ou « non » pour continuer.',
  }),
})

const textSchema = z.object({
  probe: z.string().trim().min(3, { error: 'Saisissez au moins 3 caractères.' }),
})

function ChoiceFields() {
  return (
    <div className="space-y-6">
      <DemoNotice />
      <RadioGroupField
        name="showSecondStep"
        legend="Faut-il afficher l’étape technique B ?"
        options={[
          { value: 'yes', label: 'Oui' },
          { value: 'no', label: 'Non' },
        ]}
      />
    </div>
  )
}

function TextFields() {
  return (
    <div className="space-y-6">
      <DemoNotice />
      <TextField
        name="probe"
        label="Texte d’essai"
        hint="Saisissez n’importe quel texte d’au moins 3 caractères."
      />
    </div>
  )
}

// Step 1: always active. Its answer decides whether step 2 is asked.
export const demoChoiceStep: SimulationStep = {
  id: 'demo-choice',
  title: 'Étape technique A',
  description: 'Sert à vérifier la navigation et l’activation conditionnelle d’une étape.',
  schema: choiceSchema,
  Fields: ChoiceFields,
}

// Step 2: only active if step 1 was answered "yes".
export const demoTextStep: SimulationStep = {
  id: 'demo-text',
  title: 'Étape technique B',
  description: 'Sert à vérifier la validation d’un champ texte et la conservation des saisies.',
  schema: textSchema,
  isActive: (answers) => answers['demo-choice']?.showSecondStep === 'yes',
  Fields: TextFields,
}
