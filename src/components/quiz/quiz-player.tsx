import { zodResolver } from '@hookform/resolvers/zod'
import { CheckIcon, CircleAlertIcon, XIcon } from 'lucide-react'
import { Fragment, useEffect, useId, useReducer, useRef, useState, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Definition } from '@/components/glossary/definition'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { isMultipleAnswer, type Quiz, type QuizQuestion } from '@/shared/quiz'

import {
  initialQuizState,
  quizReducer,
  quizScore,
  type QuestionResult,
  type QuizAction,
} from './quiz-state'

// Quiz player (#21). The page picks the quiz: <QuizPlayer quiz={quizzes.get('bases')} />.
// Logic lives in quiz-state.ts; this file is the UI. Accessibility (RGAA):
// - each question is a fieldset whose legend is the prompt (11.5, 11.6)
// - radios for one right answer, checkboxes (+ visible hint) for several
// - error message starting with "Erreur", bound with aria-describedby (11.10)
// - feedback and score take the focus so they are read out (7.5)
// - right / wrong answers shown with text and icon, never colour alone (3.1)
// User-facing text is French (site content).

type SectionHeadingLevel = 2 | 3 | 4 | 5

type QuizPlayerProps = {
  quiz: Quiz
  /** Level of the quiz title; feedback and score headings are one level below. */
  headingLevel?: SectionHeadingLevel
  className?: string
}

export function QuizPlayer({ quiz, headingLevel = 2, className }: QuizPlayerProps) {
  const titleId = useId()
  const [state, dispatch] = useReducer(
    (current: typeof initialQuizState, action: QuizAction) => quizReducer(quiz, current, action),
    initialQuizState,
  )
  // Focus is only moved after a user action, never on page load.
  const [interacted, setInteracted] = useState(false)
  // Incremented on restart: gives the question forms a fresh key (empty answers).
  const [round, setRound] = useState(0)
  const act = (action: QuizAction) => {
    setInteracted(true)
    if (action.type === 'restart') setRound((r) => r + 1)
    dispatch(action)
  }

  const Title = `h${headingLevel}` as const
  const subLevel = (headingLevel + 1) as 3 | 4 | 5 | 6

  return (
    <section aria-labelledby={titleId} className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <Title id={titleId} className="text-2xl font-bold">
          {quiz.title}
        </Title>
        {quiz.description && <p className="text-muted-foreground">{quiz.description}</p>}
      </div>

      {state.status === 'finished' ? (
        <QuizResults
          quiz={quiz}
          results={state.results}
          headingLevel={subLevel}
          onRestart={() => act({ type: 'restart' })}
        />
      ) : (
        <QuestionStep
          // One key per question and per round: a new question (or a restart) resets the form,
          // answering does not (the feedback keeps the focus).
          key={`${round}-${state.index}`}
          question={quiz.questions[state.index]!}
          index={state.index}
          total={quiz.questions.length}
          result={state.status === 'feedback' ? state.results.at(-1) : undefined}
          headingLevel={subLevel}
          focusOnMount={interacted}
          onAnswer={(selectedIds) => act({ type: 'answer', selectedIds })}
          onNext={() => act({ type: 'next' })}
        />
      )}
    </section>
  )
}

// ---- One question ------------------------------------------------------------

// One schema shape for both modes (react-hook-form needs a single value type): a string for
// radios, an array for checkboxes; empty means "no answer".
function answerSchema(multiple: boolean) {
  const message = multiple ? 'Choisissez au moins une réponse.' : 'Choisissez une réponse.'
  return z.object({
    answer: z
      .union([z.string(), z.array(z.string())], { error: message })
      .refine((value) => value.length > 0, message),
  })
}

type AnswerValues = { answer: string | string[] }

