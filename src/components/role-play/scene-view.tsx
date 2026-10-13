import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import type { Choice, Gauges, Scenario, Scene } from '@/shared/role-play'

import { ChoiceList } from './choice-list'
import { DialogueBox } from './dialogue-box'
import { ACTION_MS } from './pixel/actions'
import { LifeGauges } from './pixel/life-gauges'
import type { Sound } from './pixel/sound'
import { Stage } from './pixel/stage'
import { toPlainText } from './rich-text'

/**
 * One scene: first, if the last choice has an action, a short animation of it (skippable,
 * not played with reduced motion); then its lines one after the other in speech bubbles
 * (progressive text, skippable); then the choices or, on a final scene, the ending.
 * Mounted again for each scene (keyed by the parent), so it starts over and moves the
 * focus to its heading.
 */
export function SceneView({
  scenario,
  scene,
  sceneNumber,
  gauges,
  previousGauges,
  prelude,
  metIds,
  reduceMotion,
  sound,
  announce,
  onChoose,
  renderEnding,
}: {
  scenario: Scenario
  scene: Scene
  sceneNumber: number
  /** Life gauges of the player, shown in the HUD of the stage. */
  gauges: Gauges
  /** Gauges before the last choice (to show what it cost). */
  previousGauges?: Gauges
  /** Last choice and the scene where it was made: its action is played first. */
  prelude?: { choice: Choice; scene: Scene }
  /** Characters who already spoke in earlier scenes (their role is not repeated). */
  metIds: ReadonlySet<string>
  reduceMotion: boolean
  sound: Sound
  /** Sends a text to the live region of the game (read by screen readers). */
  announce: (text: string) => void
  onChoose: (choiceId: string) => void
  /** Content shown after the last line of a final scene. */
  renderEnding: (ending: NonNullable<Scene['ending']>) => React.ReactNode
}) {
  const action = prelude?.choice.action
  const [playingAction, setPlayingAction] = useState(Boolean(action) && !reduceMotion)
  const [lineIndex, setLineIndex] = useState(0)
  const [revealed, setRevealed] = useState(reduceMotion)
  const [showOutcome, setShowOutcome] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)

  const line = scene.lines[lineIndex]
  const isLastLine = lineIndex === scene.lines.length - 1
  const speaker = scenario.characters.find((c) => c.id === line.speaker)
  const onRevealed = useCallback(() => setRevealed(true), [])

  // The role of a character is given the first time they speak.
  const role =
    speaker &&
    speaker.avatar !== 'player' &&
    !metIds.has(speaker.id) &&
    !scene.lines.slice(0, lineIndex).some((l) => l.speaker === speaker.id)
      ? speaker.role
      : undefined

  useEffect(() => heading.current?.focus(), [])

  // The action animation ends by itself.
  useEffect(() => {
    if (!playingAction) return
    const timer = setTimeout(() => setPlayingAction(false), ACTION_MS)
    return () => clearTimeout(timer)
  }, [playingAction])

  // Sounds (when switched on): the effect of each line, and a blip per letter typed.
  const { effect: playEffect, blip } = sound
  useEffect(() => {
    if (!playingAction && line.effect) playEffect(line.effect)
  }, [line, playEffect, playingAction])
  const voice = speaker?.avatar ?? 'narrator'
  const onLetter = useCallback(
    (letter: string, index: number) => {
      if (index % 2 === 0 && letter.trim()) blip(voice)
    },
    [blip, voice],
  )

  useEffect(() => {
    if (playingAction) return
    const name = speaker ? `${speaker.name}${role ? ` (${role})` : ''}` : 'Narrateur'
    announce(`${name} : ${toPlainText(line.text)}`)
  }, [announce, line, speaker, role, playingAction])

  // The player always faces the characters who speak in this scene.
  const cast = scenario.characters.filter(
    (c) => c.avatar === 'player' || scene.lines.some((l) => l.speaker === c.id),
  )

  // Partner of the action: the other character of the scene where the choice was made.
  const partner = prelude
    ? scenario.characters.find(
        (c) => c.avatar !== 'player' && prelude.scene.lines.some((l) => l.speaker === c.id),
      )?.avatar
    : undefined

  const next = () => {
    if (playingAction) return setPlayingAction(false)
    if (!revealed) return setRevealed(true)
    if (!isLastLine) {
      setLineIndex((i) => i + 1)
      setRevealed(reduceMotion)
      return
    }
    setShowOutcome(true)
  }

  const speech = playingAction
    ? {
        kind: 'caption' as const,
        content: (
          <>
            <p className="font-bold text-primary">Votre choix</p>
            <p>{prelude!.choice.label}</p>
          </>
        ),
      }
    : {
        kind: speaker ? ('speech' as const) : ('caption' as const),
        content: (
          <DialogueBox
            key={lineIndex}
            speaker={speaker?.name}
            role={role}
            text={line.text}
            revealed={revealed}
            onRevealed={onRevealed}
            onLetter={onLetter}
          />
        ),
      }

  return (
    <section aria-labelledby="scene-heading" className="flex flex-col gap-4">
      <h2
        id="scene-heading"
        ref={heading}
        tabIndex={-1}
        className="text-xl font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Scène {sceneNumber}
        {scene.setting && <span className="font-normal"> — {scene.setting}</span>}
      </h2>

      <div className="overflow-hidden rounded-lg border-4 border-[#1e1f33] shadow-[4px_4px_0_0_var(--color-foreground)]">
        <LifeGauges gauges={gauges} previous={previousGauges} reduceMotion={reduceMotion} />
        <Stage
          cast={cast}
          speakerId={line.speaker}
          emotion={line.emotion}
          talking={!revealed}
          effect={line.effect}
          effectKey={lineIndex}
          location={playingAction ? prelude!.scene.location : scene.location}
          period={playingAction ? prelude!.scene.period : scene.period}
          reduceMotion={reduceMotion}
          titleCard={{ label: `Scène ${sceneNumber}`, setting: scene.setting }}
          speech={speech}
          action={playingAction && action ? { action, partner } : undefined}
        />
      </div>

      {!showOutcome && (
        <Button onClick={next} className="self-end">
          {playingAction || revealed
            ? isLastLine && !playingAction
              ? 'Continuer'
              : 'Suivant'
            : 'Tout afficher'}
        </Button>
      )}

      {showOutcome &&
        (scene.ending ? (
          renderEnding(scene.ending)
        ) : (
          <ChoiceList choices={scene.choices} onChoose={onChoose} />
        ))}
    </section>
  )
}
