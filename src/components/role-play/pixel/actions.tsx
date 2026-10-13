import { motion } from 'framer-motion'

import type { Action, Avatar, Emotion } from '@/shared/role-play'

import { characterSprite, CHARACTER_SIZE } from './characters'
import { PAPER, PHONE, Word } from './effects'
import { PALETTE as P, withOutline, type Sprite } from './pixel-art'
import { PixelSprite } from './pixel-sprite'

// Short animations of what the player does after a choice (#76): played on the stage of
// the scene where the choice was made, before the next scene. Decorative: the caption
// says the choice in text. Not played at all with reduced motion.

/** Length of an action animation; the scene goes on after it (or when skipped). */
export const ACTION_MS = 3200

const FEET_Y = 99
const TOP_Y = FEET_Y - CHARACTER_SIZE.height

const sprite = (rows: string[], colors: Record<string, string>): Sprite => ({
  rows: withOutline(rows),
  colors: { ...colors, o: P.ink },
})

const HEART = sprite(['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'], {
  X: P.marianneRed,
})

const BOX = sprite(
  [
    'YYYYYYYYYY',
    'YYYYTTYYYY',
    'XXXXTTXXXX',
    'XXXXXXXXXX',
    'XXXXXXXXXX',
    'XXXXXXXXXX',
    'XXXXXXXXXX',
  ],
  { X: P.l1, Y: P.m1, T: P.a2 },
)

const CALENDAR = sprite(
  [
    '.K......K.',
    'RRRRRRRRRR',
    'RRRRRRRRRR',
    'WWWWWWWWWW',
    'WGWGWGWGWW',
    'WWWWWWWWWW',
    'WGWGWGWGWW',
    'WWWWWWWWWW',
    'WGWGWGWGWW',
    'WWWWWWWWWW',
  ],
  { R: P.marianneRed, W: P.white, G: P.g2, K: P.q1 },
)

const CHECK = sprite(['.....X', '....XX', 'X..XX.', 'XXXX..', '.XX...'], { X: P.e0 })

const GAVEL_HEAD = sprite(['BBBBBBBBBB', 'BAABBBBAAB', 'BBBBBBBBBB', 'BBBBBBBBBB'], {
  B: P.p0,
  A: P.l1,
})

const BROOM = sprite(
  // Held by the bristles, the handle hits the ceiling.
  [...Array.from({ length: 70 }, () => '..SS..'), 'HHHHHH', 'HhHhHh', 'HhHhHh', 'HHHHHH'],
  { H: P.a1, h: P.a2, S: P.p1 },
)

/** A character walking or standing, with a step bob while it moves. */
function Walker({
  avatar,
  emotion,
  from,
  to = from,
  delay = 0,
  duration = 1.6,
  flip = false,
  talking = false,
}: {
  avatar: Avatar
  emotion?: Emotion
  from: number
  to?: number
  delay?: number
  duration?: number
  flip?: boolean
  talking?: boolean
}) {
  const moving = from !== to
  return (
    <motion.g
      data-walker={avatar}
      initial={{ x: 0 }}
      animate={{ x: to - from }}
      transition={{ duration, delay, ease: 'easeInOut' }}
    >
      <rect x={from + 2} y={FEET_Y - 1} width={14} height={2} fill={P.ink} opacity={0.3} />
      <motion.g
        animate={moving ? { y: [0, -2, 0] } : { y: [0, -1, 0] }}
        transition={{ duration: moving ? 0.3 : 1.2, repeat: Infinity, delay }}
      >
        <PixelSprite
          sprite={characterSprite(avatar, { emotion, talking })}
          x={from}
          y={TOP_Y}
          flip={flip}
        />
      </motion.g>
    </motion.g>
  )
}

/** Pops in at `delay` (seconds). */
function Pop({ delay, children }: { delay: number; children: React.ReactNode }) {
  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1.3, 1], opacity: 1 }}
      transition={{ duration: 0.4, delay }}
    >
      {children}
    </motion.g>
  )
}

const DOTS = sprite(
  ['XXXXXXXXX', 'XWWWWWWWX', 'XWKWKWKWX', 'XWWWWWWWX', 'XXXXXXXXX', '..XX.....', '..X......'],
  {
    X: P.ink,
    W: P.white,
    K: P.ink,
  },
)

