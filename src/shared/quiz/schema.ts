import { z } from 'zod'

import { isUnique, slugSchema } from '@/lib/content'

export const quizQuestionSchema = z
  .object({
    id: slugSchema,
    prompt: z.string().min(1),
    choices: z.array(z.object({ id: slugSchema, label: z.string().min(1) })).min(2),
    /** One id: single answer (radios). Several: multiple answers (checkboxes). */
    correctChoiceIds: z.array(slugSchema).min(1),
    /** Shown after answering. */
    explanation: z.string().min(1),
    /** Glossary slugs to link from the explanation. */
    glossary: z.array(slugSchema).default([]),
  })
  .superRefine((q, ctx) => {
    const ids = q.choices.map((c) => c.id)
    if (!isUnique(ids))
      ctx.addIssue({ code: 'custom', message: 'choice ids must be unique', path: ['choices'] })
    if (!isUnique(q.correctChoiceIds))
      ctx.addIssue({
        code: 'custom',
        message: 'correct ids must be unique',
        path: ['correctChoiceIds'],
      })
    for (const id of q.correctChoiceIds) {
      if (!ids.includes(id))
        ctx.addIssue({
          code: 'custom',
          message: `"${id}" is not a choice id`,
          path: ['correctChoiceIds'],
        })
    }
  })

export const quizSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1),
  description: z.string().min(1).optional(),
  questions: z
    .array(quizQuestionSchema)
    .min(1)
    .refine((q) => isUnique(q.map((x) => x.id)), 'question ids must be unique'),
})

export type Quiz = z.output<typeof quizSchema>
export type QuizQuestion = z.output<typeof quizQuestionSchema>
export type QuizInput = z.input<typeof quizSchema>
