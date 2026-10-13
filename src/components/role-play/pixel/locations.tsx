import { useId } from 'react'

import type { Location, Period } from '@/shared/role-play'

import { PALETTE as P } from './pixel-art'

// Illustrated places of the role-play stage (#76). Every place is drawn on the same
// 192 × 108 pixel canvas (16:9) with rectangles only, so it scales without blur.
// The back wall ends at y = 78, the floor goes to the bottom: characters stand on it.

export const STAGE = { width: 192, height: 108, floor: 78 } as const

type Rect = readonly [x: number, y: number, width: number, height: number, fill: string]

function Rects({ rects, opacity }: { rects: readonly Rect[]; opacity?: number }) {
  return (
    <g opacity={opacity}>
      {rects.map(([x, y, width, height, fill], i) => (
        <rect key={i} x={x} y={y} width={width} height={height} fill={fill} />
      ))}
    </g>
  )
}

// ---- Shared pieces ----------------------------------------------------------------

/** Wall, ceiling band, baseboard and floor with planks or tiles. */
function room({
  wall,
  wallShade,
  floor,
  floorLine,
  tiles = false,
}: {
  wall: string
  wallShade: string
  floor: string
  floorLine: string
  tiles?: boolean
}): Rect[] {
  const rects: Rect[] = [
    [0, 0, 192, 78, wall],
    [0, 0, 192, 5, wallShade],
    [0, 5, 192, 1, P.ink],
    [0, 75, 192, 3, wallShade],
    [0, 78, 192, 30, floor],
    [0, 78, 192, 1, P.ink],
  ]
  if (tiles) {
    for (let row = 0; row < 4; row++)
      for (let col = 0; col < 12; col++)
        if ((row + col) % 2 === 0) rects.push([col * 16, 79 + row * 8, 16, 8, floorLine])
  } else {
    for (const y of [86, 95]) rects.push([0, y, 192, 1, floorLine])
    for (const [y, xs] of [
      [79, [30, 94, 150]],
      [87, [8, 70, 128, 178]],
      [96, [44, 110, 164]],
    ] as const)
      for (const x of xs) rects.push([x, y, 1, y === 96 ? 12 : 7, floorLine])
  }
  return rects
}

/** Sky seen through a window, for the time of day. */
function sky(x: number, y: number, width: number, height: number, period: Period): Rect[] {
  switch (period) {
    case 'night':
      return [
        [x, y, width, height, P.g0],
        [x + width - 9, y + 3, 5, 5, P.l3],
        [x + width - 8, y + 3, 1, 1, P.g0],
        [x + width - 9, y + 4, 1, 1, P.g0],
        [x + 3, y + 4, 1, 1, P.white],
        [x + 8, y + 10, 1, 1, P.white],
        [x + width - 15, y + 13, 1, 1, P.l3],
      ]
    case 'evening':
      return [
        [x, y, width, height, P.h1],
        [x, y, width, Math.ceil(height / 3), P.g1],
        [x, y + Math.ceil(height / 3), width, 3, P.m1],
        [x + 4, y + height - 6, 7, 6, P.l1],
      ]
    case 'morning':
      return [
        [x, y, width, height, P.f3],
        [x, y + height - 5, width, 5, P.l3],
        [x + 4, y + height - 8, 6, 6, P.l1],
      ]
    case 'day':
      return [
        [x, y, width, height, P.f2],
        [x + 3, y + 5, 9, 3, P.white],
        [x + 5, y + 3, 5, 2, P.white],
      ]
  }
}

/** Window with a frame, a cross bar and the sky behind. */
function windowFrame(x: number, y: number, width: number, height: number, period: Period): Rect[] {
  return [
    [x - 2, y - 2, width + 4, height + 4, P.ink],
    [x - 1, y - 1, width + 2, height + 2, P.white],
    ...sky(x, y, width, height, period),
    [x + Math.floor(width / 2), y, 1, height, P.white],
    [x, y + Math.floor(height / 2), width, 1, P.white],
    [x - 3, y + height + 1, width + 6, 2, P.white],
    [x - 3, y + height + 3, width + 6, 1, P.ink],
  ]
}

