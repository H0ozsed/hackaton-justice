import { CheckCircle2Icon } from 'lucide-react'
import Link from 'next/link'

import {
  getScene,
  LEVEL_LABELS,
  PERSPECTIVE_LABELS,
  playerOf,
  type Scenario,
} from '@/shared/role-play'

import { characterSprite } from './pixel/characters'
import { LocationBackdrop, STAGE } from './pixel/locations'
import { PixelSprite } from './pixel/pixel-sprite'
import { useProgress } from './progress'

/** Small picture of the first scene: its place and the character played (decorative). */
function Thumbnail({ scenario }: { scenario: Scenario }) {
  const scene = getScene(scenario, scenario.startSceneId)
  const player = playerOf(scenario)
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox={`0 0 ${STAGE.width} ${STAGE.height}`}
      shapeRendering="crispEdges"
      className="-mx-5 -mt-5 mb-1 block w-[calc(100%+2.5rem)] max-w-none border-b-4 border-[#1e1f33]"
    >
      <LocationBackdrop location={scene.location} period={scene.period} />
      {player && <PixelSprite sprite={characterSprite(player.avatar)} x={40} y={65} />}
    </svg>
  )
}

/**
 * The scenarios grouped by level (h2), one card each (h3), with the perspective, a summary
 * without spoiler and the best score reached on this device.
 */
export function ScenarioList({ scenarios }: { scenarios: readonly Scenario[] }) {
  const progress = useProgress()
  const levels = [...new Set(scenarios.map((s) => s.level))].sort()

  return (
    <div className="mt-8 space-y-12">
      {levels.map((level) => (
        <section key={level} aria-labelledby={`niveau-${level}`}>
          <h2 id={`niveau-${level}`} className="text-2xl font-bold">
            {LEVEL_LABELS[level] ?? `Niveau ${level}`}
          </h2>
          <ul className="mt-6 grid gap-6 md:grid-cols-2">
            {scenarios
              .filter((s) => s.level === level)
              .map((scenario) => {
                const best = progress[scenario.slug]?.best
                return (
                  <li
                    key={scenario.slug}
                    className="flex flex-col gap-3 overflow-hidden rounded-lg border-4 border-[#1e1f33] bg-card p-5 shadow-[4px_4px_0_0_var(--color-foreground)]"
                  >
                    <Thumbnail scenario={scenario} />
                    <p className="w-fit rounded-sm bg-secondary px-2 py-1 text-sm font-medium text-secondary-foreground">
                      {PERSPECTIVE_LABELS[scenario.perspective]}
                    </p>
                    <h3 className="text-xl font-bold">{scenario.title}</h3>
                    <p>{scenario.summary ?? scenario.intro}</p>
                    {best !== undefined && (
                      <p className="flex items-center gap-2 text-sm font-medium">
                        <CheckCircle2Icon aria-hidden className="size-4 text-[#009b7e]" />
                        Terminé, meilleur score : {best} %
                      </p>
                    )}
                    <Link
                      href={`/mise-en-situation/${scenario.slug}`}
                      className="mt-auto inline-flex w-fit items-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      {best === undefined ? 'Jouer' : 'Rejouer'}
                      <span className="sr-only"> : {scenario.title}</span>
                    </Link>
                  </li>
                )
              })}
          </ul>
        </section>
      ))}
    </div>
  )
}
