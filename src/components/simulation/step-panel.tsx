import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'

import { Button } from '@/components/ui/button'

import { getPreviousAnswers, resolveFlow } from './engine'
import { ErrorSummary } from './error-summary'
import { StepProgress } from './step-progress'
import type { SimulationAnswers, SimulationStep, StepValues } from './types'

// One step = one react-hook-form form whose zod schema validates before moving on.
// The panel is recreated on every step change (`key` in the parent): the form therefore starts
// again from `defaultValues` (the answer already given, or the draft), which keeps the input
// when going back.
export function StepPanel({
  step,
  steps,
  answers,
  defaultValues,
  focusHeading,
  onSubmit,
  onBack,
}: {
  step: SimulationStep
  steps: SimulationStep[]
  answers: SimulationAnswers
  defaultValues?: StepValues
  /** Moves the focus to the title when displayed (never on the very first page load). */
  focusHeading: boolean
  onSubmit: (values: StepValues) => void
  onBack: (draft: StepValues) => void
}) {
  // Earlier answers the step may depend on (its schema can be a function of them).
  const previous = getPreviousAnswers(steps, answers, step.id)
  const schema = typeof step.schema === 'function' ? step.schema(previous) : step.schema

  const form = useForm<StepValues>({
    resolver: zodResolver(schema),
    defaultValues,
    // Focus is handled here: on the error summary, not directly on the first field.
    shouldFocusError: false,
  })
  const {
    control,
    handleSubmit,
    getValues,
    setFocus,
    formState: { errors },
  } = form

  // Live progress: the active steps are recomputed with the input in progress.
  const live = useWatch({ control })
  const { active } = resolveFlow(steps, { ...answers, [step.id]: live })
  const index = active.findIndex((s) => s.id === step.id)
  const total = active.length
  const isFirst = index <= 0
  const isLast = index === total - 1

  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (focusHeading) headingRef.current?.focus()
  }, [focusHeading])

  // Number of refused submits: the summary is recreated (`key`) on each one to take the focus.
  const [invalidSubmits, setInvalidSubmits] = useState(0)

  const errorItems = Object.entries(errors).flatMap(([name, error]) =>
    typeof error?.message === 'string' ? [{ name, message: error.message }] : [],
  )
  const Fields = step.Fields

  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit, () => setInvalidSubmits((count) => count + 1))}
        className="space-y-6"
      >
        <StepProgress position={index + 1} total={total} />

        <div className="space-y-2">
          <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold outline-none">
            <span className="sr-only">
              Étape {index + 1} sur {total} :{' '}
            </span>
            {step.title}
          </h2>
          {step.description && <p className="text-muted-foreground">{step.description}</p>}
        </div>

        {invalidSubmits > 0 && errorItems.length > 0 && (
          <ErrorSummary
            key={invalidSubmits}
            errors={errorItems}
            onSelect={(name) => setFocus(name)}
          />
        )}

        <p className="text-sm text-muted-foreground">Tous les champs sont obligatoires.</p>

        <Fields answers={previous} />

        <div className="flex justify-between gap-3">
          {isFirst ? (
            <span />
          ) : (
            <Button type="button" variant="outline" size="lg" onClick={() => onBack(getValues())}>
              Précédent
            </Button>
          )}
          <Button type="submit" size="lg">
            {isLast ? 'Terminer' : 'Suivant'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
