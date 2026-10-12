import { describe, expect, it } from 'vitest'

import { buildMessages, searchQueries, SYSTEM_RULES } from './prompt'

const result = (title: string, text: string) => ({
  chunk: { id: title, domain: 'faq' as const, title, text, url: '/' },
  score: 0.8,
})

describe('buildMessages', () => {
  it('gives the rules and the numbered extracts, then the history, then the question', () => {
    const messages = buildMessages(
      'Et pour un voisin ?',
      [
        { role: 'user', content: 'C’est quoi la médiation ?' },
        { role: 'assistant', content: 'Une démarche amiable.' },
      ],
      [result('Médiation', 'Texte A'), result('Conciliation', 'Texte B')],
    )
    expect(messages.map((m) => m.role)).toEqual(['system', 'user', 'assistant', 'user'])
    expect(messages[0].content).toContain(SYSTEM_RULES)
    expect(messages[0].content).toContain('[1] Médiation\nTexte A')
    expect(messages[0].content).toContain('[2] Conciliation\nTexte B')
    expect(messages.at(-1)).toEqual({ role: 'user', content: 'Et pour un voisin ?' })
  })

  it('keeps IRIS in an informative role', () => {
    expect(SYSTEM_RULES).toMatch(/UNIQUEMENT à partir des extraits/)
    expect(SYSTEM_RULES).toMatch(/ne garantis jamais/)
    expect(SYSTEM_RULES).toMatch(/« vous devez »/)
  })
})

describe('searchQueries', () => {
  it('searches the question alone when there is no history', () => {
    expect(searchQueries('C’est gratuit ?', [])).toEqual(['C’est gratuit ?'])
  })

  it('also searches a follow-up together with the previous question', () => {
    expect(
      searchQueries('Et pour un voisin ?', [
        { role: 'user', content: 'Qui contacter ?' },
        { role: 'assistant', content: 'Un conciliateur.' },
      ]),
    ).toEqual(['Et pour un voisin ?', 'Qui contacter ?\nEt pour un voisin ?'])
  })
})
