import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { assertReferences, defineCollection, isUnique, slugSchema } from './content'

const schema = z.object({ slug: slugSchema, title: z.string().min(1) })

describe('defineCollection', () => {
  it('validates entries and indexes them by slug', () => {
    const c = defineCollection('things', schema, [
      { slug: 'a', title: 'A' },
      { slug: 'b', title: 'B' },
    ])
    expect(c.all).toHaveLength(2)
    expect(c.find('b')?.title).toBe('B')
    expect(c.find('nope')).toBeUndefined()
    expect(c.has('a')).toBe(true)
    expect(() => c.get('nope')).toThrow('Unknown slug "nope" in "things"')
  })

  it('rejects a duplicate slug', () => {
    expect(() =>
      defineCollection('things', schema, [
        { slug: 'a', title: 'A' },
        { slug: 'a', title: 'A bis' },
      ]),
    ).toThrow('duplicate slug "a"')
  })

  it('names the faulty entry by its slug and the field', () => {
    expect(() => defineCollection('things', schema, [{ slug: 'a', title: '' }])).toThrow(
      /"a" > title:/,
    )
  })

  it('rejects a slug that is not kebab-case', () => {
    expect(() => defineCollection('things', schema, [{ slug: 'Pas Bon', title: 'x' }])).toThrow(
      /kebab-case/,
    )
  })
})

describe('assertReferences', () => {
  const target = { name: 'term', has: (slug: string) => slug === 'ok' }

  it('accepts existing references', () => {
    expect(() => assertReferences('quiz', target, [['q1', 'ok']])).not.toThrow()
  })

  it('reports where the broken reference is', () => {
    expect(() => assertReferences('quiz', target, [['q1', 'missing']])).toThrow(
      'q1 references unknown term "missing"',
    )
  })
})

describe('isUnique', () => {
  it('detects duplicates', () => {
    expect(isUnique(['a', 'b'])).toBe(true)
    expect(isUnique(['a', 'a'])).toBe(false)
  })
})
