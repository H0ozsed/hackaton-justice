import Link from 'next/link'
import type { ReactNode } from 'react'

import { GuideList } from '@/components/amicable/guide-list'
import { KeyFigures } from '@/components/amicable/key-figures'
import { PreparationChecklist } from '@/components/amicable/preparation-checklist'
import { RoutesComparison } from '@/components/amicable/routes-comparison'
import { SourceLink } from '@/components/amicable/source-link'
import { IrisWidget } from '@/components/chatbot/iris-widget'
import { FaqSection } from '@/components/faq/faq-section'
import { PageTitle } from '@/components/layout/page-title'
import { PracticalInfoSection } from '@/components/practical-info/practical-info'
import { QuizPlayer } from '@/components/quiz/quiz-player'
import { WhoCanHelp } from '@/components/solutions/who-can-help'
import { glossary } from '@/shared/glossary'
import { quizzes } from '@/shared/quiz'

// Learning hub (docs/PARCOURS_UTILISATEURS.md): the one page that explains the amicable routes.
// It also holds what used to be /demarches (redirected here): key figures, the mandatory attempt,
// the single comparison of the routes, step-by-step guides and the preparation checklist.
// #106: a suggested path in four steps, which is also the table of contents (RGAA 12.6).
// Outline: h1 > h2 step > h3 section > h4 item. Content in src/shared (amicable, simulation…).

const linkClassName = 'text-primary underline underline-offset-4'

const STEPS = [
  {
    id: 'comprendre',
    title: 'Comprendre l’amiable',
    summary: 'Quand tenter l’amiable, et ce qui change par rapport à un procès.',
    sections: [
      { id: 'obligatoire', label: 'Faut-il tenter l’amiable avant le juge ?' },
      { id: 'comparer', label: 'Comparer les solutions' },
      { id: 'chiffres', label: 'La conciliation en chiffres' },
    ],
  },
  {
    id: 'qui-et-comment',
    title: 'Qui peut vous aider, et comment',
    summary: 'Chaque conciliateur et médiateur, ce que dit la loi, et les démarches pas à pas.',
    sections: [
      { id: 'qui-peut-vous-aider', label: 'Qui peut vous aider ?' },
      { id: 'pas-a-pas', label: 'Les démarches étape par étape' },
      { id: 'preparer', label: 'Préparer son rendez-vous' },
    ],
  },
  {
    id: 'tester',
    title: 'Tester ses connaissances',
    summary: 'Des questionnaires et des mini-jeux pour vérifier ce que vous avez retenu.',
    sections: [
      { id: 'questionnaires', label: 'Questionnaires' },
      { id: 'mini-jeux', label: 'Mini-jeux' },
    ],
  },
  {
    id: 'aller-plus-loin',
    title: 'Aller plus loin',
    summary: 'Les mots du droit, les questions fréquentes et les infos pratiques.',
    sections: [
      { id: 'lexique', label: 'Lexique' },
      { id: 'questions-frequentes', label: 'Questions fréquentes' },
      { id: 'infos-pratiques', label: 'Infos pratiques' },
      { id: 'sensibiliser', label: 'Sensibiliser en groupe' },
    ],
  },
] as const

// Mini-games, each on its own page.
const GAMES = [
  {
    href: '/apprendre/desamorcer',
    title: 'Désamorcer',
    description:
      'Huit situations du quotidien : trouvez la phrase qui dit les choses sans faire monter la tension.',
    cta: 'Jouer à Désamorcer',
  },
  {
    href: '/apprendre/qui-fait-quoi',
    title: 'Qui fait quoi ?',
    description:
      'Conciliateur, médiateur ou juge ? Dix phrases à attribuer pour savoir à qui vous adresser.',
    cta: 'Jouer à Qui fait quoi ?',
  },
] as const

