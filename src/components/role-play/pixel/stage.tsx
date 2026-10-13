import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'
import type {
  Action,
  Avatar,
  Character,
  Effect,
  Emotion,
  Location,
  Period,
} from '@/shared/role-play'

import { ActionArt } from './actions'

import { characterSprite, CHARACTER_SIZE } from './characters'
import { StageEffect } from './effects'
import { LocationBackdrop, STAGE } from './locations'
import { PALETTE as P } from './pixel-art'
import { PixelSprite } from './pixel-sprite'

// Pixel-art stage of a scene (#76): the place, the lighting, the characters, the effect of
// the current line, and the line itself in a comic speech bubble. The drawing is decorative
// (aria-hidden); the bubble is real text (read by screen readers, glossary terms usable).

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

/**
 * Frame shared by the stage and the opening: the drawing fills a 16:9 box anchored at the
 * bottom; the overlay (bubble, caption) sits on top of it. When the overlay needs more room
 * (long line, enlarged text, narrow screen) the box grows upwards instead of hiding the
 * characters.
 */
export function StageFrame({
  testId,
  art,
  overlay,
  overlayAt = 'top',
  decor,
}: {
  testId?: string
  /** SVG content, in the 192 × 108 coordinates of the stage. */
  art: React.ReactNode
  overlay?: React.ReactNode
  /**
   * top: under the HUD (captions); above-cast: just over the characters' heads (bubbles);
   * bottom: at the bottom of the picture, under it on narrow screens.
   */
  overlayAt?: 'top' | 'above-cast' | 'bottom'
  /** Decorative HTML over everything (title card). */
  decor?: React.ReactNode
}) {
  return (
    <div data-testid={testId} className="relative grid w-full overflow-hidden bg-[#1e1f33]">
      <div aria-hidden className="col-start-1 row-start-1 aspect-video" />
      <svg
        aria-hidden
        viewBox={`0 0 ${STAGE.width} ${STAGE.height}`}
        preserveAspectRatio="xMidYMax meet"
        shapeRendering="crispEdges"
        className="col-start-1 row-start-1 size-full"
        focusable="false"
      >
        {art}
      </svg>
      <div
        className={cn(
          'relative col-start-1 row-start-1 flex flex-col p-2 sm:p-3',
          // Narrow screens: a bottom caption goes under the picture instead of over it.
          overlayAt === 'bottom' && 'max-sm:row-start-2',
        )}
      >
        {overlayAt !== 'top' && (
          <div aria-hidden className={cn('grow', overlayAt === 'bottom' && 'max-sm:hidden')} />
        )}
        {overlay}
        {/* Room left for the characters under the overlay. */}
        {overlayAt !== 'bottom' && <div aria-hidden className="aspect-[192/46] shrink-0" />}
      </div>
      {decor}
    </div>
  )
}

/** What the bubble says: a character's line, or a narration caption. */
export type Speech = { kind: 'speech' | 'caption'; content: React.ReactNode }

/**
 * Comic speech bubble whose tail points at the speaker (`tailAt`: % of the stage width),
 * or a narration caption (no tail).
 */
function Bubble({ speech, tailAt }: { speech: Speech; tailAt?: number }) {
  if (speech.kind === 'caption' || tailAt === undefined) {
    return (
      <div
        data-testid="caption"
        className="max-w-[92%] self-start border-[3px] border-[#1e1f33] bg-[#fff3d0] px-3 py-2 text-sm text-black shadow-[3px_3px_0_0_#1e1f33] sm:max-w-[75%] sm:text-base"
      >
        {speech.content}
      </div>
    )
  }
  const left = tailAt < 50
  return (
    <>
      <div
        data-testid="bubble"
        className={cn(
          'relative z-10 w-fit max-w-[92%] min-w-[55%] rounded-2xl border-[3px] border-[#1e1f33] bg-white px-3 py-2 text-sm text-black sm:max-w-[75%] sm:text-base',
          left ? 'self-start' : 'self-end',
        )}
      >
        {speech.content}
      </div>
      {/* Tail: spans the stage width, so it can be placed over the speaker. */}
      <div aria-hidden className="relative z-20 -mx-2 -mt-[3px] h-3 sm:-mx-3 sm:h-4">
        <svg
          viewBox="0 0 16 12"
          preserveAspectRatio="none"
          className="absolute top-0 h-full w-4 sm:w-5"
          style={{ left: `calc(${tailAt}% - ${left ? 2 : 14}px)` }}
        >
          <polygon points={left ? '2,0 14,0 4,12' : '2,0 14,0 12,12'} fill="#ffffff" />
          <polyline
            points={left ? '2,0 4,12 14,0' : '2,0 12,12 14,0'}
            fill="none"
            stroke="#1e1f33"
            strokeWidth={3}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </>
  )
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
  speech,
  action,
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
  /** The current line, shown in a bubble pointing at the speaker. */
  speech?: Speech
  /** Animation of the player's last choice, played instead of the cast. */
  action?: { action: Action; partner?: Avatar }
}) {
  const frame = useFrame(!reduceMotion && !action)
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
  const speaker = placed.find((p) => p.character.id === speakerId)
  const tailAt =
    speaker && !action ? ((speaker.x + CHARACTER_SIZE.width / 2) / STAGE.width) * 100 : undefined
  const shake = (effect === 'drums' || action?.action === 'broom') && !reduceMotion

  const art = (
    <>
      <motion.g
        key={`shake-${action ? 'action' : effectKey}`}
        animate={shake ? { x: [0, -1.5, 1.5, -1, 1, 0], y: [0, 1, 0, 1, 0, 0] } : undefined}
        transition={{ duration: 0.45, repeat: Infinity, repeatDelay: 0.35 }}
      >
        <LocationBackdrop location={location} period={period} />
      </motion.g>

      {action ? (
        <ActionArt action={action.action} partner={action.partner} />
      ) : (
        placed.map(({ character, x, flip }, i) => {
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
              </motion.g>
            </motion.g>
          )
        })
      )}

      {effect && !action && (
        <g key={`effect-${effectKey}`}>
          <StageEffect effect={effect} still={reduceMotion} />
        </g>
      )}
    </>
  )

  return (
    <StageFrame
      testId="stage"
      art={art}
      overlay={speech && <Bubble speech={speech} tailAt={tailAt} />}
      overlayAt={speech?.kind === 'speech' && tailAt !== undefined ? 'above-cast' : 'top'}
      decor={titleCard && !reduceMotion && !action && <TitleCard {...titleCard} />}
    />
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
          aria-hidden
          data-testid="title-card"
          className="pointer-events-none absolute inset-x-0 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-1 border-y-4 border-[#1e1f33] bg-[#1e1f33]/90 px-4 py-2 text-center text-white sm:py-3"
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
