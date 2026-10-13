import {
  IRIS,
  IRIS_SMALL_TALK,
  starterQuestions,
  type ChatRequest,
  type ChatSource,
  type ChatStreamEvent,
} from '@/shared/chatbot'
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
  cleanAnswer,
  embed,
  explainOllamaError,
  isInsideThinking,
  looksLikeReasoning,
  ollamaConfig,
  OllamaUnavailableError,
  type ChatMessage,
  type ChatPart,
  type OllamaConfig,
} from './ollama'
import { isSensitive, smallTalk } from './conversation'
import { buildMessages, searchQueries } from './prompt'

// One question → status events while IRIS works, then ONE final event:
//   nothing relevant on the site → "no-answer" (the model is NOT called)
//   otherwise → the model rephrases the extracts; its output is buffered and
//   cleaned of any reasoning before anything is shown → "answer"
// Buffering costs the word-by-word display, but guarantees that the model's
// reasoning can never reach the visitor, whatever the model does.

/** Follow-up questions offered after an answer. */
const SUGGESTION_COUNT = 2
/** Results looked at for follow-ups (wider than what the model receives). */
const SUGGESTION_POOL = 8
/** Extracts kept: within this distance of the best score (drops loosely related ones). */
const RELATIVE_MARGIN = 0.08
/** Source links shown under an answer. */
const MAX_SOURCES = 3
const CACHE_SIZE = 50

export type RespondDeps = {
  config: OllamaConfig
  getIndex: (config: OllamaConfig) => Promise<KnowledgeIndex>
  embed: (texts: string[], config: OllamaConfig) => Promise<number[][]>
  chat: (
    messages: ChatMessage[],
    config: OllamaConfig,
    signal?: AbortSignal,
  ) => AsyncIterable<ChatPart>
}

const defaultDeps = (): RespondDeps => ({
  config: ollamaConfig(),
  getIndex: getKnowledgeIndex,
  embed,
  chat,
})

type FinalEvent = Extract<ChatStreamEvent, { type: 'answer' | 'no-answer' }>
const answerCache = new Map<string, FinalEvent>()

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

/** Relevant extracts close to the best one: what the model reads. */
function focusedResults(results: readonly SearchResult[]) {
  const relevant = relevantResults(results)
  if (relevant.length === 0) return []
  return relevant
    .filter((r) => r.score >= relevant[0].score - RELATIVE_MARGIN)
    .slice(0, SEARCH_LIMIT)
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
    .slice(0, MAX_SOURCES)
}

/** Related FAQ questions found by the search, other than the one just asked. */
function followUps(results: readonly SearchResult[], question: string) {
  const asked = normalizeForSearch(question)
  return relevantResults(results)
    .filter(({ chunk }) => chunk.domain === 'faq' && normalizeForSearch(chunk.title) !== asked)
    .map(({ chunk }) => chunk.title)
    .slice(0, SUGGESTION_COUNT)
}

/** The model said it has no information (rule 2 of the prompt). */
function isNoInformation(answer: string) {
  return /^je n[’']ai pas cette information/i.test(answer)
}

export async function* respond(
  request: ChatRequest,
  signal?: AbortSignal,
  deps: RespondDeps = defaultDeps(),
): AsyncGenerator<ChatStreamEvent> {
  const { question, history } = request

  // Small talk and questions about IRIS itself: fixed answer, no search, no model.
  const talk = smallTalk(question)
  if (talk) {
    yield {
      type: 'answer',
      text: IRIS_SMALL_TALK[talk],
      sources: [],
      suggestions: talk === 'greeting' || talk === 'about' ? starterQuestions() : [],
    }
    return
  }

  // Violence, danger, distress: emergency contacts and professionals, no search, no model.
  if (isSensitive(question)) {
    yield { type: 'answer', text: IRIS.sensitive, sources: [], suggestions: [] }
    return
  }

  const noAnswer = (suggestions: string[]): FinalEvent => ({
    type: 'no-answer',
    text: IRIS.noAnswer,
    suggestions,
  })

  try {
    yield { type: 'status', step: 'search' }
    const index = await deps.getIndex(deps.config)

    // Same question, no context, same content: the answer cannot differ (temperature 0).
    const cacheKey =
      history.length === 0
        ? `${index.key}|${deps.config.chatModel}|${normalizeForSearch(question)}`
        : undefined
    const cached = cacheKey ? answerCache.get(cacheKey) : undefined
    if (cached) {
      yield cached
      return
    }

    const vectors = await deps.embed(searchQueries(question, history), deps.config)
    const results = searchAll(index, vectors, question, SUGGESTION_POOL)
    const extracts = focusedResults(results)
    const suggestions = followUps(results, question)

    let final: FinalEvent
    if (extracts.length === 0) {
      final = noAnswer(suggestions)
    } else {
      yield { type: 'status', step: 'read', count: extracts.length }
      const messages = buildMessages(question, history, extracts, { model: deps.config.chatModel })

      let raw = ''
      let truncated = false
      let step: 'think' | 'write' | undefined
      for await (const part of deps.chat(messages, deps.config, signal)) {
        if (part.kind === 'end') {
          truncated = part.truncated
          continue
        }
        if (part.kind === 'text') raw += part.text
        const now = part.kind === 'thinking' || isInsideThinking(raw) ? 'think' : 'write'
        if (now !== step) {
          step = now
          yield { type: 'status', step }
        }
      }

      const text = cleanAnswer(raw)
      // Never show a cut answer or one that reads like reasoning: it could be the
      // model thinking aloud (thinking models), possibly in another language.
      const unusable = truncated || looksLikeReasoning(text)
      if (unusable) {
        console.warn(
          `[IRIS] answer discarded (${truncated ? 'cut by the length limit' : 'reads like reasoning'}): ` +
            `use a chat model without a thinking mode (current: ${deps.config.chatModel})`,
        )
      }
      final =
        !text || unusable || isNoInformation(text)
          ? noAnswer(suggestions)
          : { type: 'answer', text, sources: sourcesOf(extracts), suggestions }
    }

    if (signal?.aborted) return
    yield final
    if (cacheKey) {
      if (answerCache.size >= CACHE_SIZE) answerCache.delete(answerCache.keys().next().value!)
      answerCache.set(cacheKey, final)
    }
  } catch (error) {
    if (signal?.aborted) return
    if (!(error instanceof OllamaUnavailableError)) throw error
    console.warn(`[IRIS] ${explainOllamaError(error, deps.config)}`)
    yield { type: 'error', code: 'unavailable' }
  }
}