/** A step of the path: numbered h2 and its one-line summary, then its sections. */
function Step({ index, children }: { index: number; children: ReactNode }) {
  const step = STEPS[index]
  return (
    <section id={step.id} aria-labelledby={`${step.id}-titre`} className="mt-16 scroll-mt-4">
      <h2 id={`${step.id}-titre`} className="text-3xl font-bold">
        {index + 1}. {step.title}
      </h2>
      <p className="mt-2 text-lg text-muted-foreground">{step.summary}</p>
      {children}
    </section>
  )
}

/** A section of a step: h3 and one intro sentence (#105). */
function Section({
  id,
  title,
  intro,
  children,
  className = 'mt-12',
}: {
  id: string
  title: string
  intro: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <section id={id} aria-labelledby={`${id}-titre`} className={`${className} scroll-mt-4`}>
      <h3 id={`${id}-titre`} className="text-2xl font-bold">
        {title}
      </h3>
      <div className="mt-2 max-w-3xl text-muted-foreground">{intro}</div>
      {children}
    </section>
  )
}

export default function LearnPage() {
  return (
    <>
      <PageTitle title="Apprendre" />
      <h1 className="text-3xl font-bold">Apprendre</h1>
      <p className="mt-4 max-w-3xl text-lg">
        Tout pour comprendre comment régler un conflit à l’amiable, sans aller directement devant un
        juge. Si c’est votre première visite, commencez par la première étape.
      </p>

      {/* The suggested path, which is also the table of contents. Numbered: it is a sequence. */}
      <nav aria-label="Par où commencer ?" className="mt-8">
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li
              key={step.id}
              className="flex flex-col gap-2 rounded-lg border-2 border-border bg-card p-5"
            >
              <a
                href={`#${step.id}`}
                className="text-lg font-bold text-france-blue underline underline-offset-4"
              >
                {index + 1}. {step.title}
              </a>
              <p className="text-muted-foreground">{step.summary}</p>
              <ul className="mt-auto flex flex-col gap-1 text-sm">
                {step.sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className={linkClassName}>
                      {section.label}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </nav>

      {/* ---- 1. Understand the amicable routes ---- */}
      <Step index={0}>
        <Section
          id="obligatoire"
          title="Faut-il tenter l’amiable avant le juge ?"
          intro="Souvent, oui : c’est la loi."
          className="mt-8"
        >
          <div className="mt-4 max-w-3xl">
            <p>
              Pour certains litiges, la loi impose de tenter une solution amiable (conciliation par
              un conciliateur de justice, médiation ou procédure participative) avant de saisir le
              juge ; une simple discussion ne suffit pas. Sinon, le juge peut déclarer la demande
              irrecevable, c’est-à-dire refuser de l’examiner (article 750-1 du code de procédure
              civile). C’est le cas :
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>des demandes en paiement de 5 000 € ou moins ;</li>
              <li>des troubles anormaux de voisinage (bruit, odeurs, plantations…) ;</li>
              <li>
                de certains conflits de voisinage précis (bornage, servitudes, distances des
                plantations, élagage).
              </li>
            </ul>
            <p className="mt-3">
              Des exceptions existent, par exemple en cas d’urgence ou si aucun conciliateur n’est
              disponible dans les trois mois. Dans tous les cas, gardez une preuve de votre
              tentative : courriers, convocation, attestation du conciliateur.
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
          </div>
        </Section>

        <Section
          id="comparer"
          title="Comparer les solutions"
          intro="De la discussion au juge : qui vous aide, ce que ça coûte, combien de temps ça prend, qui décide et ce que vaut l’issue."
        >
          <div className="mt-6">
            <RoutesComparison cardHeadingLevel={4} />
          </div>
        </Section>

        <Section
          id="chiffres"
          title="La conciliation en chiffres"
          intro="Des chiffres officiels pour savoir à quoi vous attendre."
        >
          <div className="mt-6">
            <KeyFigures />
          </div>
        </Section>
      </Step>

      {/* ---- 2. Who can help, and how ---- */}
      <Step index={1}>
        <Section
          id="qui-peut-vous-aider"
          title="Qui peut vous aider ?"
          intro="Chaque conciliateur, médiateur et autre recours, puis le juge, avec d’abord ce que dit la loi : statut, conditions (par exemple le diplôme d’État exigé du médiateur familial dans les services financés par la Caf), ce qu’ils traitent, leur coût et ce que vaut l’accord. Ouvrez celui qui vous concerne."
          className="mt-8"
        >
          <div className="mt-6 max-w-3xl">
            <WhoCanHelp headingLevel={4} />
          </div>
        </Section>

        <Section
          id="pas-a-pas"
          title="Les démarches étape par étape"
          intro="Comment saisir un conciliateur ou un médiateur, du premier contact à l’accord."
        >
          <div className="mt-6 max-w-3xl">
            <GuideList headingLevel={4} />
          </div>
        </Section>

        <Section
          id="preparer"
          title="Préparer son rendez-vous"
          intro="Une conciliation ou une médiation se prépare. Cochez ce qui est prêt : rien n’est enregistré."
        >
          <div className="mt-6 max-w-3xl">
            <PreparationChecklist />
          </div>
        </Section>
      </Step>

      {/* ---- 3. Test yourself ---- */}
      <Step index={2}>
        <Section
          id="questionnaires"
          title="Questionnaires"
          intro="Quelques questions, une réponse expliquée à chaque fois, puis votre score."
          className="mt-8"
        >
          <div className="mt-6 space-y-12">
            {quizzes.all.map((quiz) => (
              <QuizPlayer key={quiz.slug} quiz={quiz} headingLevel={4} />
            ))}
          </div>
        </Section>

        <Section
          id="mini-jeux"
          title="Mini-jeux"
          intro="Deux jeux courts, chacun sur sa page, pour vous entraîner."
        >
          <ul className="mt-6 grid gap-6 md:grid-cols-2">
            {GAMES.map((game) => (
              <li key={game.href} className="rounded-lg border-2 border-border bg-card p-6">
                <h4 className="text-xl font-bold">{game.title}</h4>
                <p className="mt-2">{game.description}</p>
                <p className="mt-4">
                  <Link href={game.href} className={linkClassName}>
                    {game.cta}
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        </Section>
      </Step>

      {/* ---- 4. Go further ---- */}
      <Step index={3}>
        <Section
          id="lexique"
          title="Lexique"
          intro={`${glossary.all.length} mots du droit expliqués simplement, avec une recherche et un index alphabétique.`}
          className="mt-8"
        >
          <p className="mt-4">
            <Link href="/apprendre/lexique" className={linkClassName}>
              Consulter le lexique
            </Link>
          </p>
        </Section>

        <div id="questions-frequentes" className="scroll-mt-4">
          <FaqSection page="learn" headingLevel={3} className="mt-12" />
        </div>

        <div id="infos-pratiques" className="scroll-mt-4">
          <PracticalInfoSection headingLevel={3} />
        </div>

        <Section
          id="sensibiliser"
          title="Sensibiliser en groupe"
          intro="Pour les écoles, les associations et les événements."
        >
          <p className="mt-4 max-w-3xl">
            Le CDAD (conseil départemental de l’accès au droit) fait connaître les solutions
            amiables là où sont les gens : dans les écoles auprès des jeunes, et lors d’événements
            pour tous les autres. Les questionnaires, les mini-jeux et les mises en situation de ce
            site se jouent aussi à plusieurs, projetés en classe ou sur un stand : chacun propose sa
            réponse, puis on en discute.
          </p>
          <p className="mt-4">
            <Link href="/mise-en-situation" className={linkClassName}>
              Choisir une mise en situation
            </Link>
          </p>
        </Section>
      </Step>

      <IrisWidget page="learn" />
    </>
  )
}
