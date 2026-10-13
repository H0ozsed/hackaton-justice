import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { orientation } from '@/shared/home'

import { Orientation } from './orientation'

describe('Orientation', () => {
  it('lists every situation under « Par où commencer ? »', () => {
    render(<Orientation />)
    const section = screen.getByRole('region', { name: 'Par où commencer ?' })
    expect(within(section).getAllByRole('link')).toHaveLength(orientation.all.length)
  })

  it('leads each answer to its journey in one link', () => {
    render(<Orientation />)
    for (const option of orientation.all) {
      const link = screen.getByRole('link', {
        name: (name) => name.startsWith(option.situation),
      })
      expect(link).toHaveAttribute('href', option.journey)
    }
  })

  it('names the destination journey in the link text (explicit out of context)', () => {
    render(
      <Orientation
        options={[
          {
            slug: 'conflit',
            situation: 'Je vis un conflit',
            journey: '/simulation',
            hint: 'Quelques questions.',
          },
        ]}
      />,
    )
    expect(screen.getByRole('link')).toHaveAccessibleName(
      'Je vis un conflit Quelques questions. Aller au parcours Simulation',
    )
  })
})
