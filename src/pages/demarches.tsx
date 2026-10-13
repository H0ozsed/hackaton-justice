import Link from 'next/link'

import { GuideList } from '@/components/amicable/guide-list'
import { KeyFigures } from '@/components/amicable/key-figures'
import { PreparationChecklist } from '@/components/amicable/preparation-checklist'
import { RoutesComparison } from '@/components/amicable/routes-comparison'
import { SourceLink } from '@/components/amicable/source-link'
import { PageTitle } from '@/components/layout/page-title'

// Practical guides to settle a dispute amicably (night work #80): figures, when the amicable
// attempt is mandatory, comparison of the routes, step-by-step guides, preparation checklist.
// Content in src/shared/amicable.

const SECTIONS = [
  { id: 'chiffres', label: 'En chiffres' },
  { id: 'obligatoire', label: 'Est-ce obligatoire ?' },
  { id: 'comparer', label: 'Comparer les solutions' },
  { id: 'pas-a-pas', label: 'Pas à pas' },
  { id: 'preparer', label: 'Préparer son rendez-vous' },
] as const

const linkClassName = 'text-primary underline underline-offset-4'

export default function ProceduresPage() {
  return (
    <>
      <PageTitle title="Démarches" />
      <h1 className="text-3xl font-bold">Régler un litige à l’amiable</h1>
      <p className="mt-4 max-w-3xl text-lg">
        Avant d’aller devant un juge, il existe des solutions plus rapides, souvent gratuites, où
        c’est vous qui décidez : la conciliation et la médiation. Voici comment elles marchent et
        comment vous y préparer.
      </p>

      <nav aria-label="Sommaire" className="mt-6">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {SECTIONS.map(({ id, label }) => (
            <li key={id}>
              <a href={`#${id}`} className={linkClassName}>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section id="chiffres" aria-labelledby="chiffres-titre" className="mt-12 scroll-mt-4">
        <h2 id="chiffres-titre" className="mb-6 text-2xl font-bold">
          En chiffres
        </h2>
        <KeyFigures />
      </section>

      <section
        id="obligatoire"
        aria-labelledby="obligatoire-titre"
        className="mt-12 max-w-3xl scroll-mt-4"
      >
        <h2 id="obligatoire-titre" className="text-2xl font-bold">
          Est-ce obligatoire ?
        </h2>
        <p className="mt-4">
          Pour certains litiges, la loi impose de tenter une solution amiable (conciliation,
          médiation ou procédure participative) avant de saisir le juge. Sinon, le juge peut
          déclarer la demande irrecevable, c’est-à-dire refuser de l’examiner (article 750-1 du code
          de procédure civile). C’est le cas :
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>des demandes en paiement de 5 000 € ou moins ;</li>
          <li>des troubles anormaux de voisinage (bruit, odeurs, plantations…) ;</li>
          <li>de certains conflits de voisinage précis (bornage, distances des plantations…).</li>
        </ul>
        <p className="mt-3">
          Des exceptions existent, par exemple en cas d’urgence ou si aucun conciliateur n’est
          disponible dans les trois mois. Dans tous les cas, gardez une preuve de votre tentative :
          courriers, convocation, attestation du conciliateur.
        </p>
        <p className="mt-3 text-sm">
          Source :{' '}
          <SourceLink
            source={{
              label: 'justice.fr : le conciliateur de justice',
              href: 'https://www.justice.fr/fiche/conciliateur-justice',
            }}
          />
        </p>
      </section>

      <section id="comparer" aria-labelledby="comparer-titre" className="mt-12 scroll-mt-4">
        <h2 id="comparer-titre" className="mb-6 text-2xl font-bold">
          Comparer les solutions
        </h2>
        <RoutesComparison />
      </section>

      <section id="pas-a-pas" aria-labelledby="pas-a-pas-titre" className="mt-12 scroll-mt-4">
        <h2 id="pas-a-pas-titre" className="mb-6 text-2xl font-bold">
          Pas à pas
        </h2>
        <GuideList />
      </section>

      <section
        id="preparer"
        aria-labelledby="preparer-titre"
        className="mt-12 max-w-3xl scroll-mt-4"
      >
        <h2 id="preparer-titre" className="text-2xl font-bold">
          Préparer son rendez-vous
        </h2>
        <p className="mt-4 mb-6">
          Une conciliation ou une médiation se prépare. Cochez ce qui est prêt : rien n’est
          enregistré.
        </p>
        <PreparationChecklist />
      </section>

      <section
        aria-labelledby="ensuite-titre"
        className="mt-12 max-w-3xl rounded-lg bg-secondary p-6"
      >
        <h2 id="ensuite-titre" className="text-2xl font-bold">
          Et maintenant ?
        </h2>
        <ul className="mt-4 space-y-2">
          <li>
            <Link href="/simulation" className={linkClassName}>
              Trouver la solution adaptée à mon litige
            </Link>
          </li>
          <li>
            <Link href="/mise-en-situation" className={linkClassName}>
              M’entraîner avec une mise en situation
            </Link>
          </li>
          <li>
            <Link href="/apprendre/lexique" className={linkClassName}>
              Comprendre les mots du droit
            </Link>
          </li>
        </ul>
      </section>
    </>
  )
}
