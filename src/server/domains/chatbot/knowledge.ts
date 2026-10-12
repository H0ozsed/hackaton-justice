import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { glossary, normalizeForSearch } from '@/shared/glossary'

import { buildChunks, type Chunk } from './chunks'
import { embed, ollamaConfig, type OllamaConfig } from './ollama'

// In-memory vector index of the site content. A few hundred chunks at most: a
// plain array and a dot product answer in well under a millisecond, no vector
// database needed. Embeddings are cached on disk and only recomputed when the
// content or the embedding model changes.

export type IndexedChunk = Chunk & { vector: number[] }
export type KnowledgeIndex = { key: string; chunks: IndexedChunk[] }
export type SearchResult = { chunk: Chunk; score: number }

/** Chunks sent to the model per question. */
export const SEARCH_LIMIT = 4
/** Added to the score of a glossary entry whose term appears in the question. */
export const GLOSSARY_BOOST = 0.1
/**
 * Minimum cosine similarity for a chunk to count as an answer. Below it, IRIS says
 * it has no information and the model is not called. Tuned for bge-m3; override
 * with IRIS_MIN_SCORE when using another embedding model.
 */
export const MIN_SCORE = Number(process.env.IRIS_MIN_SCORE) || 0.5

const EMBED_BATCH_SIZE = 16
const DEFAULT_CACHE_DIR =
  process.env.IRIS_CACHE_DIR || path.join(process.cwd(), 'node_modules', '.cache', 'iris')

type EmbedFn = (texts: string[]) => Promise<number[][]>

/** Changes whenever a chunk text, a chunk id or the embedding model changes. */
export function indexKey(chunks: readonly Chunk[], embedModel: string) {
  const content = JSON.stringify({ embedModel, chunks: chunks.map((c) => [c.id, c.text]) })
  return createHash('sha256').update(content).digest('hex').slice(0, 16)
}

/** Unit-length copy: the cosine similarity of unit vectors is their dot product. */
export function normalize(vector: readonly number[]) {
  const norm = Math.hypot(...vector)
  return norm === 0 ? [...vector] : vector.map((x) => x / norm)
}

function dot(a: readonly number[], b: readonly number[]) {
  let sum = 0
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i]
  return sum
}

/** Embeds the chunks, or reads them from the disk cache when nothing changed. */
export async function buildIndex(
  chunks: readonly Chunk[],
  {
    embedModel,
    embedFn,
    cacheDir = DEFAULT_CACHE_DIR,
  }: { embedModel: string; embedFn: EmbedFn; cacheDir?: string },
): Promise<KnowledgeIndex> {
  const key = indexKey(chunks, embedModel)
  const file = path.join(cacheDir, `index-${key}.json`)

  try {
    const cached = JSON.parse(await readFile(file, 'utf8')) as KnowledgeIndex
    if (cached.key === key && cached.chunks.length === chunks.length) return cached
  } catch {
    // No cache yet (or unreadable): embed below.
  }

  const vectors: number[][] = []
  for (let i = 0; i < chunks.length; i += EMBED_BATCH_SIZE) {
    const batch = chunks.slice(i, i + EMBED_BATCH_SIZE)
    vectors.push(...(await embedFn(batch.map((c) => c.text))))
  }
  const index: KnowledgeIndex = {
    key,
    chunks: chunks.map((chunk, i) => ({ ...chunk, vector: normalize(vectors[i]) })),
  }

  // A read-only disk only costs a re-embedding at the next start.
  await mkdir(cacheDir, { recursive: true })
    .then(() => writeFile(file, JSON.stringify(index)))
    .catch(() => undefined)
  return index
}

let pending: { key: string; index: Promise<KnowledgeIndex> } | undefined

/** The index of the current content, built once per content version and process. */
export function getKnowledgeIndex(config: OllamaConfig = ollamaConfig()) {
  const chunks = buildChunks()
  const key = indexKey(chunks, config.embedModel)
  if (pending?.key !== key) {
    const index = buildIndex(chunks, {
      embedModel: config.embedModel,
      embedFn: (texts) => embed(texts, config),
    })
    // A failure (Ollama down) must not be cached: the next question retries.
    index.catch(() => {
      if (pending?.index === index) pending = undefined
    })
    pending = { key, index }
  }
  return pending.index
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Glossary chunk ids whose term (or an alias) appears as a whole word in the text. */
export function glossaryMatches(text: string) {
  const haystack = normalizeForSearch(text)
  const ids = new Set<string>()
  for (const term of glossary.all) {
    const found = [term.term, ...term.aliases].some((value) => {
      const needle = normalizeForSearch(value)
      return (
        needle !== '' &&
        new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(needle)}($|[^\\p{L}\\p{N}])`, 'u').test(
          haystack,
        )
      )
    })
    if (found) ids.add(`glossary:${term.slug}`)
  }
  return ids
}

/** The chunks closest to the question, best first, with their score. */
export function search(
  index: KnowledgeIndex,
  queryVector: readonly number[],
  question: string,
  limit = SEARCH_LIMIT,
): SearchResult[] {
  const query = normalize(queryVector)
  const boosted = glossaryMatches(question)
  return index.chunks
    .map(({ vector, ...chunk }) => ({
      chunk,
      score: dot(vector, query) + (boosted.has(chunk.id) ? GLOSSARY_BOOST : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/** Results good enough to answer from; empty means "no information". */
export function relevantResults(results: readonly SearchResult[], minScore = MIN_SCORE) {
  return results.filter((r) => r.score >= minScore)
}
