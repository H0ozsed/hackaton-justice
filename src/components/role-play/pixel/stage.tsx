import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

import type { Character, Effect, Emotion, Location, Period } from '@/shared/role-play'

import { characterSprite, CHARACTER_SIZE } from './characters'
import { StageEffect } from './effects'
import { LocationBackdrop, STAGE } from './locations'
import { PALETTE as P, withOutline, type Sprite } from './pixel-art'
import { PixelSprite } from './pixel-sprite'

// Pixel-art stage of a scene (#76): the place, the lighting, the characters and the
// effect of the current line. Entirely decorative (aria-hidden): every piece of
// information is in the heading, the dialogue box and the live region of the game.

/** Delay between two animation frames of the faces (talking mouth, blinking). */
export const FRAME_MS = 120

/** Where the characters stand: the player on the left, the others on the right. */
const FEET_Y = 99
const PLAYER_X = 26
const OTHERS_X: Record<number, number[]> = {
  0: [],
  1: [142],
  2: [118, 152],
  3: [96, 126, 156],
}

const MARKER: Sprite = {
  rows: withOutline(['XXXXX', '.XXX.', '..X..']),
  colors: { X: P.l1, o: P.ink },
}

/** Animation frame counter, stopped with reduced motion. */
function useFrame(running: boolean) {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => setFrame((f) => f + 1), FRAME_MS)
    return () => clearInterval(timer)
  }, [running])
  return frame
}

export function Stage({
  cast,
  speakerId,
  emotion,
  talking,
  effect,
  effectKey,
  location,
  period,
  reduceMotion,
  titleCard,
}: {
  /** Characters on stage; the player (if any) is drawn on the left. */
  cast: readonly Character[]
  /** Id of the character who says the current line (undefined: narrator). */
  speakerId?: string
  /** Face of the speaker. */
  emotion?: Emotion
  /** True while the line is being typed: the speaker's mouth moves. */
  talking: boolean
  effect?: Effect
  /** Changes with each line, so the effect plays again. */
  effectKey: number
  location?: Location
  period?: Period
  reduceMotion: boolean
  /** Shown over the stage when the scene starts (not with reduced motion). */
  titleCard?: { label: string; setting?: string }
}) {
  const frame = useFrame(!reduceMotion)
  const player = cast.find((c) => c.avatar === 'player')
  const others = cast.filter((c) => c !== player).slice(0, 3)
  const placed = [
    ...(player ? [{ character: player, x: PLAYER_X, flip: false }] : []),
    ...others.map((character, i) => ({
      character,
      x: OTHERS_X[others.length]![i]!,
      flip: true,
    })),
  ]
  const shake = effect === 'drums' && !reduceMotion

  return (
    <div
      aria-hidden
      data-testid="stage"
      className="relative aspect-video w-full overflow-hidden bg-[#1e1f33]"
    >
      <svg
        viewBox={`0 0 ${STAGE.width} ${STAGE.height}`}
        shapeRendering="crispEdges"
        className="absolute inset-0 size-full"
        focusable="false"
      >
        <motion.g
          key={`shake-${effectKey}`}
          animate={shake ? { x: [0, -1.5, 1.5, -1, 1, 0], y: [0, 1, 0, 1, 0, 0] } : undefined}
          transition={{ duration: 0.45, repeat: Infinity, repeatDelay: 0.35 }}
        >
          <LocationBackdrop location={location} period={period} />
        </motion.g>

        {placed.map(({ character, x, flip }, i) => {
          const speaking = character.id === speakerId
          const sprite = characterSprite(character.avatar, {
            emotion: speaking ? emotion : undefined,
            talking: speaking && talking && frame % 2 === 0,
            blink: !reduceMotion && (frame + i * 11) % 30 === 0,
          })
          const y = FEET_Y - CHARACTER_SIZE.height
          return (
            <motion.g
              key={character.id}
              data-character={character.id}
              data-speaking={speaking || undefined}
              initial={reduceMotion ? false : { x: flip ? 70 : -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.1, ease: 'easeOut' }}
            >
              <rect x={x + 2} y={FEET_Y - 1} width={14} height={2} fill={P.ink} opacity={0.3} />
              <motion.g
                animate={reduceMotion ? undefined : { y: speaking ? [0, -1.5, 0] : [0, -1, 0] }}
                transition={{ duration: speaking ? 0.5 : 1.4, repeat: Infinity, delay: i * 0.3 }}
              >
                <PixelSprite sprite={sprite} x={x} y={y} flip={flip} />
                {speaking && <PixelSprite sprite={MARKER} x={x + 6} y={y - 9} />}
              </motion.g>
            </motion.g>
          )
        })}

        {effect && (
          <g key={`effect-${effectKey}`}>
            <StageEffect effect={effect} still={reduceMotion} />
          </g>
        )}
      </svg>

      {titleCard && !reduceMotion && <TitleCard {...titleCard} />}
    </div>
  )
}

/** "Scène 2 — Sur le palier": shown for a moment when a scene starts, never blocks. */
function TitleCard({ label, setting }: { label: string; setting?: string }) {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          data-testid="title-card"
          className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center gap-1 border-y-4 border-[#1e1f33] bg-[#1e1f33]/90 px-4 py-2 text-center text-white sm:py-3"
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          exit={{ opacity: 0, scaleY: 0 }}
          transition={{ duration: 0.25 }}
        >
          <span className="text-lg font-bold sm:text-3xl">{label}</span>
          {setting && <span className="text-xs sm:text-base">{setting}</span>}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
