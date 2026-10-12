import { CircleAlertIcon } from 'lucide-react'
import { useFormContext } from 'react-hook-form'

import { cn } from '@/lib/utils'

// Native HTML form fields for the simulation steps.
// - Label bound to the field (`for`/`id`) and placed above it (RGAA 11.1, 11.4).
// - Radio buttons grouped in a fieldset with a legend (RGAA 11.5, 11.6).
// - Required fields: `aria-required` (the "all fields are required" notice is rendered by the
//   step, RGAA 11.10.1); `noValidate` on the form lets zod handle the errors.
// - Error: visible message starting with "Erreur", bound to the field by `aria-describedby`,
//   `aria-invalid` on the field (RGAA 11.10); never conveyed by colour alone (RGAA 3.1).

/** Id of the field (or group): the step is alone on screen, so the name is unique enough. */
export function fieldId(name: string) {
  return `field-${name}`
}

function useFieldError(name: string): string | undefined {
  const {
    formState: { errors },
  } = useFormContext()
  const message = errors[name]?.message
  return typeof message === 'string' ? message : undefined
}

function describedBy(...ids: (string | false | undefined)[]) {
  return ids.filter(Boolean).join(' ') || undefined
}

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} className="flex items-start gap-2 text-sm font-medium text-destructive">
      <CircleAlertIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
      <span>
        <span className="font-bold">Erreur :</span> {message}
      </span>
    </p>
  )
}

const inputClasses =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-base focus-visible:border-ring aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20'

export function TextField({
  name,
  label,
  hint,
  autoComplete,
}: {
  name: string
  label: string
  hint?: string
  autoComplete?: string
}) {
  const { register } = useFormContext()
  const error = useFieldError(name)
  const id = fieldId(name)
  const hintId = `${id}-hint`
  const errorId = `${id}-error`

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block font-medium">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && <FieldError id={errorId} message={error} />}
      <input
        id={id}
        type="text"
        autoComplete={autoComplete}
        aria-required="true"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint && hintId, error && errorId)}
        className={inputClasses}
        {...register(name)}
      />
    </div>
  )
}

export type RadioOption = { value: string; label: string }

export function RadioGroupField({
  name,
  legend,
  hint,
  options,
}: {
  name: string
  legend: string
  hint?: string
  options: RadioOption[]
}) {
  const { register } = useFormContext()
  const error = useFieldError(name)
  const id = fieldId(name)
  const hintId = `${id}-hint`
  const errorId = `${id}-error`

  return (
    <fieldset
      id={id}
      role="radiogroup"
      aria-required="true"
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(hint && hintId, error && errorId)}
      className="space-y-3"
    >
      <legend className="mb-2 font-medium">{legend}</legend>
      {hint && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && <FieldError id={errorId} message={error} />}
      <div className="space-y-2">
        {options.map((option) => {
          const optionId = `${id}-${option.value}`
          return (
            <div
              key={option.value}
              className={cn(
                'flex items-center gap-3 rounded-md border px-3 has-checked:border-primary has-checked:bg-secondary',
                error && 'border-destructive',
              )}
            >
              <input
                id={optionId}
                type="radio"
                value={option.value}
                className="size-5 shrink-0 accent-primary"
                {...register(name)}
              />
              <label htmlFor={optionId} className="flex-1 cursor-pointer py-3">
                {option.label}
              </label>
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}
