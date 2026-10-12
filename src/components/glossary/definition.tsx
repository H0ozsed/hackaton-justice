import type { ReactNode } from 'react'

import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '@/components/ui/popover'
import { findGlossaryTermByText, glossary } from '@/shared/glossary'

type DefinitionProps = {
  /** Text shown in the sentence. Defaults to the glossary term (or `term`). */
  children?: ReactNode
} & (
  | {
      /** Glossary slug (preferred: stable when the wording changes). */
      slug: string
      term?: never
    }
  | {
      /** Term as written, matched against the glossary terms and their aliases. */
      term: string
      slug?: never
    }
)

/**
 * A difficult term: a button in the text that opens its glossary definition in a popover.
 * Works with the mouse, the keyboard (Enter/Space to open, Escape to close) and screen
 * readers. Never hover-only.
 */
export function Definition({ slug, term, children }: DefinitionProps) {
  const entry = slug !== undefined ? glossary.find(slug) : findGlossaryTermByText(term)
  // `term` is kept as written: it may be an alias that fits the sentence ("médiatrice").
  const label = children ?? term ?? entry?.term ?? slug

  if (!entry) {
    const missing = slug !== undefined ? `slug "${slug}"` : `term "${term}"`
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`<Definition>: ${missing} is not in the glossary (src/shared/glossary)`)
    }
    return <>{label}</>
  }

  return (
    <Popover>
      <PopoverTrigger className="cursor-help rounded-sm font-medium text-primary underline decoration-dotted underline-offset-4 hover:decoration-solid focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
        {label}
        <span className="sr-only"> (voir la définition)</span>
      </PopoverTrigger>
      <PopoverContent aria-label={`Définition : ${entry.term}`} className="text-left">
        <PopoverTitle className="font-bold">{entry.term}</PopoverTitle>
        <p>{entry.definition}</p>
      </PopoverContent>
    </Popover>
  )
}
