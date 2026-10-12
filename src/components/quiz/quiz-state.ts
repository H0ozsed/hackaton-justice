import { isCorrect, type Quiz } from '@/shared/quiz'

// State machine of one quiz run (#21). Pure: (state, action) → next state, no UI.
//
//   answering ──answer──► feedback ──next──► answering (next question)
//                             └─────next on the last question──► finished
//   any state ──restart──► answering (first question, results cleared)
//
// Invalid actions (answering twice, skipping a question...) leave the state unchanged.

export type QuestionResult = {
  questionId: string
  selectedIds: string[]
  correct: boolean
}

export type QuizState =
  | { status: 'answering'; index: number; results: QuestionResult[] }
  /** The answer to question `index` is the last item of `results`. */
  | { status: 'feedback'; index: number; results: QuestionResult[] }
  | { status: 'finished'; results: QuestionResult[] }

export type QuizAction =
  { type: 'answer'; selectedIds: string[] } | { type: 'next' } | { type: 'restart' }

export const initialQuizState: QuizState = { status: 'answering', index: 0, results: [] }

export function quizReducer(quiz: Quiz, state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'answer': {
      if (state.status !== 'answering') return state
      const question = quiz.questions[state.index]
      if (!question) return state
      const choiceIds = new Set(question.choices.map((c) => c.id))
      const selectedIds = [...new Set(action.selectedIds)]
      // An empty or unknown selection is not an answer: the form must not send it.
      if (selectedIds.length === 0 || selectedIds.some((id) => !choiceIds.has(id))) return state
      return {
        status: 'feedback',
        index: state.index,
        results: [
          ...state.results,
          { questionId: question.id, selectedIds, correct: isCorrect(question, selectedIds) },
        ],
      }
    }
    case 'next': {
      if (state.status !== 'feedback') return state
      const nextIndex = state.index + 1
      return nextIndex < quiz.questions.length
        ? { status: 'answering', index: nextIndex, results: state.results }
        : { status: 'finished', results: state.results }
    }
    case 'restart':
      return initialQuizState
  }
}

export type QuizScore = { correct: number; total: number; percent: number }

/** Score over the whole quiz (unanswered questions count as wrong). */
export function quizScore(quiz: Quiz, results: readonly QuestionResult[]): QuizScore {
  const total = quiz.questions.length
  const correct = results.filter((r) => r.correct).length
  return { correct, total, percent: total === 0 ? 0 : Math.round((correct / total) * 100) }
}
