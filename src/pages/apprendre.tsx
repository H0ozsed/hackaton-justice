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
// The glossary has its own page (/apprendre/lexique, #22): the hub links to it.

// Anchors of the page sections, listed in the table of contents (long page, RGAA 12.6).
const SECTIONS = [
  { id: 'conciliateur-ou-mediateur', label: 'Conciliateur ou médiateur ?' },
  { id: 'qui-peut-vous-aider', label: 'Qui peut vous aider ?' },
  { id: 'questionnaires', label: 'Questionnaires' },
  { id: 'mini-jeux', label: 'Mini-jeux' },
  { id: 'lexique', label: 'Lexique' },
  { id: 'questions-frequentes', label: 'Questions fréquentes' },
  { id: 'infos-pratiques', label: 'Infos pratiques' },
  { id: 'sensibiliser', label: 'Sensibiliser en groupe' },
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

export default function LearnPage() {
  return (
    <>
      <PageTitle title="Apprendre" />
      <h1 className="text-3xl font-bold">Apprendre</h1>
      <p className="mt-4 text-muted-foreground">
        Testez vos connaissances, découvrez les mots du droit, puis retrouvez les réponses aux
        questions fréquentes et les contacts utiles.
      </p>

      <nav aria-label="Sommaire" className="mt-6">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {SECTIONS.map(({ id, label }) => (
            <li key={id}>
              <a href={`#${id}`} className="text-primary underline underline-offset-4">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section
        id="conciliateur-ou-mediateur"
        aria-labelledby="conciliateur-ou-mediateur-titre"
        className="mt-12 scroll-mt-4"
      >
        <h2 id="conciliateur-ou-mediateur-titre" className="text-2xl font-bold">
          Conciliateur ou médiateur ?
        </h2>
        <p className="mt-4">
          Les deux vous aident, sans juger, à trouver un accord avec l’autre partie. Le conciliateur
          de justice est gratuit et peut proposer des solutions ; le médiateur est payant et vous
          aide à construire la vôtre, surtout quand la relation compte. Dans les deux cas, le juge
          peut homologuer l’accord si les parties le demandent.
        </p>
        <div className="mt-6">
          <RoutesComparison
            entries={[routes.get('conciliation'), routes.get('mediation')]}
            caption="Conciliation et médiation comparées"
            showScale={false}
          />
        </div>
        <p className="mt-4">
          <Link href="/demarches" className="text-primary underline underline-offset-4">
            Comparer toutes les démarches, de la discussion au juge
          </Link>
        </p>
      </section>

      <section
        id="qui-peut-vous-aider"
        aria-labelledby="qui-peut-vous-aider-titre"
        className="mt-12 scroll-mt-4"
      >
        <h2 id="qui-peut-vous-aider-titre" className="text-2xl font-bold">
          Qui peut vous aider ?
        </h2>
        <p className="mt-4 max-w-3xl">
          Tous les conciliateurs, médiateurs et autres recours amiables, avec d’abord ce que dit la
          loi : leur statut, leurs conditions (par exemple le diplôme d’État exigé du médiateur
          familial dans les services financés par la Caf), ce qu’ils traitent, leur coût et ce que
          vaut l’accord.
        </p>
        <div className="mt-6 max-w-3xl">
          <WhoCanHelp />
        </div>
      </section>

      <section
        id="questionnaires"
        aria-labelledby="questionnaires-titre"
        className="mt-12 scroll-mt-4"
      >
        <h2 id="questionnaires-titre" className="text-2xl font-bold">
          Questionnaires
        </h2>
        <div className="mt-6 space-y-12">
          {quizzes.all.map((quiz) => (
            <QuizPlayer key={quiz.slug} quiz={quiz} headingLevel={3} />
          ))}
        </div>
      </section>

      <section id="mini-jeux" aria-labelledby="mini-jeux-titre" className="mt-12 scroll-mt-4">
        <h2 id="mini-jeux-titre" className="text-2xl font-bold">
          Mini-jeux
        </h2>
        <ul className="mt-6 grid gap-6 md:grid-cols-2">
          {GAMES.map((game) => (
            <li key={game.href} className="rounded-lg border-2 border-border bg-card p-6">
              <h3 className="text-xl font-bold">{game.title}</h3>
              <p className="mt-2">{game.description}</p>
              <p className="mt-4">
                <Link href={game.href} className="text-primary underline underline-offset-4">
                  {game.cta}
                </Link>
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section id="lexique" aria-labelledby="lexique-titre" className="mt-12 scroll-mt-4">
        <h2 id="lexique-titre" className="text-2xl font-bold">
          Lexique
        </h2>
        <p className="mt-4">
          {glossary.all.length} mots du droit expliqués simplement, avec une recherche et un index
          alphabétique.
        </p>
        <p className="mt-4">
          <Link href="/apprendre/lexique" className="text-primary underline underline-offset-4">
            Consulter le lexique
          </Link>
        </p>
      </section>

      <div id="questions-frequentes" className="scroll-mt-4">
        <FaqSection page="learn" className="mt-12" />
      </div>

      <div id="infos-pratiques" className="scroll-mt-4">
        <PracticalInfoSection />
      </div>

      <section id="sensibiliser" aria-labelledby="sensibiliser-titre" className="mt-12 scroll-mt-4">
        <h2 id="sensibiliser-titre" className="text-2xl font-bold">
          Sensibiliser en groupe
        </h2>
        <p className="mt-4">
          Le CDAD (conseil départemental de l’accès au droit) fait connaître les solutions amiables
          là où sont les gens : dans les écoles auprès des jeunes, et lors d’événements pour tous
          les autres. Les questionnaires, les mini-jeux et les mises en situation de ce site se
          jouent aussi à plusieurs, projetés en classe ou sur un stand : chacun propose sa réponse,
          puis on en discute.
        </p>
        <p className="mt-4">
          <Link href="/mise-en-situation" className="text-primary underline underline-offset-4">
            Choisir une mise en situation
          </Link>
        </p>
      </section>

      <IrisWidget page="learn" />
    </>
  )
}
