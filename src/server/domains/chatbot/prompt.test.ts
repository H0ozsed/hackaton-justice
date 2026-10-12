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
    expect(SYSTEM_RULES).toMatch(/UNIQUEMENT les extraits/)
    expect(SYSTEM_RULES).toMatch(/ne garantis jamais/)
    expect(SYSTEM_RULES).toMatch(/« vous devez »/)
  })
})

describe('buildMessages for Qwen3', () => {
  it('asks Qwen3 not to reason, on the latest user message only', () => {
    const messages = buildMessages(
      'Et ensuite ?',
      [{ role: 'user', content: 'Avant' }],
      [result('A', 'a')],
      { model: 'qwen3:8b' },
    )
    expect(messages.at(-1)?.content).toBe('Et ensuite ? /no_think')
    expect(messages[1].content).toBe('Avant')
  })

  it('leaves other models untouched', () => {
    const messages = buildMessages('Bonjour', [], [result('A', 'a')], { model: 'llama3.2' })
    expect(messages.at(-1)?.content).toBe('Bonjour')
  })
})

describe('SYSTEM_RULES format', () => {
  it('asks for a short, lightly formatted answer without the reasoning', () => {
    expect(SYSTEM_RULES).toMatch(/80 mots au plus/)
    expect(SYSTEM_RULES).toMatch(/commençant par « - »/)
    expect(SYSTEM_RULES).toMatch(/sans montrer ton raisonnement/)
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
