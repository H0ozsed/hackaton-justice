import { describe, expect, it } from 'vitest'

import type { Quiz } from '@/shared/quiz'

import {
  initialQuizState,
  quizReducer,
  quizScore,
  type QuizAction,
  type QuizState,
} from './quiz-state'

const QUIZ: Quiz = {
  slug: 'test',
  title: 'Test',
  questions: [
    {
      id: 'q1',
      prompt: 'Une réponse ?',
      choices: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
      correctChoiceIds: ['a'],
      explanation: '...',
      glossary: [],
    },
    {
      id: 'q2',
      prompt: 'Plusieurs réponses ?',
      choices: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'c', label: 'C' },
      ],
      correctChoiceIds: ['a', 'c'],
      explanation: '...',
      glossary: [],
    },
  ],
}

const run = (...actions: QuizAction[]): QuizState =>
  actions.reduce((state, action) => quizReducer(QUIZ, state, action), initialQuizState)

describe('quizReducer', () => {
  it('starts on the first question', () => {
    expect(initialQuizState).toEqual({ status: 'answering', index: 0, results: [] })
  })

  it('records a correct answer and shows the feedback', () => {
    expect(run({ type: 'answer', selectedIds: ['a'] })).toEqual({
      status: 'feedback',
      index: 0,
      results: [{ questionId: 'q1', selectedIds: ['a'], correct: true }],
    })
  })

  it('records a wrong answer', () => {
    const state = run({ type: 'answer', selectedIds: ['b'] })
    expect(state.status === 'feedback' && state.results[0]?.correct).toBe(false)
  })

  it('moves to the next question, then finishes after the last one', () => {
    const second = run({ type: 'answer', selectedIds: ['a'] }, { type: 'next' })
    expect(second).toMatchObject({ status: 'answering', index: 1 })

    const done = run(
      { type: 'answer', selectedIds: ['a'] },
      { type: 'next' },
      { type: 'answer', selectedIds: ['c', 'a'] },
      { type: 'next' },
    )
    expect(done.status).toBe('finished')
    expect(done.results.map((r) => r.correct)).toEqual([true, true])
  })

  it('refuses to answer the same question twice', () => {
    const once = run({ type: 'answer', selectedIds: ['b'] })
    expect(quizReducer(QUIZ, once, { type: 'answer', selectedIds: ['a'] })).toBe(once)
  })

  it('ignores an empty or unknown selection', () => {
    expect(run({ type: 'answer', selectedIds: [] })).toBe(initialQuizState)
    expect(run({ type: 'answer', selectedIds: ['z'] })).toBe(initialQuizState)
  })

  it('does not skip a question without answering', () => {
    expect(run({ type: 'next' })).toBe(initialQuizState)
  })

  it('counts a choice selected twice once', () => {
    const state = run({ type: 'answer', selectedIds: ['a', 'a'] })
    expect(state.results[0]).toMatchObject({ selectedIds: ['a'], correct: true })
  })

  it('restarts from scratch', () => {
    const state = run({ type: 'answer', selectedIds: ['a'] }, { type: 'restart' })
    expect(state).toEqual(initialQuizState)
  })
})

describe('quizScore', () => {
  it('gives the number of right answers and the rounded percentage', () => {
    const state = run(
      { type: 'answer', selectedIds: ['a'] },
      { type: 'next' },
      { type: 'answer', selectedIds: ['a'] },
      { type: 'next' },
    )
    expect(quizScore(QUIZ, state.results)).toEqual({ correct: 1, total: 2, percent: 50 })
  })

  it('counts unanswered questions as wrong', () => {
    expect(quizScore(QUIZ, [])).toEqual({ correct: 0, total: 2, percent: 0 })
  })
})
