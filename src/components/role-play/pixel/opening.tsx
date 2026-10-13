import { motion } from 'framer-motion'
import { useId } from 'react'

import type { OpeningShot } from '@/shared/role-play'

import { characterSprite } from './characters'
import { CutawayArt } from './cutaway'
import { NOTE, StageEffect } from './effects'
import { LocationBackdrop } from './locations'
import { PALETTE as P, textSprite, withOutline, type Sprite } from './pixel-art'
import { PixelSprite } from './pixel-sprite'

// Shots of the animated opening (#76), drawn in the 192 × 108 coordinates of the stage.
// Decorative: each shot comes with a caption in text.

type Rect = readonly [number, number, number, number, string]

const rects = (list: readonly Rect[]) =>
  list.map(([x, y, width, height, fill], i) => (
    <rect key={i} x={x} y={y} width={width} height={height} fill={fill} />
  ))

const CAT: Sprite = {
  rows: withOutline(['K.K........', 'KKK.......K', 'KYKKKKKKKK.', '.KKKKKKKKK.', '.K.K...K.K.']),
  colors: { K: P.q1, Y: P.l1, o: P.ink },
}

/** Title in the pixel font: capitals without accents, cut into lines of ten letters at most. */
export function titleLines(title: string): string[] {
  const words = title.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().split(/\s+/)
  const lines: string[] = []
  for (const word of words) {
    const last = lines.at(-1)
    if (last !== undefined && `${last} ${word}`.length <= 10)
      lines[lines.length - 1] = `${last} ${word}`
    else lines.push(word)
  }
  return lines
}

const WINDOWS_X = [60, 78, 106, 124]
const FLOORS_Y = [44, 58, 72] // top floor (the drummer), Camille's floor, first floor

