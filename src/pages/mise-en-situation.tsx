import { PageTitle } from '@/components/layout/page-title'
import { RolePlayGame } from '@/components/role-play/role-play-game'
import { scenarios } from '@/shared/role-play'

export default function RolePlayPage() {
  return (
    <>
      <PageTitle title="Mise en situation" />
      <h1 className="text-3xl font-bold">Mise en situation</h1>
      <p className="mt-4 text-muted-foreground">
        Vivez un cas concret et découvrez les conséquences de vos choix.
      </p>
      <RolePlayGame scenario={scenarios.all[0]} />
    </>
  )
}
