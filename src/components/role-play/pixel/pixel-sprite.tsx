import { useMemo } from 'react'

import { pixelRuns, type Sprite } from './pixel-art'

/**
 * Draws a sprite inside an SVG, one rectangle per run of same-colour pixels.
 * `x`/`y` place its top-left corner in the SVG units of the parent; `flip` mirrors it
 * horizontally (a character facing left).
 */
export function PixelSprite({
  sprite,
  x = 0,
  y = 0,
  flip = false,
}: {
  sprite: Sprite
  x?: number
  y?: number
  flip?: boolean
}) {
  const runs = useMemo(() => pixelRuns(sprite), [sprite])
  const width = sprite.rows[0]?.length ?? 0
  const transform = flip ? `translate(${x + width} ${y}) scale(-1 1)` : `translate(${x} ${y})`

  return (
    <g transform={transform}>
      {runs.map((run) => (
        <rect
          key={`${run.x}-${run.y}`}
          x={run.x}
          y={run.y}
          width={run.width}
          height={1}
          fill={run.color}
        />
      ))}
    </g>
  )
}
