import { SearchIcon } from 'lucide-react'
import { useId, useState } from 'react'

import { cn } from '@/lib/utils'
import {
  glossary,
  groupGlossaryByLetter,
  searchGlossary,
  type GlossaryTerm,
} from '@/shared/glossary'

// Glossary page content (#22): search, letter index, terms grouped by letter.
// Each term has an anchor equal to its slug: /apprendre/lexique#mediation.
// Accessibility (RGAA): labelled search field (11.1), result count announced in a
// status region (7.5), definition list markup (9.3), letter headings (9.1).
// User-facing text is French (site content).

type GlossaryListProps = {
  /** Terms to list; the whole glossary by default (tests pass their own). */
  terms?: readonly GlossaryTerm[]
  /** Level of the letter headings (the page h1 is above). */
  headingLevel?: 2 | 3 | 4
  className?: string
}

export function GlossaryList({
  terms: allTerms = glossary.all,
  headingLevel = 2,
  className,
}: GlossaryListProps) {
  const [query, setQuery] = useState('')
  const searchId = useId()
  const results = searchGlossary(query, allTerms)
  const nameOf = (slug: string) => allTerms.find((t) => t.slug === slug)?.term ?? slug
  const groups = groupGlossaryByLetter(results)
  const LetterHeading = `h${headingLevel}` as const

  const count =
    results.length === 0
      ? `Aucun terme ne correspond à « ${query.trim()} ».`
      : `${results.length} terme${results.length > 1 ? 's' : ''}`

  return (
    <div className={cn('space-y-8', className)}>
      <div className="space-y-2">
        <label htmlFor={searchId} className="block font-medium">
          Rechercher un terme
        </label>
        <div className="relative max-w-md">
          <SearchIcon
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
            className="h-10 w-full rounded-md border border-input bg-background pr-3 pl-9 text-base focus-visible:border-ring"
          />
        </div>
        {/* Read out by screen readers each time the results change. */}
        <p role="status" className="text-sm text-muted-foreground">
          {count}
        </p>
      </div>

      {groups.length > 0 && (
        <nav aria-label="Index alphabétique">
          <ul className="flex flex-wrap gap-2">
            {groups.map(({ letter }) => (
              <li key={letter}>
                <a
                  href={`#lettre-${letter === '#' ? 'autres' : letter}`}
                  className="inline-flex size-9 items-center justify-center rounded-md border font-semibold hover:bg-accent hover:text-accent-foreground"
                >
                  {letter}
                  {letter === '#' && <span className="sr-only"> (autres)</span>}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {groups.map(({ letter, terms }) => (
        <section key={letter} aria-labelledby={`lettre-${letter === '#' ? 'autres' : letter}`}>
          <LetterHeading
            id={`lettre-${letter === '#' ? 'autres' : letter}`}
            className="mb-4 border-b-2 border-france-blue pb-1 text-2xl font-bold"
          >
            {letter === '#' ? 'Autres' : letter}
          </LetterHeading>
          <dl className="space-y-6">
            {terms.map((term) => (
              <div key={term.slug} className="space-y-1">
                {/* scroll-mt: the anchor target is not hidden under the top of the page. */}
                <dt id={term.slug} className="scroll-mt-4 text-lg font-semibold">
                  {term.term}
                </dt>
                <dd>{term.definition}</dd>
                {term.aliases.length > 0 && (
                  <dd className="text-sm text-muted-foreground">
                    Aussi : {term.aliases.join(', ')}
                  </dd>
                )}
                {term.related.length > 0 && (
                  <dd className="text-sm">
                    Voir aussi :{' '}
                    {term.related.map((slug, i) => (
                      <span key={slug}>
                        {i > 0 && ', '}
                        <a href={`#${slug}`} className="text-primary underline underline-offset-4">
                          {nameOf(slug)}
                        </a>
                      </span>
                    ))}
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}
