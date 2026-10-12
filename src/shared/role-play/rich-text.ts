// Scenario texts can link glossary terms inline: `[[slug]]` shows the term as written in
// the glossary, `[[slug|displayed text]]` shows another spelling (plural, verb...).
// The UI renders each `term` segment with <Definition>.

const TERM_PATTERN = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g

export type RichTextSegment =
  { kind: 'text'; text: string } | { kind: 'term'; slug: string; text?: string }

/** Splits a text into plain parts and glossary terms. */
export function parseRichText(text: string): RichTextSegment[] {
  const segments: RichTextSegment[] = []
  let last = 0
  for (const match of text.matchAll(TERM_PATTERN)) {
    if (match.index > last) segments.push({ kind: 'text', text: text.slice(last, match.index) })
    const [, slug, label] = match
    segments.push(
      label
        ? { kind: 'term', slug: slug.trim(), text: label }
        : { kind: 'term', slug: slug.trim() },
    )
    last = match.index + match[0].length
  }
  if (last < text.length) segments.push({ kind: 'text', text: text.slice(last) })
  return segments
}

/** Glossary slugs referenced by a text. */
export function termSlugs(text: string) {
  return parseRichText(text).flatMap((s) => (s.kind === 'term' ? [s.slug] : []))
}

/** Text as read aloud / in plain contexts: markup removed. */
export function plainText(text: string, termLabel: (slug: string) => string = (slug) => slug) {
  return parseRichText(text)
    .map((s) => (s.kind === 'text' ? s.text : (s.text ?? termLabel(s.slug))))
    .join('')
}

/** True when a text has `[[` or `]]` left after removing valid term markup. */
export function hasBrokenMarkup(text: string) {
  const rest = text.replace(TERM_PATTERN, '')
  return rest.includes('[[') || rest.includes(']]')
}
