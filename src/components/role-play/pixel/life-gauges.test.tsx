import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { INITIAL_GAUGES } from '@/shared/role-play'

import { LifeGauges } from './life-gauges'

describe('LifeGauges', () => {
  it('gives every value in text, with words for screen readers', () => {
    render(
      <LifeGauges
        gauges={{ health: 7, relationship: 4, money: 150, time: 1 }}
        reduceMotion={false}
      />,
    )
    const items = within(screen.getByRole('list', { name: 'Vos jauges' })).getAllByRole('listitem')
    expect(items.map((i) => i.textContent)).toEqual([
      'Bien-être7/107 sur 10',
      'Relation4/104 sur 10',
      'Argent dépensé150 €150 euros',
      'Temps perdu1 h1 heure',
    ])
    // The visual forms are hidden, the spoken ones are kept.
    expect(screen.getByText('7/10')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('7 sur 10')).toHaveClass('sr-only')
  })

  it('shows what the last choice cost next to the values', () => {
    render(
      <LifeGauges
        gauges={{ health: 7, relationship: 10, money: 150, time: 0 }}
        previous={INITIAL_GAUGES}
        reduceMotion
      />,
    )
    expect(screen.getByTestId('delta-health')).toHaveTextContent('−3')
    expect(screen.getByTestId('delta-money')).toHaveTextContent('+150 €')
    expect(screen.queryByTestId('delta-relationship')).toBeNull()
    expect(screen.queryByTestId('delta-time')).toBeNull()
  })
})