/** Door with a frame, a handle and a small number plate. */
function door(x: number, wood: string, shade: string): Rect[] {
  return [
    [x - 1, 33, 26, 45, P.ink],
    [x, 34, 24, 44, wood],
    [x + 3, 38, 18, 15, shade],
    [x + 3, 57, 18, 17, shade],
    [x + 4, 39, 16, 13, wood],
    [x + 4, 58, 16, 15, wood],
    [x + 19, 55, 3, 2, P.l1],
    [x + 9, 29, 6, 3, P.l1],
  ]
}

// ---- Places -----------------------------------------------------------------------

function Bedroom({ period }: { period: Period }) {
  const night = period === 'night'
  return (
    <>
      <Rects
        rects={[
          ...room({ wall: P.f3, wallShade: P.f2, floor: P.p1, floorLine: P.p0 }),
          // Wallpaper dots.
          ...Array.from({ length: 30 }, (_, i): Rect => [
            8 + (i % 10) * 19,
            14 + Math.floor(i / 10) * 20,
            1,
            1,
            P.f2,
          ]),
          ...windowFrame(18, 18, 30, 26, period),
          // Poster.
          [64, 16, 18, 24, P.ink],
          [65, 17, 16, 22, P.e1],
          [68, 22, 10, 10, P.l1],
          [68, 34, 10, 2, P.white],
          // Bed: headboard, mattress, pillow, blanket, legs.
          [96, 46, 6, 34, P.ink],
          [97, 47, 4, 32, P.p0],
          [101, 62, 62, 10, P.ink],
          [102, 63, 60, 8, P.white],
          [103, 59, 16, 6, P.ink],
          [104, 60, 14, 5, P.q4],
          [116, 64, 48, 12, P.ink],
          [117, 65, 46, 10, P.f1],
          [117, 65, 46, 2, P.f2],
          [130, 67, 2, 8, P.g1],
          [146, 67, 2, 8, P.g1],
          [101, 76, 62, 3, P.p0],
          [102, 79, 3, 3, P.ink],
          [159, 79, 3, 3, P.ink],
          // Bedside table, alarm clock and lamp.
          [168, 60, 18, 19, P.ink],
          [169, 61, 16, 17, P.p1],
          [169, 68, 16, 1, P.p0],
          [176, 64, 3, 2, P.l1],
          [170, 55, 8, 5, P.ink],
          [171, 56, 6, 3, P.q1],
          [172, 57, 1, 1, P.marianneRed],
          [174, 57, 2, 1, P.marianneRed],
          [179, 42, 1, 18, P.ink],
          [175, 36, 10, 7, P.ink],
          [176, 37, 8, 5, night ? P.l1 : P.l3],
          [177, 59, 6, 2, P.ink],
          // Rug.
          [20, 92, 60, 10, P.ink],
          [21, 93, 58, 8, P.h1],
          [21, 96, 58, 2, P.m1],
        ]}
      />
    </>
  )
}

