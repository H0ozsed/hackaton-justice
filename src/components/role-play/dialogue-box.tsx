import { useEffect, useState } from 'react'

import { RichText, toPlainText } from './rich-text'

/** Delay between two letters of the progressive text. */
const LETTER_MS = 25

/**
 * One line of dialogue, written letter by letter. `revealed` shows it all at once
 * (skip button, or reduced motion); `onRevealed` is called when the whole line shows.
 * The typed text is hidden from screen readers: the full line is announced by the
 * live region of the scene, and once revealed its glossary terms become usable.
 */
export function DialogueBox({
  speaker,
  text,
  revealed,
  onRevealed,
  onLetter,
}: {
  /** Name of the speaker, or undefined for the narrator. */
  speaker?: string
  text: string
  revealed: boolean
  onRevealed: () => void
  /** Called with each letter as it is typed (text sounds). */
  onLetter?: (letter: string, index: number) => void
}) {
  const plain = toPlainText(text)
  const [letters, setLetters] = useState(0)

  useEffect(() => {
    if (revealed) return
    if (letters >= plain.length) {
      onRevealed()
      return
    }
    const timer = setTimeout(() => {
      onLetter?.(plain[letters]!, letters)
      setLetters((n) => n + 1)
    }, LETTER_MS)
    return () => clearTimeout(timer)
  }, [letters, plain, revealed, onRevealed, onLetter])

  return (
    <div className="min-h-32 rounded-lg border-4 border-double border-foreground bg-background p-4 shadow-[4px_4px_0_0_var(--color-foreground)]">
      <p className="mb-2 font-bold text-primary">{speaker ?? 'Narrateur'}</p>
      {revealed ? (
        <p className="text-lg">
          <RichText text={text} />
        </p>
      ) : (
        <p className="text-lg" aria-hidden>
          {plain.slice(0, letters)}
        </p>
      )}
    </div>
  )
}
