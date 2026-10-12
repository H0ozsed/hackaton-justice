import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useReducer, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  computeResults,
  createInitialState,
  currentScene,
  rolePlayReducer,
  type RolePlayAction,
  type RolePlayState,
  type Scenario,
} from '@/shared/role-play'

import { CharacterPortrait } from './character-portrait'
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

  const scene = currentScene(scenario, state)

  const restart = () => {
    dispatch({ type: 'restart' })
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
    <div className="mt-8 flex flex-col gap-4">
      {/* Announces each line in full (the typed text itself is hidden from screen readers). */}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {/* initial={false}: the intro is rendered visible by the server, not animated in. */}
      <AnimatePresence mode="wait" initial={false}>
        {phase === 'intro' && (
          <motion.div key="intro" {...slide}>
            <Intro scenario={scenario} onStart={() => setPhase('playing')} />
          </motion.div>
        )}
        {phase === 'playing' && (
          <motion.div key={`${run}-${scene.id}`} {...slide}>
            <SceneView
              scenario={scenario}
              scene={scene}
              sceneNumber={state.history.length + 1}
              reduceMotion={reduceMotion}
              announce={setAnnouncement}
              onChoose={(choiceId) => dispatch({ type: 'choose', choiceId })}
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

function Intro({ scenario, onStart }: { scenario: Scenario; onStart: () => void }) {
  return (
    <section aria-labelledby="intro-heading" className="flex flex-col gap-4">
      <h2 id="intro-heading" className="text-xl font-bold">
        {scenario.title}
      </h2>
      <p className="text-lg">
        <RichText text={scenario.intro} />
      </p>
      <div className="flex flex-wrap justify-around gap-4 rounded-lg bg-secondary px-4 py-6">
        {scenario.characters.map((c) => (
          <CharacterPortrait key={c.id} character={c} speaking={false} />
        ))}
      </div>
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
