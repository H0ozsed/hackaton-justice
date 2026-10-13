import { describe, expect, it } from 'vitest'

import { smallTalk } from './conversation'

describe('smallTalk', () => {
  it('recognises a greeting, a thank-you and a goodbye on their own', () => {
    expect(smallTalk('Bonjour IRIS !')).toBe('greeting')
    expect(smallTalk('merci beaucoup')).toBe('thanks')
    expect(smallTalk('Au revoir')).toBe('goodbye')
  })

  it.each([
    'Qui es-tu ?',
    'tu es qui',
    'C’est quoi IRIS ?',
    'Tu sers à quoi ?',
    'À quoi sers-tu ?',
    'Bonjour IRIS, tu sers à quoi ?',
    'Que peux-tu faire ?',
    'Qu’est-ce que tu sais faire ?',
    'Comment tu fonctionnes ?',
    'Présente-toi',
    'Tu es un robot ?',
    'Es-tu un avocat ?',
  ])('recognises a question about IRIS itself: "%s"', (question) => {
    expect(smallTalk(question)).toBe('about')
  })

  it('leaves real questions to the search, even after a greeting', () => {
    expect(smallTalk('Bonjour, c’est quoi la médiation ?')).toBeUndefined()
    expect(smallTalk('Merci de m’expliquer la conciliation en détail svp')).toBeUndefined()
    expect(smallTalk('C’est quoi la médiation ?')).toBeUndefined()
    expect(smallTalk('À quoi sert la médiation ?')).toBeUndefined()
    expect(smallTalk('Qui es-tu pour me dire ça sur mon voisin ?')).toBeUndefined()
  })
})
