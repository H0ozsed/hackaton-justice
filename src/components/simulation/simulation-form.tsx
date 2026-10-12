import { useEffect, useRef } from 'react'
import type { ComponentType, ReactNode } from 'react'

import { StepPanel } from './step-panel'
import type { ResultViewProps, SimulationStep } from './types'
import { useSimulation } from './use-simulation'

// Multi-step simulation form (#12). The engine knows no content: the steps (registry) and the
// result screen (`ResultView`) are provided by the page.
export function SimulationForm({
  steps,
  ResultView,
}: {
  steps: SimulationStep[]
  ResultView: ComponentType<ResultViewProps>
}) {
  const simulation = useSimulation(steps)

  return (
    <div className="max-w-2xl">
      {simulation.completed ? (
        <ResultRegion>
          <ResultView result={simulation.result} onRestart={simulation.restart} />
        </ResultRegion>
      ) : (
        simulation.currentStep && (
          <StepPanel
            // Recreate the panel on every step: the form starts again from the kept values.
            key={simulation.currentStep.id}
            step={simulation.currentStep}
            steps={steps}
            answers={simulation.answers}
            defaultValues={simulation.defaultValues}
            focusHeading={simulation.navigated}
            onSubmit={simulation.submit}
            onBack={simulation.back}
          />
        )
      )}
    </div>
  )
}

// Result region: takes the focus when displayed so that the change is announced.
function ResultRegion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.focus()
  }, [])

  return (
    <div ref={ref} tabIndex={-1} role="region" aria-label="Résultat" className="outline-none">
      {children}
    </div>
  )
}
