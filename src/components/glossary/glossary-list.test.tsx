import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import type { GlossaryTerm } from '@/shared/glossary'

import { GlossaryList } from './glossary-list'

const term = (
  slug: string,
  name: string,
  extra: Partial<Pick<GlossaryTerm, 'aliases' | 'related'>> = {},
): GlossaryTerm => ({
  slug,
  term: name,
  definition: `Définition de ${name}.`,
  aliases: [],
  related: [],
  ...extra,
})

// Test data instead of the real glossary, which the content team will replace.
const TERMS = [
  term('mediation', 'Médiation', { aliases: ['médiatrice'], related: ['conciliation'] }),
  term('conciliation', 'Conciliation', { related: ['mediation'] }),
  term('avocat', 'Avocat'),
]

const setup = () => {
  const user = userEvent.setup()
  render(<GlossaryList terms={TERMS} />)
  return user
}

describe('GlossaryList', () => {
  it('lists every term alphabetically under letter headings', () => {
    setup()
    const letters = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(letters).toEqual(['A', 'C', 'M'])
    const terms = screen.getAllByRole('term').map((dt) => dt.textContent)
    expect(terms).toEqual(['Avocat', 'Conciliation', 'Médiation'])
  })

  it('gives each term an anchor equal to its slug', () => {
    setup()
    expect(screen.getAllByRole('term').map((dt) => dt.id)).toEqual([
      'avocat',
      'conciliation',
      'mediation',
    ])
  })

  it('links related terms to their anchor', () => {
    setup()
    const mediation = document.getElementById('mediation')!.parentElement!
    const link = within(mediation).getByRole('link', { name: 'Conciliation' })
    expect(link).toHaveAttribute('href', '#conciliation')
    expect(within(mediation).getByText('Aussi : médiatrice')).toBeInTheDocument()
  })

  it('has a letter index leading to each group', () => {
    setup()
    const index = screen.getByRole('navigation', { name: 'Index alphabétique' })
    const links = within(index).getAllByRole('link')
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '#lettre-A',
      '#lettre-C',
      '#lettre-M',
    ])
    expect(document.getElementById('lettre-C')).toHaveTextContent('C')
  })

  it('filters with the labelled search field, ignoring accents, and announces the count', async () => {
    const user = setup()
    expect(screen.getByRole('status')).toHaveTextContent('3 termes')

    await user.type(screen.getByLabelText('Rechercher un terme'), 'mediatrice')
    expect(screen.getAllByRole('term').map((dt) => dt.textContent)).toEqual(['Médiation'])
    expect(screen.getByRole('status')).toHaveTextContent('1 terme')
  })

  it('says when nothing matches, without empty headings', async () => {
    const user = setup()
    await user.type(screen.getByLabelText('Rechercher un terme'), 'xyz')
    expect(screen.getByRole('status')).toHaveTextContent('Aucun terme ne correspond à « xyz ».')
    expect(screen.queryByRole('term')).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Index alphabétique' })).not.toBeInTheDocument()
  })
})
