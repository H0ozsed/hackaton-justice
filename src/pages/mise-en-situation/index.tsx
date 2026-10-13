import { PageTitle } from '@/components/layout/page-title'
import { ScenarioList } from '@/components/role-play/scenario-list'
import { scenarios } from '@/shared/role-play'

// List of the role-play scenarios, by level (night work #80). Each one is played on its own
// page, /mise-en-situation/[slug].
export default function RolePlayPage() {
  return (
    <>
      <PageTitle title="Mise en situation" />
      <h1 className="text-3xl font-bold">Mise en situation</h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">
        Vivez un conflit de l’intérieur, d’un côté ou de l’autre, puis à la place du médiateur.
        Faites vos choix et découvrez leurs conséquences. Vos scores restent sur votre appareil.
      </p>
      <ScenarioList scenarios={scenarios.all} />
    </>
  )
}
