import { EventEmitter } from 'node:events'

import type { NextApiRequest, NextApiResponse } from 'next'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { IRIS } from '@/shared/chatbot'

import handler from '@/pages/api/chatbot'

import { clearAnswerCache } from './respond'

// POST /api/chatbot (src/pages/api/chatbot.ts). Test files cannot live in
// src/pages: Next would serve them as routes.
// The whole route runs for real (validation → index → search → prompt → stream);
// only Ollama is replaced, by a fake `fetch`. CI has no Ollama.
// The index cache goes to a temporary folder (set before the modules load).
await vi.hoisted(async () => {
  const { mkdtemp } = await import('node:fs/promises')
  const { tmpdir } = await import('node:os')
  const path = await import('node:path')
  process.env.IRIS_CACHE_DIR = await mkdtemp(path.join(tmpdir(), 'iris-int-'))
})

/** Questions the fake embedding places far from every chunk. */
const OFF_TOPIC = new Set(['Quelle est la capitale du Pérou ?'])

function fakeOllama({ down = false } = {}) {
  return vi.fn(async (url: string, init?: RequestInit) => {
    if (down) throw new TypeError('fetch failed')
    const body = JSON.parse(String(init?.body ?? '{}'))
    if (url.endsWith('/api/embed')) {
      const vectors = (body.input as string[]).map((t) => (OFF_TOPIC.has(t) ? [0, 1] : [1, 0]))
      return Response.json({ embeddings: vectors })
    }
    if (url.endsWith('/api/chat')) {
      // Like the real run that leaked: reasoning in clear, ended by an orphan </think>.
      const lines = [
        { message: { content: "Okay, let's see. The user is asking…\n" } },
        { message: { content: '</think>\n\nSelon le site, ' } },
        { message: { content: 'la médiation est possible.' } },
        { done: true, message: { content: '' } },
      ]
      return new Response(lines.map((l) => JSON.stringify(l)).join('\n'))
    }
    return new Response('not found', { status: 404 })
  })
}

class FakeResponse extends EventEmitter {
  statusCode = 200
  headers: Record<string, string> = {}
  chunks: string[] = []
  jsonBody: unknown
  ended = false
  status(code: number) {
    this.statusCode = code
    return this
  }
  setHeader(name: string, value: string) {
    this.headers[name.toLowerCase()] = value
    return this
  }
  flushHeaders() {}
  write(chunk: string) {
    this.chunks.push(chunk)
    return true
  }
  json(body: unknown) {
    this.jsonBody = body
    this.ended = true
    return this
  }
  end() {
    this.ended = true
    return this
  }
  events() {
    return this.chunks
      .join('')
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line))
  }
}

let ip = 0
async function call(method: string, body?: unknown) {
  const req = {
    method,
    body,
    headers: {},
    // A new client per call: the rate limit is tested on its own.
    socket: { remoteAddress: `10.0.0.${ip++}` },
  } as unknown as NextApiRequest
  const res = new FakeResponse()
  await handler(req, res as unknown as NextApiResponse)
  return res
}

beforeEach(() => {
  clearAnswerCache()
  vi.unstubAllGlobals()
})

describe('POST /api/chatbot', () => {
  it('refuses other methods', async () => {
    const res = await call('GET')
    expect(res.statusCode).toBe(405)
    expect(res.headers.allow).toBe('POST')
  })

  it('refuses an empty or too long question without calling Ollama', async () => {
    const fetchMock = fakeOllama()
    vi.stubGlobal('fetch', fetchMock)
    expect((await call('POST', { question: '   ' })).statusCode).toBe(400)
    expect((await call('POST', { question: 'x'.repeat(501) })).statusCode).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('streams the steps, then one answer without any reasoning, as NDJSON', async () => {
    vi.stubGlobal('fetch', fakeOllama())
    const res = await call('POST', { question: 'C’est quoi la médiation ?' })

    expect(res.statusCode).toBe(200)
    expect(res.headers['content-type']).toMatch(/application\/x-ndjson/)
    const events = res.events()
    expect(events.slice(0, 2)).toEqual([
      { type: 'status', step: 'search' },
      { type: 'status', step: 'read', count: expect.any(Number) },
    ])
    const answer = events.at(-1)
    expect(answer.type).toBe('answer')
    expect(answer.text).toBe('Selon le site, la médiation est possible.')
    expect(answer.sources.length).toBeGreaterThan(0)
    expect(res.chunks.join('')).not.toMatch(/Okay|think/)
    expect(res.ended).toBe(true)
  })

  it('answers "no information" and never calls the chat model off topic', async () => {
    const fetchMock = fakeOllama()
    vi.stubGlobal('fetch', fetchMock)
    const res = await call('POST', { question: 'Quelle est la capitale du Pérou ?' })

    expect(res.events().at(-1)).toEqual({
      type: 'no-answer',
      text: IRIS.noAnswer,
      suggestions: [],
    })
    expect(fetchMock.mock.calls.some(([url]) => String(url).endsWith('/api/chat'))).toBe(false)
  })

  it('reports IRIS as unavailable when Ollama is down', async () => {
    clearAnswerCache()
    vi.stubGlobal('fetch', fakeOllama({ down: true }))
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const res = await call('POST', { question: 'Une autre question sur la médiation' })
    expect(res.statusCode).toBe(200)
    expect(res.events().at(-1)).toEqual({ type: 'error', code: 'unavailable' })
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/not reachable.*docker compose/))
    warn.mockRestore()
  })

  it('limits the number of questions per client', async () => {
    vi.stubGlobal('fetch', fakeOllama())
    const req = {
      method: 'POST',
      body: { question: 'C’est quoi la médiation ?' },
      headers: { 'x-forwarded-for': '203.0.113.7' },
      socket: {},
    } as unknown as NextApiRequest
    const statuses: number[] = []
    for (let i = 0; i < 21; i++) {
      const res = new FakeResponse()
      await handler(req, res as unknown as NextApiResponse)
      statuses.push(res.statusCode)
    }
    expect(statuses.slice(0, 20).every((s) => s === 200)).toBe(true)
    expect(statuses[20]).toBe(429)
  })
})