function QuestionStep({
  question,
  index,
  total,
  result,
  headingLevel,
  focusOnMount,
  onAnswer,
  onNext,
}: {
  question: QuizQuestion
  index: number
  total: number
  /** Present once the question is answered: the feedback is shown. */
  result: QuestionResult | undefined
  headingLevel: 3 | 4 | 5 | 6
  focusOnMount: boolean
  onAnswer: (selectedIds: string[]) => void
  onNext: () => void
}) {
  const multiple = isMultipleAnswer(question)
  const answered = result !== undefined
  const baseId = useId()
  const legendId = `${baseId}-legend`
  const hintId = `${baseId}-hint`
  const errorId = `${baseId}-error`
  const legendRef = useRef<HTMLLegendElement>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AnswerValues>({
    resolver: zodResolver(answerSchema(multiple)),
    defaultValues: { answer: multiple ? [] : '' },
  })
  const error = errors.answer?.message

  // Only when the question appears (next question, restart): later prop changes must not
  // take the focus away from the feedback.
  const focusOnMountRef = useRef(focusOnMount)
  useEffect(() => {
    if (focusOnMountRef.current) legendRef.current?.focus()
  }, [])

  const describedBy = [multiple && hintId, error && errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="space-y-6">
      <form
        noValidate
        onSubmit={handleSubmit(({ answer }) => onAnswer(Array.isArray(answer) ? answer : [answer]))}
        className="space-y-4"
      >
        <p className="text-sm font-medium text-muted-foreground">
          Question {index + 1} sur {total}
        </p>
        <fieldset aria-describedby={describedBy} className="space-y-4">
          <legend
            id={legendId}
            ref={legendRef}
            tabIndex={-1}
            className="text-lg font-semibold outline-none"
          >
            {question.prompt}
          </legend>
          {multiple && (
            <p id={hintId} className="text-sm text-muted-foreground">
              Plusieurs réponses possibles.
            </p>
          )}
          {error && (
            <p id={errorId} className="flex items-start gap-2 text-sm font-medium text-destructive">
              <CircleAlertIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
              <span>
                <span className="font-bold">Erreur :</span> {error}
              </span>
            </p>
          )}

          <Controller
            control={control}
            name="answer"
            render={({ field }) =>
              multiple ? (
                <div className="grid gap-3">
                  {question.choices.map((choice) => {
                    const id = `${baseId}-${choice.id}`
                    const values = Array.isArray(field.value) ? field.value : []
                    return (
                      <ChoiceRow
                        key={choice.id}
                        choiceId={choice.id}
                        question={question}
                        result={result}
                      >
                        <Checkbox
                          id={id}
                          disabled={answered}
                          aria-invalid={error ? true : undefined}
                          checked={values.includes(choice.id)}
                          onCheckedChange={(checked) =>
                            field.onChange(
                              checked
                                ? [...values, choice.id]
                                : values.filter((value) => value !== choice.id),
                            )
                          }
                        />
                        <ChoiceLabel htmlFor={id}>{choice.label}</ChoiceLabel>
                      </ChoiceRow>
                    )
                  })}
                </div>
              ) : (
                <RadioGroup
                  aria-labelledby={legendId}
                  disabled={answered}
                  value={typeof field.value === 'string' ? field.value : ''}
                  onValueChange={field.onChange}
                  className="gap-3"
                >
                  {question.choices.map((choice) => {
                    const id = `${baseId}-${choice.id}`
                    return (
                      <ChoiceRow
                        key={choice.id}
                        choiceId={choice.id}
                        question={question}
                        result={result}
                      >
                        <RadioGroupItem
                          id={id}
                          value={choice.id}
                          aria-invalid={error ? true : undefined}
                        />
                        <ChoiceLabel htmlFor={id}>{choice.label}</ChoiceLabel>
                      </ChoiceRow>
                    )
                  })}
                </RadioGroup>
              )
            }
          />
        </fieldset>

        {!answered && <Button type="submit">Valider</Button>}
      </form>

      {answered && <Feedback question={question} result={result} headingLevel={headingLevel} />}
      {answered && (
        <Button type="button" onClick={onNext}>
          {index + 1 < total ? 'Question suivante' : 'Voir mon score'}
        </Button>
      )}
    </div>
  )
}

function ChoiceLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  // Answers stay fully readable once the question is locked (no disabled fading).
  return (
    <Label
      htmlFor={htmlFor}
      className="text-base leading-snug font-normal peer-disabled:cursor-default peer-disabled:opacity-100"
    >
      {children}
    </Label>
  )
}

/** One choice; after answering, says whether it was a right answer and/or the user's pick. */
function ChoiceRow({
  choiceId,
  question,
  result,
  children,
}: {
  choiceId: string
  question: QuizQuestion
  result: QuestionResult | undefined
  children: ReactNode
}) {
  const isRight = question.correctChoiceIds.includes(choiceId)
  const isPicked = result?.selectedIds.includes(choiceId) ?? false
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {children}
      {result && isRight && (
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
          <CheckIcon aria-hidden className="size-4" />
          Bonne réponse
        </span>
      )}
      {result && isPicked && !isRight && (
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-destructive">
          <XIcon aria-hidden className="size-4" />
          Votre réponse, incorrecte
        </span>
      )}
    </div>
  )
}

function Feedback({
  question,
  result,
  headingLevel,
}: {
  question: QuizQuestion
  result: QuestionResult
  headingLevel: 3 | 4 | 5 | 6
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.focus()
  }, [])

  const Heading = `h${headingLevel}` as const
  const rightLabels = question.choices
    .filter((choice) => question.correctChoiceIds.includes(choice.id))
    .map((choice) => choice.label)

  return (
    <div
      ref={ref}
      tabIndex={-1}
      className={cn(
        'space-y-3 rounded-md border-2 p-4 outline-none',
        result.correct ? 'border-primary' : 'border-destructive',
      )}
    >
      <Heading className="flex items-center gap-2 text-lg font-bold">
        {result.correct ? (
          <CheckIcon aria-hidden className="size-5 text-primary" />
        ) : (
          <XIcon aria-hidden className="size-5 text-destructive" />
        )}
        {result.correct ? 'Bonne réponse !' : 'Mauvaise réponse'}
      </Heading>
      {!result.correct && (
        <p>
          {rightLabels.length > 1 ? 'Les bonnes réponses : ' : 'La bonne réponse : '}
          <span className="font-semibold">{rightLabels.join(', ')}</span>
        </p>
      )}
      <p>{question.explanation}</p>
      {question.glossary.length > 0 && (
        <p>
          Pour aller plus loin :{' '}
          {question.glossary.map((slug, i) => (
            <Fragment key={slug}>
              {i > 0 && ', '}
              <Definition slug={slug} />
            </Fragment>
          ))}
        </p>
      )}
    </div>
  )
}

// ---- End of the quiz ---------------------------------------------------------

function QuizResults({
  quiz,
  results,
  headingLevel,
  onRestart,
}: {
  quiz: Quiz
  results: QuestionResult[]
  headingLevel: 3 | 4 | 5 | 6
  onRestart: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.focus()
  }, [])

  const { correct, total, percent } = quizScore(quiz, results)
  const Heading = `h${headingLevel}` as const

  return (
    <div ref={ref} tabIndex={-1} className="space-y-4 outline-none">
      <Heading className="text-xl font-bold">
        Votre score : {correct} / {total} ({percent} %)
      </Heading>
      <ol className="space-y-2">
        {quiz.questions.map((question) => {
          const ok = results.find((r) => r.questionId === question.id)?.correct ?? false
          return (
            <li key={question.id} className="flex items-start gap-2">
              {ok ? (
                <CheckIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
              ) : (
                <XIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-destructive" />
              )}
              <span>
                {question.prompt}{' '}
                <span className="font-semibold">— {ok ? 'Réussie' : 'Ratée'}</span>
              </span>
            </li>
          )
        })}
      </ol>
      <Button type="button" onClick={onRestart}>
        Recommencer
      </Button>
    </div>
  )
}
