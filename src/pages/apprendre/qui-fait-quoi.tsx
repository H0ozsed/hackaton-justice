import Link from 'next/link'

import { WhoDoesWhat } from '@/components/games/who-does-what'
import { PageTitle } from '@/components/layout/page-title'
import { whoStatements } from '@/shared/games'

// Mini-game "Qui fait quoi ?" (night work #80): conciliator, mediator or judge?
export default function WhoDoesWhatPage() {
  return (
    <>
      <PageTitle title="Qui fait quoi ? | Apprendre" />
      <p>
        <Link href="/apprendre" className="text-primary underline underline-offset-4">
          Retour à Apprendre
        </Link>
      </p>
      <h1 className="mt-4 text-3xl font-bold">Qui fait quoi ?</h1>
      <p className="mt-4 max-w-3xl">
        Conciliateur de justice, médiateur ou juge : pour chaque phrase, cochez à qui elle
        s’applique. Parfois, c’est plusieurs. Vérifiez ensuite toutes vos réponses d’un coup.
      </p>
      <WhoDoesWhat statements={whoStatements.all} />
    </>
  )
}
