import { z } from 'zod'

import type { LossKind } from '@/shared/simulation'

import { hasAtMostTwoDecimals, parseDecimal } from './numbers'

// Rules of the "losses and frequency" step (#14). The fields asked depend on the `lossKinds` of
// the chosen conflict type: only those are validated, and only those are kept in the answers
// (zod drops the other keys, e.g. leftovers of a previously chosen conflict type).
//
// Wording below is PROVISIONAL UI copy (no legal content). If the content team wants to own it,
// it can move to `src/shared/simulation` later.
//
// Values:
//   money         number in euros, >= 0, at most 2 decimals
//   time + unit   number >= 0 with 'hours' | 'days' (the unit changes the plausible maximum)
//   health, relationship   one impact level
//   frequency     one frequency (always asked)
// Zero is accepted on purpose: a declared loss can be nil so far. Negative, non-numeric and
// implausible values are refused with a message that says how to fix them.

export const MAX_MONEY = 1_000_000
export const MAX_HOURS = 8760 // one year
export const MAX_DAYS = 365

export const FREQUENCY_OPTIONS = [
  { value: 'once', label: 'Une seule fois' },
  { value: 'rarely', label: 'Quelques fois par an' },
  { value: 'monthly', label: 'Une ou plusieurs fois par mois' },
  { value: 'weekly', label: 'Une ou plusieurs fois par semaine' },
  { value: 'daily', label: 'Tous les jours ou presque' },
] as const

/** Impact levels, from the lightest to the strongest (the order is meaningful). */
export const IMPACT_OPTIONS = [
  { value: 'none', label: 'Aucun effet' },
  { value: 'low', label: 'Faible' },
  { value: 'moderate', label: 'Modéré' },
  { value: 'high', label: 'Fort' },
  { value: 'very-high', label: 'Très fort' },
] as const

export const TIME_UNIT_OPTIONS = [
  { value: 'hours', label: 'Heures' },
  { value: 'days', label: 'Jours' },
] as const

const values = <T extends readonly { value: string }[]>(options: T) =>
  options.map((option) => option.value) as [T[number]['value'], ...T[number]['value'][]]

const moneySchema = z.preprocess(
  parseDecimal,
  z
    .number({ error: 'Saisissez un montant en chiffres, en euros (exemple : 150 ou 149,90).' })
    .min(0, {
      error: 'Le montant ne peut pas être négatif. Saisissez 0 si vous n’avez rien perdu.',
    })
    .max(MAX_MONEY, {
      error: 'Ce montant semble trop élevé (maximum 1 000 000 €). Vérifiez la valeur saisie.',
    })
    .refine(hasAtMostTwoDecimals, {
      error: 'Indiquez au plus deux chiffres après la virgule (exemple : 149,90).',
    }),
)

const timeSchema = z.preprocess(
  parseDecimal,
  z.number({ error: 'Saisissez une durée en chiffres (exemple : 3 ou 2,5).' }).min(0, {
    error: 'La durée ne peut pas être négative. Saisissez 0 si vous n’avez rien perdu.',
  }),
)

const timeUnitSchema = z.enum(values(TIME_UNIT_OPTIONS), {
  error: 'Choisissez l’unité de la durée : heures ou jours.',
})

const impactSchema = z.enum(values(IMPACT_OPTIONS), { error: 'Choisissez un niveau.' })

const frequencySchema = z.enum(values(FREQUENCY_OPTIONS), {
  error: 'Indiquez à quelle fréquence le conflit se produit.',
})

// Fields (and so rules) of each loss kind.
const LOSS_FIELDS: Record<LossKind, Record<string, z.ZodType>> = {
  money: { money: moneySchema },
  time: { time: timeSchema, timeUnit: timeUnitSchema },
  health: { health: impactSchema },
  relationship: { relationship: impactSchema },
}

// True unless the time, in this unit, is longer than `max`. Reads the object defensively: the
// other fields may be invalid, and a missing or unreadable time (NaN included) or unit is not this
// rule's business.
const notLongerThan = (unit: 'hours' | 'days', max: number) => (value: Record<string, unknown>) =>
  typeof value !== 'object' ||
  value === null ||
  value.timeUnit !== unit ||
  typeof value.time !== 'number' ||
  !Number.isFinite(value.time) ||
  value.time <= max

/**
 * zod schema of the step for a conflict type declaring these loss kinds: one block per declared
 * kind, plus the frequency. A time longer than a year (in the chosen unit) is refused: it usually
 * means the wrong unit was picked.
 *
 * That rule involves two fields, so it is checked on the whole object. `when` makes zod run it
 * even if another field is invalid (by default it would wait for every other error to be fixed),
 * so that all the problems are shown at once.
 */
export function lossFrequencySchema(lossKinds: readonly LossKind[]) {
  const shape: Record<string, z.ZodType> = {}
  for (const kind of lossKinds) Object.assign(shape, LOSS_FIELDS[kind])
  shape.frequency = frequencySchema

  return z
    .object(shape)
    .refine(notLongerThan('hours', MAX_HOURS), {
      error: 'Plus d’un an (8 760 heures) : vérifiez la durée, ou choisissez l’unité « jours ».',
      path: ['time'],
      when: () => true,
    })
    .refine(notLongerThan('days', MAX_DAYS), {
      error: 'Plus d’un an (365 jours) : vérifiez la durée et l’unité choisie.',
      path: ['time'],
      when: () => true,
    })
}
