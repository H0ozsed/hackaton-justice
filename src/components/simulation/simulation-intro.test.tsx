import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import { SimulationIntro } from './simulation-intro'

describe('SimulationIntro', () => {
  it('says what the form does, how long it takes and that nothing is sent', () => {
    render(<SimulationIntro onStart={vi.fn()} />)

    const intro = screen.getByRole('region', { name: 'Comment ça marche ?' })
    expect(within(intro).getAllByRole('list')[0].tagName).toBe('OL')
    expect(intro).toHaveTextContent('Moins d’une minute')
    expect(intro).toHaveTextContent('rien n’est envoyé ni enregistré')
  })

  it('starts the form with its button', async () => {
    const onStart = vi.fn()
    const user = userEvent.setup()
    render(<SimulationIntro onStart={onStart} />)

    await user.click(screen.getByRole('button', { name: 'Commencer' }))
    expect(onStart).toHaveBeenCalledOnce()
  })

  it('has no automatic WCAG A/AA violation', async () => {
    const { container } = render(<SimulationIntro onStart={vi.fn()} />)
    const results = await axe.run(container, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })
})
