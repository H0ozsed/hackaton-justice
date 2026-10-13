import Link from 'next/link'

import { IrisWidget } from '@/components/chatbot/iris-widget'
import { AboutSection } from '@/components/home/about-section'
import { AmicableExplainer } from '@/components/home/amicable-explainer'
import { Hero } from '@/components/home/hero'
import { Orientation } from '@/components/home/orientation'
import { PageTitle } from '@/components/layout/page-title'
import { about } from '@/shared/home'

const linkClassName = 'text-primary underline underline-offset-4'

// Home page (docs/PARCOURS_UTILISATEURS.md): explain first, then orient (#127), with the
// IRIS chatbot. « Par où commencer ? » is the entry to the 3 journeys. The FAQ and the
// practical info live on /apprendre only (coherence review of 13 Oct 2026): the home page
// links to them instead of repeating them.
export default function HomePage() {
  return (
    <>
      <PageTitle description={about.purpose} />
      <Hero />
      <AmicableExplainer />
      <Orientation />
      <AboutSection />
      <section aria-labelledby="questions-titre" className="mt-12">
        <h2 id="questions-titre" className="text-2xl font-bold">
          Une question ?
        </h2>
        <p className="mt-2 text-muted-foreground">
          Les réponses aux questions fréquentes, les infos pratiques et les mots du droit sont
          réunis dans Apprendre. Vous pouvez aussi demander à IRIS.
        </p>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          <li>
            <Link href="/apprendre#questions-frequentes" className={linkClassName}>
              Questions fréquentes
            </Link>
          </li>
          <li>
            <Link href="/apprendre#infos-pratiques" className={linkClassName}>
              Infos pratiques
            </Link>
          </li>
          <li>
            <Link href="/apprendre/lexique" className={linkClassName}>
              Lexique
            </Link>
          </li>
        </ul>
      </section>
      <IrisWidget />
    </>
  )
}