function Street({ still, title }: { still: boolean; title: string }) {
  const glow = useId()
  const lines = titleLines(title)
  return (
    <g data-shot="street">
      <defs>
        <radialGradient id={glow}>
          <stop offset="0%" stopColor={P.l1} stopOpacity={0.6} />
          <stop offset="100%" stopColor={P.l1} stopOpacity={0} />
        </radialGradient>
      </defs>
      {rects([
        // Night sky, darker at the top.
        [0, 0, 192, 108, P.g0],
        [0, 0, 192, 26, P.ink],
        [0, 26, 192, 4, P.g0],
        [0, 70, 192, 22, P.g1],
        // Moon.
        [164, 8, 10, 10, P.l3],
        [162, 8, 4, 6, P.ink],
        // Skyline behind.
        [0, 52, 22, 40, P.ink],
        [18, 42, 26, 50, P.ink],
        [146, 48, 22, 44, P.ink],
        [166, 38, 26, 54, P.ink],
        [6, 58, 2, 3, P.l1],
        [28, 50, 2, 3, P.l1],
        [36, 66, 2, 3, P.l1],
        [152, 56, 2, 3, P.l1],
        [176, 46, 2, 3, P.l1],
        [184, 70, 2, 3, P.l1],
        // The building: cornice, facade, door.
        [50, 36, 92, 5, P.ink],
        [51, 37, 90, 3, P.q1],
        [52, 41, 88, 51, P.ink],
        [53, 41, 86, 51, P.r2],
        [53, 41, 86, 2, P.a2],
        [90, 80, 12, 12, P.ink],
        [91, 81, 10, 11, P.p0],
        [99, 86, 1, 2, P.l1],
        [88, 78, 16, 2, P.q1],
        // Windows (dark), with their sills.
        ...FLOORS_Y.flatMap((y) =>
          WINDOWS_X.flatMap((x): Rect[] => [
            [x - 1, y - 1, 10, 11, P.ink],
            [x, y, 8, 9, P.g1],
            [x + 4, y, 1, 9, P.ink],
            [x - 2, y + 10, 12, 1, P.q1],
          ]),
        ),
        // Ground floor windows.
        [60, 80, 8, 8, P.g1],
        [78, 80, 8, 8, P.g1],
        [106, 80, 8, 8, P.l3],
        [124, 80, 8, 8, P.g1],
        // Pavement and road.
        [0, 92, 192, 6, P.q3],
        [0, 92, 192, 1, P.q2],
        [0, 98, 192, 10, P.q1],
        ...[8, 40, 72, 104, 136, 168].map((x): Rect => [x, 103, 14, 1, P.q4]),
        // Street lamp.
        [172, 60, 2, 32, P.ink],
        [168, 56, 10, 4, P.ink],
        [169, 57, 8, 3, P.l1],
      ])}
      <circle cx={173} cy={60} r={22} fill={`url(#${glow})`} />

      {/* Camille's window: a dim lamp. Upstairs: lit, pulsing with the drums. */}
      {rects([
        [78, 58, 4, 9, P.m2],
        [83, 58, 3, 9, P.m2],
      ])}
      {[WINDOWS_X[1]!, WINDOWS_X[2]!].map((x, i) => (
        <motion.rect
          key={x}
          x={x}
          y={FLOORS_Y[0]}
          width={8}
          height={9}
          fill={P.l1}
          initial={{ opacity: 1 }}
          animate={still ? undefined : { opacity: [1, 0.55, 1] }}
          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.25 }}
        />
      ))}
      {rects([WINDOWS_X[1]!, WINDOWS_X[2]!].map((x): Rect => [x + 4, FLOORS_Y[0]!, 1, 9, P.ink]))}
      {[90, 112].map((x, i) => (
        <motion.g
          key={x}
          initial={still ? false : { y: 0, opacity: 0 }}
          animate={still ? undefined : { y: [0, -14], opacity: [0, 1, 0] }}
          transition={{ duration: 1.6, delay: i * 0.8, repeat: Infinity }}
        >
          <PixelSprite sprite={NOTE} x={x} y={40} />
        </motion.g>
      ))}

      {/* A cat crossing the pavement. */}
      <motion.g
        initial={{ x: still ? 30 : -20 }}
        animate={still ? undefined : { x: 210 }}
        transition={{ duration: 11, repeat: Infinity, ease: 'linear', delay: 1 }}
      >
        <PixelSprite sprite={CAT} x={0} y={86} />
      </motion.g>

      {/* Title. */}
      {lines.map((line, i) => {
        const sprite = textSprite(line, P.l1)
        const width = sprite.rows[0]!.length * 2
        return (
          <g
            key={line}
            transform={`translate(${Math.round((192 - width) / 2)} ${3 + i * 15}) scale(2)`}
          >
            <motion.g
              initial={still ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.4 }}
            >
              <PixelSprite sprite={sprite} />
            </motion.g>
          </g>
        )
      })}
    </g>
  )
}

function Bedroom({ still }: { still: boolean }) {
  return (
    <g data-shot="bedroom">
      <LocationBackdrop location="bedroom" period="night" />
      <PixelSprite sprite={characterSprite('player', { emotion: 'tired' })} x={70} y={65} />
      <StageEffect effect="drums" still={still} />
    </g>
  )
}

/** One shot of the opening, with a slow zoom (not with reduced motion). */
export function OpeningArt({
  shot,
  still,
  title,
}: {
  shot: OpeningShot
  still: boolean
  title: string
}) {
  const art = {
    street: <Street still={still} title={title} />,
    cutaway: <CutawayArt still={still} />,
    bedroom: <Bedroom still={still} />,
  }[shot]
  return (
    <motion.g
      initial={still ? false : { opacity: 0, scale: 1 }}
      animate={still ? { opacity: 1 } : { opacity: 1, scale: 1.06 }}
      transition={{ opacity: { duration: 0.6 }, scale: { duration: 9, ease: 'linear' } }}
    >
      {art}
    </motion.g>
  )
}
