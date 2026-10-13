import { describe, expect, it } from 'vitest'

import { getFaqForPage } from '@/shared/faq'
import { homeIrisQuestions } from '@/shared/home'

import { starterQuestions } from '.'

describe('starterQuestions', () => {
  it('suggests the questions of the home explainer first on the home page', () => {
    expect(starterQuestions('home')).toEqual(homeIrisQuestions.slice(0, 3))
  })

  it('fills up with the FAQ questions of the home page', () => {
    const questions = starterQuestions('home', homeIrisQuestions.length + 1)
    expect(questions.at(-1)).toBe(getFaqForPage('home')[0]?.question)
  })

  it('suggests the FAQ questions of the learn page there', () => {
    expect(starterQuestions('learn')).toEqual(
      getFaqForPage('learn')
        .slice(0, 3)
        .map((entry) => entry.question),
    )
  })
})
