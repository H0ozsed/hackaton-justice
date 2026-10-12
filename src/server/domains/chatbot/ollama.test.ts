import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  chat,
  embed,
  isOllamaAvailable,
  ollamaConfig,
  OllamaUnavailableError,
  thinkStripper,
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

async function collect(stream: AsyncGenerator<string>) {
  let text = ''
  for await (const piece of stream) text += piece
  return text
}

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

    expect(await collect(chat([{ role: 'user', content: 'Salut' }], config))).toBe('Bonjour')
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body).toMatchObject({
      model: 'chat-model',
      stream: true,
      think: false,
      options: { temperature: 0 },
    })
  })

  it('retries without the thinking flag when the model does not support it', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response('"chat-model" does not support thinking', { status: 400 }),
      )
      .mockResolvedValueOnce(ndjsonResponse([{ message: { content: 'ok' }, done: true }]))
    vi.stubGlobal('fetch', fetchMock)

    expect(await collect(chat([{ role: 'user', content: 'x' }], config))).toBe('ok')
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

describe('thinkStripper', () => {
  function run(pieces: string[]) {
    const strip = thinkStripper()
    return pieces.map((p) => strip.push(p)).join('') + strip.flush()
  }

  it('removes a thinking block', () => {
    expect(run(['<think>hmm</think>\n\nBonjour'])).toBe('Bonjour')
  })

  it('removes a block whose tags are split across pieces', () => {
    expect(run(['<thi', 'nk>hmm</th', 'ink>Bon', 'jour'])).toBe('Bonjour')
  })

  it('keeps text that only looks like the start of a tag', () => {
    expect(run(['a <', ' b'])).toBe('a < b')
    expect(run(['fin <'])).toBe('fin <')
  })
})
