// The light formatting IRIS is asked to use (short paragraphs, "- " lists, **bold**),
// turned into a structure the widget renders with React elements. No HTML is ever
// injected: anything else (titles, links, code) is reduced to plain text.

export type Inline = { text: string; bold?: boolean }
export type Block = { type: 'paragraph'; inlines: Inline[] } | { type: 'list'; items: Inline[][] }

const LIST_ITEM = /^\s*(?:[-*•]|\d+[.)])\s+/

/** **bold** pieces; links keep their text only, other markup characters are dropped. */
export function parseInlines(text: string): Inline[] {
  const clean = text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`+/g, '')
    .replace(/(^|\s)_{1,2}([^_]+)_{1,2}(?=\s|$|[.,;:!?])/g, '$1$2')
  const inlines: Inline[] = []
  const pattern = /\*\*([^*]+)\*\*/g
  let cursor = 0
  for (const match of clean.matchAll(pattern)) {
    if (match.index > cursor) inlines.push({ text: clean.slice(cursor, match.index) })
    inlines.push({ text: match[1], bold: true })
    cursor = match.index + match[0].length
  }
  if (cursor < clean.length) inlines.push({ text: clean.slice(cursor) })
  // Stray single asterisks (unclosed emphasis) are not shown.
  return inlines
    .map((i) => ({ ...i, text: i.text.replace(/\*/g, '') }))
    .filter((i) => i.text !== '')
}

/** Paragraphs and lists, in order. */
export function parseAnswer(text: string): Block[] {
  const blocks: Block[] = []
  let paragraph: string[] = []
  let list: string[] = []

  const flushParagraph = () => {
    if (paragraph.length > 0)
      blocks.push({ type: 'paragraph', inlines: parseInlines(paragraph.join(' ')) })
    paragraph = []
  }
  const flushList = () => {
    if (list.length > 0) blocks.push({ type: 'list', items: list.map(parseInlines) })
    list = []
  }

  for (const rawLine of text.replace(/\r\n?/g, '\n').split('\n')) {
    // Titles are not wanted: keep their words as a plain line.
    const line = rawLine.replace(/^\s*#{1,6}\s+/, '').trimEnd()
    if (line.trim() === '') {
      flushParagraph()
      flushList()
    } else if (LIST_ITEM.test(line)) {
      flushParagraph()
      list.push(line.replace(LIST_ITEM, ''))
    } else if (list.length > 0 && /^\s+/.test(rawLine)) {
      // Indented continuation of the previous list item.
      list[list.length - 1] += ` ${line.trim()}`
    } else {
      flushList()
      paragraph.push(line.trim())
    }
  }
  flushParagraph()
  flushList()
  return blocks
}

/** The answer as plain text, for the copy button and the screen-reader announcement. */
export function plainAnswer(text: string) {
  return parseAnswer(text)
    .map((block) =>
      block.type === 'paragraph'
        ? block.inlines.map((i) => i.text).join('')
        : block.items.map((item) => `- ${item.map((i) => i.text).join('')}`).join('\n'),
    )
    .join('\n\n')
}
