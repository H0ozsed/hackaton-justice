import { ExternalLinkIcon } from 'lucide-react'
import Link from 'next/link'
import type { ComponentType } from 'react'

import { Button } from '@/components/ui/button'
import {
  channels as channelsContent,
  conflictTypes as conflictTypesContent,
  freeInformation,
  type Channel,
  type ConflictType,
} from '@/shared/simulation'

import { summarizeAnswers } from './answers-summary'
import { getChosenConflictType } from './conflict-type'
import { SolutionPicker } from './solution-picker'
import { mandatoryAttemptNotice, solutionsFor } from './solutions'
import type { ResultViewProps } from './types'

// Result screen of the simulation (#16): what to know first, whether an amicable attempt is
// mandatory, then the solutions for the conflict, for the person to choose from (no automatic
// recommendation, coaching feedback of 13 Oct 2026), free information, and the answers given.
// The channels and conflict types are parameters so that tests can use their own;
// `SimulationResult` below is the real one.
export function createSimulationResult({
  channels,
  conflictTypes,
}: {
  channels: readonly Channel[]
  conflictTypes: readonly ConflictType[]
}): ComponentType<ResultViewProps> {
  function SimulationResultView({ result, onRestart }: ResultViewProps) {
    const groups = solutionsFor(result, channels)
    const answers = summarizeAnswers(result, conflictTypes)
    const conflictType = getChosenConflictType(result, conflictTypes)
    const notice = mandatoryAttemptNotice(conflictType, result)

    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Votre orientation</h2>
        <p className="rounded-md bg-secondary p-3 text-sm text-secondary-foreground">
          Cette orientation est indicative : elle s’appuie uniquement sur vos réponses et ne
          remplace pas l’avis d’un professionnel du droit.
        </p>

        {conflictType?.warning && (
          <section
            aria-labelledby="result-warning"
            className="space-y-2 rounded-lg border-l-4 border-marianne-red bg-marianne-red-4 p-4"
          >
            <h3 id="result-warning" className="font-bold">
              À savoir d’abord
            </h3>
            <p>{conflictType.warning}</p>
          </section>
        )}

        {notice && (
          <section
            aria-labelledby="result-mandatory"
            className="space-y-2 rounded-lg border-l-4 border-marianne-red bg-marianne-red-4 p-4"
          >
            <h3 id="result-mandatory" className="font-bold">
              Une tentative amiable est obligatoire
            </h3>
            <p>{notice}</p>
          </section>
        )}

        {groups.length > 0 ? (
          <section aria-labelledby="result-solutions" className="space-y-4">
            <h3 id="result-solutions" className="text-xl font-bold">
              Qui peut vous aider ?
            </h3>
            <p>
              Voici les solutions possibles pour votre conflit, de la discussion au juge. C’est à
              vous de choisir celle qui correspond à votre situation.
            </p>
            <SolutionPicker groups={groups} />
            <p>
              Il existe d’autres conciliateurs et médiateurs (familial, de la consommation, de
              l’éducation, des administrations…) : seuls ceux qui traitent votre type de conflit
              sont proposés ici.{' '}
              <Link
                href="/apprendre#qui-peut-vous-aider"
                className="font-medium text-france-blue underline underline-offset-4 hover:decoration-2"
              >
                Voir tous les conciliateurs et médiateurs
              </Link>
            </p>
          </section>
        ) : (
          <p>Aucune solution n’est disponible pour le moment.</p>
        )}

        <section
          aria-labelledby="result-information"
          className="space-y-2 rounded-lg border-l-4 border-france-blue bg-secondary p-4"
        >
          <h3 id="result-information" className="font-bold">
            {freeInformation.title}
          </h3>
          <p>{freeInformation.text}</p>
          <p>
            <a
              href={freeInformation.link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium break-words text-france-blue underline underline-offset-4 hover:decoration-2"
            >
              {freeInformation.link.label}
              <span className="sr-only"> (nouvelle fenêtre)</span>
              <ExternalLinkIcon aria-hidden className="ml-1 inline size-4 align-[-0.125em]" />
            </a>
          </p>
        </section>

        {answers.length > 0 && (
          <section aria-labelledby="result-answers" className="space-y-3">
            <h3 id="result-answers" className="text-xl font-bold">
              Vos réponses
            </h3>
            <dl className="space-y-2">
              {answers.map(({ label, value }) => (
                <div key={label}>
                  <dt className="font-medium">{label}</dt>
                  <dd className="text-muted-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <Button type="button" variant="outline" size="lg" onClick={onRestart}>
          Recommencer le questionnaire
        </Button>
      </div>
    )
  }

  return SimulationResultView
}

export const SimulationResult = createSimulationResult({
  channels: channelsContent.all,
  conflictTypes: conflictTypesContent.all,
})
