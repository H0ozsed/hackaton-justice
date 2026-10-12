import { ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { JOURNEYS } from '@/lib/site'

// One card per journey. The link has an explicit label (RGAA 6.1) and covers the
// whole card through ::after: a click anywhere on the card works, without nesting
// the card content inside the link.
export function JourneyCards() {
  return (
    <section aria-labelledby="parcours-titre" className="mt-12">
      <h2 id="parcours-titre" className="text-2xl font-bold">
        Choisissez votre parcours
      </h2>
      <ul className="mt-6 grid gap-6 md:grid-cols-3">
        {JOURNEYS.map(({ href, label, description, cta, icon: Icon }) => (
          <li
            key={href}
            className="relative flex flex-col gap-3 rounded-lg border-2 border-border bg-card p-6 transition-colors hover:border-france-blue"
          >
            <Icon aria-hidden className="size-8 text-france-blue" />
            <h3 className="text-xl font-bold">{label}</h3>
            <p className="text-muted-foreground">{description}</p>
            <Button
              asChild
              size="lg"
              className="mt-auto h-auto self-start py-2 whitespace-normal after:absolute after:inset-0"
            >
              <Link href={href}>
                {cta}
                <ArrowRightIcon aria-hidden />
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
}
