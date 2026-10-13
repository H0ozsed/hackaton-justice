import { describe, expect, it } from 'vitest'

import { buildLetter, letterSchema, type LetterInput } from './letter'

const input: LetterInput = {
  sender: 'Camille Durand',
  recipient: 'M. Martin',
  topic: 'voisinage',
  facts: 'Depuis le 3 mars, j’entends de la batterie après 23 h',
  request: 'Pourriez-vous ne plus jouer après 21 h en semaine ?',
  delay: '15',
  proposeConciliation: true,
}

describe('letterSchema', () => {
  it('turns the delay into a number of days', () => {
    expect(letterSchema.parse(input).delay).toBe(15)
  })

  it('refuses empty names, short texts and delays out of 8 to 60 days', () => {
    const result = letterSchema.safeParse({
      ...input,
      sender: ' ',
      facts: 'Trop court',
      delay: '3',
    })
    expect(result.success).toBe(false)
    const fields = result.error!.issues.map((i) => i.path[0])
    expect(fields).toEqual(expect.arrayContaining(['sender', 'facts', 'delay']))
    expect(letterSchema.safeParse({ ...input, delay: 'quinze' }).success).toBe(false)
    expect(letterSchema.safeParse({ ...input, delay: '61' }).success).toBe(false)
  })
})

describe('buildLetter', () => {
  const today = new Date(2026, 9, 13)

  it('writes a dated, courteous letter with the facts, the request and the delay', () => {
    const letter = buildLetter(letterSchema.parse(input), today)
    expect(letter).toContain('Le 13 octobre 2026')
    expect(letter).toContain('Objet : Trouble de voisinage')
    expect(letter).toContain('Depuis le 3 mars, j’entends de la batterie après 23 h.')
    expect(letter).toContain('Pourriez-vous ne plus jouer après 21 h en semaine ?')
    expect(letter).toContain('dans un délai de 15 jours')
    expect(letter).toContain('conciliateur de justice')
    expect(letter.split('\n\n').at(-1)).toBe('Camille Durand')
  })

  it('leaves the conciliator out when not wanted', () => {
    const letter = buildLetter(letterSchema.parse({ ...input, proposeConciliation: false }), today)
    expect(letter).not.toContain('conciliateur')
  })
})