function Talk({ partner }: { partner?: Avatar }) {
  if (!partner)
    return (
      <>
        <Walker avatar="player" from={26} to={130} duration={1.8} emotion="neutral" />
        <Word text="TOC TOC" x={112} y={22} still={false} once delay={2} />
      </>
    )
  // Someone is there: Camille walks up to them, they talk in turn.
  return (
    <>
      <Walker avatar="player" from={26} to={92} duration={1.2} emotion="neutral" />
      <Walker avatar={partner} from={142} emotion="neutral" flip />
      <g transform="translate(100 44)">
        <Pop delay={1.3}>
          <PixelSprite sprite={DOTS} />
        </Pop>
      </g>
      <g transform="translate(132 36)">
        <Pop delay={2.1}>
          <PixelSprite sprite={DOTS} />
        </Pop>
      </g>
    </>
  )
}

function Broom() {
  return (
    <>
      <Walker avatar="player" from={70} emotion="angry" />
      <motion.g
        animate={{ y: [0, -6, 0, -6, 0, -6, 0] }}
        transition={{ duration: 1.8, delay: 0.3 }}
      >
        <PixelSprite sprite={BROOM} x={80} y={8} />
      </motion.g>
      <Word text="BANG" x={104} y={12} still={false} once delay={0.55} />
      <Word text="BANG" x={136} y={24} still={false} once delay={1.15} color={P.h1} />
    </>
  )
}

function Phone() {
  return (
    <>
      <Walker avatar="player" from={60} emotion="surprised" talking />
      <motion.g
        animate={{ x: [-1, 1, -1, 1, 0] }}
        transition={{ duration: 0.4, repeat: 3, repeatDelay: 0.2 }}
      >
        <PixelSprite sprite={PHONE} x={80} y={66} />
      </motion.g>
      <Word text="17" x={104} y={12} size={3} still={false} once delay={0.4} color={P.f2} />
      <Word text="ALLO ?" x={96} y={46} still={false} once delay={1.4} />
    </>
  )
}

function Letter() {
  return (
    <>
      <Walker avatar="player" from={26} to={60} duration={1} emotion="neutral" />
      <motion.g
        initial={{ x: 0, y: 0, rotate: 0, opacity: 0 }}
        animate={{ x: [0, 50, 100], y: [0, -16, 10], rotate: [0, 180, 360], opacity: 1 }}
        transition={{ duration: 1.4, delay: 1 }}
      >
        <PixelSprite sprite={PAPER} x={74} y={72} />
      </motion.g>
      <Word text="FFFT" x={130} y={50} still={false} once delay={2.3} color={P.white} />
    </>
  )
}

function Wait() {
  const cx = 96
  const cy = 26
  return (
    <>
      <Walker avatar="player" from={60} emotion="tired" />
      {/* Clock: face, then two hands spinning around its centre. */}
      <rect x={cx - 9} y={cy - 9} width={18} height={18} fill={P.ink} />
      <rect x={cx - 8} y={cy - 8} width={16} height={16} fill={P.white} />
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={i % 2 === 0 ? cx : i === 1 ? cx + 6 : cx - 7}
          y={i % 2 === 1 ? cy : i === 0 ? cy - 7 : cy + 6}
          width={1}
          height={1}
          fill={P.ink}
        />
      ))}
      {[
        { length: 6, turns: 1, color: P.ink },
        { length: 5, turns: 12, color: P.marianneRed },
      ].map(({ length, turns, color }) => (
        <motion.g
          key={length}
          animate={{ rotate: 360 * turns }}
          transition={{ duration: 2.8, ease: 'linear' }}
        >
          <rect x={cx} y={cy - length} width={1} height={length} fill={color} />
          {/* Invisible half: keeps the box centred on the clock, the hands turn around it. */}
          <rect x={cx} y={cy} width={1} height={length} fill="none" />
        </motion.g>
      ))}
      {[0, 1, 2].map((i) => (
        <motion.rect
          key={i}
          x={76 + i * 4}
          y={56}
          width={2}
          height={2}
          fill={P.white}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 + i * 0.5 }}
        />
      ))}
    </>
  )
}

