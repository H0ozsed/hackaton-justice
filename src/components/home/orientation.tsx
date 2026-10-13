import { ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'

import { journeyFor, orientation, type OrientationOption } from '@/shared/home'

// « Par où commencer ? » (#127): the only entry to the journeys on the home page. The
// visitor picks the situation that fits, and each answer is a link to its journey (one
// click). The link text names the situation, the journey and what to do there, so it is
// explicit out of context (RGAA 6.1).
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
      {/* Three blocks side by side from md, stacked on narrow screens (no horizontal scroll). */}
      <ul className="mt-6 grid gap-4 md:grid-cols-3">
        {options.map(({ slug, situation, journey: path }) => {
          const journey = journeyFor(path)
          return (
            <li key={slug} className="flex">
              <Link
                href={path}
                className="group flex w-full flex-col gap-3 rounded-lg border-2 border-border bg-card p-5 transition-colors hover:border-france-blue focus-visible:border-france-blue"
              >
                <journey.icon aria-hidden className="size-8 shrink-0 text-france-blue" />
                <span className="text-lg font-bold">{situation}</span>
                <span className="text-muted-foreground">
                  Parcours {journey.label} : {journey.description}
                </span>
                <span className="mt-auto flex items-center gap-2 font-medium text-france-blue">
                  <span className="underline underline-offset-4 group-hover:decoration-2">
                    {journey.cta}
                  </span>
                  <ArrowRightIcon aria-hidden className="size-5 shrink-0" />
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
