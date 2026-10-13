import { describe, expect, it } from 'vitest'

import { buildMessages, NO_INFORMATION, searchQueries, SYSTEM_PROMPT } from './prompt'

const result = (title: string, text: string) => ({
  chunk: { id: title, domain: 'faq' as const, title, text, url: '/' },
  score: 0.8,
})

describe('SYSTEM_PROMPT', () => {
  it('limits the model to rephrasing the retrieved extracts', () => {
    expect(SYSTEM_PROMPT).toMatch(/Tu es IRIS \(Informer, Renseigner, Indiquer les Solutions\)/)
    expect(SYSTEM_PROMPT).toMatch(/Ta seule tâche\nReformuler en français simple les extraits/)
    expect(SYSTEM_PROMPT).toMatch(/Utilise uniquement le contenu des extraits/)
    expect(SYSTEM_PROMPT).toContain(`« ${NO_INFORMATION} »`)
  })

  it('keeps IRIS neutral', () => {
    expect(SYSTEM_PROMPT).toMatch(/ne garantis aucun résultat/)
    expect(SYSTEM_PROMPT).toMatch(/« vous devez »/)
  })

  it('asks for a short French answer, lightly formatted, without reasoning', () => {
    expect(SYSTEM_PROMPT).toMatch(/En français/)
    expect(SYSTEM_PROMPT).toMatch(/80 mots au plus/)
    expect(SYSTEM_PROMPT).toMatch(/commençant par « - »/)
    expect(SYSTEM_PROMPT).toMatch(/pas de raisonnement/)
  })
})

describe('buildMessages', () => {
  it('gives the prompt and the numbered extracts, then the history, then the question', () => {
    const messages = buildMessages(
      'Et pour un voisin ?',
      [
        { role: 'user', content: 'C’est quoi la médiation ?' },
        { role: 'assistant', content: 'Une démarche amiable.' },
      ],
      [result('Médiation', 'Texte A'), result('Conciliation', 'Texte B')],
    )
    expect(messages.map((m) => m.role)).toEqual(['system', 'user', 'assistant', 'user'])
    expect(messages[0].content).toContain(SYSTEM_PROMPT)
    expect(messages[0].content).toContain('[1] Médiation\nTexte A')
    expect(messages[0].content).toContain('[2] Conciliation\nTexte B')
    expect(messages.at(-1)).toEqual({ role: 'user', content: 'Et pour un voisin ?' })
  })

  it('asks a thinking Qwen3 model not to reason, on the latest user message only', () => {
    const messages = buildMessages(
      'Et ensuite ?',
      [{ role: 'user', content: 'Avant' }],
      [result('A', 'a')],
      { model: 'qwen3:8b' },
    )
    expect(messages.at(-1)?.content).toBe('Et ensuite ? /no_think')
    expect(messages[1].content).toBe('Avant')
  })

  it('leaves models without a thinking mode untouched', () => {
    for (const model of ['qwen3:4b-instruct-2507-q4_K_M', 'llama3.2']) {
      expect(buildMessages('Bonjour', [], [result('A', 'a')], { model }).at(-1)?.content).toBe(
        'Bonjour',
      )
    }
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
