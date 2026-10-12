import { beforeEach, describe, expect, it, vi } from 'vitest'

import { chatRequestSchema, IRIS, type ChatStreamEvent } from '@/shared/chatbot'

import type { Chunk } from './chunks'
import { normalize, type KnowledgeIndex } from './knowledge'
import { OllamaUnavailableError } from './ollama'
import { clearAnswerCache, respond, type RespondDeps } from './respond'

const chunk = (id: string, domain: Chunk['domain'], title: string): Chunk => ({
  id,
  domain,
  title,
  text: `${title} (texte)`,
  url: domain === 'faq' ? '/apprendre#questions-frequentes' : '/apprendre/lexique#mediation',
})

// Axis 0 = "médiation", axis 1 = "loyer". The question vector decides what matches.
const index: KnowledgeIndex = {
  key: 'test',
  chunks: [
    { ...chunk('glossary:mediation', 'glossary', 'Médiation'), vector: normalize([1, 0]) },
    {
      ...chunk('faq:cout', 'faq', 'La médiation est-elle payante ?'),
      vector: normalize([0.9, 0.1]),
    },
    {
      ...chunk('faq:duree', 'faq', 'Combien de temps dure une médiation ?'),
      vector: normalize([0.8, 0.2]),
    },
    { ...chunk('faq:loyer', 'faq', 'Mon loyer a augmenté'), vector: normalize([0, 1]) },
  ],
}

function deps(queryVector: number[], answer = ['La médiation ', 'est une démarche amiable.']) {
  return {
    config: { url: 'http://ollama', chatModel: 'chat', embedModel: 'embed' },
    getIndex: vi.fn(async () => index),
    embed: vi.fn(async (texts: string[]) => texts.map(() => queryVector)),
    chat: vi.fn<RespondDeps['chat']>(async function* () {
      yield* answer
    }),
  } satisfies RespondDeps
}

async function run(
  question: string,
  d: RespondDeps,
  history: { role: 'user' | 'assistant'; content: string }[] = [],
) {
  const events: ChatStreamEvent[] = []
  for await (const event of respond(chatRequestSchema.parse({ question, history }), undefined, d)) {
    events.push(event)
  }
  return events
}

beforeEach(() => clearAnswerCache())

describe('respond', () => {
  it('streams the sources, the answer, then follow-up questions', async () => {
    const d = deps([1, 0])
    const events = await run('C’est quoi la médiation ?', d)

    expect(events[0]).toEqual({
      type: 'sources',
      sources: expect.arrayContaining([
        { title: 'Médiation', url: '/apprendre/lexique#mediation' },
      ]),
    })
    expect(
      events
        .filter((e) => e.type === 'token')
        .map((e) => e.text)
        .join(''),
    ).toBe('La médiation est une démarche amiable.')
    expect(events.at(-1)).toEqual({
      type: 'done',
      suggestions: ['La médiation est-elle payante ?', 'Combien de temps dure une médiation ?'],
    })
  })

  it('answers "no information" without calling the model when nothing is relevant', async () => {
    const d = deps([-1, -1])
    const events = await run('Quelle est la capitale du Pérou ?', d)
    expect(events).toEqual([{ type: 'no-answer', text: IRIS.noAnswer, suggestions: [] }])
    expect(d.chat).not.toHaveBeenCalled()
  })

  it('gives the model only the relevant extracts', async () => {
    const d = deps([0, 1])
    await run('Mon loyer a augmenté, que faire ?', d)
    const system = d.chat.mock.calls[0][0][0].content
    expect(system).toContain('Mon loyer a augmenté (texte)')
    expect(system).not.toContain('Médiation (texte)')
  })

  it('does not suggest the question that was just asked', async () => {
    const events = await run('la médiation est-elle payante ?', deps([1, 0]))
    expect(events.at(-1)).toEqual({
      type: 'done',
      suggestions: ['Combien de temps dure une médiation ?'],
    })
  })

  it('searches a follow-up together with the previous question', async () => {
    const d = deps([1, 0])
    await run('Et c’est long ?', d, [
      { role: 'user', content: 'C’est quoi la médiation ?' },
      { role: 'assistant', content: 'Une démarche amiable.' },
    ])
    expect(d.embed.mock.calls[0][0]).toEqual([
      'Et c’est long ?',
      'C’est quoi la médiation ?\nEt c’est long ?',
    ])
  })

  it('reuses the answer to the same question without calling the model again', async () => {
    const d = deps([1, 0])
    const first = await run('C’est quoi la médiation ?', d)
    const second = await run('c’est quoi la MÉDIATION ?', d)
    expect(d.chat).toHaveBeenCalledTimes(1)
    expect(second.map((e) => e.type)).toEqual(['sources', 'token', 'done'])
    expect(second.at(-1)).toEqual(first.at(-1))
  })

  it('reports IRIS as unavailable when Ollama is down', async () => {
    const d = deps([1, 0])
    d.getIndex.mockRejectedValue(new OllamaUnavailableError('down'))
    expect(await run('Bonjour', d)).toEqual([{ type: 'error', code: 'unavailable' }])
  })
})
