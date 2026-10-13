import { useEffect, useState } from 'react'

import { RichText, toPlainText } from './rich-text'

/** Delay between two letters of the progressive text. */
const LETTER_MS = 25

/**
 * Content of a speech bubble: the speaker, then the line written letter by letter. `revealed` shows it all at once
 * (skip button, or reduced motion); `onRevealed` is called when the whole line shows.
 * The typed text is hidden from screen readers: the full line is announced by the
 * live region of the scene, and once revealed its glossary terms become usable.
 */
export function DialogueBox({
  speaker,
  role,
  text,
  revealed,
  onRevealed,
  onLetter,
}: {
  /** Name of the speaker, or undefined for the narrator. */
  speaker?: string
  /** Shown after the name the first time a character speaks ("votre voisin du dessus"). */
  role?: string
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
    <>
      <p className="font-bold text-primary">
        {speaker ?? 'Narrateur'}
        {role && <span className="font-normal text-slate-blue"> ({role})</span>}
      </p>
      {revealed ? (
        <p>
          <RichText text={text} />
        </p>
      ) : (
        // The whole line is laid out invisibly so the bubble keeps its size while typing.
        <p className="relative" aria-hidden>
          <span className="invisible">{plain}</span>
          <span className="absolute inset-0">{plain.slice(0, letters)}</span>
        </p>
      )}
    </>
  )
}
