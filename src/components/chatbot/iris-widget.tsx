import {
  CheckIcon,
  CopyIcon,
  LoaderCircleIcon,
  MessageCircleIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  SendIcon,
  SquareIcon,
  XIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'

import { Definition } from '@/components/glossary/definition'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  IRIS,
  IRIS_ERRORS,
  MAX_QUESTION_LENGTH,
  starterQuestions,
  type ChatStep,
} from '@/shared/chatbot'
import type { FaqPage } from '@/shared/faq'

import { parseAnswer, plainAnswer, type Inline } from './answer-format'
import { glossarySegments } from './glossary-segments'
import { useIris, type IrisMessage } from './use-iris'
import { useLauncherAttention } from './use-launcher-attention'

/** What IRIS is doing, shown live while it works on an answer. */
export function stepLabel(step: ChatStep | undefined, count?: number) {
  switch (step) {
    case 'read':
      return `Lecture de ${count ?? 0} extrait${(count ?? 0) > 1 ? 's' : ''} du site…`
    case 'think':
      return 'Réflexion…'
    case 'write':
      return 'Rédaction de la réponse…'
    default:
      return 'Recherche dans le site…'
  }
}

/**
 * IRIS, the site's assistant (« votre assistante » in French): a launcher button and a non-modal panel.
 * RGAA: the panel is labelled by its heading, the field has a visible label and a
 * character counter, the focus moves into the panel on open and back to the
 * launcher on close (Escape works too). One polite live region announces the steps,
 * then the finished answer once, as a whole.
 */
export function IrisWidget({
  page = 'home',
}: {
  /** Page the widget is on: its FAQ provides the questions suggested at start. */
  page?: FaqPage
}) {
  const [open, setOpen] = useState(false)
  const { messages, busy, ask, stop, retry, reset } = useIris()
  const attention = useLauncherAttention(open)
  const [question, setQuestion] = useState('')
  const [announcement, setAnnouncement] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const panelId = useId()
  const titleId = useId()
  const fieldId = useId()
  const counterId = useId()
  const launcherRef = useRef<HTMLButtonElement>(null)
  const fieldRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const questionRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (open) fieldRef.current?.focus()
  }, [open])

  // A new question goes to the top of the panel: its answer is then read from the
  // start. Only the panel scrolls, never the page.
  const last = messages.at(-1)
  const lastQuestionId = messages.findLast((m) => m.role === 'user')?.id
  useEffect(() => {
    const container = scrollRef.current
    const asked = questionRef.current
    if (container && asked) container.scrollTop = asked.offsetTop
  }, [lastQuestionId])

  // Live region: the current step while IRIS works, then the outcome once.
  useEffect(() => {
    if (!last || last.role !== 'assistant') return
    const text =
      last.status === 'pending'
        ? stepLabel(last.step, last.count)
        : last.status === 'error'
          ? IRIS_ERRORS[last.error ?? 'unavailable']
          : last.status === 'stopped'
            ? 'Réponse arrêtée.'
            : `IRIS : ${plainAnswer(last.content)}`
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors the answer's progress
    setAnnouncement(text)
  }, [last])

  const close = () => {
    setOpen(false)
    launcherRef.current?.focus()
  }

  const send = (text: string) => {
    if (!text.trim() || busy) return
    ask(text)
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

  const copy = async (message: IrisMessage) => {
    try {
      await navigator.clipboard.writeText(plainAnswer(message.content))
      setCopiedId(message.id)
      setAnnouncement('Réponse copiée.')
      setTimeout(() => setCopiedId((id) => (id === message.id ? null : id)), 2000)
    } catch {
      setAnnouncement('La copie n’a pas fonctionné.')
    }
  }

  const suggestions =
    messages.length === 0 ? starterQuestions(page) : busy ? [] : (last?.suggestions ?? [])
  const canRetry = !busy && (last?.status === 'error' || last?.status === 'stopped')

  return (
    <>
      <div className="fixed right-4 bottom-4 z-40">
        {/* Catching the eye on arrival (#133): decorative, hidden from screen readers (the
            button keeps its name). The ring pulses 3 times (under 5 s, RGAA 13.8) and only
            without `prefers-reduced-motion`; the bubble then shows without animation. */}
        {attention && (
          <>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 hidden rounded-full bg-france-blue motion-safe:block motion-safe:animate-[iris-ring_1.5s_ease-out_3_forwards]"
            />
            <p
              aria-hidden
              data-testid="iris-teaser"
              className="pointer-events-none absolute right-0 bottom-full mb-3 w-max max-w-[calc(100vw-2rem)] rounded-lg border-2 border-france-blue bg-background px-3 py-2 text-sm font-medium text-foreground shadow-lg motion-safe:animate-in motion-safe:duration-500 motion-safe:fade-in motion-safe:slide-in-from-bottom-2"
            >
              Une question ? Demandez à IRIS
            </p>
          </>
        )}
        <Button
          ref={launcherRef}
          size="lg"
          className={cn(
            'relative size-12 rounded-full shadow-lg sm:w-auto sm:px-4',
            attention &&
              'motion-safe:animate-in motion-safe:duration-500 motion-safe:zoom-in-50 motion-safe:fade-in',
          )}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => (open ? close() : setOpen(true))}
        >
          <MessageCircleIcon aria-hidden className="size-5" />
          <span className="sr-only sm:not-sr-only">
            {open ? 'Fermer IRIS' : 'Poser une question à IRIS'}
          </span>
        </Button>
      </div>

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
        {/* The tagline gets the full width of the panel (below the buttons): the four
            words of the acronym fit on one line. */}
        <header className="grid grid-cols-[1fr_auto] items-center gap-x-2 border-b px-4 py-3">
          <h2 id={titleId} className="text-lg font-bold text-france-blue">
            {IRIS.name}
          </h2>
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
          <p className="col-span-2 text-xs text-muted-foreground sm:text-sm">{IRIS.tagline}</p>
        </header>

        <p className="bg-france-blue-4 px-4 py-2 text-xs">{IRIS.notice}</p>

        <div ref={scrollRef} className="relative flex-1 space-y-4 overflow-y-auto px-4 py-3">
          {messages.length === 0 && <p className="text-sm">{IRIS.greeting}</p>}
          <ol aria-label="Conversation avec IRIS" className="space-y-4">
            {messages.map((message) => (
              <li key={message.id} ref={message.id === lastQuestionId ? questionRef : undefined}>
                <MessageView
                  message={message}
                  copied={copiedId === message.id}
                  onCopy={() => void copy(message)}
                />
              </li>
            ))}
          </ol>

          {canRetry && (
            <Button variant="outline" size="sm" onClick={retry}>
              <RefreshCwIcon aria-hidden />
              Réessayer
            </Button>
          )}

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
          <div className="flex items-baseline justify-between">
            <label htmlFor={fieldId} className="text-sm font-medium">
              Votre question
            </label>
            <span id={counterId} className="text-xs text-muted-foreground">
              {question.length}/{MAX_QUESTION_LENGTH}
              <span className="sr-only"> caractères</span>
            </span>
          </div>
          <div className="mt-1 flex items-end gap-2">
            <textarea
              ref={fieldRef}
              id={fieldId}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={onFieldKeyDown}
              maxLength={MAX_QUESTION_LENGTH}
              aria-describedby={counterId}
              rows={2}
              className="min-h-10 flex-1 resize-none rounded-md border border-input px-3 py-2 text-sm"
            />
            {busy ? (
              <Button type="button" size="icon-lg" variant="destructive" onClick={stop}>
                <SquareIcon aria-hidden />
                <span className="sr-only">Arrêter la réponse</span>
              </Button>
            ) : (
              <Button type="submit" size="icon-lg" disabled={!question.trim()}>
                <SendIcon aria-hidden />
                <span className="sr-only">Envoyer</span>
              </Button>
            )}
          </div>
        </form>

        <p role="status" aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </section>
    </>
  )
}

