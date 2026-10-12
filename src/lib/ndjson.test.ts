import { describe, expect, it } from 'vitest'

import { readNdjson, toNdjsonLine } from './ndjson'

function streamOf(chunks: string[]) {
  const encoder = new TextEncoder()
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk))
      controller.close()
    },
  })
}

async function collect(stream: ReadableStream<Uint8Array>) {
  const values: unknown[] = []
  for await (const value of readNdjson(stream)) values.push(value)
  return values
}

describe('readNdjson', () => {
  it('yields one value per line', async () => {
    expect(await collect(streamOf(['{"a":1}\n{"a":2}\n']))).toEqual([{ a: 1 }, { a: 2 }])
  })

  it('rebuilds a line split across chunks', async () => {
    expect(await collect(streamOf(['{"te', 'xt":"bon', 'jour"}\n']))).toEqual([{ text: 'bonjour' }])
  })

  it('reads a last line without a final newline and skips blank lines', async () => {
    expect(await collect(streamOf(['\n{"a":1}\n\n', '{"a":2}']))).toEqual([{ a: 1 }, { a: 2 }])
  })

  it('round-trips with toNdjsonLine', async () => {
    const values = [{ type: 'token', text: 'é\n' }, { type: 'done' }]
    expect(await collect(streamOf(values.map(toNdjsonLine)))).toEqual(values)
  })
})
