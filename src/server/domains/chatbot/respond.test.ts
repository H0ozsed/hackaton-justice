import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  chatRequestSchema,
  IRIS,
  IRIS_SMALL_TALK,
  starterQuestions,
  type ChatStreamEvent,
} from '@/shared/chatbot'

import type { Chunk } from './chunks'
import { normalize, type KnowledgeIndex } from './knowledge'
import { OllamaUnavailableError, type ChatPart } from './ollama'
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
      vector: normalize([0.97, 0.24]),
    },
    {
      ...chunk('faq:duree', 'faq', 'Combien de temps dure une médiation ?'),
      vector: normalize([0.95, 0.31]),
    },
    { ...chunk('faq:loyer', 'faq', 'Mon loyer a augmenté'), vector: normalize([0, 1]) },
  ],
}

const text = (t: string): ChatPart => ({ kind: 'text', text: t })

function deps(
  queryVector: number[],
  output: ChatPart[] = [text('La **médiation** '), text('est amiable.')],
) {
  return {
    config: { url: 'http://ollama', chatModel: 'qwen3:4b', embedModel: 'embed' },
    getIndex: vi.fn(async () => index),
    embed: vi.fn(async (texts: string[]) => texts.map(() => queryVector)),
    chat: vi.fn<RespondDeps['chat']>(async function* () {
      yield* output
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
  it('reports its steps, then sends one cleaned answer with sources and follow-ups', async () => {
    // No glossary term in the question: the 3 close extracts are all kept.
    const events = await run('Comment ça se passe ?', deps([1, 0]))

    expect(events.slice(0, -1)).toEqual([
      { type: 'status', step: 'search' },
      { type: 'status', step: 'read', count: 3 },
      { type: 'status', step: 'write' },
    ])
    expect(events.at(-1)).toEqual({
      type: 'answer',
      text: 'La **médiation** est amiable.',
      sources: [
        { title: 'Médiation', url: '/apprendre/lexique#mediation' },
        { title: 'La médiation est-elle payante ?', url: '/apprendre#questions-frequentes' },
        { title: 'Combien de temps dure une médiation ?', url: '/apprendre#questions-frequentes' },
      ],
      suggestions: ['La médiation est-elle payante ?', 'Combien de temps dure une médiation ?'],
    })
  })

  it('never lets reasoning through, even when only a closing tag marks its end', async () => {
    const leaked = [
      text("Okay, let's see. The user is asking about mediation.\n"),
      text('Wait, the extracts say…\n</think>\n\n'),
      text('La médiation est une démarche amiable.'),
    ]
    const events = await run('C’est quoi la médiation ?', deps([1, 0], leaked))
    expect(events.at(-1)).toMatchObject({
      type: 'answer',
      text: 'La médiation est une démarche amiable.',
    })
    expect(JSON.stringify(events)).not.toMatch(/Okay|Wait|think/)
  })

  it('shows a "thinking" step while the model reasons', async () => {
    const reasoning: ChatPart[] = [{ kind: 'thinking' }, { kind: 'thinking' }, text('Réponse.')]
    const events = await run('C’est quoi la médiation ?', deps([1, 0], reasoning))
    expect(events.filter((e) => e.type === 'status').map((e) => e.step)).toEqual([
      'search',
      'read',
      'think',
      'write',
    ])
  })

  it('answers "no information" without calling the model when nothing is relevant', async () => {
    const d = deps([-1, -1])
    const events = await run('Quelle est la capitale du Pérou ?', d)
    expect(events.at(-1)).toEqual({ type: 'no-answer', text: IRIS.noAnswer, suggestions: [] })
    expect(d.chat).not.toHaveBeenCalled()
  })

  it('shows no sources when the model finds no answer in the extracts', async () => {
    const d = deps([1, 0], [text('Je n’ai pas cette information sur le site.')])
    const events = await run('La médiation, c’est quand ?', d)
    expect(events.at(-1)).toMatchObject({ type: 'no-answer', text: IRIS.noAnswer })
    expect(events.at(-1)).not.toHaveProperty('sources')
  })

  it('treats an answer made only of reasoning as "no information"', async () => {
    const d = deps([1, 0], [text('<think>Let me think about this for a long')])
    expect((await run('C’est quoi la médiation ?', d)).at(-1)?.type).toBe('no-answer')
  })

  it('keeps only the glossary entry when the question names its term', async () => {
    const events = await run('C’est quoi la médiation ?', deps([1, 0]))
    expect(events).toContainEqual({ type: 'status', step: 'read', count: 1 })
    expect(events.at(-1)).toMatchObject({
      sources: [{ title: 'Médiation', url: '/apprendre/lexique#mediation' }],
    })
  })

  it('gives the model only the extracts close to the best one', async () => {
    const d = deps([0, 1])
    await run('Mon loyer a augmenté, que faire ?', d)
    const system = d.chat.mock.calls[0][0][0].content
    expect(system).toContain('Mon loyer a augmenté (texte)')
    expect(system).not.toContain('Médiation (texte)')
  })

  it('asks a Qwen3 model not to reason', async () => {
    const d = deps([1, 0])
    await run('C’est quoi la médiation ?', d)
    expect(d.chat.mock.calls[0][0].at(-1)?.content).toMatch(/\/no_think$/)
  })

  it('does not suggest the question that was just asked', async () => {
    const events = await run('la médiation est-elle payante ?', deps([1, 0]))
    expect(events.at(-1)).toMatchObject({
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
    expect(second.at(-1)).toEqual(first.at(-1))
  })

  it('reports IRIS as unavailable and logs what to do', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const d = deps([1, 0])
    d.getIndex.mockRejectedValue(
      new OllamaUnavailableError('Ollama error: model requires more system memory (5.6 GiB)'),
    )
    expect((await run('Une question sur la médiation', d)).at(-1)).toEqual({
      type: 'error',
      code: 'unavailable',
    })
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/does not fit in memory/))
    warn.mockRestore()
  })

  it('never shows raw reasoning without any tag, cut by the length limit', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const cut: ChatPart[] = [
      text('Okay, let\'s tackle this query. The user is asking "C’est quoi la médiation ?"\n'),
      text(
        'Looking at the extracts, there is a section labeled [1] Médiation. The extract says "Démarche',
      ),
      { kind: 'end', truncated: true },
    ]
    const events = await run('C’est quoi la médiation ?', deps([1, 0], cut))
    expect(events.at(-1)).toMatchObject({ type: 'no-answer' })
    expect(JSON.stringify(events)).not.toMatch(/Okay|tackle|extracts/)
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/cut by the length limit/))
    warn.mockRestore()
  })

  it('never shows a complete answer that reads like reasoning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const thinkingAloud = [text('Let me check the extracts. Mediation is…')]
    const events = await run('C’est quoi la médiation ?', deps([1, 0], thinkingAloud))
    expect(events.at(-1)).toMatchObject({ type: 'no-answer' })
    warn.mockRestore()
  })

  it('answers a greeting directly, without searching or calling the model', async () => {
    const d = deps([1, 0])
    expect(await run('Bonjour !', d)).toEqual([
      {
        type: 'answer',
        text: IRIS_SMALL_TALK.greeting,
        sources: [],
        suggestions: starterQuestions(),
      },
    ])
    expect(d.getIndex).not.toHaveBeenCalled()
    expect(d.chat).not.toHaveBeenCalled()
    expect((await run('Merci beaucoup !', d)).at(-1)).toMatchObject({
      text: IRIS_SMALL_TALK.thanks,
    })
  })
})
