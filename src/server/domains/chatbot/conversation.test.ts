import { describe, expect, it } from 'vitest'

import { smallTalk } from './conversation'

describe('smallTalk', () => {
  it('recognises a greeting, a thank-you and a goodbye on their own', () => {
    expect(smallTalk('Bonjour IRIS !')).toBe('greeting')
    expect(smallTalk('merci beaucoup')).toBe('thanks')
    expect(smallTalk('Au revoir')).toBe('goodbye')
  })

  it('leaves real questions to the search, even after a greeting', () => {
    expect(smallTalk('Bonjour, c’est quoi la médiation ?')).toBeUndefined()
    expect(smallTalk('Merci de m’expliquer la conciliation en détail svp')).toBeUndefined()
    expect(smallTalk('C’est quoi la médiation ?')).toBeUndefined()
  })
})
