import { ExternalLinkIcon } from 'lucide-react'
import Link from 'next/link'

import { isExternalLink, practicalInfo, type PracticalInfo } from '@/shared/practical-info'

// "Practical info" block, used on / and /apprendre. Its heading level follows the page outline
// (h2 under the h1 by default, h3 inside a step of /apprendre), entries one level below (RGAA 9.1).
export function PracticalInfoSection({
  entries = practicalInfo.all,
  headingLevel = 2,
  className = 'mt-12',
}: {
  entries?: readonly PracticalInfo[]
  headingLevel?: 2 | 3
  className?: string
}) {
  const Heading = `h${headingLevel}` as const
  const EntryHeading = `h${headingLevel + 1}` as 'h3' | 'h4'
  return (
    <section aria-labelledby="infos-pratiques-titre" className={className}>
      <Heading id="infos-pratiques-titre" className="text-2xl font-bold">
        Infos pratiques
      </Heading>
      <p className="mt-2 text-muted-foreground">
        Où trouver de l’aide, comment se préparer et quels délais respecter.
      </p>
      <ul className="mt-6 grid gap-6 md:grid-cols-2">
        {entries.map(({ slug, title, body, links }) => (
          <li key={slug} className="min-w-0 rounded-lg border-2 border-border bg-card p-6">
            <EntryHeading className="text-xl font-bold">{title}</EntryHeading>
            <p className="mt-2 whitespace-pre-line">{body}</p>
            {links.length > 0 && (
              <ul className="mt-4 flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <InfoLink {...link} />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

// Inline (not inline-flex): a long label wraps like text instead of pushing the icon out of
// narrow cards (320 px, text at 200 %).
const linkClassName =
  'font-medium break-words text-france-blue underline underline-offset-4 hover:decoration-2'

function InfoLink({ label, href }: { label: string; href: string }) {
  if (!isExternalLink(href)) {
    return (
      <Link href={href} className={linkClassName}>
        {label}
      </Link>
    )
  }

  // External site in a new window: said in the link text for screen readers
  // and shown by the icon (RGAA 13.2).
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClassName}>
      {label}
      <span className="sr-only"> (nouvelle fenêtre)</span>
      <ExternalLinkIcon aria-hidden className="ml-1 inline size-4 align-[-0.125em]" />
    </a>
  )
}