function Landing({ period }: { period: Period }) {
  return (
    <>
      <Rects
        rects={[
          ...room({ wall: P.a2, wallShade: P.a1, floor: P.q3, floorLine: P.q2, tiles: true }),
          // Lower part of the wall painted darker, like in most old buildings.
          [0, 52, 192, 23, P.a1],
          [0, 52, 192, 1, P.p0],
          ...door(14, P.p1, P.p0),
          ...door(152, P.r1, P.p1),
          // Stairs going up to the next floor, with a handrail.
          ...Array.from({ length: 8 }, (_, i): Rect => [
            64 + i * 8,
            70 - i * 8,
            9,
            8 + i * 8,
            P.q3,
          ]),
          ...Array.from({ length: 8 }, (_, i): Rect => [64 + i * 8, 70 - i * 8, 9, 1, P.ink]),
          ...Array.from({ length: 8 }, (_, i): Rect => [64 + i * 8, 71 - i * 8, 1, 7, P.q2]),
          ...Array.from({ length: 34 }, (_, i): Rect => [64 + i * 2, 54 - i * 2, 3, 2, P.p0]),
          ...Array.from({ length: 8 }, (_, i): Rect => [68 + i * 8, 56 - i * 8, 1, 14, P.ink]),
          // Hanging bulb.
          [96, 6, 1, 10, P.ink],
          [94, 16, 5, 5, P.ink],
          [95, 17, 3, 3, period === 'night' || period === 'evening' ? P.l1 : P.q4],
          // Door mats.
          [12, 79, 28, 4, P.a1],
          [150, 79, 28, 4, P.e0],
        ]}
      />
    </>
  )
}

function Stairwell({ period }: { period: Period }) {
  return (
    <>
      <Rects
        rects={[
          ...room({ wall: P.m2, wallShade: P.m1, floor: P.q3, floorLine: P.q2, tiles: true }),
          [0, 52, 192, 23, P.r2],
          [0, 52, 192, 1, P.p0],
          ...windowFrame(146, 16, 20, 30, period),
          // Big staircase climbing from left to right.
          ...Array.from({ length: 10 }, (_, i): Rect => [i * 12, 72 - i * 7, 14, 6 + i * 7, P.q3]),
          ...Array.from({ length: 10 }, (_, i): Rect => [i * 12, 72 - i * 7, 14, 1, P.ink]),
          ...Array.from({ length: 10 }, (_, i): Rect => [i * 12, 73 - i * 7, 1, 6, P.q2]),
          // Handrail.
          ...Array.from({ length: 60 }, (_, i): Rect => [
            i * 2,
            56 - Math.round((i * 2 * 7) / 12),
            3,
            2,
            P.p0,
          ]),
          ...Array.from({ length: 10 }, (_, i): Rect => [i * 12 + 6, 58 - i * 7, 1, 14, P.ink]),
          // Timer light switch, typical of stairwells.
          [176, 50, 6, 8, P.ink],
          [177, 51, 4, 6, P.white],
          [178, 53, 2, 2, P.m1],
        ]}
      />
    </>
  )
}

function Lobby({ period }: { period: Period }) {
  return (
    <Rects
      rects={[
        ...room({ wall: P.g3, wallShade: P.g2, floor: P.q4, floorLine: P.g2, tiles: true }),
        // Mailboxes: 3 × 4 grid with name plates.
        [12, 22, 62, 40, P.ink],
        ...Array.from({ length: 12 }, (_, i): Rect => [
          13 + (i % 4) * 15,
          23 + Math.floor(i / 4) * 13,
          14,
          12,
          P.a1,
        ]),
        ...Array.from({ length: 12 }, (_, i): Rect => [
          15 + (i % 4) * 15,
          25 + Math.floor(i / 4) * 13,
          10,
          2,
          P.a2,
        ]),
        ...Array.from({ length: 12 }, (_, i): Rect => [
          16 + (i % 4) * 15,
          30 + Math.floor(i / 4) * 13,
          8,
          1,
          P.ink,
        ]),
        // Notice board with a few papers pinned.
        [86, 20, 34, 26, P.ink],
        [87, 21, 32, 24, P.p1],
        [90, 24, 10, 12, P.white],
        [103, 23, 12, 9, P.l3],
        [102, 34, 13, 9, P.white],
        [91, 26, 8, 1, P.q2],
        [91, 28, 6, 1, P.q2],
        [104, 25, 9, 1, P.q2],
        [94, 23, 2, 2, P.marianneRed],
        [108, 22, 2, 2, P.franceBlue],
        // Glass entrance door with the street behind.
        [146, 18, 36, 60, P.ink],
        ...sky(148, 20, 32, 56, period),
        [148, 58, 32, 18, P.q2],
        [163, 20, 2, 56, P.ink],
        [158, 46, 2, 6, P.q3],
        [168, 46, 2, 6, P.q3],
        // Plant.
        [128, 66, 12, 12, P.ink],
        [129, 67, 10, 11, P.r1],
        [130, 50, 8, 16, P.e0],
        [127, 54, 6, 8, P.e1],
        [135, 52, 6, 9, P.e1],
      ]}
    />
  )
}

