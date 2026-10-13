import { zodResolver } from '@hookform/resolvers/zod'
import { CheckIcon, XIcon } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  ACTOR_LABELS,
  actorSchema,
  isRightSet,
  type Actor,
  type WhoStatement,
} from '@/shared/games'

// "Qui fait quoi ?" (night work #80): for each statement, tick who it is true for (the
// conciliator, the mediator, the judge; sometimes several), then check everything at once.
// One fieldset per statement (legend = the statement), an error summary when a card is left
// empty, results in text and icons (never colour alone), focus moved to the score.

const ACTORS = actorSchema.options

const MISSING = 'Erreur : cochez au moins une personne.'

function schemaFor(statements: readonly WhoStatement[]) {
  return z.object(
    Object.fromEntries(
      statements.map((s) => [s.slug, z.array(actorSchema).min(1, MISSING)]),
    ) as Record<string, z.ZodArray<typeof actorSchema>>,
  )
}

type Values = Record<string, Actor[]>

export function WhoDoesWhat({ statements }: { statements: readonly WhoStatement[] }) {
  const id = useId()
  const [checked, setChecked] = useState<Values>()
  const [run, setRun] = useState(0)
  const summary = useRef<HTMLDivElement>(null)
  const score = useRef<HTMLHeadingElement>(null)
  const form = useForm<Values>({
    resolver: zodResolver(schemaFor(statements)),
    // The focus goes to the error summary, not to the first empty card.
    shouldFocusError: false,
    defaultValues: Object.fromEntries(statements.map((s) => [s.slug, []])),
  })
  const errors = form.formState.errors
  const missing = statements.filter((s) => errors[s.slug])

  useEffect(() => {
    if (checked) score.current?.focus()
  }, [checked])

  // Each refused attempt moves the focus to the error summary (once it is rendered: the errors
  // can arrive one render after the attempt).
  const [refused, setRefused] = useState(0)
  const hasSummary = missing.length > 0
  useEffect(() => {
    if (refused > 0 && hasSummary) summary.current?.focus()
  }, [refused, hasSummary])

  const submit = form.handleSubmit(setChecked, () => setRefused((n) => n + 1))

  const restart = () => {
    form.reset()
    setChecked(undefined)
    setRun((r) => r + 1)
  }

  const right = checked ? statements.filter((s) => isRightSet(checked[s.slug] ?? [], s.actors)) : []

  return (
    <form key={run} onSubmit={submit} noValidate className="mt-8 flex max-w-4xl flex-col gap-6">
      {missing.length > 0 && !checked && (
        <div
          ref={summary}
          tabIndex={-1}
          role="alert"
          className="rounded-lg border-l-4 border-destructive bg-marianne-red-4 p-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <p className="font-bold">
            Erreur : {missing.length} carte{missing.length > 1 ? 's' : ''} sans réponse.
          </p>
          <ul className="mt-2 list-disc pl-5">
            {missing.map((s) => (
              <li key={s.slug}>
                <a href={`#${id}-${s.slug}`} className="underline underline-offset-4">
                  {s.statement}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {checked && (
        <div className="rounded-lg bg-[#1e1f33] p-4 text-white">
          <h2
            ref={score}
            tabIndex={-1}
            className="text-2xl font-bold outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Votre score : {right.length} sur {statements.length}
          </h2>
          <p className="mt-1">
            {right.length === statements.length
              ? 'Parfait : vous savez à qui vous adresser.'
              : 'Les explications sous chaque carte vous aident à retenir les différences.'}
          </p>
        </div>
      )}

      <ul className="grid gap-4 md:grid-cols-2">
        {statements.map((statement) => {
          const error = errors[statement.slug]?.message
          const result = checked
            ? isRightSet(checked[statement.slug] ?? [], statement.actors)
            : undefined
          return (
            <li key={statement.slug}>
              <fieldset
                id={`${id}-${statement.slug}`}
                aria-describedby={error ? `${id}-${statement.slug}-error` : undefined}
                className={cn(
                  'h-full rounded-lg border-4 border-[#1e1f33] bg-card p-4',
                  result === true && 'border-[#009b7e]',
                  result === false && 'border-marianne-red',
                )}
              >
                {/* float: the legend stays inside the bordered card. */}
                <legend className="float-left mb-3 w-full text-lg font-bold">
                  « {statement.statement} »
                </legend>
                {error && (
                  <p
                    id={`${id}-${statement.slug}-error`}
                    className="clear-left mb-2 font-medium text-destructive"
                  >
                    {error}
                  </p>
                )}
                <Controller
                  control={form.control}
                  name={statement.slug}
                  render={({ field }) => (
                    <div className="clear-left flex flex-col gap-2">
                      {ACTORS.map((actor) => {
                        const inputId = `${id}-${statement.slug}-${actor}`
                        const value = field.value ?? []
                        return (
                          <div key={actor} className="flex items-center gap-2">
                            <Checkbox
                              id={inputId}
                              checked={value.includes(actor)}
                              disabled={checked !== undefined}
                              onCheckedChange={(on) =>
                                field.onChange(
                                  on === true
                                    ? [...value, actor]
                                    : value.filter((a) => a !== actor),
                                )
                              }
                            />
                            <Label
                              htmlFor={inputId}
                              className="text-base font-normal peer-disabled:cursor-default peer-disabled:opacity-100"
                            >
                              {ACTOR_LABELS[actor]}
                            </Label>
                          </div>
                        )
                      })}
                    </div>
                  )}
                />
                {result !== undefined && (
                  <div className="mt-3 space-y-1 border-t pt-3">
                    <p className="flex items-center gap-2 font-bold">
                      {result ? (
                        <CheckIcon aria-hidden className="size-5 text-[#009b7e]" />
                      ) : (
                        <XIcon aria-hidden className="size-5 text-marianne-red" />
                      )}
                      {result ? 'Juste' : 'À revoir'}
                    </p>
                    {!result && (
                      <p>
                        Bonne réponse : {statement.actors.map((a) => ACTOR_LABELS[a]).join(', ')}.
                      </p>
                    )}
                    <p>{statement.explanation}</p>
                  </div>
                )}
              </fieldset>
            </li>
          )
        })}
      </ul>

      {checked ? (
        <Button type="button" variant="outline" onClick={restart} className="self-start">
          Recommencer
        </Button>
      ) : (
        <Button type="submit" className="h-auto self-start py-2 whitespace-normal">
          Vérifier mes réponses
        </Button>
      )}
    </form>
  )
}
