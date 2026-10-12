import { PageTitle } from '@/components/layout/page-title'
import { SimulationForm } from '@/components/simulation/simulation-form'
import { SIMULATION_STEPS } from '@/components/simulation/steps'
import { TechnicalRecap } from '@/components/simulation/technical-recap'

export default function SimulationPage() {
  return (
    <>
      <PageTitle title="Simulation" />
      <h1 className="text-3xl font-bold">Simulation</h1>
      <p className="mt-4 text-muted-foreground">
        Répondez à quelques questions sur votre conflit pour savoir vers qui vous tourner.
      </p>
      <div className="mt-8">
        <SimulationForm steps={SIMULATION_STEPS} ResultView={TechnicalRecap} />
      </div>
    </>
  )
}
