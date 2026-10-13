import type { Avatar, Emotion } from '@/shared/role-play'

import { paint, PALETTE, withOutline, type Sprite } from './pixel-art'

// Character sprites (#76): 16 × 32 grids (18 × 34 with the outline), one look per
// avatar, faces drawn on top for each emotion, talking and blinking.
// Keys: H hair, S skin, T top, t top shade, B bottoms, O shoes, A/X/Y accessories,
// C collar, E eyes/brows, M mouth, R blush, b eye bags, G glasses.

const HEADS: Record<Avatar, string[]> = {
  // Camille: brown bob with a fringe.
  player: [
    '.....HHHHHH.....',
    '...HHHHHHHHHH...',
    '..HHHHHHHHHHHH..',
    '..HHHHHHHHHHHH..',
    '..HHSSSSSSSSHH..',
    '..HSSSSSSSSSSH..',
    '..HSSSSSSSSSSH..',
    '..HSSSSSSSSSSH..',
    '..HSSSSSSSSSSH..',
    '..HHSSSSSSSSHH..',
    '...H.SSSSSS.H...',
    '......SSSS......',
  ],
  // M. Martin: short dark hair and a full beard.
  neighbor: [
    '................',
    '....HHHHHHHH....',
    '...HHHHHHHHHH...',
    '...HHHHHHHHHH...',
    '...HSSSSSSSSH...',
    '...SSSSSSSSSS...',
    '...SSSSSSSSSS...',
    '...SSSSSSSSSS...',
    '...SHHSSSSHHS...',
    '...SHHHHHHHHS...',
    '....HHHHHHHH....',
    '......SSSS......',
  ],
  // Mme Diallo: patterned headscarf.
  relative: [
    '.....XXXXXX.....',
    '...XXXYXXYXXX...',
    '..XXXXXXXXXXXX..',
    '..XYXXXXXXXXYX..',
    '..XXSSSSSSSSXX..',
    '..XSSSSSSSSSSX..',
    '..XSSSSSSSSSSX..',
    '..XSSSSSSSSSSX..',
    '..XSSSSSSSSSSX..',
    '...XSSSSSSSSX...',
    '....XSSSSSSX....',
    '......SSSS......',
  ],
  // Mme Roche: grey bun.
  official: [
    '......HHHH......',
    '.....HHHHHH.....',
    '...HHHHHHHHHH...',
    '..HHHHHHHHHHHH..',
    '..HHSSSSSSSSHH..',
    '..HSSSSSSSSSSH..',
    '..HSSSSSSSSSSH..',
    '..HSSSSSSSSSSH..',
    '...SSSSSSSSSS...',
    '...SSSSSSSSSS...',
    '....SSSSSSSS....',
    '......SSSS......',
  ],
  // A lawyer or an agent: side parting.
  professional: [
    '................',
    '....HHHHHHHH....',
    '...HHHHHHHHHH...',
    '...HHHHHHHHHHH..',
    '...HSSSSSSSSHH..',
    '...SSSSSSSSSS...',
    '...SSSSSSSSSS...',
    '...SSSSSSSSSS...',
    '...SSSSSSSSSS...',
    '...SSSSSSSSSS...',
    '....SSSSSSSS....',
    '......SSSS......',
  ],
}

const BODY = [
  '....TTTTTTTT....',
  '...TTTTCCTTTT...',
  '..TTTTTTTTTTTT..',
  '..TTTtTTTTtTTT..',
  '..TTtTTTTTTtTT..',
  '..TTtTTTTTTtTT..',
  '..TTtTTTTTTtTT..',
  '..TTtTTTTTTtTT..',
  '..SSTTTTTTTTSS..',
  '..SS.TTTTTT.SS..',
  '....BBBBBBBB....',
  '....BBBBBBBB....',
  '....BBB..BBB....',
  '....BBB..BBB....',
  '....BBB..BBB....',
  '....BBB..BBB....',
  '....BBB..BBB....',
  '...OOOO..OOOO...',
  '...OOOO..OOOO...',
  '................',
]

