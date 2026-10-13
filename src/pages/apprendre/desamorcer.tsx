import Link from 'next/link'

import { RephraseGame } from '@/components/games/rephrase-game'
import { PageTitle } from '@/components/layout/page-title'
import { rephraseRounds } from '@/shared/games'

// Mini-game "Désamorcer" (night work #80): rephrase without attacking.
export default function RephrasePage() {
  return (
    <>
      <PageTitle title="Désamorcer | Apprendre" />
      <p>
        <Link href="/apprendre" className="text-primary underline underline-offset-4">
          Retour à Apprendre
        </Link>
      </p>
      <h1 className="mt-4 text-3xl font-bold">Désamorcer : dire les choses sans attaquer</h1>
      <div className="mt-4 max-w-3xl space-y-3">
        <p>
          Dans un conflit, la première phrase compte. Pour chaque situation, choisissez la réponse
          qui dit la même chose sans faire monter la tension. Une demande qui apaise suit souvent
          quatre temps :
        </p>
        <ol className="list-decimal space-y-1 pl-6">
          <li>un fait précis, sans jugement ;</li>
          <li>ce que vous ressentez ;</li>
          <li>votre besoin ;</li>
          <li>une demande concrète.</li>
        </ol>
        <p className="text-muted-foreground">Pas de chrono : prenez votre temps.</p>
      </div>
      <RephraseGame rounds={rephraseRounds.all} />
    </>
  )
}
