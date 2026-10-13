import { Clock, Euro, HeartCrack, HeartPulse, type LucideIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { formatLoss, type RolePlayResults } from '@/shared/role-play'
import { LOSS_KIND_DESCRIPTIONS, LOSS_KIND_LABELS, type LossKind } from '@/shared/simulation'

import { RichText } from './rich-text'

const LOSS_ICONS: Record<LossKind, LucideIcon> = {
  money: Euro,
  time: Clock,
  health: HeartPulse,
  relationship: HeartCrack,
}

const QUALITY_LABELS = { ok: 'Peut mieux faire', bad: 'À éviter' } as const

/** End of the game: score, corrections of the choices that were not the best, losses. */
export function ResultsScreen({
  results,
  onRestart,
}: {
  results: RolePlayResults
  onRestart: () => void
}) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => heading.current?.focus(), [])

  const { scorePercent, decisions, goodDecisions, corrections, losses, ending } = results

  return (
    <section aria-labelledby="results-heading" className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2
          id="results-heading"
          ref={heading}
          tabIndex={-1}
          className="text-2xl font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Votre bilan
        </h2>
        {ending && <p className="text-muted-foreground">Fin : {ending.title}</p>}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border-4 border-double border-foreground p-4">
        <p className="flex items-baseline gap-3">
          <span className="text-5xl font-bold text-primary">{scorePercent} %</span>
          <span>
            {goodDecisions} bon{goodDecisions > 1 ? 's' : ''} choix sur {decisions}
          </span>
        </p>
        {/* Visual gauge only: the value is given in text just above. */}
        <div aria-hidden className="h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary" style={{ width: `${scorePercent}%` }} />
        </div>
      </div>

      <section aria-labelledby="losses-heading" className="flex flex-col gap-3">
        <h3 id="losses-heading" className="text-xl font-bold">
          Ce que vos choix vous ont coûté
        </h3>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(Object.keys(LOSS_KIND_LABELS) as LossKind[]).map((kind) => {
            const Icon = LOSS_ICONS[kind]
            return (
              <div key={kind} className="flex flex-col gap-1 rounded-lg bg-secondary p-3">
                <dt className="flex items-center gap-2 text-sm">
                  <Icon aria-hidden className="size-4 text-primary" />
                  {LOSS_KIND_LABELS[kind]}
                </dt>
                <dd className="text-lg font-bold">{formatLoss(kind, losses[kind])}</dd>
                <dd className="text-sm text-muted-foreground">{LOSS_KIND_DESCRIPTIONS[kind]}</dd>
              </div>
            )
          })}
        </dl>
      </section>

      <section aria-labelledby="corrections-heading" className="flex flex-col gap-3">
        <h3 id="corrections-heading" className="text-xl font-bold">
          Corrections
        </h3>
        {corrections.length === 0 ? (
          <p>Aucune erreur : vous avez fait les meilleurs choix à chaque étape.</p>
        ) : (
          <ol className="flex flex-col gap-4">
            {corrections.map(({ sceneNumber, scene, choice, better }) => (
              <li key={scene.id} className="flex flex-col gap-2 rounded-lg border-2 p-4">
                <p className="text-sm text-muted-foreground">
                  Scène {sceneNumber}
                  {scene.setting && ` — ${scene.setting}`}
                </p>
                <p>
                  <span className="font-bold">Votre choix :</span> {choice.label}{' '}
                  <span className="rounded-sm bg-muted px-1.5 py-0.5 text-sm">
                    {QUALITY_LABELS[choice.quality as keyof typeof QUALITY_LABELS]}
                  </span>
                </p>
                <p>
                  <RichText text={choice.feedback} />
                </p>
                {better.length > 0 && (
                  <p>
                    <span className="font-bold">Meilleur choix :</span>{' '}
                    {better.map((b) => b.label).join(' ou ')}
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      <Button onClick={onRestart} className="self-start">
        Rejouer
      </Button>
    </section>
  )
}
