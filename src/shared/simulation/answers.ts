import { z } from 'zod'

import type { ConflictType, Question } from './schema'

// The follow-up questions are content (see schema.ts), so the schema of the
// ANSWERS cannot be written by hand: it is built from the conflict type config.
// The same schema validates the form (react-hook-form + zodResolver) and the
// API (never trust the client).
//
// Answer shapes, by question kind:
//   choice (single)   → one option value           'bruit'
//   choice (multiple) → array of option values     ['bruit', 'odeurs']
//   number            → number within min/max      120
//   yesNo             → 'yes' | 'no'               (strings: what radio inputs give)

// Shown to users: French.
const REQUIRED = 'Ce champ est obligatoire'

/** zod schema of the answer to one question. */
export function answerSchema(question: Question): z.ZodType {
  let schema: z.ZodType
  switch (question.kind) {
    case 'choice': {
      const values = question.options.map((o) => o.value) as [string, ...string[]]
      const one = z.enum(values, { error: REQUIRED })
      schema = question.multiple
        ? z.array(one, { error: REQUIRED }).min(question.required ? 1 : 0, REQUIRED)
        : one
      break
    }
    case 'number': {
      // react-hook-form `valueAsNumber` gives NaN for an empty field: refused like a missing value.
      let n = z.number({ error: REQUIRED })
      if (question.min !== undefined) n = n.min(question.min, `Minimum : ${question.min}`)
      if (question.max !== undefined) n = n.max(question.max, `Maximum : ${question.max}`)
      schema = n
      break
    }
    case 'yesNo':
      schema = z.enum(['yes', 'no'], { error: REQUIRED })
      break
  }
  return question.required ? schema : schema.optional()
}

/**
 * zod schema of all follow-up answers of a conflict type, keyed by question id.
 * Usage in a form: `useForm({ resolver: zodResolver(followUpAnswersSchema(type)) })`.
 */
export function followUpAnswersSchema(conflictType: ConflictType) {
  return z.object(
    Object.fromEntries(conflictType.followUpQuestions.map((q) => [q.id, answerSchema(q)])),
  )
}

export type FollowUpAnswers = Record<string, string | string[] | number | undefined>
