import { useEffect, useRef } from 'react'

import { fieldId } from './form-fields'

export type ErrorItem = { name: string; message: string }

// Summary of the step errors, shown after a refused validation. `role="alert"` makes it
// announced (RGAA 7.5.2) and it takes the focus when displayed: the parent recreates it (`key`)
// on every refused submit. Each message is a link that leads to the field concerned.
export function ErrorSummary({
  errors,
  onSelect,
}: {
  errors: ErrorItem[]
  onSelect: (name: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.focus()
  }, [])

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      className="rounded-md border-2 border-destructive p-4 outline-none"
    >
      <h3 className="font-bold text-destructive">
        {errors.length === 1 ? 'Une erreur à corriger' : `${errors.length} erreurs à corriger`}
      </h3>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {errors.map(({ name, message }) => (
          <li key={name}>
            <a
              href={`#${fieldId(name)}`}
              onClick={(event) => {
                event.preventDefault()
                onSelect(name)
              }}
              className="underline underline-offset-4"
            >
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