function Agree({ partner }: { partner: Avatar }) {
  return (
    <>
      <Walker avatar="player" from={30} to={72} duration={1.2} emotion="happy" />
      <Walker avatar={partner} from={150} to={104} duration={1.2} emotion="happy" flip />
      <g transform="translate(88 40)">
        <Pop delay={1.4}>
          <PixelSprite sprite={HEART} />
        </Pop>
      </g>
      <Word text="OK !" x={84} y={20} still={false} once delay={1.8} color={P.e2} />
    </>
  )
}

function Threaten({ partner }: { partner: Avatar }) {
  return (
    <>
      <motion.g
        animate={{ x: [0, -2, 2, -2, 2, 0] }}
        transition={{ duration: 0.5, delay: 0.4, repeat: 2 }}
      >
        <Walker avatar="player" from={60} emotion="angry" talking />
      </motion.g>
      <Walker avatar={partner} from={140} emotion="surprised" flip />
      <Word text="!!" x={74} y={44} size={3} still={false} once delay={0.4} color={P.marianneRed} />
      <Word text="?!" x={146} y={44} size={2} still={false} once delay={1.4} color={P.white} />
    </>
  )
}

function Court() {
  return (
    <>
      <Walker avatar="player" from={30} emotion="neutral" />
      {/* Sound block, then the gavel striking it three times. */}
      <rect x={92} y={62} width={22} height={6} fill={P.ink} />
      <rect x={93} y={63} width={20} height={4} fill={P.p1} />
      <motion.g
        style={{ originX: '0%', originY: '50%' }}
        initial={{ rotate: -35 }}
        animate={{ rotate: [-35, 10, -35, 10, -35, 10] }}
        transition={{ duration: 1.8, delay: 0.3 }}
      >
        <rect x={84} y={56} width={22} height={2} fill={P.p1} />
        <PixelSprite sprite={GAVEL_HEAD} x={96} y={50} />
      </motion.g>
      <Word text="TOC" x={118} y={46} still={false} once delay={0.6} />
      <Word text="TOC" x={126} y={30} still={false} once delay={1.2} />
      <Word text="TOC" x={134} y={14} still={false} once delay={1.8} color={P.h1} />
    </>
  )
}

function Appointment() {
  return (
    <>
      <Walker avatar="player" from={30} emotion="happy" />
      <g transform="translate(84 18) scale(3)">
        <Pop delay={0.3}>
          <PixelSprite sprite={CALENDAR} />
        </Pop>
      </g>
      <g transform="translate(104 42) scale(3)">
        <Pop delay={1.2}>
          <PixelSprite sprite={CHECK} />
        </Pop>
      </g>
      <Word text="RDV" x={136} y={20} still={false} once delay={1.8} color={P.e2} />
    </>
  )
}

function Move() {
  return (
    <>
      <PixelSprite sprite={BOX} x={150} y={88} />
      <PixelSprite sprite={BOX} x={164} y={88} />
      <PixelSprite sprite={BOX} x={157} y={79} />
      <motion.g
        initial={{ x: 0 }}
        animate={{ x: 190 }}
        transition={{ duration: 2.6, delay: 0.3, ease: 'easeIn' }}
      >
        <Walker avatar="player" from={26} emotion="sad" />
        <PixelSprite sprite={BOX} x={30} y={78} />
      </motion.g>
      <Word text="AU REVOIR" x={60} y={18} still={false} once delay={1.6} color={P.white} />
    </>
  )
}

/** Animation of an action; `partner` is the other character of the scene, if any. */
export function ActionArt({ action, partner }: { action: Action; partner?: Avatar }) {
  const art: Record<Action, React.ReactNode> = {
    talk: <Talk partner={partner} />,
    broom: <Broom />,
    phone: <Phone />,
    letter: <Letter />,
    wait: <Wait />,
    agree: <Agree partner={partner ?? 'neighbor'} />,
    threaten: <Threaten partner={partner ?? 'neighbor'} />,
    court: <Court />,
    appointment: <Appointment />,
    move: <Move />,
  }
  return <g data-action={action}>{art[action]}</g>
}
