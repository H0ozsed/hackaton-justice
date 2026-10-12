import type { NextApiRequest, NextApiResponse } from 'next'

import { toNdjsonLine } from '@/lib/ndjson'
import { chatRateLimit } from '@/server/domains/chatbot/rate-limit'
import { respond } from '@/server/domains/chatbot/respond'
import { chatRequestSchema, type ChatStreamEvent } from '@/shared/chatbot'

// POST /api/chatbot: a question for IRIS. Answer: NDJSON stream of ChatStreamEvent.
// Nothing is stored: the conversation history comes from the browser.

export const config = { api: { bodyParser: { sizeLimit: '32kb' } } }

function clientKey(req: NextApiRequest) {
  const forwarded = req.headers['x-forwarded-for']
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]
  return first?.trim() || req.socket.remoteAddress || 'unknown'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end()
  }

  const parsed = chatRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ type: 'error', code: 'invalid' } satisfies ChatStreamEvent)
  }
  if (!chatRateLimit(clientKey(req))) {
    return res.status(429).json({ type: 'error', code: 'rate-limited' } satisfies ChatStreamEvent)
  }

  // Stop generating when the visitor closes the widget or starts a new conversation.
  const controller = new AbortController()
  res.on('close', () => controller.abort())

  res.status(200)
  res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  // Compression buffers the whole body: the answer would show up all at once.
  res.setHeader('Content-Encoding', 'none')
  res.flushHeaders()

  try {
    for await (const event of respond(parsed.data, controller.signal)) {
      if (controller.signal.aborted) break
      res.write(toNdjsonLine(event))
    }
  } catch (error) {
    // Headers are already sent: end the stream with an error event the widget understands.
    console.error('[IRIS]', error)
    if (!controller.signal.aborted) res.write(toNdjsonLine({ type: 'error', code: 'unavailable' }))
  }
  res.end()
}
