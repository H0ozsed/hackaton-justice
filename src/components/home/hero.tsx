import { ArrowDownIcon } from 'lucide-react'

import { about } from '@/shared/home'

// Landing banner: says what the site is for in one sentence (#104).
// Holds the only h1 of the home page (RGAA 9.1).
export function Hero() {
  return (
    <section aria-labelledby="accueil-titre" className="rounded-lg bg-france-blue-4 px-6 py-10">
      <h1 id="accueil-titre" className="max-w-3xl text-3xl font-bold text-france-blue md:text-4xl">
        Comprendre et gérer votre conflit
      </h1>
      <p className="mt-4 max-w-3xl text-lg">{about.purpose}</p>
      <p className="mt-6">
        <a
          href="#par-ou-commencer"
          className="inline-flex items-center gap-1 font-medium text-france-blue underline underline-offset-4 hover:decoration-2"
        >
          Par où commencer ?
          <ArrowDownIcon aria-hidden className="size-4" />
        </a>
      </p>
    </section>
  )
}
