import { MessageCircleIcon, RotateCcwIcon, SendIcon, XIcon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'

import { Definition } from '@/components/glossary/definition'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { IRIS, IRIS_ERRORS, MAX_QUESTION_LENGTH, starterQuestions } from '@/shared/chatbot'
import type { FaqPage } from '@/shared/faq'

import { glossarySegments } from './glossary-segments'
import { useIris, type IrisMessage } from './use-iris'

/**
 * IRIS, the site's assistant: a launcher button and a non-modal panel.
 * RGAA: the panel is labelled by its heading, the field has a visible label, the
 * focus moves into the panel on open and back to the launcher on close (Escape
 * works too), and each finished answer is announced once by a live region (the
 * streamed text itself is not live: it would be read word by word).
 */
export function IrisWidget({
  page = 'home',
}: {
  /** Page the widget is on: its FAQ provides the questions suggested at start. */
  page?: FaqPage
}) {
  const [open, setOpen] = useState(false)
  const { messages, busy, ask, reset } = useIris()
  const [question, setQuestion] = useState('')
  const [announcement, setAnnouncement] = useState('')

  const panelId = useId()
  const titleId = useId()
  const fieldId = useId()
  const launcherRef = useRef<HTMLButtonElement>(null)
  const fieldRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const questionRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (open) fieldRef.current?.focus()
  }, [open])

  // A new question goes to the top of the panel: its answer is then read from the
  // start (scrolling to the bottom would hide the beginning of a long answer).
  // Only the panel scrolls, never the page.
  const last = messages.at(-1)
  const lastQuestionId = messages.findLast((m) => m.role === 'user')?.id
  useEffect(() => {
    const container = scrollRef.current
    const question = questionRef.current
    if (container && question) container.scrollTop = question.offsetTop
  }, [lastQuestionId])

  // Announce a finished answer once, as a whole.
  useEffect(() => {
    if (!last || last.role !== 'assistant' || last.status === 'streaming') return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors the end of a stream
    setAnnouncement(
      last.status === 'error' ? IRIS_ERRORS[last.error ?? 'unavailable'] : `IRIS : ${last.content}`,
    )
  }, [last])

  const close = () => {
    setOpen(false)
    launcherRef.current?.focus()
  }

  const send = (text: string) => {
    if (!text.trim() || busy) return
    void ask(text)
    setQuestion('')
    fieldRef.current?.focus()
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    send(question)
  }

  // Enter sends, Shift+Enter adds a line.
  const onFieldKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      send(question)
    }
  }

  const suggestions =
    messages.length === 0
      ? starterQuestions(page)
      : last?.status !== 'streaming'
        ? (last?.suggestions ?? [])
        : []

  return (
    <>
      <Button
        ref={launcherRef}
        size="lg"
        className="fixed right-4 bottom-4 z-40 size-12 rounded-full shadow-lg sm:w-auto sm:px-4"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <MessageCircleIcon aria-hidden className="size-5" />
        <span className="sr-only sm:not-sr-only">
          {open ? 'Fermer IRIS' : 'Poser une question à IRIS'}
        </span>
      </Button>

      <section
        id={panelId}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        hidden={!open}
        onKeyDown={(event) => {
          if (event.key === 'Escape') close()
        }}
        className="fixed inset-x-2 bottom-20 z-40 flex max-h-[min(36rem,calc(100dvh-6rem))] flex-col rounded-lg border-2 border-france-blue bg-background shadow-xl sm:inset-x-auto sm:right-4 sm:w-96"
      >
        <header className="flex items-start justify-between gap-2 border-b px-4 py-3">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-france-blue">
              {IRIS.name}
            </h2>
            <p className="text-sm text-muted-foreground">{IRIS.tagline}</p>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon-lg" onClick={reset} disabled={messages.length === 0}>
              <RotateCcwIcon aria-hidden />
              <span className="sr-only">Nouvelle conversation</span>
            </Button>
            <Button variant="ghost" size="icon-lg" onClick={close}>
              <XIcon aria-hidden />
              <span className="sr-only">Fermer IRIS</span>
            </Button>
          </div>
        </header>

        <p className="bg-france-blue-4 px-4 py-2 text-xs">{IRIS.notice}</p>

        <div ref={scrollRef} className="relative flex-1 space-y-4 overflow-y-auto px-4 py-3">
          {messages.length === 0 && <p className="text-sm">{IRIS.greeting}</p>}
          <ol aria-label="Conversation avec IRIS" className="space-y-4">
            {messages.map((message) => (
              <li key={message.id} ref={message.id === lastQuestionId ? questionRef : undefined}>
                <MessageView message={message} />
              </li>
            ))}
          </ol>
          {suggestions.length > 0 && (
            <div>
              <p className="text-sm font-medium" id={`${panelId}-suggestions`}>
                Questions suggérées
              </p>
              <ul aria-labelledby={`${panelId}-suggestions`} className="mt-2 flex flex-col gap-2">
                {suggestions.map((s) => (
                  <li key={s}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-auto w-full justify-start py-1.5 text-left whitespace-normal"
                      onClick={() => send(s)}
                      disabled={busy}
                    >
                      {s}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} className="border-t px-4 py-3">
          <label htmlFor={fieldId} className="text-sm font-medium">
            Votre question
          </label>
          <div className="mt-1 flex items-end gap-2">
            <textarea
              ref={fieldRef}
              id={fieldId}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={onFieldKeyDown}
              maxLength={MAX_QUESTION_LENGTH}
              rows={2}
              className="min-h-10 flex-1 resize-none rounded-md border border-input px-3 py-2 text-sm"
            />
            <Button type="submit" size="icon-lg" disabled={busy || !question.trim()}>
              <SendIcon aria-hidden />
              <span className="sr-only">Envoyer</span>
            </Button>
          </div>
        </form>

        <p role="status" aria-live="polite" className="sr-only">
          {busy ? 'IRIS rédige sa réponse…' : announcement}
        </p>
      </section>
    </>
  )
}

function MessageView({ message }: { message: IrisMessage }) {
  if (message.role === 'user') {
    return (
      <div className="ml-8 rounded-lg bg-france-blue px-3 py-2 text-sm text-white">
        <span className="sr-only">Vous : </span>
        {message.content}
      </div>
    )
  }

  if (message.status === 'error') {
    return (
      <div className="mr-8 rounded-lg border border-destructive px-3 py-2 text-sm">
        <p>{IRIS_ERRORS[message.error ?? 'unavailable']}</p>
        <Link href="/apprendre#questions-frequentes" className="mt-1 inline-block underline">
          Voir les questions fréquentes
        </Link>
      </div>
    )
  }

  return (
    <div className="mr-8 rounded-lg bg-muted px-3 py-2 text-sm">
      <span className="sr-only">IRIS : </span>
      {message.content ? (
        <p
          className={cn(
            'whitespace-pre-line',
            message.status === 'streaming' && 'after:content-["▍"]',
          )}
        >
          {message.status === 'streaming' ? message.content : <AnswerText text={message.content} />}
        </p>
      ) : (
        <p className="text-muted-foreground">IRIS rédige sa réponse…</p>
      )}
      {message.sources && message.sources.length > 0 && message.status !== 'streaming' && (
        <div className="mt-2 border-t border-border pt-2">
          <p className="text-xs font-medium">Sources</p>
          <ul className="mt-1 space-y-1">
            {message.sources.map((source) => (
              <li key={`${source.url}|${source.title}`}>
                <Link
                  href={source.url}
                  className="text-xs text-france-blue underline underline-offset-2"
                >
                  {source.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/** Answer text with its glossary terms opening their definition. */
function AnswerText({ text }: { text: string }) {
  return (
    <>
      {glossarySegments(text).map((segment, i) =>
        segment.slug ? (
          <Definition key={i} slug={segment.slug}>
            {segment.text}
          </Definition>
        ) : (
          segment.text
        ),
      )}
    </>
  )
}
