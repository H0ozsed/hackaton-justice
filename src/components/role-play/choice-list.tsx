import { ChevronRight } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'

import type { Choice } from '@/shared/role-play'

/** Pokémon-style menu of choices: real buttons in a named group, the first one focused. */
export function ChoiceList({
  choices,
  onChoose,
}: {
  choices: readonly Choice[]
  onChoose: (choiceId: string) => void
}) {
  const labelId = useId()
  const first = useRef<HTMLButtonElement>(null)

  useEffect(() => first.current?.focus(), [])

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      className="rounded-lg border-4 border-double border-foreground bg-background p-4"
    >
      <p id={labelId} className="mb-3 font-bold">
        Que faites-vous ?
      </p>
      <ul className="flex flex-col gap-2">
        {choices.map((choice, i) => (
          <li key={choice.id}>
            <button
              ref={i === 0 ? first : undefined}
              type="button"
              onClick={() => onChoose(choice.id)}
              className="group flex w-full items-start gap-2 rounded-md border-2 border-transparent p-2 text-left hover:border-primary hover:bg-accent focus-visible:border-primary focus-visible:bg-accent focus-visible:outline-none"
            >
              <ChevronRight
                aria-hidden
                className="mt-0.5 size-5 shrink-0 text-primary opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
              />
              <span>{choice.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
