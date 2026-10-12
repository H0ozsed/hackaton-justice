import { useCallback, useEffect, useRef, useState } from 'react'

import { readNdjson } from '@/lib/ndjson'
import {
  chatStreamEventSchema,
  IRIS,
  MAX_HISTORY,
  type ChatErrorCode,
  type ChatMessage,
  type ChatSource,
} from '@/shared/chatbot'

// Conversation state of the IRIS widget. The conversation lives in this browser
// tab only (sessionStorage): closing the tab forgets it, nothing is kept on the server.

export type IrisMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  /** assistant only */
  status?: 'streaming' | 'done' | 'no-answer' | 'error'
  sources?: ChatSource[]
  suggestions?: string[]
  error?: ChatErrorCode
}

export const STORAGE_KEY = 'iris-conversation'

function load(): IrisMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    const messages = raw ? (JSON.parse(raw) as IrisMessage[]) : []
    // An answer cut off by a reload cannot resume: drop it.
    return Array.isArray(messages) ? messages.filter((m) => m.status !== 'streaming') : []
  } catch {
    return []
  }
}

function save(messages: IrisMessage[]) {
  try {
    if (messages.length === 0) sessionStorage.removeItem(STORAGE_KEY)
    else sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  } catch {
    // Storage blocked (private mode...): the conversation just won't survive a reload.
  }
}

/** Previous exchanges sent with a question: completed answers only. */
export function historyFor(messages: readonly IrisMessage[]): ChatMessage[] {
  return messages
    .filter((m) => m.role === 'user' || m.status === 'done')
    .map(({ role, content }) => ({ role, content }))
    .slice(-MAX_HISTORY)
}

let nextId = 0
const newId = () => `iris-${Date.now()}-${nextId++}`

export function useIris() {
  const [messages, setMessages] = useState<IrisMessage[]>([])
  const [loaded, setLoaded] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)

  // sessionStorage only exists in the browser: read it after the first render.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from storage
    setMessages(load())
    setLoaded(true)
    return () => controllerRef.current?.abort()
  }, [])

  useEffect(() => {
    if (loaded) save(messages)
  }, [messages, loaded])

  const busy = messages.at(-1)?.status === 'streaming'

  const updateLast = (patch: (m: IrisMessage) => Partial<IrisMessage>) =>
    setMessages((current) => {
      const last = current.at(-1)
      if (!last || last.role !== 'assistant') return current
      return [...current.slice(0, -1), { ...last, ...patch(last) }]
    })

  const ask = useCallback(
    async (rawQuestion: string) => {
      const question = rawQuestion.trim()
      if (!question || busy) return

      const history = historyFor(messages)
      setMessages((current) => [
        ...current,
        { id: newId(), role: 'user', content: question },
        { id: newId(), role: 'assistant', content: '', status: 'streaming' },
      ])

      const controller = new AbortController()
      controllerRef.current = controller
      try {
        const response = await fetch('/api/chatbot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, history }),
          signal: controller.signal,
        })
        if (!response.ok || !response.body) {
          const code: ChatErrorCode =
            response.status === 429
              ? 'rate-limited'
              : response.status === 400
                ? 'invalid'
                : 'unavailable'
          updateLast(() => ({ status: 'error', error: code }))
          return
        }
        for await (const raw of readNdjson(response.body)) {
          const event = chatStreamEventSchema.parse(raw)
          switch (event.type) {
            case 'sources':
              updateLast(() => ({ sources: event.sources }))
              break
            case 'token':
              updateLast((m) => ({ content: m.content + event.text }))
              break
            case 'done':
              updateLast(() => ({ status: 'done', suggestions: event.suggestions }))
              break
            case 'no-answer':
              updateLast(() => ({
                status: 'no-answer',
                content: event.text,
                suggestions: event.suggestions,
              }))
              break
            case 'error':
              updateLast(() => ({ status: 'error', error: event.code }))
              break
          }
        }
        // Stream closed without an end event: keep what arrived.
        updateLast((m) =>
          m.status === 'streaming'
            ? { status: m.content ? 'done' : 'error', error: m.content ? undefined : 'unavailable' }
            : {},
        )
      } catch {
        if (controller.signal.aborted) return
        updateLast(() => ({ status: 'error', error: 'unavailable' }))
      } finally {
        if (controllerRef.current === controller) controllerRef.current = null
      }
    },
    [busy, messages],
  )

  /** Stops any answer in progress and forgets the conversation. */
  const reset = useCallback(() => {
    controllerRef.current?.abort()
    controllerRef.current = null
    setMessages([])
  }, [])

  return { messages, busy, ask, reset, greeting: IRIS.greeting }
}
