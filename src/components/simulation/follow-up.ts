import { z } from 'zod'

import { followUpAnswersSchema, type ConflictType, type Question } from '@/shared/simulation'

import { parseDecimal } from './numbers'
import type { StepValues } from './types'

// Rules of the follow-up questions step (#13). The questions are content: each conflict type
// declares its own (`followUpQuestions`), and `followUpAnswersSchema` of `@/shared/simulation`
// builds the schema of their answers. This step validates through that schema, and only adds what
// the form needs around it: the number questions are typed as text (like the losses step), so the
// raw text is turned into a number before validation, and unreadable text gets its own message.

export const FOLLOW_UP_STEP_ID = 'follow-up'

const NOT_A_NUMBER = 'Saisissez un nombre en chiffres (exemple : 12 ou 12,5).'

const isBlank = (value: unknown) =>
  value === undefined || value === null || (typeof value === 'string' && value.trim() === '')

// What `followUpAnswersSchema` expects: no null (a missing answer is undefined), and for number
// questions a number (NaN for a required empty field, which it refuses like a missing value) or
// undefined for an optional empty field.
function toAnswers(raw: Record<string, unknown>, questions: readonly Question[]) {
  const answers = { ...raw }
  for (const question of questions) {
    // An unchecked group of radio buttons gives null: the same as no answer.
    if (answers[question.id] === null) answers[question.id] = undefined
    // Checkboxes that were never touched do not give a list: no box checked is an empty list.
    if (question.kind === 'choice' && question.multiple && !Array.isArray(answers[question.id])) {
      answers[question.id] = question.required ? undefined : []
    }
    if (question.kind !== 'number') continue
    const value = answers[question.id]
    answers[question.id] = isBlank(value)
      ? question.required
        ? Number.NaN
        : undefined
      : parseDecimal(value)
  }
  return answers
}

// Something was typed, but it is not a number.
const isUnreadableNumber = (value: unknown) => !isBlank(value) && Number.isNaN(parseDecimal(value))

/**
 * zod schema of the follow-up step for a conflict type (no question when there is none). Every
 * error of the shared schema is reported at once; a number question typed with unreadable text
 * says so, instead of "Ce champ est obligatoire".
 */
export function followUpSchema(conflictType: ConflictType | undefined) {
  const questions = conflictType?.followUpQuestions ?? []
  const shared = conflictType ? followUpAnswersSchema(conflictType) : z.object({})

  // The values of a form are always an object: record in, validated answers out.
  return z.record(z.string(), z.unknown()).transform((values, ctx): StepValues => {
    const result = shared.safeParse(toAnswers(values, questions))
    if (result.success) return result.data

    const unreadable = new Set(
      questions
        .filter((q) => q.kind === 'number' && isUnreadableNumber(values[q.id]))
        .map((q) => q.id),
    )
    for (const issue of result.error.issues) {
      const [id] = issue.path
      ctx.addIssue({
        code: 'custom',
        path: issue.path,
        message: typeof id === 'string' && unreadable.has(id) ? NOT_A_NUMBER : issue.message,
      })
    }
    return z.NEVER
  })
}
