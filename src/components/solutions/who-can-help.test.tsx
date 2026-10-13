import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'

import { channels, type Channel } from '@/shared/simulation'

import { WhoCanHelp } from './who-can-help'

const channel = (slug: string, attributes: Partial<Channel>): Channel => ({
  slug,
  name: `Tiers ${slug}`,
  family: 'mediation',
  description: `Description ${slug}.`,
  forYouIf: `Pour vous ${slug}.`,
  disputes: [],
  excluded: [],
  amicable: true,
  free: true,
  inSimulation: true,
  sources: [],
  ...attributes,
})

const entries = [
  channel('judge', { family: 'judge', amicable: false }),
  channel('family', {
    law: { text: 'Diplôme d’État exigé.', references: ['CASF, art. R451-66'] },
  }),
  channel('conciliator', { family: 'conciliation', inSimulation: false }),
]

describe('WhoCanHelp', () => {
  it('groups the third parties by family, from conciliation to the judge', () => {
    render(<WhoCanHelp entries={entries} />)
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      'Conciliation',
      'Médiation',
      'Le juge',
    ])
    // Even the steps only a judge starts are explained here.
    expect(screen.getByRole('button', { name: 'Tiers conciliator' })).toBeInTheDocument()
  })

  it('opens a third party on what the law says first', async () => {
    const user = userEvent.setup()
    render(<WhoCanHelp entries={entries} />)
    await user.click(screen.getByRole('button', { name: 'Tiers family' }))

    const region = screen.getByRole('region', { name: 'Tiers family' })
    expect(within(region).getAllByRole('term')[0]).toHaveTextContent('Ce que dit la loi')
    expect(region).toHaveTextContent('Diplôme d’État exigé.')
    expect(region).toHaveTextContent('CASF, art. R451-66')
    expect(region).toHaveTextContent('C’est pour vous si…Pour vous family.')
  })

  it('presents every solution of the content', () => {
    render(<WhoCanHelp />)
    for (const entry of channels.all) {
      expect(screen.getByRole('button', { name: entry.name })).toBeInTheDocument()
    }
  })

  it('has no automatic WCAG A/AA violation, with a third party open', async () => {
    const user = userEvent.setup()
    const { container } = render(<WhoCanHelp entries={entries} />)
    await user.click(screen.getByRole('button', { name: 'Tiers family' }))
    const results = await axe.run(container, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })
})
