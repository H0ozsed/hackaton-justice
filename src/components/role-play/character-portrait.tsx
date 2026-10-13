import type { Character } from '@/shared/role-play'

import { CHARACTER_SIZE, characterSprite } from './pixel/characters'
import { PixelSprite } from './pixel/pixel-sprite'

/**
 * Character card of the intro: the pixel sprite (decorative) on a platform, with the
 * name and role in text.
 */
export function CharacterPortrait({ character }: { character: Character }) {
  const { width, height } = CHARACTER_SIZE
  return (
    <figure className="flex flex-col items-center gap-2">
      <div className="flex h-24 w-20 items-end justify-center border-b-4 border-[#1e1f33]/30 sm:h-28">
        <svg
          aria-hidden
          focusable="false"
          viewBox={`0 0 ${width} ${height}`}
          shapeRendering="crispEdges"
          className="h-full w-auto"
        >
          <PixelSprite sprite={characterSprite(character.avatar)} />
        </svg>
      </div>
      <figcaption className="text-center text-sm leading-tight">
        <span className="block font-bold">{character.name}</span>
        <span className="block text-muted-foreground">{character.role}</span>
      </figcaption>
    </figure>
  )
}
