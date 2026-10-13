import { motion } from 'framer-motion'

import type { Effect } from '@/shared/role-play'

import { PALETTE as P, textSprite, withOutline, type Sprite } from './pixel-art'
import { PixelSprite } from './pixel-sprite'

// Visual effects played with a line of dialogue (#76), drawn on the 192 × 108 stage.
// Decorative only: the line itself always says what happens. With reduced motion, each
// effect is shown as a still picture.

const NOTE: Sprite = {
  rows: withOutline(['..XXX', '..X.X', '..X..', '..X..', 'XXX..', 'XXX..']),
  colors: { X: P.white, o: P.ink },
}

const PAPER: Sprite = {
  rows: withOutline([
    'WWWWWWW',
    'WLLLLWW',
    'WWWWWWW',
    'WLLLLLW',
    'WWWWWWW',
    'WLLLWWW',
    'WWWWWWW',
    'WWWWSSW',
    'WWWWSSW',
  ]),
  colors: { W: P.white, L: P.g2, S: P.franceBlue, o: P.ink },
}

const PHONE: Sprite = {
  rows: withOutline(['KKKK', 'KSSK', 'KSSK', 'KSSK', 'KKKK', 'KWKK']),
  colors: { K: P.q1, S: P.f2, W: P.white, o: P.ink },
}

/** A pixel word, scaled `size` times, that pops in at `delay` and repeats. */
function Word({
  text,
  x,
  y,
  size = 2,
  color = P.l1,
  delay = 0,
  still,
}: {
  text: string
  x: number
  y: number
  size?: number
  color?: string
  delay?: number
  still: boolean
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      <motion.g
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        initial={still ? false : { scale: 0, opacity: 0 }}
        animate={
          still
            ? undefined
            : { scale: [0, 1.25, 1, 1], opacity: [0, 1, 1, 0], rotate: [-8, 4, 0, 0] }
        }
        transition={{ duration: 1.1, delay, repeat: Infinity, repeatDelay: 0.5 }}
      >
        <PixelSprite sprite={textSprite(text, color)} />
      </motion.g>
    </g>
  )
}

function Drums({ still }: { still: boolean }) {
  return (
    <g data-effect="drums">
      <Word text="BOUM" x={14} y={8} still={still} />
      <Word text="TCHAK" x={128} y={10} still={still} delay={0.55} color={P.h1} />
      {[52, 92, 150].map((x, i) => (
        <motion.g
          key={x}
          initial={still ? false : { y: 0, opacity: 0 }}
          animate={still ? undefined : { y: [0, 30], opacity: [0, 1, 0], rotate: [-10, 10] }}
          transition={{ duration: 1.6, delay: i * 0.4, repeat: Infinity, ease: 'easeIn' }}
        >
          <PixelSprite sprite={NOTE} x={x} y={8 + (i % 2) * 6} />
        </motion.g>
      ))}
    </g>
  )
}

function Knock({ still }: { still: boolean }) {
  return (
    <g data-effect="knock">
      <Word text="TOC" x={132} y={20} still={still} />
      <Word text="TOC" x={150} y={34} still={still} delay={0.3} />
    </g>
  )
}

function Door({ still }: { still: boolean }) {
  return (
    <g data-effect="door">
      <Word text="CLAC !" x={130} y={14} still={still} color={P.white} />
      {[
        [124, 22, 6, 1],
        [126, 28, 5, 1],
        [176, 22, 6, 1],
      ].map(([x, y, w, h]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} fill={P.white} />
      ))}
    </g>
  )
}

function Phone({ still }: { still: boolean }) {
  return (
    <g data-effect="phone">
      <motion.g
        animate={still ? undefined : { x: [-1, 1, -1, 1, 0] }}
        transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 0.6 }}
      >
        <PixelSprite sprite={PHONE} x={54} y={58} />
      </motion.g>
      <Word text="DRING" x={46} y={38} still={still} />
    </g>
  )
}

function Paper({ still }: { still: boolean }) {
  return (
    <g data-effect="paper">
      <motion.g
        initial={still ? false : { y: -40, x: 0, rotate: -20 }}
        animate={still ? undefined : { y: 0, x: [0, 8, -6, 0], rotate: [-20, 15, -10, 0] }}
        transition={{ duration: 1.8, ease: 'easeOut' }}
      >
        <PixelSprite sprite={PAPER} x={88} y={40} />
      </motion.g>
    </g>
  )
}

function Sleep({ still }: { still: boolean }) {
  return (
    <g data-effect="sleep">
      {[
        { x: 50, y: 52, size: 1 },
        { x: 58, y: 42, size: 2 },
        { x: 70, y: 28, size: 3 },
      ].map(({ x, y, size }, i) => (
        <motion.g
          key={x}
          initial={still ? false : { opacity: 0, y: 8 }}
          animate={still ? undefined : { opacity: [0, 1, 0], y: [8, 0, -6] }}
          transition={{ duration: 2.4, delay: i * 0.6, repeat: Infinity }}
        >
          <g transform={`translate(${x} ${y}) scale(${size})`}>
            <PixelSprite sprite={textSprite('Z', P.f3)} />
          </g>
        </motion.g>
      ))}
    </g>
  )
}

const EFFECTS: Record<Effect, (props: { still: boolean }) => React.ReactNode> = {
  drums: Drums,
  knock: Knock,
  door: Door,
  phone: Phone,
  paper: Paper,
  sleep: Sleep,
}

export function StageEffect({ effect, still }: { effect: Effect; still: boolean }) {
  const Play = EFFECTS[effect]
  return <Play still={still} />
}
