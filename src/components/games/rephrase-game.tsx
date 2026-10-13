import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useId, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { characterSprite } from '@/components/role-play/pixel/characters'
import { LocationBackdrop } from '@/components/role-play/pixel/locations'
import { PixelSprite } from '@/components/role-play/pixel/pixel-sprite'
import { StageFrame } from '@/components/role-play/pixel/stage'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  nextTension,
  REPLY_KIND_LABELS,
  TENSION_MAX,
  TENSION_START,
  type RephraseRound,
  type ReplyKind,
} from '@/shared/games'
import type { Emotion } from '@/shared/role-play'

// "Désamorcer" (night work #80): for each everyday situation, pick the reply that says the
// same thing without attacking. The tension of the conversation goes down with non-violent
// replies and up with judgements, threats and avoidance. No time limit (RGAA 13.1); the
// scene is decorative, everything is said in text; feedback and results take the focus.

const REACTIONS: Record<ReplyKind, { text: string; emotion: Emotion }> = {
  nvc: { text: '« Ah… je ne m’en rendais pas compte. D’accord, on en parle. »', emotion: 'happy' },
  judgement: { text: '« Pardon ? Vous vous prenez pour qui ? »', emotion: 'angry' },
  threat: {
    text: '« Très bien. Faites ce que vous voulez, moi je ne bouge pas. »',
    emotion: 'angry',
  },
  avoidance: { text: 'Rien ne change. La gêne continue…', emotion: 'neutral' },
}

const answerSchema = z.object({
  reply: z
    .string({ error: 'Erreur : choisissez une réponse.' })
    .min(1, 'Erreur : choisissez une réponse.'),
})

type Answer = { round: RephraseRound; kind: ReplyKind }

export function RephraseGame({ rounds }: { rounds: readonly RephraseRound[] }) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [run, setRun] = useState(0)
  const tension = answers.reduce((t, a) => nextTension(t, a.kind), TENSION_START)
  const finished = answers.length === rounds.length && index === rounds.length

  const restart = () => {
    setIndex(0)
    setAnswers([])
    setRun((r) => r + 1)
  }

  return (
    <div className="mt-8 flex max-w-3xl flex-col gap-4">
      <TensionMeter tension={tension} />
      {finished ? (
        <Results answers={answers} tension={tension} onRestart={restart} />
      ) : (
        <Round
          key={`${run}-${index}`}
          round={rounds[index]!}
          number={index + 1}
          total={rounds.length}
          onAnswer={(kind) => setAnswers((a) => [...a, { round: rounds[index]!, kind }])}
          onNext={() => setIndex((i) => i + 1)}
          last={index === rounds.length - 1}
        />
      )}
    </div>
  )
}

/** Tension in text (read by screen readers) and as a bar (decorative). */
function TensionMeter({ tension }: { tension: number }) {
  const high = tension >= 7
  return (
    <div className="rounded-lg bg-[#1e1f33] px-4 py-3 text-white">
      <p className="flex justify-between gap-4 font-bold">
        <span>Tension de la discussion</span>
        <span aria-live="polite">
          {tension} sur {TENSION_MAX}
          {high && ' : ça va exploser'}
        </span>
      </p>
      <span aria-hidden className="mt-2 flex gap-px">
        {Array.from({ length: TENSION_MAX }, (_, i) => (
          <span
            key={i}
            className={`h-2 flex-1 transition-colors duration-500 motion-reduce:transition-none ${
              i < tension ? (high ? 'bg-[#e1000f]' : 'bg-[#ff9940]') : 'bg-[#484d7a]'
            }`}
          />
        ))}
      </span>
    </div>
  )
}

