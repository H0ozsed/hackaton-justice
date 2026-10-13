import Link from 'next/link'

import { RoutesComparison } from '@/components/amicable/routes-comparison'
import { IrisWidget } from '@/components/chatbot/iris-widget'
import { FaqSection } from '@/components/faq/faq-section'
import { PageTitle } from '@/components/layout/page-title'
import { PracticalInfoSection } from '@/components/practical-info/practical-info'
import { QuizPlayer } from '@/components/quiz/quiz-player'
import { WhoCanHelp } from '@/components/solutions/who-can-help'
import { routes } from '@/shared/amicable'
import { glossary } from '@/shared/glossary'
import { quizzes } from '@/shared/quiz'

// Learning hub (docs/PARCOURS_UTILISATEURS.md), with the IRIS chatbot.
// #106: a suggested path in three steps, so that a first-time visitor knows where to start:
// 1. understand the basics, 2. test yourself, 3. go further. The path is also the table of
// contents (long page, RGAA 12.6): each step links to its sections. The glossary has its own
// page (/apprendre/lexique, #22). Outline: h1 > h2 step > h3 section.

const linkClassName = 'text-primary underline underline-offset-4'

const STEPS = [
  {
    id: 'comprendre',
    title: 'Comprendre les bases',
    summary: 'Ce que font le conciliateur et le médiateur, et qui peut vous aider.',
    sections: [
      { id: 'conciliateur-ou-mediateur', label: 'Conciliateur ou médiateur ?' },
      { id: 'qui-peut-vous-aider', label: 'Qui peut vous aider ?' },
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

/** Heading of a step, numbered like the path above (h2), with its one-line summary. */
function StepHeading({ index }: { index: number }) {
  const step = STEPS[index]
  return (
    <>
      <h2 id={`${step.id}-titre`} className="text-3xl font-bold">
        {index + 1}. {step.title}
      </h2>
      <p className="mt-2 text-lg text-muted-foreground">{step.summary}</p>
    </>
  )
}

export default function LearnPage() {
  return (
    <>
      <PageTitle title="Apprendre" />
      <h1 className="text-3xl font-bold">Apprendre</h1>
      <p className="mt-4 max-w-3xl text-lg">
        Comprendre comment régler un conflit à l’amiable, en trois étapes. Si c’est votre première
        visite, commencez par la première.
      </p>

      {/* The suggested path, which is also the table of contents. Numbered: it is a sequence. */}
      <nav aria-label="Par où commencer ?" className="mt-8">
        <ol className="grid gap-4 md:grid-cols-3">
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

      {/* ---- 1. Understand the basics ---- */}
      <section id="comprendre" aria-labelledby="comprendre-titre" className="mt-16 scroll-mt-4">
        <StepHeading index={0} />

        <section
          id="conciliateur-ou-mediateur"
          aria-labelledby="conciliateur-ou-mediateur-titre"
          className="mt-8 scroll-mt-4"
        >
          <h3 id="conciliateur-ou-mediateur-titre" className="text-2xl font-bold">
            Conciliateur ou médiateur ?
          </h3>
          <p className="mt-4">
            Les deux vous aident, sans juger, à trouver un accord avec l’autre partie. Le
            conciliateur de justice est gratuit et peut proposer des solutions ; le médiateur est
            payant et vous aide à construire la vôtre, surtout quand la relation compte. Dans les
            deux cas, le juge peut homologuer l’accord si les parties le demandent.
          </p>
          <div className="mt-6">
            <RoutesComparison
              entries={[routes.get('conciliation'), routes.get('mediation')]}
              caption="Conciliation et médiation comparées"
              showScale={false}
              cardHeadingLevel={4}
            />
          </div>
          <p className="mt-4">
            <Link href="/demarches" className={linkClassName}>
              Comparer toutes les démarches, de la discussion au juge
            </Link>
          </p>
        </section>

        <section
          id="qui-peut-vous-aider"
          aria-labelledby="qui-peut-vous-aider-titre"
          className="mt-12 scroll-mt-4"
        >
          <h3 id="qui-peut-vous-aider-titre" className="text-2xl font-bold">
            Qui peut vous aider ?
          </h3>
          <p className="mt-4 max-w-3xl">
            Tous les conciliateurs, médiateurs et autres recours amiables, avec d’abord ce que dit
            la loi : leur statut, leurs conditions (par exemple le diplôme d’État exigé du médiateur
            familial dans les services financés par la Caf), ce qu’ils traitent, leur coût et ce que
            vaut l’accord. Ouvrez celui qui vous concerne.
          </p>
          <div className="mt-6 max-w-3xl">
            <WhoCanHelp headingLevel={4} />
          </div>
        </section>
      </section>

      {/* ---- 2. Test yourself ---- */}
      <section id="tester" aria-labelledby="tester-titre" className="mt-16 scroll-mt-4">
        <StepHeading index={1} />

        <section
          id="questionnaires"
          aria-labelledby="questionnaires-titre"
          className="mt-8 scroll-mt-4"
        >
          <h3 id="questionnaires-titre" className="text-2xl font-bold">
            Questionnaires
          </h3>
          <p className="mt-2 text-muted-foreground">
            Quelques questions, une réponse expliquée à chaque fois, puis votre score.
          </p>
          <div className="mt-6 space-y-12">
            {quizzes.all.map((quiz) => (
              <QuizPlayer key={quiz.slug} quiz={quiz} headingLevel={4} />
            ))}
          </div>
        </section>

        <section id="mini-jeux" aria-labelledby="mini-jeux-titre" className="mt-12 scroll-mt-4">
          <h3 id="mini-jeux-titre" className="text-2xl font-bold">
            Mini-jeux
          </h3>
          <p className="mt-2 text-muted-foreground">
            Deux jeux courts, chacun sur sa page, pour vous entraîner.
          </p>
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
        </section>
      </section>

      {/* ---- 3. Go further ---- */}
      <section
        id="aller-plus-loin"
        aria-labelledby="aller-plus-loin-titre"
        className="mt-16 scroll-mt-4"
      >
        <StepHeading index={2} />

        <section id="lexique" aria-labelledby="lexique-titre" className="mt-8 scroll-mt-4">
          <h3 id="lexique-titre" className="text-2xl font-bold">
            Lexique
          </h3>
          <p className="mt-4">
            {glossary.all.length} mots du droit expliqués simplement, avec une recherche et un index
            alphabétique.
          </p>
          <p className="mt-4">
            <Link href="/apprendre/lexique" className={linkClassName}>
              Consulter le lexique
            </Link>
          </p>
        </section>

        <div id="questions-frequentes" className="scroll-mt-4">
          <FaqSection page="learn" headingLevel={3} className="mt-12" />
        </div>

        <div id="infos-pratiques" className="scroll-mt-4">
          <PracticalInfoSection headingLevel={3} />
        </div>

        <section
          id="sensibiliser"
          aria-labelledby="sensibiliser-titre"
          className="mt-12 scroll-mt-4"
        >
          <h3 id="sensibiliser-titre" className="text-2xl font-bold">
            Sensibiliser en groupe
          </h3>
          <p className="mt-4">
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
        </section>
      </section>

      <IrisWidget page="learn" />
    </>
  )
}
