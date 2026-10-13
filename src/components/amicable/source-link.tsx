import { ExternalLinkIcon } from 'lucide-react'

import type { Source } from '@/shared/amicable'

/** Link to an official source, in a new window (said in the link text: RGAA 13.2). */
export function SourceLink({ source }: { source: Source }) {
  return (
    <a
      href={source.href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-france-blue underline underline-offset-4 hover:decoration-2"
    >
      {source.label}
      <span className="sr-only"> (nouvelle fenêtre)</span>
      <ExternalLinkIcon aria-hidden className="size-4 shrink-0" />
    </a>
  )
}
