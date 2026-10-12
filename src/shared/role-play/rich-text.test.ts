import { describe, expect, it } from 'vitest'

import { hasBrokenMarkup, parseRichText, plainText, termSlugs } from './rich-text'

describe('parseRichText', () => {
  it('returns a single text segment when there is no markup', () => {
    expect(parseRichText('Bonjour')).toEqual([{ kind: 'text', text: 'Bonjour' }])
  })

  it('splits glossary terms, with or without a displayed text', () => {
    expect(parseRichText('Une [[mise-en-demeure]] ou un [[mediation|médiateur]].')).toEqual([
      { kind: 'text', text: 'Une ' },
      { kind: 'term', slug: 'mise-en-demeure' },
      { kind: 'text', text: ' ou un ' },
      { kind: 'term', slug: 'mediation', text: 'médiateur' },
      { kind: 'text', text: '.' },
    ])
  })
})

describe('termSlugs', () => {
  it('lists the referenced slugs', () => {
    expect(termSlugs('[[a]] et [[b|B]]')).toEqual(['a', 'b'])
  })
})

describe('plainText', () => {
  it('removes the markup', () => {
    expect(plainText('Un [[mediation|médiateur]] et [[x]]', () => 'X')).toBe('Un médiateur et X')
  })
})

describe('hasBrokenMarkup', () => {
  it('detects unclosed or stray brackets only', () => {
    expect(hasBrokenMarkup('Une [[mise-en-demeure]]')).toBe(false)
    expect(hasBrokenMarkup('Une [[mise-en-demeure')).toBe(true)
    expect(hasBrokenMarkup('fin]]')).toBe(true)
  })
})
