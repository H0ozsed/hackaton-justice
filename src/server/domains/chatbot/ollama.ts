import { readNdjson } from '@/lib/ndjson'

// Minimal client for the local Ollama server (docker-compose service `ollama`).
// Only the 3 calls IRIS needs: embeddings, streamed chat, availability.

export type OllamaConfig = {
  url: string
  chatModel: string
  embedModel: string
}

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

/** Ollama cannot be reached or refused the request: IRIS shows "unavailable". */
export class OllamaUnavailableError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'OllamaUnavailableError'
  }
}

/** Same defaults everywhere; Docker sets OLLAMA_URL to http://ollama:11434. */
export function ollamaConfig(env: Record<string, string | undefined> = process.env): OllamaConfig {
  return {
    url: (env.OLLAMA_URL || 'http://localhost:11434').replace(/\/+$/, ''),
    chatModel: env.OLLAMA_CHAT_MODEL || 'qwen3:4b',
    embedModel: env.OLLAMA_EMBED_MODEL || 'bge-m3',
  }
}

async function post(config: OllamaConfig, path: string, body: unknown, signal?: AbortSignal) {
  let response: Response
  try {
    response = await fetch(`${config.url}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    })
  } catch (cause) {
    if (signal?.aborted) throw cause
    throw new OllamaUnavailableError(`Ollama is not reachable at ${config.url}`, { cause })
  }
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new OllamaUnavailableError(`Ollama ${path} failed (${response.status}): ${detail}`)
  }
  return response
}

/** One embedding vector per text, in the same order. */
export async function embed(texts: string[], config = ollamaConfig(), signal?: AbortSignal) {
  if (texts.length === 0) return []
  const response = await post(
    config,
    '/api/embed',
    { model: config.embedModel, input: texts },
    signal,
  )
  const data = (await response.json()) as { embeddings?: number[][] }
  if (!Array.isArray(data.embeddings) || data.embeddings.length !== texts.length) {
    throw new OllamaUnavailableError('Ollama returned no embeddings')
  }
  return data.embeddings
}

type ChatChunk = { message?: { content?: string }; done?: boolean; error?: string }

/**
 * Streams the answer of the chat model, text piece by text piece.
 * Deterministic settings: IRIS rephrases the retrieved content, it must not improvise.
 */
export async function* chat(
  messages: ChatMessage[],
  config = ollamaConfig(),
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const request = {
    model: config.chatModel,
    messages,
    stream: true,
    // Reasoning traces are slow and never shown: off.
    think: false,
    options: { temperature: 0, num_ctx: 4096 },
  }
  let response: Response
  try {
    response = await post(config, '/api/chat', request, signal)
  } catch (error) {
    // A model without a thinking mode may reject the `think` flag: retry without it.
    if (!(error instanceof OllamaUnavailableError) || !/think/i.test(error.message)) throw error
    response = await post(config, '/api/chat', { ...request, think: undefined }, signal)
  }
  if (!response.body) throw new OllamaUnavailableError('Ollama returned an empty answer')

  const strip = thinkStripper()
  for await (const raw of readNdjson(response.body)) {
    const chunk = raw as ChatChunk
    if (chunk.error) throw new OllamaUnavailableError(`Ollama error: ${chunk.error}`)
    const text = strip.push(chunk.message?.content ?? '')
    if (text) yield text
    if (chunk.done) break
  }
  const rest = strip.flush()
  if (rest) yield rest
}

/** True when Ollama answers within the timeout. */
export async function isOllamaAvailable(config = ollamaConfig(), timeoutMs = 2000) {
  try {
    const response = await fetch(`${config.url}/api/version`, {
      signal: AbortSignal.timeout(timeoutMs),
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Removes `<think>…</think>` blocks from a stream of text pieces, even when a tag
 * is split across pieces. Safety net for models that think despite `think: false`.
 */
export function thinkStripper() {
  let inside = false
  let pending = ''
  /** Text held back because it might be the start of a tag: released at the end. */
  const flush = () => {
    const rest = inside ? '' : pending
    pending = ''
    return rest
  }
  const push = (piece: string) => {
    let text = pending + piece
    pending = ''
    let out = ''
    for (;;) {
      const tag = inside ? '</think>' : '<think>'
      const index = text.indexOf(tag)
      if (index === -1) {
        // Keep a possible partial tag at the end for the next piece.
        const keep = partialTagLength(text, tag)
        if (!inside) out += text.slice(0, text.length - keep)
        pending = text.slice(text.length - keep)
        return out
      }
      if (!inside) out += text.slice(0, index)
      text = text.slice(index + tag.length)
      inside = !inside
      if (!inside) text = text.replace(/^\s+/, '')
    }
  }
  return { push, flush }
}

function partialTagLength(text: string, tag: string) {
  for (let length = Math.min(tag.length - 1, text.length); length > 0; length--) {
    if (tag.startsWith(text.slice(-length))) return length
  }
  return 0
}
