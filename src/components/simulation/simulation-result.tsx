import { ExternalLinkIcon, PhoneIcon } from 'lucide-react'
import type { ComponentType } from 'react'

import { Button } from '@/components/ui/button'
import {
  channels as channelsContent,
  conflictTypes as conflictTypesContent,
  type Channel,
  type ConflictType,
} from '@/shared/simulation'

import { summarizeAnswers } from './answers-summary'
import { getChosenConflictType } from './conflict-type'
import { mandatoryAttemptNotice, recommendChannel } from './recommend-channel'
import type { ResultViewProps } from './types'

// Result screen of the simulation (#16): the recommended channel and why, how to reach it, the
// other channels, and what the person answered. The rules are in `recommend-channel.ts`; the
// text of the channels comes from the content. The channels and conflict types are parameters so
// that tests can use their own; `SimulationResult` below is the real one.
export function createSimulationResult({
  channels,
  conflictTypes,
}: {
  channels: readonly Channel[]
  conflictTypes: readonly ConflictType[]
}): ComponentType<ResultViewProps> {
  function SimulationResultView({ result, onRestart }: ResultViewProps) {
    const recommendation = recommendChannel(result, channels)
    const answers = summarizeAnswers(result, conflictTypes)
    const notice = mandatoryAttemptNotice(getChosenConflictType(result, conflictTypes), result)

    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Votre orientation</h2>
        <p className="rounded-md bg-secondary p-3 text-sm text-secondary-foreground">
          Cette orientation est indicative : elle s’appuie uniquement sur vos réponses et ne
          remplace pas l’avis d’un professionnel du droit.
        </p>

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

        {recommendation ? (
          <>
            <section
              aria-labelledby="result-channel"
              className="space-y-4 rounded-lg border-2 border-primary p-6"
            >
              <p className="text-sm font-medium text-muted-foreground">Le canal conseillé</p>
              <h3 id="result-channel" className="text-xl font-bold">
                {recommendation.channel.name}
              </h3>
              <p>{recommendation.channel.description}</p>
              <ChannelFacts channel={recommendation.channel} />
              <ChannelContact channel={recommendation.channel} />
            </section>

            <section aria-labelledby="result-why" className="space-y-3">
              <h3 id="result-why" className="text-xl font-bold">
                Pourquoi ce canal ?
              </h3>
              <ul className="list-disc space-y-1 pl-5">
                {recommendation.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </section>

            {recommendation.alternatives.length > 0 && (
              <section aria-labelledby="result-others" className="space-y-3">
                <h3 id="result-others" className="text-xl font-bold">
                  Autres pistes
                </h3>
                <ul className="space-y-3">
                  {recommendation.alternatives.map((channel) => (
                    <li key={channel.slug}>
                      <p className="font-medium">{channel.name}</p>
                      <p className="text-muted-foreground">{channel.description}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        ) : (
          <p>Aucun canal d’orientation n’est disponible pour le moment.</p>
        )}

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
          Recommencer la simulation
        </Button>
      </div>
    )
  }

  return SimulationResultView
}

// What kind of channel it is, in words (never only by colour).
function ChannelFacts({ channel }: { channel: Channel }) {
  const fact = 'rounded-md border px-2 py-1'
  return (
    <p className="flex flex-wrap gap-2 text-sm">
      <span className={fact}>{channel.amicable ? 'Voie amiable' : 'Voie judiciaire'}</span>
      <span className={fact}>{channel.free ? 'Gratuit' : 'Peut avoir un coût'}</span>
    </p>
  )
}

const linkClassName =
  'inline-flex items-center gap-1 font-medium break-words text-france-blue underline underline-offset-4 hover:decoration-2'

// How to reach the channel: its website (external, in a new window, said in the link text for
// screen readers and shown by the icon: RGAA 13.2) and/or its phone number.
function ChannelContact({ channel }: { channel: Channel }) {
  const { contact } = channel
  if (!contact) return null

  return (
    <ul className="flex flex-col gap-2">
      {contact.url && (
        <li>
          <a href={contact.url} target="_blank" rel="noopener noreferrer" className={linkClassName}>
            En savoir plus : {channel.name}
            <span className="sr-only"> (nouvelle fenêtre)</span>
            <ExternalLinkIcon aria-hidden className="size-4 shrink-0" />
          </a>
        </li>
      )}
      {contact.phone && (
        <li>
          <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className={linkClassName}>
            <PhoneIcon aria-hidden className="size-4 shrink-0" />
            {contact.phone}
          </a>
        </li>
      )}
    </ul>
  )
}

export const SimulationResult = createSimulationResult({
  channels: channelsContent.all,
  conflictTypes: conflictTypesContent.all,
})