function TownHall({ period }: { period: Period }) {
  return (
    <Rects
      rects={[
        ...room({ wall: P.white, wallShade: P.q4, floor: P.p1, floorLine: P.p0 }),
        // Wainscot.
        [0, 56, 192, 19, P.f3],
        [0, 56, 192, 1, P.g2],
        ...windowFrame(14, 14, 26, 30, period),
        // French flag on a pole.
        [58, 12, 2, 66, P.ink],
        [57, 10, 4, 3, P.l1],
        [60, 14, 7, 18, P.franceBlue],
        [67, 14, 7, 18, P.white],
        [74, 14, 7, 18, P.marianneRed],
        [60, 32, 21, 1, P.ink],
        // Framed portrait (anonymous silhouette).
        [94, 14, 20, 24, P.l1],
        [96, 16, 16, 20, P.f3],
        [101, 20, 6, 6, P.g2],
        [99, 27, 10, 9, P.g2],
        // Shelves with binders.
        [134, 14, 50, 46, P.ink],
        [135, 15, 48, 44, P.p0],
        ...[0, 1, 2].flatMap((row) =>
          [P.franceBlue, P.e1, P.m1, P.f1, P.marianneRed, P.l1, P.e0, P.g1].map(
            (color, i): Rect => [137 + i * 6, 17 + row * 14, 5, 11, color],
          ),
        ),
        [135, 28, 48, 2, P.p1],
        [135, 42, 48, 2, P.p1],
        // Desk with papers, seen from the front.
        [70, 60, 60, 4, P.ink],
        [71, 61, 58, 2, P.r1],
        [72, 64, 56, 15, P.ink],
        [73, 64, 54, 14, P.p1],
        [76, 67, 22, 9, P.p0],
        [102, 67, 22, 9, P.p0],
        [84, 56, 12, 4, P.white],
        [86, 55, 10, 1, P.q4],
        [110, 55, 6, 5, P.ink],
        [111, 56, 4, 3, P.e1],
      ]}
    />
  )
}

function Courthouse({ period }: { period: Period }) {
  return (
    <Rects
      rects={[
        ...room({ wall: P.q4, wallShade: P.q3, floor: P.p0, floorLine: P.ink }),
        // Stone joints.
        ...Array.from({ length: 6 }, (_, i): Rect => [0, 18 + i * 10, 192, 1, P.q3]),
        // Tall arched windows.
        ...windowFrame(20, 14, 18, 40, period),
        [20, 11, 18, 3, P.white],
        [22, 9, 14, 2, P.white],
        ...windowFrame(154, 14, 18, 40, period),
        [154, 11, 18, 3, P.white],
        [156, 9, 14, 2, P.white],
        // Columns.
        ...[56, 124].flatMap((x): Rect[] => [
          [x, 8, 14, 4, P.q3],
          [x + 2, 12, 10, 63, P.white],
          [x + 4, 12, 1, 63, P.q3],
          [x + 8, 12, 1, 63, P.q3],
          [x, 72, 14, 3, P.q3],
        ]),
        // Scales of justice above the bench.
        [95, 12, 2, 14, P.l1],
        [86, 14, 20, 2, P.l1],
        [84, 16, 1, 6, P.l1],
        [107, 16, 1, 6, P.l1],
        [81, 22, 8, 2, P.l1],
        [104, 22, 8, 2, P.l1],
        [92, 26, 8, 2, P.l1],
        // Bench (raised desk of the court).
        [74, 46, 44, 32, P.ink],
        [75, 47, 42, 30, P.p1],
        [74, 46, 44, 3, P.p0],
        [79, 52, 34, 20, P.p0],
        [80, 53, 32, 18, P.p1],
      ]}
    />
  )
}

