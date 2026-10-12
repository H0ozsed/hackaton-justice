import { glossary } from '@/shared/glossary'
import { assertReferences, defineCollection } from '@/lib/content'

import { quizzesData } from './data'
import { quizSchema, type QuizQuestion } from './schema'

export type { Quiz, QuizQuestion } from './schema'

export const quizzes = defineCollection('quizzes', quizSchema, quizzesData)

assertReferences(
  'quizzes',
  { name: 'glossary term', has: glossary.has },
  quizzes.all.flatMap((quiz) =>
    quiz.questions.flatMap((q) =>
      q.glossary.map((slug) => [`"${quiz.slug}" > "${q.id}".glossary`, slug] as const),
    ),
  ),
)

/** Several correct answers: render checkboxes instead of radios. */
export function isMultipleAnswer(question: QuizQuestion) {
  return question.correctChoiceIds.length > 1
}

/** True when the selected ids are exactly the correct ones (order ignored). */
export function isCorrect(question: QuizQuestion, selectedIds: readonly string[]) {
  const selected = new Set(selectedIds)
  return (
    selected.size === question.correctChoiceIds.length &&
    question.correctChoiceIds.every((id) => selected.has(id))
  )
}
