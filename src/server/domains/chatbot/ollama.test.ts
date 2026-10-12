import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  chat,
  cleanAnswer,
  embed,
  explainOllamaError,
  isInsideThinking,
  isOllamaAvailable,
  ollamaConfig,
  OllamaUnavailableError,
  type ChatPart,
} from './ollama'

const config = { url: 'http://ollama:11434', chatModel: 'chat-model', embedModel: 'embed-model' }

function ndjsonResponse(lines: unknown[]) {
  const encoder = new TextEncoder()
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const line of lines) controller.enqueue(encoder.encode(`${JSON.stringify(line)}\n`))
      controller.close()
    },
  })
  return new Response(body, { status: 200 })
}

async function collect(stream: AsyncGenerator<ChatPart>) {
  const parts: ChatPart[] = []
  for await (const part of stream) parts.push(part)
  return parts
}

const textOf = (parts: ChatPart[]) => parts.map((p) => (p.kind === 'text' ? p.text : '')).join('')

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ollamaConfig', () => {
  it('uses the same defaults everywhere', () => {
    expect(ollamaConfig({})).toEqual({
      url: 'http://localhost:11434',
      chatModel: 'qwen3:4b',
      embedModel: 'bge-m3',
    })
  })

  it('reads the environment and drops a trailing slash', () => {
    expect(
      ollamaConfig({ OLLAMA_URL: 'http://ollama:11434/', OLLAMA_CHAT_MODEL: 'qwen3:8b' }),
    ).toMatchObject({ url: 'http://ollama:11434', chatModel: 'qwen3:8b' })
  })
})

describe('embed', () => {
  it('sends every text to the embedding model and returns the vectors in order', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        embeddings: [
          [1, 0],
          [0, 1],
        ],
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    expect(await embed(['a', 'b'], config)).toEqual([
      [1, 0],
      [0, 1],
    ])
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('http://ollama:11434/api/embed')
    expect(JSON.parse(init.body)).toEqual({ model: 'embed-model', input: ['a', 'b'] })
  })

  it('reports Ollama as unavailable when it cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')))
    await expect(embed(['a'], config)).rejects.toBeInstanceOf(OllamaUnavailableError)
  })

  it('reports Ollama as unavailable when the model is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('model "embed-model" not found', { status: 404 })),
    )
    await expect(embed(['a'], config)).rejects.toThrow(/not found/)
  })
})

describe('chat', () => {
  it('streams the answer with deterministic settings and thinking off', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        ndjsonResponse([
          { message: { content: 'Bon' } },
          { message: { content: 'jour' } },
          { message: { content: '' }, done: true },
        ]),
      )
    vi.stubGlobal('fetch', fetchMock)

    expect(textOf(await collect(chat([{ role: 'user', content: 'Salut' }], config)))).toBe(
      'Bonjour',
    )
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body).toMatchObject({
      model: 'chat-model',
      stream: true,
      think: false,
      options: { temperature: 0, num_predict: expect.any(Number) },
    })
  })

  it('reports the reasoning Ollama separates as thinking parts, without its text', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          ndjsonResponse([
            { message: { thinking: 'Okay, let me see' } },
            { message: { content: 'Réponse' }, done: true },
          ]),
        ),
    )
    expect(await collect(chat([{ role: 'user', content: 'x' }], config))).toEqual([
      { kind: 'thinking' },
      { kind: 'text', text: 'Réponse' },
    ])
  })

  it('retries without the thinking flag when the model does not support it', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response('"chat-model" does not support thinking', { status: 400 }),
      )
      .mockResolvedValueOnce(ndjsonResponse([{ message: { content: 'ok' }, done: true }]))
    vi.stubGlobal('fetch', fetchMock)

    expect(textOf(await collect(chat([{ role: 'user', content: 'x' }], config)))).toBe('ok')
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).not.toHaveProperty('think')
  })

  it('turns an error line of the stream into an unavailable error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ndjsonResponse([{ error: 'out of memory' }])))
    await expect(collect(chat([{ role: 'user', content: 'x' }], config))).rejects.toBeInstanceOf(
      OllamaUnavailableError,
    )
  })
})

describe('isOllamaAvailable', () => {
  it('is false when Ollama does not answer', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')))
    expect(await isOllamaAvailable(config)).toBe(false)
  })

  it('is true when the version endpoint answers', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ version: '0' })))
    expect(await isOllamaAvailable(config)).toBe(true)
  })
})

describe('cleanAnswer', () => {
  it('removes a complete reasoning block', () => {
    expect(cleanAnswer('<think>hmm</think>\n\nBonjour')).toBe('Bonjour')
  })

  it('drops everything before a closing tag whose opening was in the prompt', () => {
    expect(
      cleanAnswer(
        "Okay, let's see. The user is asking…\nWait, but…\n</think>\n\nJe n’ai pas cette information sur le site.",
      ),
    ).toBe('Je n’ai pas cette information sur le site.')
  })

  it('returns nothing when the answer was cut while reasoning', () => {
    expect(cleanAnswer('<think>Let me think about this for a long')).toBe('')
  })

  it('keeps an answer without any reasoning as is', () => {
    expect(cleanAnswer('  - Gratuit\n- Rapide  ')).toBe('- Gratuit\n- Rapide')
  })
})

describe('isInsideThinking', () => {
  it('is true between an opening tag and its closing tag only', () => {
    expect(isInsideThinking('<think>hmm')).toBe(true)
    expect(isInsideThinking('<think>hmm</think>Bon')).toBe(false)
    expect(isInsideThinking('Bonjour')).toBe(false)
  })
})

describe('explainOllamaError', () => {
  it('says what to do for each usual failure', () => {
    const explain = (m: string) => explainOllamaError(new OllamaUnavailableError(m), config)
    expect(explain('Ollama is not reachable at http://ollama:11434')).toMatch(
      /docker compose up -d ollama/,
    )
    expect(explain('Ollama /api/chat failed (404): model "chat-model" not found')).toMatch(
      /ollama-models/,
    )
    expect(explain('Ollama error: model requires more system memory (5.6 GiB)')).toMatch(
      /does not fit in memory.*qwen3:4b/,
    )
  })
})
