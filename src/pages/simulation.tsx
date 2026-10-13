import { useState } from 'react'

import { PageTitle } from '@/components/layout/page-title'
import { SimulationForm } from '@/components/simulation/simulation-form'
import { SimulationIntro } from '@/components/simulation/simulation-intro'
import { SimulationResult } from '@/components/simulation/simulation-result'
import { SIMULATION_STEPS } from '@/components/simulation/steps'

// « Ma situation ? » (#101): an introduction, then the adaptive form and its result.
export default function SimulationPage() {
  const [started, setStarted] = useState(false)
  return (
    <>
      <PageTitle title="Ma situation ?" />
      <h1 className="text-3xl font-bold">Ma situation ?</h1>
      <p className="mt-4 text-muted-foreground">
        Répondez à quelques questions sur votre conflit pour savoir vers qui vous tourner.
      </p>
      <div className="mt-8">
        {started ? (
          <SimulationForm steps={SIMULATION_STEPS} ResultView={SimulationResult} autoFocus />
        ) : (
          <SimulationIntro onStart={() => setStarted(true)} />
        )}
      </div>
    </>
  )
}
