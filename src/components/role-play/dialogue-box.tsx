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
}: {
  /** Name of the speaker, or undefined for the narrator. */
  speaker?: string
  text: string
  revealed: boolean
  onRevealed: () => void
}) {
  const plain = toPlainText(text)
  const [letters, setLetters] = useState(0)

  useEffect(() => {
    if (revealed) return
    if (letters >= plain.length) {
      onRevealed()
      return
    }
    const timer = setTimeout(() => setLetters((n) => n + 1), LETTER_MS)
    return () => clearTimeout(timer)
  }, [letters, plain.length, revealed, onRevealed])

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
