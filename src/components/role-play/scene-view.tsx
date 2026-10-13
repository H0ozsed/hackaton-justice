import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import type { Gauges, Scenario, Scene } from '@/shared/role-play'

import { ChoiceList } from './choice-list'
import { DialogueBox } from './dialogue-box'
import { LifeGauges } from './pixel/life-gauges'
import type { Sound } from './pixel/sound'
import { Stage } from './pixel/stage'
import { toPlainText } from './rich-text'

/**
 * One scene: its lines one after the other (progressive text, skippable), then the
 * choices or, on a final scene, the ending. Mounted again for each scene (keyed by the
 * parent), so it starts at the first line and moves the focus to its heading.
 */
export function SceneView({
  scenario,
  scene,
  sceneNumber,
  gauges,
  previousGauges,
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
  reduceMotion: boolean
  sound: Sound
  /** Sends a text to the live region of the game (read by screen readers). */
  announce: (text: string) => void
  onChoose: (choiceId: string) => void
  /** Content shown after the last line of a final scene. */
  renderEnding: (ending: NonNullable<Scene['ending']>) => React.ReactNode
}) {
  const [lineIndex, setLineIndex] = useState(0)
  const [revealed, setRevealed] = useState(reduceMotion)
  const [showOutcome, setShowOutcome] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)

  const line = scene.lines[lineIndex]
  const isLastLine = lineIndex === scene.lines.length - 1
  const speaker = scenario.characters.find((c) => c.id === line.speaker)
  const onRevealed = useCallback(() => setRevealed(true), [])

  useEffect(() => heading.current?.focus(), [])

  // Sounds (when switched on): the effect of each line, and a blip per letter typed.
  const { effect: playEffect, blip } = sound
  useEffect(() => {
    if (line.effect) playEffect(line.effect)
  }, [line, playEffect])
  const voice = speaker?.avatar ?? 'narrator'
  const onLetter = useCallback(
    (letter: string, index: number) => {
      if (index % 2 === 0 && letter.trim()) blip(voice)
    },
    [blip, voice],
  )

  useEffect(() => {
    announce(`${speaker?.name ?? 'Narrateur'} : ${toPlainText(line.text)}`)
  }, [announce, line, speaker])

  // The player always faces the characters who speak in this scene.
  const cast = scenario.characters.filter(
    (c) => c.avatar === 'player' || scene.lines.some((l) => l.speaker === c.id),
  )

  const next = () => {
    if (!revealed) return setRevealed(true)
    if (!isLastLine) {
      setLineIndex((i) => i + 1)
      setRevealed(reduceMotion)
      return
    }
    setShowOutcome(true)
  }

  return (
    <section aria-labelledby="scene-heading" className="flex max-w-3xl flex-col gap-4">
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
          location={scene.location}
          period={scene.period}
          reduceMotion={reduceMotion}
          titleCard={{ label: `Scène ${sceneNumber}`, setting: scene.setting }}
        />
      </div>

      <DialogueBox
        key={lineIndex}
        speaker={speaker?.name}
        text={line.text}
        revealed={revealed}
        onRevealed={onRevealed}
        onLetter={onLetter}
      />

      {!showOutcome && (
        <Button onClick={next} className="self-end">
          {!revealed ? 'Tout afficher' : isLastLine ? 'Continuer' : 'Suivant'}
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
