import { CircleAlertIcon } from 'lucide-react'
import { useFormContext } from 'react-hook-form'

import { cn } from '@/lib/utils'

// Native HTML form fields for the simulation steps.
// - Label bound to the field (`for`/`id`) and placed above it (RGAA 11.1, 11.4).
// - Radio buttons and checkboxes grouped in a fieldset with a legend (RGAA 11.5, 11.6).
// - Required fields: `aria-required` (the notice that every field is required unless marked
//   "facultatif" is rendered by the step, RGAA 11.10.1); an optional field says "(facultatif)" in
//   its label; `noValidate` on the form lets zod handle the errors.
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

// Label or legend text, followed by "(facultatif)" for an optional field. The mention is part of
// the accessible name, so it is announced too.
function LabelText({ text, required }: { text: string; required: boolean }) {
  return (
    <>
      {text}
      {!required && <span className="font-normal text-muted-foreground"> (facultatif)</span>}
    </>
  )
}

const inputClasses =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-base focus-visible:border-ring aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20'

type FieldProps = {
  name: string
  hint?: string
  /** Defaults to true. An optional field says "(facultatif)" and is not `aria-required`. */
  required?: boolean
}

type InputFieldProps = FieldProps & { label: string }

// Text input with its label, hint and error, shared by TextField and NumberField.
function InputField({
  name,
  label,
  hint,
  required = true,
  autoComplete,
  inputMode,
}: InputFieldProps & { autoComplete?: string; inputMode?: 'decimal' }) {
  const { register } = useFormContext()
  const error = useFieldError(name)
  const id = fieldId(name)
  const hintId = `${id}-hint`
  const errorId = `${id}-error`

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block font-medium">
        <LabelText text={label} required={required} />
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
        inputMode={inputMode}
        autoComplete={autoComplete}
        aria-required={required ? 'true' : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint && hintId, error && errorId)}
        className={inputClasses}
        {...register(name)}
      />
    </div>
  )
}

export function TextField(props: InputFieldProps & { autoComplete?: string }) {
  return <InputField {...props} />
}

// Number typed by the person ("12,5" or "12.5"). A text input with a decimal keypad, not
// `type="number"` (no scroll-wheel changes, no locale surprises). The value stays raw text in the
// form: the step schema parses it (see `parseDecimal`) and gives the clear error messages.
export function NumberField(props: InputFieldProps) {
  return <InputField {...props} inputMode="decimal" autoComplete="off" />
}

export type ChoiceOption = {
  value: string
  label: string
  /** Optional explanation under the label, linked to the control with `aria-describedby`. */
  description?: string
}
export type RadioOption = ChoiceOption

type GroupFieldProps = FieldProps & {
  legend: string
  options: ChoiceOption[]
}

// Fieldset with a legend, hint and error around a list of choices (radio buttons or checkboxes).
function ChoiceGroup({
  name,
  legend,
  hint,
  options,
  required = true,
  kind,
}: GroupFieldProps & { kind: 'radio' | 'checkbox' }) {
  const { register } = useFormContext()
  const error = useFieldError(name)
  const id = fieldId(name)
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const isRadio = kind === 'radio'

  return (
    <fieldset
      id={id}
      // A radio group is a `radiogroup` (it supports aria-required and aria-invalid); a checkbox
      // group stays a plain group, and each checkbox carries `aria-invalid`.
      role={isRadio ? 'radiogroup' : undefined}
      aria-required={isRadio && required ? 'true' : undefined}
      aria-invalid={isRadio && error ? true : undefined}
      aria-describedby={describedBy(hint && hintId, error && errorId)}
      className="space-y-3"
    >
      <legend className="mb-2 font-medium">
        <LabelText text={legend} required={required} />
      </legend>
      {hint && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && <FieldError id={errorId} message={error} />}
      <div className="space-y-2">
        {options.map((option) => {
          const optionId = `${id}-${option.value}`
          const descriptionId = `${optionId}-description`
          return (
            <div
              key={option.value}
              className={cn(
                'flex items-start gap-3 rounded-md border px-3 has-checked:border-primary has-checked:bg-secondary',
                error && 'border-destructive',
              )}
            >
              <input
                id={optionId}
                type={kind}
                value={option.value}
                aria-invalid={!isRadio && error ? true : undefined}
                aria-describedby={option.description ? descriptionId : undefined}
                className="mt-2.5 size-6 shrink-0 accent-primary"
                {...register(name)}
              />
              <div className="flex-1 py-3">
                <label htmlFor={optionId} className="block cursor-pointer">
                  {option.label}
                </label>
                {option.description && (
                  <p id={descriptionId} className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}

export function RadioGroupField(props: GroupFieldProps) {
  return <ChoiceGroup {...props} kind="radio" />
}

// Several answers allowed. The form value is the list of the checked values.
export function CheckboxGroupField(props: GroupFieldProps) {
  return <ChoiceGroup {...props} kind="checkbox" />
}
