import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlertIcon, CopyIcon, PrinterIcon } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { Controller, useForm, type FieldPath } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

import {
  buildLetter,
  LETTER_TOPICS,
  letterSchema,
  type LetterInput,
  type LetterTopic,
  type LetterValues,
} from './letter'

// Amicable letter generator (night work #80): a few fields, then a courteous letter to copy or
// print. Nothing is sent or stored. Accessibility: labels above the fields, required fields
// said once, errors starting with "Erreur" bound to their field, error summary focused on an
// invalid attempt, letter heading focused once written.

const inputClasses =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:border-ring aria-invalid:border-destructive'

export function LetterGenerator({ today = () => new Date() }: { today?: () => Date }) {
  const id = useId()
  const [letter, setLetter] = useState<string>()
  const [copied, setCopied] = useState(false)
  const [refused, setRefused] = useState(0)
  const summary = useRef<HTMLDivElement>(null)
  const result = useRef<HTMLHeadingElement>(null)

  const form = useForm<LetterInput, unknown, LetterValues>({
    resolver: zodResolver(letterSchema),
    shouldFocusError: false,
    defaultValues: {
      sender: '',
      recipient: '',
      facts: '',
      request: '',
      delay: '15',
      proposeConciliation: true,
    },
  })
  const { errors } = form.formState
  const errorNames = Object.keys(errors) as FieldPath<LetterInput>[]
  const hasErrors = errorNames.length > 0

  useEffect(() => {
    if (refused > 0 && hasErrors) summary.current?.focus()
  }, [refused, hasErrors])
  useEffect(() => {
    if (letter) result.current?.focus()
  }, [letter])

  const submit = form.handleSubmit(
    (values) => {
      setCopied(false)
      setLetter(buildLetter(values, today()))
    },
    () => setRefused((n) => n + 1),
  )

  const copy = async () => {
    if (!letter) return
    try {
      await navigator.clipboard.writeText(letter)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  // Prints the letter alone (see the print rules of globals.css), then the page again.
  const printLetter = () => {
    document.body.dataset.print = 'letter'
    window.addEventListener('afterprint', () => delete document.body.dataset.print, { once: true })
    window.print()
  }

  const fieldId = (name: string) => `${id}-${name}`
  const error = (name: FieldPath<LetterInput>) => {
    const message = errors[name]?.message
    return typeof message === 'string' ? message : undefined
  }
  const describedBy = (name: FieldPath<LetterInput>, hint?: boolean) =>
    [hint && `${fieldId(name)}-hint`, error(name) && `${fieldId(name)}-error`]
      .filter(Boolean)
      .join(' ') || undefined

  const errorText = (name: FieldPath<LetterInput>) =>
    error(name) ? (
      <p
        id={`${fieldId(name)}-error`}
        className="flex items-start gap-2 text-sm font-medium text-destructive"
      >
        <CircleAlertIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
        <span>
          <span className="font-bold">Erreur :</span> {error(name)}
        </span>
      </p>
    ) : null

  const LABELS: Record<FieldPath<LetterInput>, string> = {
    sender: 'Votre nom',
    recipient: 'Nom du destinataire',
    topic: 'Objet du courrier',
    facts: 'Ce qui s’est passé',
    request: 'Ce que vous demandez',
    delay: 'Délai de réponse, en jours',
    proposeConciliation: 'Proposer un conciliateur de justice',
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">Tous les champs sont obligatoires.</p>

        {hasErrors && (
          <div
            ref={summary}
            tabIndex={-1}
            role="alert"
            className="rounded-lg border-l-4 border-destructive bg-marianne-red-4 p-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <p className="font-bold">
              Erreur : {errorNames.length} champ{errorNames.length > 1 ? 's' : ''} à corriger.
            </p>
            <ul className="mt-2 list-disc pl-5">
              {errorNames.map((name) => (
                <li key={name}>
                  <a href={`#${fieldId(name)}`} className="underline underline-offset-4">
                    {LABELS[name]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {(['sender', 'recipient'] as const).map((name) => (
            <div key={name} className="flex flex-col gap-1">
              <Label htmlFor={fieldId(name)}>{LABELS[name]}</Label>
              <input
                id={fieldId(name)}
                autoComplete={name === 'sender' ? 'name' : 'off'}
                aria-required
                aria-invalid={error(name) ? true : undefined}
                aria-describedby={describedBy(name)}
                className={inputClasses}
                {...form.register(name)}
              />
              {errorText(name)}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor={fieldId('topic')}>{LABELS.topic}</Label>
          <select
            id={fieldId('topic')}
            aria-required
            aria-invalid={error('topic') ? true : undefined}
            aria-describedby={describedBy('topic')}
            className={inputClasses}
            defaultValue=""
            {...form.register('topic')}
          >
            <option value="" disabled>
              Choisissez
            </option>
            {(Object.keys(LETTER_TOPICS) as LetterTopic[]).map((topic) => (
              <option key={topic} value={topic}>
                {LETTER_TOPICS[topic]}
              </option>
            ))}
          </select>
          {errorText('topic')}
        </div>

        {(
          [
            ['facts', 'Les faits, avec les dates : « Depuis le 3 mars, … »'],
            ['request', 'Une demande précise : « Pourriez-vous… d’ici le… ? »'],
          ] as const
        ).map(([name, hint]) => (
          <div key={name} className="flex flex-col gap-1">
            <Label htmlFor={fieldId(name)}>{LABELS[name]}</Label>
            <p id={`${fieldId(name)}-hint`} className="text-sm text-muted-foreground">
              {hint}
            </p>
            <textarea
              id={fieldId(name)}
              rows={4}
              aria-required
              aria-invalid={error(name) ? true : undefined}
              aria-describedby={describedBy(name, true)}
              className={inputClasses}
              {...form.register(name)}
            />
            {errorText(name)}
          </div>
        ))}

        <div className="flex flex-col gap-1 sm:max-w-xs">
          <Label htmlFor={fieldId('delay')}>{LABELS.delay}</Label>
          <p id={`${fieldId('delay')}-hint`} className="text-sm text-muted-foreground">
            Entre 8 et 60 jours.
          </p>
          <input
            id={fieldId('delay')}
            inputMode="numeric"
            aria-required
            aria-invalid={error('delay') ? true : undefined}
            aria-describedby={describedBy('delay', true)}
            className={inputClasses}
            {...form.register('delay')}
          />
          {errorText('delay')}
        </div>

        <div className="flex items-start gap-3">
          <Controller
            control={form.control}
            name="proposeConciliation"
            render={({ field }) => (
              <Checkbox
                id={fieldId('proposeConciliation')}
                checked={field.value}
                onCheckedChange={(on) => field.onChange(on === true)}
                aria-describedby={`${fieldId('proposeConciliation')}-hint`}
                className="mt-1"
              />
            )}
          />
          <div>
            <Label htmlFor={fieldId('proposeConciliation')} className="text-base">
              {LABELS.proposeConciliation}
            </Label>
            <p
              id={`${fieldId('proposeConciliation')}-hint`}
              className="text-sm text-muted-foreground"
            >
              Gratuit, et utile pour prouver votre tentative amiable.
            </p>
          </div>
        </div>

        <Button type="submit" className="self-start">
          Écrire mon courrier
        </Button>
      </form>

      {letter && (
        <section aria-labelledby={`${id}-letter`} className="flex flex-col gap-4">
          <h3
            id={`${id}-letter`}
            ref={result}
            tabIndex={-1}
            className="text-xl font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Votre courrier
          </h3>
          <div
            data-testid="letter"
            data-print-area
            className="rounded-lg border-2 bg-card p-6 font-serif leading-relaxed whitespace-pre-line shadow-sm"
          >
            {letter}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={copy}>
              <CopyIcon aria-hidden />
              Copier le courrier
            </Button>
            <Button type="button" variant="outline" onClick={printLetter}>
              <PrinterIcon aria-hidden />
              Imprimer le courrier
            </Button>
          </div>
          <p aria-live="polite" className="text-sm font-medium">
            {copied ? 'Courrier copié : vous pouvez le coller dans un e-mail ou un document.' : ''}
          </p>
          <p className="text-sm text-muted-foreground">
            Envoyez-le de préférence en recommandé avec accusé de réception, et gardez-en une copie
            : c’est la preuve de votre démarche amiable.
          </p>
        </section>
      )}
    </div>
  )
}
