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

/**
 * Chat model without a thinking mode (Qwen3 2507 Instruct): it answers directly.
 * Thinking models (qwen3:4b, qwen3:8b...) reason first: slow, and the reasoning can
 * be cut by the length limit before the answer.
 */
export const DEFAULT_CHAT_MODEL = 'qwen3:4b-instruct-2507-q4_K_M'

/** Same defaults everywhere; Docker sets OLLAMA_URL to http://ollama:11434. */
export function ollamaConfig(env: Record<string, string | undefined> = process.env): OllamaConfig {
  return {
    url: (env.OLLAMA_URL || 'http://localhost:11434').replace(/\/+$/, ''),
    chatModel: env.OLLAMA_CHAT_MODEL || DEFAULT_CHAT_MODEL,
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

type ChatChunk = {
  message?: { content?: string; thinking?: string }
  done?: boolean
  done_reason?: string
  error?: string
}

/**
 * A piece of the model's output: its reasoning (never shown), answer text, or the
 * end. `truncated`: stopped by the length limit, the answer may be incomplete.
 */
export type ChatPart =
  { kind: 'thinking' } | { kind: 'text'; text: string } | { kind: 'end'; truncated: boolean }

/** Longest answer generated, in tokens: IRIS answers in a few sentences. */
const MAX_ANSWER_TOKENS = 400

/**
 * Streams the output of the chat model. Deterministic settings: IRIS rephrases the
 * retrieved content, it must not improvise. Reasoning is turned off; when a model
 * reasons anyway, Ollama's `thinking` field comes out as `thinking` parts, and
 * inline `<think>` text is removed later by cleanAnswer().
 */
export async function* chat(
  messages: ChatMessage[],
  config = ollamaConfig(),
  signal?: AbortSignal,
): AsyncGenerator<ChatPart> {
  const request = {
    model: config.chatModel,
    messages,
    stream: true,
    think: false,
    options: { temperature: 0, num_ctx: 4096, num_predict: MAX_ANSWER_TOKENS },
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

  for await (const raw of readNdjson(response.body)) {
    const chunk = raw as ChatChunk
    if (chunk.error) throw new OllamaUnavailableError(`Ollama error: ${chunk.error}`)
    if (chunk.message?.thinking) yield { kind: 'thinking' }
    if (chunk.message?.content) yield { kind: 'text', text: chunk.message.content }
    if (chunk.done) {
      yield { kind: 'end', truncated: chunk.done_reason === 'length' }
      return
    }
  }
}

/** True while the text so far is inside a reasoning block (`<think>` not closed yet). */
export function isInsideThinking(text: string) {
  return text.lastIndexOf('<think>') > text.lastIndexOf('</think>')
}

/**
 * The answer without any reasoning: `<think>…</think>` blocks are removed, and when
 * only a closing `</think>` is present (the opening tag was in the prompt template),
 * everything before it is reasoning too.
 */
export function cleanAnswer(text: string) {
  let answer = text.replace(/<think>[\s\S]*?<\/think>/g, '')
  const orphanClose = answer.lastIndexOf('</think>')
  if (orphanClose !== -1) answer = answer.slice(orphanClose + '</think>'.length)
  // An unclosed block means the answer was cut while reasoning: nothing usable.
  const open = answer.indexOf('<think>')
  if (open !== -1) answer = answer.slice(0, open)
  return answer.trim()
}

/**
 * True when the text reads like a model thinking aloud rather than answering, e.g.
 * a thinking model whose reasoning has no tags ("Okay, let's see. The user is
 * asking…"). Such text is never shown.
 */
export function looksLikeReasoning(text: string) {
  const start = text.trimStart().slice(0, 200)
  return (
    /^(okay|ok|alright|hmm+|wait|let me|let.s|let us|i need to|i should|the user)\b/i.test(start) ||
    /\bthe user (is asking|asks|wants)\b/i.test(start)
  )
}

/** What to do about an Ollama failure, for the server logs. */
export function explainOllamaError(error: OllamaUnavailableError, config = ollamaConfig()) {
  const message = error.message
  if (/not reachable/i.test(message)) {
    return `${message}. Is the \`ollama\` service running? (docker compose up -d ollama)`
  }
  if (/not found/i.test(message)) {
    return `${message}. Download the models: docker compose up ollama-models`
  }
  if (/memory/i.test(message)) {
    return `${message}. The model ${config.chatModel} does not fit in memory: use a smaller one (OLLAMA_CHAT_MODEL=${DEFAULT_CHAT_MODEL}) or give Docker more memory.`
  }
  return message
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
