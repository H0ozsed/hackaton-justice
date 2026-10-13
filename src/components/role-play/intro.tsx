import { AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import type { Scenario } from '@/shared/role-play'

import { DialogueBox } from './dialogue-box'
import { useHydrated } from './pixel/cutaway'
import { OpeningArt } from './pixel/opening'
import { StageFrame } from './pixel/stage'
import { RichText, toPlainText } from './rich-text'

/**
 * Before the game: the animated opening of the scenario, shot by shot with captions
 * ("Suivant"), or its intro text when it has no opening. Characters are not listed: they
 * are discovered during the game. "Commencer" starts the game at any time.
 */
export function Intro({
  scenario,
  reduceMotion,
  announce,
  onStart,
}: {
  scenario: Scenario
  reduceMotion: boolean
  announce: (text: string) => void
  onStart: () => void
}) {
  // The server cannot know the motion preference: animations start after hydration.
  const hydrated = useHydrated()
  const still = reduceMotion || !hydrated
  const shots = scenario.opening
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const shot = shots?.[index]
  const isLast = !shots || index === shots.length - 1

  // The first caption is read with the page; the next ones are announced.
  useEffect(() => {
    if (shot && index > 0) announce(`Narrateur : ${toPlainText(shot.text)}`)
  }, [announce, index, shot])

  const next = () => {
    if (!revealed && !still) return setRevealed(true)
    setIndex((i) => i + 1)
    setRevealed(false)
  }

  return (
    <section aria-labelledby="intro-heading" className="flex flex-col gap-4">
      <h2 id="intro-heading" className="text-xl font-bold">
        {scenario.title}
      </h2>

      {shot ? (
        <div className="overflow-hidden rounded-lg border-4 border-[#1e1f33] shadow-[4px_4px_0_0_var(--color-foreground)]">
          <StageFrame
            testId="opening"
            overlayAt="bottom"
            art={
              <AnimatePresence initial={false}>
                <OpeningArt key={index} shot={shot.shot} still={still} title={scenario.title} />
              </AnimatePresence>
            }
            overlay={
              <div
                data-testid="caption"
                className="light-colors max-w-[92%] self-start border-[3px] border-[#1e1f33] bg-[#fff3d0] px-3 py-2 text-sm text-black shadow-[3px_3px_0_0_#1e1f33] sm:max-w-[75%] sm:text-base"
              >
                <DialogueBox
                  key={index}
                  text={shot.text}
                  revealed={revealed || still}
                  onRevealed={() => setRevealed(true)}
                />
              </div>
            }
          />
        </div>
      ) : (
        <p className="text-lg">
          <RichText text={scenario.intro} />
        </p>
      )}

      <p className="text-muted-foreground">
        Lisez les dialogues puis choisissez ce que vous feriez. Vos choix restent sur votre
        appareil.
      </p>
      <div className="flex flex-wrap justify-end gap-2">
        {!isLast && (
          <Button variant="outline" onClick={next}>
            Suivant
          </Button>
        )}
        <Button onClick={onStart}>Commencer</Button>
      </div>
    </section>
  )
}
