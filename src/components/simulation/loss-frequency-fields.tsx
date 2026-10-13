import type { ReactNode } from 'react'

import { LOSS_KIND_LABELS, type LossKind } from '@/shared/simulation'

import { NumberField, RadioGroupField } from './form-fields'
import { FREQUENCY_OPTIONS, IMPACT_OPTIONS, TIME_UNIT_OPTIONS } from './loss-frequency'

// Fields of the "losses and frequency" step (#14): one block per loss kind declared by the chosen
// conflict type (each kind has its own UI), then the frequency, always asked. Wording is
// provisional UI copy, see `loss-frequency.ts`.
export function LossFrequencyFields({ lossKinds }: { lossKinds: readonly LossKind[] }) {
  return (
    <div className="space-y-8">
      {lossKinds.map((kind) => (
        <LossBlock key={kind} kind={kind} />
      ))}
      <RadioGroupField
        name="frequency"
        legend="À quelle fréquence le conflit se produit-il ?"
        hint="Un trouble qui se répète pèse plus lourd : cela aide à mesurer l’urgence."
        options={[...FREQUENCY_OPTIONS]}
      />
    </div>
  )
}

function LossGroup({ kind, children }: { kind: LossKind; children: ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-md border p-4">
      <legend className="px-1 font-medium">{LOSS_KIND_LABELS[kind]}</legend>
      {children}
    </fieldset>
  )
}

function LossBlock({ kind }: { kind: LossKind }) {
  switch (kind) {
    case 'money':
      return (
        <LossGroup kind={kind}>
          <NumberField
            name="money"
            label="Montant estimé, en euros (€)"
            hint="Ce que le conflit vous a déjà coûté. Exemple : 150 ou 149,90. Saisissez 0 si vous n’avez rien perdu pour l’instant."
          />
        </LossGroup>
      )
    case 'time':
      return (
        <LossGroup kind={kind}>
          <NumberField
            name="time"
            label="Durée estimée"
            hint="Temps déjà passé à cause du conflit. Exemple : 3 ou 2,5. Saisissez 0 si vous n’avez rien perdu pour l’instant."
          />
          <RadioGroupField
            name="timeUnit"
            legend="Unité de la durée"
            options={[...TIME_UNIT_OPTIONS]}
          />
        </LossGroup>
      )
    case 'health':
      return (
        <LossGroup kind={kind}>
          <RadioGroupField
            name="health"
            legend="Effet du conflit sur votre bien-être (stress, sommeil, fatigue…)"
            hint="Votre ressenti suffit."
            options={[...IMPACT_OPTIONS]}
          />
        </LossGroup>
      )
    case 'relationship':
      return (
        <LossGroup kind={kind}>
          <RadioGroupField
            name="relationship"
            legend="Effet du conflit sur vos relations (famille, voisinage, travail…)"
            hint="Quand la relation compte, une médiation peut aider à la préserver."
            options={[...IMPACT_OPTIONS]}
          />
        </LossGroup>
      )
  }
}
