import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { glossary } from '@/shared/glossary'
import { explainer } from '@/shared/home'

import { AmicableExplainer } from './amicable-explainer'

describe('AmicableExplainer', () => {
  it('gives each key idea its own heading', () => {
    render(<AmicableExplainer />)
    const section = screen.getByRole('region', { name: 'L’amiable en 1 minute' })
    expect(within(section).getAllByRole('heading', { level: 3 })).toHaveLength(explainer.all.length)
  })

  it('opens the glossary definition of a term linked in a card', async () => {
    const user = userEvent.setup()
    const term = glossary.get('mediation')
    render(
      <AmicableExplainer
        cards={[{ slug: 'voies', title: 'Les voies', body: 'Essayez la [[mediation|médiation]].' }]}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'médiation (voir la définition)' }))
    expect(screen.getByRole('dialog', { name: `Définition : ${term.term}` })).toBeInTheDocument()
  })
})
