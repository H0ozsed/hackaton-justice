import { mkdtemp, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it, vi } from 'vitest'

import { glossary } from '@/shared/glossary'

import type { Chunk } from './chunks'
import {
  buildIndex,
  GLOSSARY_BOOST,
  glossaryMatches,
  indexKey,
  normalize,
  relevantResults,
  search,
  type KnowledgeIndex,
} from './knowledge'

const chunk = (id: string, text = id): Chunk => ({
  id,
  domain: 'faq',
  title: id,
  text,
  url: '/',
})

/** Fake embedding: one axis per known word, so similarities are predictable. */
const WORDS = ['voisin', 'bruit', 'loyer', 'mediation']
const fakeEmbed = vi.fn(async (texts: string[]) =>
  texts.map((t) => WORDS.map((w) => (t.toLowerCase().includes(w) ? 1 : 0))),
)

describe('indexKey', () => {
  it('changes when a text or the model changes, not otherwise', () => {
    const chunks = [chunk('a', 'voisin')]
    expect(indexKey(chunks, 'm')).toBe(indexKey([chunk('a', 'voisin')], 'm'))
    expect(indexKey(chunks, 'm')).not.toBe(indexKey([chunk('a', 'bruit')], 'm'))
    expect(indexKey(chunks, 'm')).not.toBe(indexKey(chunks, 'other'))
  })
})

describe('buildIndex', () => {
  it('embeds every chunk once, then reuses the disk cache', async () => {
    const cacheDir = await mkdtemp(path.join(tmpdir(), 'iris-'))
    const chunks = [chunk('a', 'voisin'), chunk('b', 'loyer')]
    fakeEmbed.mockClear()

    const first = await buildIndex(chunks, { embedModel: 'm', embedFn: fakeEmbed, cacheDir })
    expect(fakeEmbed).toHaveBeenCalledTimes(1)
    expect(first.chunks.map((c) => c.id)).toEqual(['a', 'b'])

    const second = await buildIndex(chunks, { embedModel: 'm', embedFn: fakeEmbed, cacheDir })
    expect(fakeEmbed).toHaveBeenCalledTimes(1)
    expect(second).toEqual(first)
    expect(await readdir(cacheDir)).toEqual([`index-${first.key}.json`])
  })

  it('re-embeds when the content changed', async () => {
    const cacheDir = await mkdtemp(path.join(tmpdir(), 'iris-'))
    fakeEmbed.mockClear()
    await buildIndex([chunk('a', 'voisin')], { embedModel: 'm', embedFn: fakeEmbed, cacheDir })
    await buildIndex([chunk('a', 'bruit')], { embedModel: 'm', embedFn: fakeEmbed, cacheDir })
    expect(fakeEmbed).toHaveBeenCalledTimes(2)
  })

  it('sends the texts in batches', async () => {
    const cacheDir = await mkdtemp(path.join(tmpdir(), 'iris-'))
    fakeEmbed.mockClear()
    const many = Array.from({ length: 40 }, (_, i) => chunk(`c${i}`))
    await buildIndex(many, { embedModel: 'm', embedFn: fakeEmbed, cacheDir })
    expect(fakeEmbed.mock.calls.map(([texts]) => texts.length)).toEqual([16, 16, 8])
  })
})

describe('search', () => {
  const index: KnowledgeIndex = {
    key: 'k',
    chunks: [
      { ...chunk('voisinage'), vector: normalize([1, 1, 0, 0]) },
      { ...chunk('location'), vector: normalize([0, 0, 1, 0]) },
      { ...chunk('autre'), vector: normalize([0, 0, 0, 1]) },
    ],
  }

  it('returns the closest chunks first, without their vectors', () => {
    const results = search(index, [1, 1, 0, 0], 'bruit de mon voisin', 2)
    expect(results.map((r) => r.chunk.id)).toEqual(['voisinage', 'location'])
    expect(results[0].score).toBeCloseTo(1)
    expect(results[0].chunk).not.toHaveProperty('vector')
  })

  it('keeps only the results above the threshold', () => {
    const results = search(index, [0, 0, 1, 0], 'loyer')
    expect(relevantResults(results, 0.5).map((r) => r.chunk.id)).toEqual(['location'])
    expect(relevantResults(search(index, [0, 0, 0, 0], 'rien'), 0.5)).toEqual([])
  })

  it('boosts the glossary entry of a term named in the question', () => {
    const term = glossary.all[0]
    const withTerm: KnowledgeIndex = {
      key: 'k',
      chunks: [
        { ...chunk(`glossary:${term.slug}`), vector: normalize([0, 1, 0, 0]) },
        { ...chunk('other'), vector: normalize([0, 1, 0, 0]) },
      ],
    }
    const [first, second] = search(withTerm, [0, 1, 0, 0], `C'est quoi ${term.term} ?`)
    expect(first.chunk.id).toBe(`glossary:${term.slug}`)
    expect(first.score - second.score).toBeCloseTo(GLOSSARY_BOOST)
  })
})

describe('glossaryMatches', () => {
  const term = glossary.all[0]

  it('finds a term written without accents or capitals', () => {
    expect(glossaryMatches(`parle-moi de ${term.term.toUpperCase()}`)).toContain(
      `glossary:${term.slug}`,
    )
  })

  it('ignores a term that is only part of a longer word', () => {
    expect(glossaryMatches(`xyz${term.term}xyz`)).not.toContain(`glossary:${term.slug}`)
  })
})
