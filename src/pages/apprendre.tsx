import Link from 'next/link'

import { IrisWidget } from '@/components/chatbot/iris-widget'
import { FaqSection } from '@/components/faq/faq-section'
import { PageTitle } from '@/components/layout/page-title'
import { PracticalInfoSection } from '@/components/practical-info/practical-info'
import { QuizPlayer } from '@/components/quiz/quiz-player'
import { glossary } from '@/shared/glossary'
import { quizzes } from '@/shared/quiz'

// Learning hub (docs/PARCOURS_UTILISATEURS.md), with the IRIS chatbot.
// The glossary has its own page (/apprendre/lexique, #22): the hub links to it.

// Anchors of the page sections, listed in the table of contents (long page, RGAA 12.6).
const SECTIONS = [
  { id: 'questionnaires', label: 'Questionnaires' },
  { id: 'mini-jeux', label: 'Mini-jeux' },
  { id: 'lexique', label: 'Lexique' },
  { id: 'questions-frequentes', label: 'Questions fréquentes' },
  { id: 'infos-pratiques', label: 'Infos pratiques' },
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

      <IrisWidget page="learn" />
    </>
  )
}
