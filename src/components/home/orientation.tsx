import { ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'

import { journeyFor, orientation, type OrientationOption } from '@/shared/home'

// « Par où commencer ? » (#127): the visitor picks the situation that fits, and each
// answer is a link to its journey (one click). The link text names the situation and
// the destination, so it is explicit out of context (RGAA 6.1).
export function Orientation({
  options = orientation.all,
}: {
  options?: readonly OrientationOption[]
}) {
  return (
    <section
      id="par-ou-commencer"
      aria-labelledby="orientation-titre"
      className="mt-12 scroll-mt-24"
    >
      <h2 id="orientation-titre" className="text-2xl font-bold">
        Par où commencer ?
      </h2>
      <p className="mt-2 text-muted-foreground">
        Choisissez la phrase qui vous correspond : nous vous indiquons le parcours adapté.
      </p>
      <ul className="mt-6 flex flex-col gap-4">
        {options.map(({ slug, situation, journey: path, hint }) => {
          const journey = journeyFor(path)
          return (
            <li key={slug}>
              <Link
                href={path}
                className="group flex items-center gap-4 rounded-lg border-2 border-border bg-card p-5 transition-colors hover:border-france-blue focus-visible:border-france-blue"
              >
                <journey.icon aria-hidden className="size-8 shrink-0 text-france-blue" />
                <span className="flex flex-col gap-1">
                  <span className="text-lg font-bold">{situation}</span>
                  <span className="text-muted-foreground">{hint}</span>
                  <span className="font-medium text-france-blue underline underline-offset-4 group-hover:decoration-2">
                    Aller au parcours {journey.label}
                  </span>
                </span>
                <ArrowRightIcon aria-hidden className="ml-auto size-5 shrink-0 text-france-blue" />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
