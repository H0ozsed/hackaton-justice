import { describe, expect, it } from 'vitest'

import { faq } from '@/shared/faq'
import { glossary } from '@/shared/glossary'
import { practicalInfo } from '@/shared/practical-info'
import { quizzes } from '@/shared/quiz'
import { channels, conflictTypes } from '@/shared/simulation'

import { buildChunks } from './chunks'

describe('buildChunks', () => {
  const chunks = buildChunks()

  it('has one chunk per indexable entry', () => {
    const questions = quizzes.all.reduce((n, quiz) => n + quiz.questions.length, 0)
    expect(chunks).toHaveLength(
      faq.all.length +
        practicalInfo.all.length +
        glossary.all.length +
        conflictTypes.all.length +
        channels.all.length +
        questions,
    )
  })

  it('gives every chunk a unique id', () => {
    expect(new Set(chunks.map((c) => c.id)).size).toBe(chunks.length)
  })

  it('links every chunk to a page of the site', () => {
    for (const chunk of chunks) expect(chunk.url).toMatch(/^\//)
  })

  it('links a glossary chunk to its anchor in the glossary page', () => {
    const term = glossary.all[0]
    expect(chunks.find((c) => c.id === `glossary:${term.slug}`)?.url).toBe(
      `/apprendre/lexique#${term.slug}`,
    )
  })

  it('keeps the question and the answer of a FAQ entry in its text', () => {
    const entry = faq.all[0]
    const chunk = chunks.find((c) => c.id === `faq:${entry.slug}`)
    expect(chunk?.text).toContain(entry.question)
    expect(chunk?.text).toContain(entry.answer)
  })
})