function Round({
  round,
  number,
  total,
  last,
  onAnswer,
  onNext,
}: {
  round: RephraseRound
  number: number
  total: number
  last: boolean
  onAnswer: (kind: ReplyKind) => void
  onNext: () => void
}) {
  const id = useId()
  const heading = useRef<HTMLHeadingElement>(null)
  const feedback = useRef<HTMLHeadingElement>(null)
  const [chosen, setChosen] = useState<ReplyKind>()
  const form = useForm<z.input<typeof answerSchema>>({ resolver: zodResolver(answerSchema) })
  const error = form.formState.errors.reply?.message

  useEffect(() => {
    if (number > 1) heading.current?.focus()
  }, [number])
  useEffect(() => {
    if (chosen) feedback.current?.focus()
  }, [chosen])

  const submit = form.handleSubmit(({ reply }) => {
    const kind = round.replies.find((r) => r.id === reply)!.kind
    setChosen(kind)
    onAnswer(kind)
  })

  const best = round.replies.find((r) => r.kind === 'nvc')!
  const reaction = chosen ? REACTIONS[chosen] : undefined

  return (
    <section aria-labelledby={`${id}-title`} className="flex flex-col gap-4">
      <h2
        id={`${id}-title`}
        ref={heading}
        tabIndex={-1}
        className="text-xl font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Situation {number} sur {total}
      </h2>
      <p>{round.situation}</p>

      <div className="overflow-hidden rounded-lg border-4 border-[#1e1f33]">
        <StageFrame
          testId="rephrase-stage"
          art={
            <>
              <LocationBackdrop location={round.location} period="day" />
              <PixelSprite
                sprite={characterSprite('player', {
                  emotion: chosen === 'nvc' ? 'happy' : chosen ? 'neutral' : 'angry',
                })}
                x={40}
                y={65}
              />
              <PixelSprite
                sprite={characterSprite(round.other, { emotion: reaction?.emotion ?? 'neutral' })}
                x={134}
                y={65}
                flip
              />
            </>
          }
          overlay={
            <div className="max-w-[92%] self-start border-[3px] border-[#1e1f33] bg-[#fff3d0] px-3 py-2 text-sm text-black shadow-[3px_3px_0_0_#1e1f33] sm:max-w-[75%] sm:text-base">
              {reaction ? (
                <>
                  <p className="font-bold text-primary">Sa réaction</p>
                  <p>{reaction.text}</p>
                </>
              ) : (
                <>
                  <p className="font-bold text-primary">Ce que vous avez envie de dire</p>
                  <p>« {round.impulse} »</p>
                </>
              )}
            </div>
          }
        />
      </div>

      {!chosen ? (
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <fieldset aria-describedby={error ? `${id}-error` : undefined}>
            <legend className="mb-3 font-bold">Que dites-vous plutôt ?</legend>
            {error && (
              <p id={`${id}-error`} className="mb-3 font-medium text-destructive">
                {error}
              </p>
            )}
            <Controller
              control={form.control}
              name="reply"
              render={({ field }) => (
                <RadioGroup
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                  aria-invalid={error ? true : undefined}
                  className="gap-3"
                >
                  {round.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start gap-3 rounded-md border-2 p-3">
                      <RadioGroupItem id={`${id}-${reply.id}`} value={reply.id} className="mt-1" />
                      <Label htmlFor={`${id}-${reply.id}`} className="text-base font-normal">
                        « {reply.text} »
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
          </fieldset>
          <Button type="submit" className="self-start">
            Valider
          </Button>
        </form>
      ) : (
        <div className="flex flex-col gap-3 rounded-lg border-4 border-double border-primary p-4">
          <h3
            ref={feedback}
            tabIndex={-1}
            className="text-lg font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {chosen === 'nvc' ? 'Bien joué : la tension baisse' : 'Aïe : la tension monte'}
          </h3>
          <p>{REPLY_KIND_LABELS[chosen]}</p>
          {chosen !== 'nvc' && (
            <p>
              <span className="font-bold">La réponse qui apaise : </span>« {best.text} »
            </p>
          )}
          <p>{round.explanation}</p>
          <Button onClick={onNext} className="self-start">
            {last ? 'Voir mon bilan' : 'Situation suivante'}
          </Button>
        </div>
      )}
    </section>
  )
}

function Results({
  answers,
  tension,
  onRestart,
}: {
  answers: Answer[]
  tension: number
  onRestart: () => void
}) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => heading.current?.focus(), [])
  const calm = answers.filter((a) => a.kind === 'nvc').length

  return (
    <section aria-labelledby="rephrase-results" className="flex flex-col gap-4">
      <h2
        id="rephrase-results"
        ref={heading}
        tabIndex={-1}
        className="text-2xl font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Votre bilan
      </h2>
      <p className="text-lg">
        <span className="text-4xl font-bold text-primary">
          {calm} sur {answers.length}
        </span>{' '}
        réponses apaisantes. Tension finale : {tension} sur {TENSION_MAX}.
      </p>
      <p>
        {calm === answers.length
          ? 'Parfait : vous savez dire les choses sans attaquer. C’est exactement l’esprit d’une conciliation ou d’une médiation.'
          : calm >= answers.length / 2
            ? 'Bonne base ! Retenez les quatre temps : un fait, ce que vous ressentez, votre besoin, une demande précise.'
            : 'Pas facile de ne pas réagir à chaud ! Retenez les quatre temps : un fait, ce que vous ressentez, votre besoin, une demande précise.'}
      </p>
      <Button onClick={onRestart} variant="outline" className="self-start">
        Rejouer
      </Button>
    </section>
  )
}
