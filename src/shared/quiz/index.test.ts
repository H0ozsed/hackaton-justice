import { describe, expect, it } from 'vitest'

import { isCorrect, isMultipleAnswer, type QuizQuestion } from '.'

const question = (correctChoiceIds: string[]): QuizQuestion => ({
  id: 'q',
  prompt: 'Question ?',
  choices: [
    { id: 'a', label: 'A' },
    { id: 'b', label: 'B' },
    { id: 'c', label: 'C' },
  ],
  correctChoiceIds,
  explanation: '...',
  glossary: [],
})

describe('isCorrect', () => {
  it('single answer: only the right choice is correct', () => {
    expect(isCorrect(question(['a']), ['a'])).toBe(true)
    expect(isCorrect(question(['a']), ['b'])).toBe(false)
    expect(isCorrect(question(['a']), [])).toBe(false)
  })

  it('multiple answers: all right choices, in any order, and nothing else', () => {
    const q = question(['a', 'c'])
    expect(isCorrect(q, ['c', 'a'])).toBe(true)
    expect(isCorrect(q, ['a'])).toBe(false)
    expect(isCorrect(q, ['a', 'b', 'c'])).toBe(false)
  })

  it('ignores a choice selected twice', () => {
    expect(isCorrect(question(['a']), ['a', 'a'])).toBe(true)
  })
})

describe('isMultipleAnswer', () => {
  it('is true only with several correct choices', () => {
    expect(isMultipleAnswer(question(['a']))).toBe(false)
    expect(isMultipleAnswer(question(['a', 'b']))).toBe(true)
  })
})
