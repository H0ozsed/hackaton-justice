import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import type { Scenario, Scene } from '@/shared/role-play'

import { CharacterPortrait } from './character-portrait'
import { ChoiceList } from './choice-list'
import { DialogueBox } from './dialogue-box'
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
  reduceMotion,
  announce,
  onChoose,
  renderEnding,
}: {
  scenario: Scenario
  scene: Scene
  sceneNumber: number
  reduceMotion: boolean
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

      {cast.length > 0 && (
        <div className="flex justify-around rounded-lg bg-secondary px-4 py-6">
          {cast.map((c) => (
            <CharacterPortrait key={c.id} character={c} speaking={c.id === line.speaker} />
          ))}
        </div>
      )}

      <DialogueBox
        key={lineIndex}
        speaker={speaker?.name}
        text={line.text}
        revealed={revealed}
        onRevealed={onRevealed}
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
