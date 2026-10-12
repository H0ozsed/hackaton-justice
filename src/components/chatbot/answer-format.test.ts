import { describe, expect, it } from 'vitest'

import { parseAnswer, parseInlines, plainAnswer } from './answer-format'

describe('parseInlines', () => {
  it('turns **text** into bold pieces', () => {
    expect(parseInlines('La **médiation** est gratuite.')).toEqual([
      { text: 'La ' },
      { text: 'médiation', bold: true },
      { text: ' est gratuite.' },
    ])
  })

  it('keeps only the text of a link and drops stray markup', () => {
    expect(parseInlines('Voir [la FAQ](https://exemple.fr) et `ça` *ici')).toEqual([
      { text: 'Voir la FAQ et ça ici' },
    ])
  })
})

describe('parseAnswer', () => {
  it('splits paragraphs on blank lines and joins wrapped lines', () => {
    expect(parseAnswer('Première\nsuite.\n\nDeuxième.')).toEqual([
      { type: 'paragraph', inlines: [{ text: 'Première suite.' }] },
      { type: 'paragraph', inlines: [{ text: 'Deuxième.' }] },
    ])
  })

  it('reads "-", "*", "•" and numbered lines as list items', () => {
    const [intro, list] = parseAnswer(
      'Deux pistes :\n- la **conciliation**\n* la médiation\n2. le juge',
    )
    expect(intro).toEqual({ type: 'paragraph', inlines: [{ text: 'Deux pistes :' }] })
    expect(list).toEqual({
      type: 'list',
      items: [
        [{ text: 'la ' }, { text: 'conciliation', bold: true }],
        [{ text: 'la médiation' }],
        [{ text: 'le juge' }],
      ],
    })
  })

  it('keeps the words of a title as a plain paragraph', () => {
    expect(parseAnswer('### Les pistes')).toEqual([
      { type: 'paragraph', inlines: [{ text: 'Les pistes' }] },
    ])
  })
})

describe('plainAnswer', () => {
  it('gives readable text without markup', () => {
    expect(plainAnswer('La **médiation** :\n- gratuite\n- rapide')).toBe(
      'La médiation :\n\n- gratuite\n- rapide',
    )
  })
})
