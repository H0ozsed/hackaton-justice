import { describe, expect, it } from 'vitest'

import { titleLines } from './opening'

describe('titleLines', () => {
  it('writes the title in capitals without accents, ten letters per line at most', () => {
    expect(titleLines('Le voisin du dessus')).toEqual(['LE VOISIN', 'DU DESSUS'])
    expect(titleLines('Un été bruyant')).toEqual(['UN ETE', 'BRUYANT'])
  })

  it('keeps a long word on its own line', () => {
    expect(titleLines('Copropriétaires')).toEqual(['COPROPRIETAIRES'])
  })
})
