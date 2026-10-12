import { useCallback, useEffect, useRef, useState } from 'react'

import { readNdjson } from '@/lib/ndjson'
import {
  chatStreamEventSchema,
  MAX_HISTORY,
  type ChatErrorCode,
  type ChatMessage,
  type ChatSource,
  type ChatStep,
} from '@/shared/chatbot'

// Conversation state of the IRIS widget. The conversation lives in this browser
// tab only (sessionStorage): closing the tab forgets it, nothing is kept on the server.

export type IrisMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  /** assistant only. pending: IRIS is working on it (see `step`). */
  status?: 'pending' | 'done' | 'no-answer' | 'error' | 'stopped'
  step?: ChatStep
  /** Number of extracts read (step "read"). */
  count?: number
  sources?: ChatSource[]
  suggestions?: string[]
  error?: ChatErrorCode
}

export const STORAGE_KEY = 'iris-conversation'

function load(): IrisMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    const messages = raw ? (JSON.parse(raw) as IrisMessage[]) : []
    // An answer interrupted by a reload cannot resume: mark it as stopped.
    return Array.isArray(messages)
      ? messages.map((m) => (m.status === 'pending' ? { ...m, status: 'stopped' } : m))
      : []
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

/** Previous exchanges sent with a question: only questions that got a real answer. */
export function historyFor(messages: readonly IrisMessage[]): ChatMessage[] {
  const history: ChatMessage[] = []
  messages.forEach((message, i) => {
    const answer = messages[i + 1]
    if (message.role === 'user' && answer?.role === 'assistant' && answer.status === 'done') {
      history.push({ role: 'user', content: message.content })
      history.push({ role: 'assistant', content: answer.content })
    }
  })
  return history.slice(-MAX_HISTORY)
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

  const busy = messages.at(-1)?.status === 'pending'

  const updateLast = useCallback(
    (patch: (m: IrisMessage) => Partial<IrisMessage>) =>
      setMessages((current) => {
        const last = current.at(-1)
        if (!last || last.role !== 'assistant') return current
        return [...current.slice(0, -1), { ...last, ...patch(last) }]
      }),
    [],
  )

  const send = useCallback(
    async (question: string, history: ChatMessage[]) => {
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
            case 'status':
              updateLast(() => ({ step: event.step, count: event.count ?? undefined }))
              break
            case 'answer':
              updateLast(() => ({
                status: 'done',
                content: event.text,
                sources: event.sources,
                suggestions: event.suggestions,
              }))
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
        // Stream closed without a final event.
        updateLast((m) => (m.status === 'pending' ? { status: 'error', error: 'unavailable' } : {}))
      } catch {
        if (controller.signal.aborted) return
        updateLast(() => ({ status: 'error', error: 'unavailable' }))
      } finally {
        if (controllerRef.current === controller) controllerRef.current = null
      }
    },
    [updateLast],
  )

  const ask = useCallback(
    (rawQuestion: string) => {
      const question = rawQuestion.trim()
      if (!question || busy) return
      const history = historyFor(messages)
      setMessages((current) => [
        ...current,
        { id: newId(), role: 'user', content: question },
        { id: newId(), role: 'assistant', content: '', status: 'pending', step: 'search' },
      ])
      void send(question, history)
    },
    [busy, messages, send],
  )

  /** Stops the answer in progress (the server stops generating too). */
  const stop = useCallback(() => {
    controllerRef.current?.abort()
    controllerRef.current = null
    updateLast((m) => (m.status === 'pending' ? { status: 'stopped' } : {}))
  }, [updateLast])

  /** Asks the last question again, after an error or a stop. */
  const retry = useCallback(() => {
    const last = messages.at(-1)
    const question = messages.at(-2)
    if (!last || !question || question.role !== 'user' || busy) return
    if (last.status !== 'error' && last.status !== 'stopped') return
    const history = historyFor(messages.slice(0, -2))
    setMessages((current) => [
      ...current.slice(0, -1),
      { id: newId(), role: 'assistant', content: '', status: 'pending', step: 'search' },
    ])
    void send(question.content, history)
  }, [busy, messages, send])

  /** Stops any answer in progress and forgets the conversation. */
  const reset = useCallback(() => {
    controllerRef.current?.abort()
    controllerRef.current = null
    setMessages([])
  }, [])

  return { messages, busy, ask, stop, retry, reset }
}