const SKIRT_BODY = [
  ...BODY.slice(0, 10),
  '...BBBBBBBBBB...',
  '...BBBBBBBBBB...',
  '..BBBBBBBBBBBB..',
  '..BBBBBBBBBBBB..',
  '..BBBBBBBBBBBB..',
  '....SS....SS....',
  '....SS....SS....',
  '...OOO....OOO...',
  '...OOO....OOO...',
  '................',
]

type Look = {
  colors: Record<string, string>
  body: string[]
  /** Extra pixels drawn on the body (accessories), in 16 × 32 coordinates. */
  extras?: [number, number, string][]
}

const LOOKS: Record<Avatar, Look> = {
  player: {
    body: BODY,
    colors: {
      H: PALETTE.p0,
      S: PALETTE.i2,
      T: PALETTE.e1,
      t: PALETTE.e0,
      C: PALETTE.e2,
      B: PALETTE.g1,
      O: PALETTE.q1,
    },
    // Hoodie strings and pocket.
    extras: [
      [6, 15, 'C'],
      [9, 15, 'C'],
      [6, 19, 't'],
      [7, 19, 't'],
      [8, 19, 't'],
      [9, 19, 't'],
    ],
  },
  neighbor: {
    body: BODY,
    colors: {
      H: PALETTE.q1,
      S: PALETTE.i1,
      T: PALETTE.q1,
      t: PALETTE.black,
      C: PALETTE.marianneRed,
      B: PALETTE.f1,
      O: PALETTE.white,
      A: PALETTE.r1,
    },
    // Band logo on the t-shirt, drumsticks in both hands.
    extras: [
      [7, 16, 'C'],
      [8, 16, 'C'],
      [6, 17, 'C'],
      [9, 17, 'C'],
      [7, 18, 'C'],
      [8, 18, 'C'],
      [14, 17, 'A'],
      [14, 18, 'A'],
      [14, 19, 'A'],
      [1, 17, 'A'],
      [1, 18, 'A'],
      [1, 19, 'A'],
    ],
  },
  relative: {
    body: SKIRT_BODY,
    colors: {
      X: PALETTE.m1,
      Y: PALETTE.l1,
      S: PALETTE.r1,
      T: PALETTE.f1,
      t: PALETTE.g1,
      C: PALETTE.f2,
      B: PALETTE.f1,
      O: PALETTE.p1,
      A: PALETTE.a1,
    },
    // Apron with a pocket and a bunch of keys.
    extras: [
      [5, 15, 'A'],
      [6, 15, 'A'],
      [7, 15, 'A'],
      [8, 15, 'A'],
      [9, 15, 'A'],
      [10, 15, 'A'],
      ...[16, 17, 18, 19, 20, 21, 22, 23, 24, 25].flatMap((y): [number, number, string][] =>
        [5, 6, 7, 8, 9, 10].map((x): [number, number, string] => [x, y, 'A']),
      ),
      [12, 22, 'Y'],
      [12, 23, 'Y'],
    ],
  },
  official: {
    body: BODY,
    colors: {
      H: PALETTE.q3,
      S: PALETTE.i2,
      T: PALETTE.franceBlue,
      t: PALETTE.g0,
      C: PALETTE.white,
      B: PALETTE.q1,
      O: PALETTE.black,
      G: PALETTE.q2,
    },
    // White shirt in the open blazer.
    extras: [
      [7, 14, 'C'],
      [8, 14, 'C'],
      [7, 15, 'C'],
      [8, 15, 'C'],
      [7, 16, 'C'],
      [8, 16, 'C'],
    ],
  },
  professional: {
    body: BODY,
    colors: {
      H: PALETTE.p0,
      S: PALETTE.i1,
      T: PALETTE.q1,
      t: PALETTE.black,
      C: PALETTE.white,
      B: PALETTE.q1,
      O: PALETTE.black,
      A: PALETTE.marianneRed,
    },
    // Tie.
    extras: [
      [7, 14, 'A'],
      [8, 14, 'A'],
      [7, 15, 'A'],
      [8, 15, 'A'],
      [7, 16, 'A'],
      [8, 16, 'A'],
    ],
  },
}

type Pixels = [number, number, string][]

