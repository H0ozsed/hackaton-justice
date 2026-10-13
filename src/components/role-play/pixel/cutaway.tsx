import { motion } from 'framer-motion'
import { useSyncExternalStore } from 'react'

import { characterSprite } from './characters'
import { PALETTE as P, textSprite, withOutline, type Sprite } from './pixel-art'
import { PixelSprite } from './pixel-sprite'

// Cross-section of the building, a shot of the opening (#76): the neighbour plays the
// drums upstairs while Camille tries to sleep downstairs. Decorative: the caption says it.

type Rect = readonly [number, number, number, number, string]

const NOTE: Sprite = {
  rows: withOutline(['..XXX', '..X.X', '..X..', '..X..', 'XXX..', 'XXX..']),
  colors: { X: P.white, o: P.ink },
}

const BUILDING: Rect[] = [
  // Night sky, moon and stars.
  [0, 0, 192, 108, P.g0],
  [166, 8, 10, 10, P.l3],
  [164, 8, 4, 6, P.g0],
  ...[
    [8, 12],
    [30, 6],
    [186, 30],
    [4, 44],
    [184, 60],
    [150, 4],
  ].map(([x, y]): Rect => [x!, y!, 1, 1, P.white]),
  // Roof and outer walls.
  [12, 4, 168, 8, P.ink],
  [14, 5, 164, 6, P.q1],
  [14, 12, 164, 92, P.ink],
  // Upstairs: the neighbour's flat.
  [18, 14, 156, 36, P.m2],
  [18, 14, 156, 2, P.m1],
  [18, 46, 156, 4, P.p1],
  [30, 20, 18, 16, P.ink],
  [31, 21, 16, 14, P.g1],
  [38, 21, 1, 14, P.white],
  [150, 18, 14, 18, P.ink],
  [151, 19, 12, 16, P.marianneRed],
  [154, 22, 6, 6, P.l1],
  // Drum kit: cymbal, tom, snare, bass drum.
  [128, 26, 14, 2, P.l1],
  [134, 28, 2, 18, P.ink],
  [112, 28, 9, 5, P.ink],
  [113, 29, 7, 3, P.marianneRed],
  [100, 36, 11, 5, P.ink],
  [101, 37, 9, 3, P.q4],
  [104, 41, 2, 5, P.ink],
  [112, 32, 18, 14, P.ink],
  [113, 33, 16, 13, P.marianneRed],
  [115, 35, 12, 9, P.white],
  [119, 38, 4, 3, P.ink],
  // Rounded corners of the bass drum.
  [112, 32, 2, 2, P.m2],
  [128, 32, 2, 2, P.m2],
  // Floor between the two flats.
  [14, 50, 164, 6, P.q2],
  [14, 50, 164, 1, P.ink],
  [14, 55, 164, 1, P.ink],
  // Downstairs: Camille's bedroom.
  [18, 56, 156, 44, P.f3],
  [18, 96, 156, 4, P.p1],
  [100, 72, 4, 24, P.p0],
  [104, 80, 54, 8, P.ink],
  [105, 81, 52, 6, P.white],
  [118, 84, 40, 8, P.ink],
  [119, 85, 38, 6, P.f1],
  [104, 92, 54, 4, P.p0],
  [162, 82, 10, 14, P.p1],
  [165, 74, 4, 8, P.l1],
  [140, 62, 18, 14, P.ink],
  [141, 63, 16, 12, P.g0],
  [148, 63, 1, 12, P.white],
  // Street.
  [0, 104, 192, 4, P.q1],
]

const subscribe = () => () => {}

/**
 * False on the server and while hydrating, true afterwards. The intro is rendered by the
 * server, which cannot know the motion preference: animations start after hydration only,
 * so both renders match.
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}

/** Cut-away of the building, drawn in the 192 × 108 coordinates of the stage. */
export function CutawayArt({ still }: { still: boolean }) {
  const reduceMotion = still
  return (
    <g data-shot="cutaway">
      {BUILDING.map(([x, y, width, height, fill], i) => (
        <rect key={i} x={x} y={y} width={width} height={height} fill={fill} />
      ))}

      {/* The neighbour drums, the floor shakes, Camille is awake. */}
      <motion.g
        animate={reduceMotion ? undefined : { y: [0, -1, 0] }}
        transition={{ duration: 0.3, repeat: Infinity }}
      >
        <PixelSprite
          sprite={characterSprite('neighbor', { emotion: 'happy' })}
          x={78}
          y={46 - 34}
        />
      </motion.g>
      <PixelSprite sprite={characterSprite('player', { emotion: 'tired' })} x={62} y={96 - 34} />

      {[
        { x: 86, delay: 0 },
        { x: 112, delay: 0.5 },
        { x: 130, delay: 1 },
      ].map(({ x, delay }) => (
        <motion.g
          key={x}
          initial={reduceMotion ? false : { y: 0, opacity: 0 }}
          animate={reduceMotion ? undefined : { y: [0, 12], opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, delay, repeat: Infinity }}
        >
          <PixelSprite sprite={NOTE} x={x} y={58} />
        </motion.g>
      ))}

      <g transform="translate(20 58) scale(2)">
        <motion.g
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          animate={reduceMotion ? undefined : { scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          <PixelSprite sprite={textSprite('BOUM', P.l1)} />
        </motion.g>
      </g>
    </g>
  )
}
