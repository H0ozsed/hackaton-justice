import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  applyChoice,
  computeResults,
  createInitialState,
  currentScene,
  describeGaugeChange,
  gaugesAfter,
  rolePlayReducer,
  type Gauges,
  type RolePlayAction,
  type RolePlayState,
  type Scenario,
} from '@/shared/role-play'

import { CharacterPortrait } from './character-portrait'
import { BuildingCutaway } from './pixel/cutaway'
import { useSound } from './pixel/sound'
import { ResultsScreen } from './results-screen'
import { RichText } from './rich-text'
import { SceneView } from './scene-view'

/**
 * The whole game: intro, then the scenes driven by the engine (src/shared/role-play).
 * Everything stays in the browser: choices are neither sent nor stored (RGPD).
 */
export function RolePlayGame({ scenario }: { scenario: Scenario }) {
  const [phase, setPhase] = useState<'intro' | 'playing' | 'results'>('intro')
  const [state, dispatch] = useReducer(
    (s: RolePlayState, a: RolePlayAction) => rolePlayReducer(scenario, s, a),
    scenario,
    createInitialState,
  )
  // Incremented on restart, so the first scene is mounted again even with the same id.
  const [run, setRun] = useState(0)
  const [announcement, setAnnouncement] = useState('')
  const reduceMotion = useReducedMotion() ?? false
  const sound = useSound()

  const scene = currentScene(scenario, state)
  const gauges = useMemo(() => gaugesAfter(scenario, state.history), [scenario, state.history])

  // Says what the last choice cost (the HUD bars are only visual).
  const [gaugeNotice, setGaugeNotice] = useState('')
  const [previousGauges, setPreviousGauges] = useState<Gauges>()

  const choose = (choiceId: string) => {
    const choice = scene.choices.find((c) => c.id === choiceId)
    sound.select()
    if (choice) setGaugeNotice(describeGaugeChange(gauges, applyChoice(gauges, choice)))
    setPreviousGauges(gauges)
    dispatch({ type: 'choose', choiceId })
  }

  const restart = () => {
    dispatch({ type: 'restart' })
    setGaugeNotice('')
    setPreviousGauges(undefined)
    setRun((r) => r + 1)
    setPhase('playing')
  }

  // Same props on the server and the client (no hydration mismatch); reduced motion
  // only makes the transition instant.
  const slide = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
    transition: { duration: reduceMotion ? 0 : 0.2 },
  }

  return (
    <div className="mt-8 flex max-w-3xl flex-col gap-4">
      {/* Announces each line in full (the typed text itself is hidden from screen readers). */}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
      <p aria-live="polite" className="sr-only">
        {gaugeNotice}
      </p>

      {/* Same name in both states, the state is given by aria-pressed (and the icon). */}
      <Button
        variant="outline"
        size="sm"
        aria-pressed={sound.enabled}
        onClick={sound.toggle}
        className="self-end aria-pressed:bg-secondary aria-pressed:text-secondary-foreground"
      >
        {sound.enabled ? <Volume2 aria-hidden /> : <VolumeX aria-hidden />}
        Son
      </Button>

      {/* initial={false}: the intro is rendered visible by the server, not animated in. */}
      <AnimatePresence mode="wait" initial={false}>
        {phase === 'intro' && (
          <motion.div key="intro" {...slide}>
            <Intro
              scenario={scenario}
              reduceMotion={reduceMotion}
              onStart={() => setPhase('playing')}
            />
          </motion.div>
        )}
        {phase === 'playing' && (
          <motion.div key={`${run}-${scene.id}`} {...slide}>
            <SceneView
              scenario={scenario}
              scene={scene}
              sceneNumber={state.history.length + 1}
              gauges={gauges}
              previousGauges={previousGauges}
              reduceMotion={reduceMotion}
              sound={sound}
              announce={setAnnouncement}
              onChoose={choose}
              renderEnding={(ending) => (
                <Ending title={ending.title} onShowResults={() => setPhase('results')} />
              )}
            />
          </motion.div>
        )}
        {phase === 'results' && (
          <motion.div key={`${run}-results`} {...slide}>
            <ResultsScreen results={computeResults(scenario, state)} onRestart={restart} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Intro({
  scenario,
  reduceMotion,
  onStart,
}: {
  scenario: Scenario
  reduceMotion: boolean
  onStart: () => void
}) {
  return (
    <section aria-labelledby="intro-heading" className="flex max-w-3xl flex-col gap-4">
      <h2 id="intro-heading" className="text-xl font-bold">
        {scenario.title}
      </h2>
      <div className="overflow-hidden rounded-lg border-4 border-[#1e1f33] shadow-[4px_4px_0_0_var(--color-foreground)]">
        <BuildingCutaway reduceMotion={reduceMotion} />
      </div>
      <p className="text-lg">
        <RichText text={scenario.intro} />
      </p>
      <ul
        aria-label="Personnages"
        className="flex flex-wrap justify-around gap-4 rounded-lg bg-secondary px-4 py-6"
      >
        {scenario.characters.map((c) => (
          <li key={c.id}>
            <CharacterPortrait character={c} />
          </li>
        ))}
      </ul>
      <p className="text-muted-foreground">
        Lisez les dialogues puis choisissez ce que vous feriez. Vos choix restent sur votre
        appareil.
      </p>
      <Button onClick={onStart} className="self-start">
        Commencer
      </Button>
    </section>
  )
}

function Ending({ title, onShowResults }: { title: string; onShowResults: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => heading.current?.focus(), [])

  return (
    <div className="flex flex-col gap-4 rounded-lg border-4 border-double border-primary p-4">
      <h3
        ref={heading}
        tabIndex={-1}
        className="text-lg font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Fin : {title}
      </h3>
      <Button onClick={onShowResults} className="self-start">
        Voir mon bilan
      </Button>
    </div>
  )
}
