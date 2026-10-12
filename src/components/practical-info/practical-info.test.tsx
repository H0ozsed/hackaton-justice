import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { PracticalInfo } from '@/shared/practical-info'

import { PracticalInfoSection } from './practical-info'

const entries: PracticalInfo[] = [
  {
    slug: 'trouver-un-conciliateur',
    title: 'Trouver un conciliateur',
    body: 'Le conciliateur de justice est gratuit.',
    links: [
      { label: 'Annuaire des conciliateurs', href: 'https://www.conciliateurs.fr' },
      { label: 'Apprendre', href: '/apprendre' },
    ],
  },
  { slug: 'sans-lien', title: 'Sans lien', body: 'Texte seul.', links: [] },
]

describe('PracticalInfoSection', () => {
  it('lists each entry under the section heading', () => {
    render(<PracticalInfoSection entries={entries} />)
    const section = screen.getByRole('region', { name: 'Infos pratiques' })
    expect(within(section).getAllByRole('heading', { level: 3 })).toHaveLength(2)
  })

  it('announces that an external link opens a new window', () => {
    render(<PracticalInfoSection entries={entries} />)
    const link = screen.getByRole('link', {
      name: 'Annuaire des conciliateurs (nouvelle fenêtre)',
    })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('keeps internal links in the same window', () => {
    render(<PracticalInfoSection entries={entries} />)
    const link = screen.getByRole('link', { name: 'Apprendre' })
    expect(link).toHaveAttribute('href', '/apprendre')
    expect(link).not.toHaveAttribute('target')
  })
})