function MessageView({
  message,
  copied,
  onCopy,
}: {
  message: IrisMessage
  copied: boolean
  onCopy: () => void
}) {
  if (message.role === 'user') {
    return (
      <div className="ml-8 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
        <span className="sr-only">Vous : </span>
        {message.content}
      </div>
    )
  }

  if (message.status === 'pending') {
    return (
      <p className="mr-8 flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
        <LoaderCircleIcon aria-hidden className="size-4 shrink-0 motion-safe:animate-spin" />
        {stepLabel(message.step, message.count)}
      </p>
    )
  }

  if (message.status === 'stopped') {
    return (
      <p className="mr-8 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
        Réponse arrêtée.
      </p>
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
      <FormattedAnswer text={message.content} />
      {message.status === 'no-answer' && (
        // No answer on the site: a way to the contacts, never a dead end (#135).
        <Link href="/apprendre#infos-pratiques" className="mt-2 inline-block underline">
          Trouver de l’aide près de chez vous
        </Link>
      )}
      {message.sources && message.sources.length > 0 && (
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
      {message.status === 'done' && (
        <Button variant="ghost" size="xs" className="mt-2 -ml-2" onClick={onCopy}>
          {copied ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
          {copied ? 'Copié' : 'Copier'}
          <span className="sr-only"> la réponse</span>
        </Button>
      )}
    </div>
  )
}

/** Short paragraphs, lists and bold, with glossary terms opening their definition. */
function FormattedAnswer({ text }: { text: string }) {
  // One clickable occurrence per term in the whole answer.
  const used = new Set<string>()
  const inline = (pieces: Inline[]) =>
    pieces.map((piece, i) => {
      const content = glossarySegments(piece.text, used).map((segment, j) =>
        segment.slug ? (
          <Definition key={j} slug={segment.slug}>
            {segment.text}
          </Definition>
        ) : (
          segment.text
        ),
      )
      return piece.bold ? <strong key={i}>{content}</strong> : <span key={i}>{content}</span>
    })

  return (
    <div className="space-y-2">
      {parseAnswer(text).map((block, i) =>
        block.type === 'paragraph' ? (
          <p key={i}>{inline(block.inlines)}</p>
        ) : (
          <ul key={i} className="list-disc space-y-1 pl-5">
            {block.items.map((item, j) => (
              <li key={j}>{inline(item)}</li>
            ))}
          </ul>
        ),
      )}
    </div>
  )
}
