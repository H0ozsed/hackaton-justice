import { describe, expect, it } from 'vitest'

import { guides, keyFigures, routes } from '@/shared/amicable'
import { faq } from '@/shared/faq'
import { glossary } from '@/shared/glossary'
import { explainer } from '@/shared/home'
import { practicalInfo } from '@/shared/practical-info'
import { quizzes } from '@/shared/quiz'
import { channels, conflictTypes } from '@/shared/simulation'

import { buildChunks, isPlaceholder } from './chunks'

describe('buildChunks', () => {
  const chunks = buildChunks()

  it('has one chunk per written entry, and none for placeholder content', () => {
    const written = (texts: string[]) => texts.filter((t) => !isPlaceholder(t)).length
    // Home: one chunk per explainer card, plus « Par où commencer ? » and « À propos ».
    expect(chunks).toHaveLength(
      explainer.all.length +
        2 +
        written(faq.all.map((e) => e.answer)) +
        written(practicalInfo.all.map((i) => i.body)) +
        written(glossary.all.map((t) => t.definition)) +
        written(conflictTypes.all.map((t) => t.description)) +
        written(channels.all.map((c) => c.description)) +
        written(quizzes.all.flatMap((q) => q.questions.map((x) => x.explanation))) +
        guides.all.length +
        routes.all.length +
        keyFigures.all.length,
    )
  })

  it('recognises text the content team has not written at all', () => {
    expect(isPlaceholder('EXEMPLE — à remplacer.')).toBe(true)
    expect(isPlaceholder('EXEMPLE — à remplacer. Démarche pour trouver un accord.')).toBe(false)
    expect(isPlaceholder('La médiation est gratuite.')).toBe(false)
  })

  it('removes the example markers from the indexed text', () => {
    for (const chunk of chunks) expect(chunk.text).not.toMatch(/à remplacer/i)
  })

  it('gives every chunk a unique id', () => {
    expect(new Set(chunks.map((c) => c.id)).size).toBe(chunks.length)
  })

  it('links every chunk to a page of the site', () => {
    for (const chunk of chunks) expect(chunk.url).toMatch(/^\//)
  })

  it('links a glossary chunk to its anchor in the glossary page', () => {
    const term = glossary.all.find((t) => !isPlaceholder(t.definition))!
    expect(chunks.find((c) => c.id === `glossary:${term.slug}`)?.url).toBe(
      `/apprendre/lexique#${term.slug}`,
    )
  })

  it('tells IRIS which journey fits each situation of the home orientation', () => {
    const chunk = chunks.find((c) => c.id === 'home:par-ou-commencer')
    expect(chunk?.url).toBe('/#par-ou-commencer')
    expect(chunk?.text).toContain(
      'Je vis un conflit en ce moment : parcours Simulation (/simulation)',
    )
  })

  it('indexes the explainer cards without the glossary markup', () => {
    for (const card of explainer.all) {
      expect(chunks.find((c) => c.id === `home:${card.slug}`)?.text).not.toMatch(/\[\[|\]\]/)
    }
  })

  it('keeps the question and the answer of a FAQ entry in its text', () => {
    const entry = faq.all.find((e) => !isPlaceholder(e.answer))
    if (!entry) return
    const chunk = chunks.find((c) => c.id === `faq:${entry.slug}`)
    expect(chunk?.text).toContain(entry.question)
    expect(chunk?.text).toContain(entry.answer)
  })

  it('indexes the step-by-step guides of /demarches with every step', () => {
    const guide = guides.all[0]!
    const chunk = chunks.find((c) => c.id === `guide:${guide.slug}`)
    expect(chunk?.url).toBe('/demarches#pas-a-pas')
    for (const step of guide.steps) expect(chunk?.text).toContain(step.text)
  })
})
