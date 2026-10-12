import { glossary, normalizeForSearch } from '@/shared/glossary'

export type Segment = { text: string; slug?: string }

/**
 * Splits an answer into plain text and glossary terms, so each term can open its
 * definition. Only the first occurrence of each term is marked: a page full of
 * buttons would be hard to read and to navigate with a keyboard.
 */
export function glossarySegments(
  text: string,
  /** Terms already marked elsewhere in the same answer (shared across calls). */
  usedSlugs = new Set<string>(),
): Segment[] {
  // Every spelling of every term, longest first ("médiatrice" before "médiation").
  const spellings = glossary.all
    .flatMap((t) => [t.term, ...t.aliases].map((value) => ({ value, slug: t.slug })))
    .filter((s) => s.value.trim() !== '')
    .sort((a, b) => b.value.length - a.value.length)

  // Accents and case are ignored, but normalising never changes the length of
  // a French word letter by letter, so positions can be mapped back.
  const haystack = normalizeLetters(text)
  const found: { start: number; end: number; slug: string }[] = []

  for (const { value, slug } of spellings) {
    if (usedSlugs.has(slug)) continue
    const needle = normalizeLetters(value)
    const match = new RegExp(
      `(^|[^\\p{L}\\p{N}])(${escapeRegExp(needle)})(?=$|[^\\p{L}\\p{N}])`,
      'u',
    ).exec(haystack)
    if (!match) continue
    const start = match.index + match[1].length
    const end = start + needle.length
    if (found.some((f) => start < f.end && end > f.start)) continue
    found.push({ start, end, slug })
    usedSlugs.add(slug)
  }

  found.sort((a, b) => a.start - b.start)
  const segments: Segment[] = []
  let cursor = 0
  for (const { start, end, slug } of found) {
    if (start > cursor) segments.push({ text: text.slice(cursor, start) })
    segments.push({ text: text.slice(start, end), slug })
    cursor = end
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) })
  return segments
}

/** Lowercase, accents removed character by character (keeps every position). */
function normalizeLetters(text: string) {
  return [...text].map((char) => normalizeForSearch(char) || char).join('')
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
