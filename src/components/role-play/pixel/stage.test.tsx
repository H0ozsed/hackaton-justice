import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Character } from '@/shared/role-play'

import { FRAME_MS, Stage } from './stage'

const cast: Character[] = [
  { id: 'martin', name: 'M. Martin', role: 'Voisin', avatar: 'neighbor' },
  { id: 'camille', name: 'Camille', role: 'Vous', avatar: 'player' },
]

const base = {
  cast,
  talking: false,
  effectKey: 0,
  reduceMotion: false,
} as const

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('Stage', () => {
  it('is hidden from screen readers and draws the place with its lighting', () => {
    render(<Stage {...base} location="bedroom" period="night" />)
    const stage = screen.getByTestId('stage')
    expect(stage).toHaveAttribute('aria-hidden', 'true')
    const place = stage.querySelector('[data-location]')
    expect(place).toHaveAttribute('data-location', 'bedroom')
    expect(place).toHaveAttribute('data-period', 'night')
  })

  it('draws a neutral room in daylight when the scene has no location', () => {
    render(<Stage {...base} />)
    const place = screen.getByTestId('stage').querySelector('[data-location]')
    expect(place).toHaveAttribute('data-location', 'neutral')
    expect(place).toHaveAttribute('data-period', 'day')
  })

  it('puts the player first (on the left) and marks the speaker', () => {
    render(<Stage {...base} speakerId="martin" />)
    const characters = screen.getByTestId('stage').querySelectorAll('[data-character]')
    expect([...characters].map((c) => c.getAttribute('data-character'))).toEqual([
      'camille',
      'martin',
    ])
    expect(characters[1]).toHaveAttribute('data-speaking', 'true')
    expect(characters[0]).not.toHaveAttribute('data-speaking')
  })

  it('plays the effect of the line', () => {
    render(<Stage {...base} effect="drums" />)
    expect(screen.getByTestId('stage').querySelector('[data-effect="drums"]')).not.toBeNull()
  })

  it('moves the mouth of the speaker while the line is typed', () => {
    const { rerender } = render(<Stage {...base} speakerId="martin" talking />)
    const martin = () => screen.getByTestId('stage').querySelector('[data-character="martin"]')!
    const frames = new Set<string>()
    for (let i = 0; i < 4; i++) {
      frames.add(martin().innerHTML)
      act(() => vi.advanceTimersByTime(FRAME_MS))
    }
    expect(frames.size).toBeGreaterThan(1)

    // Line fully shown: the mouth stays still.
    rerender(<Stage {...base} speakerId="martin" talking={false} />)
    const still = martin().innerHTML
    act(() => vi.advanceTimersByTime(FRAME_MS))
    expect(martin().innerHTML).toBe(still)
  })

  it('shows the title card for a moment, then removes it', async () => {
    render(<Stage {...base} titleCard={{ label: 'Scène 1', setting: 'Chez vous' }} />)
    expect(screen.getByTestId('title-card')).toHaveTextContent('Scène 1Chez vous')
    await act(async () => vi.advanceTimersByTime(3000))
    expect(screen.queryByTestId('title-card')).toBeNull()
  })

  it('stays still with reduced motion: no title card, no frame timer', () => {
    render(
      <Stage {...base} reduceMotion speakerId="martin" talking titleCard={{ label: 'Scène 1' }} />,
    )
    expect(screen.queryByTestId('title-card')).toBeNull()
    expect(vi.getTimerCount()).toBe(0)
  })
})
