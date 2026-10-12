// NDJSON (one JSON value per line) over a streamed HTTP body.
// Used by the server to read Ollama's streamed answers and by the front to read
// the chatbot API: both stream this format.

/** Yields each JSON line of a stream, as soon as the line is complete. */
export async function* readNdjson(body: ReadableStream<Uint8Array>): AsyncGenerator<unknown> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  try {
    for (;;) {
      const { done, value } = await reader.read()
      buffer += decoder.decode(value, { stream: !done })
      // A chunk can end in the middle of a line: keep the incomplete end for later.
      const lines = buffer.split('\n')
      buffer = done ? '' : (lines.pop() ?? '')
      for (const line of lines) {
        if (line.trim()) yield JSON.parse(line)
      }
      if (done) return
    }
  } finally {
    reader.releaseLock()
  }
}

/** Serialises one value as an NDJSON line. */
export function toNdjsonLine(value: unknown) {
  return `${JSON.stringify(value)}\n`
}