/** Eyes, brows and mouth for an emotion (coordinates in the 16 × 32 grid). */
function face(emotion: Emotion, talking: boolean, blink: boolean): Pixels {
  const eyes: Pixels = blink
    ? [
        [5, 6, 'E'],
        [6, 6, 'E'],
        [9, 6, 'E'],
        [10, 6, 'E'],
      ]
    : [
        [5, 6, 'E'],
        [10, 6, 'E'],
      ]
  const openMouth: Pixels = [
    [7, 8, 'M'],
    [8, 8, 'M'],
    [7, 9, 'M'],
    [8, 9, 'M'],
  ]

  switch (emotion) {
    case 'happy':
      return [
        ...eyes,
        [4, 8, 'R'],
        [11, 8, 'R'],
        ...(talking
          ? openMouth
          : ([
              [6, 8, 'M'],
              [9, 8, 'M'],
              [7, 9, 'M'],
              [8, 9, 'M'],
            ] as Pixels)),
      ]
    case 'angry':
      return [
        ...eyes,
        [4, 4, 'E'],
        [5, 5, 'E'],
        [11, 4, 'E'],
        [10, 5, 'E'],
        ...(talking
          ? openMouth
          : ([
              [6, 8, 'M'],
              [7, 8, 'M'],
              [8, 8, 'M'],
              [9, 8, 'M'],
            ] as Pixels)),
      ]
    case 'sad':
      return [
        ...eyes,
        [5, 4, 'E'],
        [4, 5, 'E'],
        [10, 4, 'E'],
        [11, 5, 'E'],
        ...(talking
          ? openMouth
          : ([
              [7, 8, 'M'],
              [8, 8, 'M'],
              [6, 9, 'M'],
              [9, 9, 'M'],
            ] as Pixels)),
      ]
    case 'tired':
      return [
        [5, 6, 'E'],
        [6, 6, 'E'],
        [9, 6, 'E'],
        [10, 6, 'E'],
        [5, 7, 'b'],
        [10, 7, 'b'],
        ...(talking
          ? openMouth
          : ([
              [7, 8, 'M'],
              [8, 8, 'M'],
            ] as Pixels)),
      ]
    case 'surprised':
      return [[5, 5, 'E'], [5, 6, 'E'], [10, 5, 'E'], [10, 6, 'E'], ...openMouth]
    case 'neutral':
      return [
        ...eyes,
        ...(talking
          ? openMouth
          : ([
              [7, 8, 'M'],
              [8, 8, 'M'],
            ] as Pixels)),
      ]
  }
}

/** Glasses of the conciliator, drawn over the eyes. */
const GLASSES: Pixels = [4, 5, 6].flatMap((x): Pixels => [
  [x, 5, 'G'],
  [x, 7, 'G'],
  [x + 5, 5, 'G'],
  [x + 5, 7, 'G'],
])
GLASSES.push([4, 6, 'G'], [6, 6, 'G'], [9, 6, 'G'], [11, 6, 'G'], [7, 6, 'G'], [8, 6, 'G'])

export type SpritePose = { emotion?: Emotion; talking?: boolean; blink?: boolean }

const cache = new Map<string, Sprite>()

/** Sprite of a character for a pose. Cached: there are only a few hundred combinations. */
export function characterSprite(avatar: Avatar, pose: SpritePose = {}): Sprite {
  const { emotion = 'neutral', talking = false, blink = false } = pose
  const key = `${avatar}:${emotion}:${talking}:${blink}`
  const hit = cache.get(key)
  if (hit) return hit

  const look = LOOKS[avatar]
  let rows = paint([...HEADS[avatar], ...look.body], look.extras ?? [])
  rows = paint(rows, face(emotion, talking, blink))
  if (avatar === 'official') rows = paint(rows, GLASSES)

  const sprite: Sprite = {
    rows: withOutline(rows),
    colors: {
      E: PALETTE.ink,
      M: PALETTE.p0,
      R: PALETTE.h1,
      b: PALETTE.g2,
      o: PALETTE.ink,
      ...look.colors,
    },
  }
  cache.set(key, sprite)
  return sprite
}

/** Size of every character sprite, outline included. */
export const CHARACTER_SIZE = { width: 18, height: 34 } as const
