import Link from 'next/link'

import { KeyFigures } from '@/components/amicable/key-figures'

// Home page block (night work #80): sourced figures about conciliation and the mandatory
// amicable attempt, leading to /demarches.
export function AmicableTeaser() {
  return (
    <section aria-labelledby="amiable-titre" className="mt-12">
      <h2 id="amiable-titre" className="text-2xl font-bold">
        Avant le juge, l’amiable
      </h2>
      <p className="mt-4 mb-6 max-w-3xl">
        Pour une somme de 5 000 € ou moins, ou un trouble de voisinage, la loi impose de tenter une
        solution amiable avant de saisir le juge. Bonne nouvelle : c’est souvent gratuit, et une
        fois sur deux, on trouve un accord.
      </p>
      <KeyFigures />
      <p className="mt-6">
        <Link href="/demarches" className="font-medium text-primary underline underline-offset-4">
          Voir comment régler un litige à l’amiable
        </Link>
      </p>
    </section>
  )
}
