import { IRIS, type ChatRequest, type ChatSource, type ChatStreamEvent } from '@/shared/chatbot'
import { normalizeForSearch } from '@/shared/glossary'

import {
  getKnowledgeIndex,
  relevantResults,
  search,
  SEARCH_LIMIT,
  type KnowledgeIndex,
  type SearchResult,
} from './knowledge'
import {
  chat,
  embed,
  ollamaConfig,
  OllamaUnavailableError,
  type ChatMessage,
  type OllamaConfig,
} from './ollama'
import { buildMessages, searchQueries } from './prompt'

// One question → a stream of events for the widget:
//   no relevant content → "no-answer" (the model is NOT called)
//   otherwise           → "sources", then the answer token by token, then "done"

/** Follow-up questions offered after an answer. */
const SUGGESTION_COUNT = 2
/** Results looked at for follow-ups (wider than what the model receives). */
const SUGGESTION_POOL = 8
const CACHE_SIZE = 50

export type RespondDeps = {
  config: OllamaConfig
  getIndex: (config: OllamaConfig) => Promise<KnowledgeIndex>
  embed: (texts: string[], config: OllamaConfig) => Promise<number[][]>
  chat: (
    messages: ChatMessage[],
    config: OllamaConfig,
    signal?: AbortSignal,
  ) => AsyncIterable<string>
}

const defaultDeps = (): RespondDeps => ({
  config: ollamaConfig(),
  getIndex: getKnowledgeIndex,
  embed,
  chat,
})

type CachedAnswer = { sources: ChatSource[]; text: string; suggestions: string[] }
const answerCache = new Map<string, CachedAnswer>()

/** For tests: start from an empty answer cache. */
export function clearAnswerCache() {
  answerCache.clear()
}

/** Best score of each chunk over several query vectors, best first. */
function searchAll(index: KnowledgeIndex, vectors: number[][], question: string, limit: number) {
  const best = new Map<string, SearchResult>()
  for (const vector of vectors) {
    for (const result of search(index, vector, question, limit)) {
      const current = best.get(result.chunk.id)
      if (!current || result.score > current.score) best.set(result.chunk.id, result)
    }
  }
  return [...best.values()].sort((a, b) => b.score - a.score).slice(0, limit)
}

/** One link per page and title, in the order of relevance. */
function sourcesOf(results: readonly SearchResult[]): ChatSource[] {
  const seen = new Set<string>()
  return results
    .map(({ chunk }) => ({ title: chunk.title, url: chunk.url }))
    .filter((s) => {
      const key = `${s.url}|${s.title}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

/** Related FAQ questions found by the search, other than the one just asked. */
function followUps(results: readonly SearchResult[], question: string) {
  const asked = normalizeForSearch(question)
  return relevantResults(results)
    .filter(({ chunk }) => chunk.domain === 'faq' && normalizeForSearch(chunk.title) !== asked)
    .map(({ chunk }) => chunk.title)
    .slice(0, SUGGESTION_COUNT)
}

export async function* respond(
  request: ChatRequest,
  signal?: AbortSignal,
  deps: RespondDeps = defaultDeps(),
): AsyncGenerator<ChatStreamEvent> {
  const { question, history } = request
  try {
    const index = await deps.getIndex(deps.config)
    // Same question, no context, same content: the answer cannot differ (temperature 0).
    const cacheKey =
      history.length === 0
        ? `${index.key}|${deps.config.chatModel}|${normalizeForSearch(question)}`
        : undefined
    const cached = cacheKey ? answerCache.get(cacheKey) : undefined
    if (cached) {
      yield { type: 'sources', sources: cached.sources }
      yield { type: 'token', text: cached.text }
      yield { type: 'done', suggestions: cached.suggestions }
      return
    }

    const vectors = await deps.embed(searchQueries(question, history), deps.config)
    const results = searchAll(index, vectors, question, SUGGESTION_POOL)
    const relevant = relevantResults(results).slice(0, SEARCH_LIMIT)
    const suggestions = followUps(results, question)

    if (relevant.length === 0) {
      yield { type: 'no-answer', text: IRIS.noAnswer, suggestions }
      return
    }

    const sources = sourcesOf(relevant)
    yield { type: 'sources', sources }
    let text = ''
    for await (const piece of deps.chat(
      buildMessages(question, history, relevant),
      deps.config,
      signal,
    )) {
      text += piece
      yield { type: 'token', text: piece }
    }
    yield { type: 'done', suggestions }

    if (cacheKey && text.trim()) {
      if (answerCache.size >= CACHE_SIZE) answerCache.delete(answerCache.keys().next().value!)
      answerCache.set(cacheKey, { sources, text, suggestions })
    }
  } catch (error) {
    if (signal?.aborted) return
    if (!(error instanceof OllamaUnavailableError)) throw error
    yield { type: 'error', code: 'unavailable' }
  }
}
