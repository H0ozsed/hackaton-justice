import { describe, expect, it } from 'vitest'

import { avatarSchema, type Emotion } from '@/shared/role-play'

import { CHARACTER_SIZE, characterSprite } from './characters'

const EMOTIONS: Emotion[] = ['neutral', 'happy', 'angry', 'sad', 'tired', 'surprised']

describe('characterSprite', () => {
  it.each(avatarSchema.options)(
    '%s: every pose has the same size and only known colours',
    (avatar) => {
      for (const emotion of EMOTIONS) {
        for (const talking of [false, true]) {
          const sprite = characterSprite(avatar, { emotion, talking })
          expect(sprite.rows).toHaveLength(CHARACTER_SIZE.height)
          for (const row of sprite.rows) {
            expect(row).toHaveLength(CHARACTER_SIZE.width)
            for (const key of row)
              if (key !== '.') expect(sprite.colors[key], `${avatar} "${key}"`).toBeDefined()
          }
        }
      }
    },
  )

  it('draws a different face for each emotion', () => {
    const faces = EMOTIONS.map((emotion) => characterSprite('player', { emotion }).rows.join('\n'))
    expect(new Set(faces).size).toBe(EMOTIONS.length)
  })

  it('opens the mouth while talking and closes the eyes when blinking', () => {
    const still = characterSprite('neighbor').rows.join('\n')
    expect(characterSprite('neighbor', { talking: true }).rows.join('\n')).not.toBe(still)
    expect(characterSprite('neighbor', { blink: true }).rows.join('\n')).not.toBe(still)
  })

  it('gives each avatar its own look', () => {
    const looks = avatarSchema.options.map((avatar) => characterSprite(avatar).rows.join('\n'))
    expect(new Set(looks).size).toBe(avatarSchema.options.length)
  })
})
