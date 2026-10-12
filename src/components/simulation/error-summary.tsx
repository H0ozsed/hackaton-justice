import { useEffect, useRef } from 'react'

import { fieldId } from './form-fields'

export type ErrorItem = { name: string; message: string }

// Errors in the order of their fields on the page, whatever the order in which zod reported them
// (a rule on several fields is reported last). Fields are already in the page when the summary is
// shown; an item whose field is not found keeps its place.
function byPageOrder(a: ErrorItem, b: ErrorItem): number {
  const first = document.getElementById(fieldId(a.name))
  const second = document.getElementById(fieldId(b.name))
  if (!first || !second || first === second) return 0
  return first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
}

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
  const ordered = [...errors].sort(byPageOrder)

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      className="rounded-md border-2 border-destructive p-4 outline-none"
    >
      <h3 className="font-bold text-destructive">
        {ordered.length === 1 ? 'Une erreur à corriger' : `${ordered.length} erreurs à corriger`}
      </h3>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {ordered.map(({ name, message }) => (
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
