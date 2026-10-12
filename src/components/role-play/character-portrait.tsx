import { Briefcase, House, Landmark, User, Users, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { Avatar, Character } from '@/shared/role-play'

const ICONS: Record<Avatar, LucideIcon> = {
  player: User,
  neighbor: House,
  official: Landmark,
  professional: Briefcase,
  relative: Users,
}

/**
 * Pokémon-style portrait: icon on a round "platform". The speaking character is
 * highlighted by its border AND named in the dialogue box (never color alone).
 */
export function CharacterPortrait({
  character,
  speaking,
}: {
  character: Character
  speaking: boolean
}) {
  const Icon = ICONS[character.avatar]
  return (
    <figure className="flex flex-col items-center gap-2">
      <div
        className={cn(
          'flex size-16 items-center justify-center rounded-full border-4 bg-background sm:size-20',
          speaking ? 'border-primary text-primary' : 'border-border text-muted-foreground',
        )}
      >
        <Icon aria-hidden className="size-8 sm:size-10" />
      </div>
      <figcaption className="text-center text-sm leading-tight">
        <span className="block font-bold">{character.name}</span>
        <span className="block text-muted-foreground">{character.role}</span>
      </figcaption>
    </figure>
  )
}