function NewHome({ period }: { period: Period }) {
  return (
    <Rects
      rects={[
        ...room({ wall: P.e2, wallShade: P.e1, floor: P.a2, floorLine: P.a1 }),
        ...windowFrame(88, 12, 48, 34, period),
        // Sunbeam on the floor.
        [86, 79, 54, 12, P.l3],
        // Cardboard boxes.
        ...(
          [
            [54, 56, 28, 22],
            [58, 42, 20, 14],
            [148, 60, 28, 18],
            [176, 66, 14, 12],
          ] as const
        ).flatMap(([x, y, w, h]): Rect[] => [
          [x, y, w, h, P.ink],
          [x + 1, y + 1, w - 2, h - 1, P.l1],
          [x + 1, y + 1, w - 2, 3, P.a2],
          [x + Math.floor(w / 2) - 1, y + 1, 3, h - 1, P.a2],
        ]),
        // Plant on the windowsill.
        [144, 38, 10, 8, P.ink],
        [145, 39, 8, 7, P.r1],
        [146, 28, 6, 10, P.e0],
        [143, 31, 4, 6, P.e1],
        [151, 30, 4, 6, P.e1],
        // Rolled rug.
        [130, 84, 50, 6, P.ink],
        [131, 85, 48, 4, P.h1],
        [176, 85, 3, 4, P.m1],
      ]}
    />
  )
}

/** Neutral room when a scene has no location. */
function Neutral({ period }: { period: Period }) {
  return (
    <Rects
      rects={[
        ...room({ wall: P.f3, wallShade: P.f2, floor: P.q3, floorLine: P.q2 }),
        ...windowFrame(80, 16, 32, 26, period),
      ]}
    />
  )
}

const PLACES: Record<Location, (props: { period: Period }) => React.ReactNode> = {
  bedroom: Bedroom,
  landing: Landing,
  stairwell: Stairwell,
  lobby: Lobby,
  'town-hall': TownHall,
  courthouse: Courthouse,
  'new-home': NewHome,
}

/** Colour laid over the whole place for the time of day (day: none). */
const LIGHTING: Record<Period, { fill: string; opacity: number } | undefined> = {
  night: { fill: P.ink, opacity: 0.42 },
  evening: { fill: P.m1, opacity: 0.16 },
  morning: { fill: P.l3, opacity: 0.22 },
  day: undefined,
}

/** Lamps of each place: they glow over the lighting in the evening and at night. */
const LAMPS: Partial<Record<Location, readonly (readonly [cx: number, cy: number])[]>> = {
  bedroom: [[180, 40]],
  landing: [[96, 19]],
}

/** Background of the stage: the place, then the lighting of the time of day. */
export function LocationBackdrop({
  location,
  period = 'day',
}: {
  location?: Location
  period?: Period
}) {
  const glowId = useId()
  const Place = location ? PLACES[location] : Neutral
  const light = LIGHTING[period]
  return (
    <g data-location={location ?? 'neutral'} data-period={period}>
      <defs>
        <radialGradient id={glowId}>
          <stop offset="0%" stopColor={P.l1} stopOpacity={0.55} />
          <stop offset="100%" stopColor={P.l1} stopOpacity={0} />
        </radialGradient>
      </defs>
      <Place period={period} />
      {light && (
        <rect width={STAGE.width} height={STAGE.height} fill={light.fill} opacity={light.opacity} />
      )}
      {(period === 'night' || period === 'evening') &&
        (location ? (LAMPS[location] ?? []) : []).map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={30} fill={`url(#${glowId})`} />
        ))}{' '}
    </g>
  )
}
