import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { checklist, guides, keyFigures, routes } from '@/shared/amicable'

import { GuideList } from './guide-list'
import { KeyFigures } from './key-figures'
import { PreparationChecklist } from './preparation-checklist'
import { RoutesComparison } from './routes-comparison'

describe('KeyFigures', () => {
  it('shows every figure and names its sources', () => {
    render(<KeyFigures />)
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(keyFigures.all.length)
    expect(items[0]).toHaveTextContent(keyFigures.all[0]!.value)
    expect(screen.getByText(/^Sources :/)).toHaveTextContent('Infostat Justice')
  })
})

describe('RoutesComparison', () => {
  it('is a table with a header per route and per criterion', () => {
    render(<RoutesComparison />)
    const table = screen.getByRole('table', { name: /Comparaison des façons de régler un litige/ })
    const columns = within(table).getAllByRole('columnheader')
    expect(columns).toHaveLength(routes.all.length)
    expect(columns[0]).toHaveTextContent('En parler directementVoie amiable')
    expect(columns.at(-1)).toHaveTextContent('Voie judiciaire')
    const rows = within(table)
      .getAllByRole('rowheader')
      .map((h) => h.textContent)
    expect(rows).toEqual(['Qui vous aide', 'Coût', 'Qui décide', 'Durée', 'Ce que vaut l’issue'])
  })

  it('says in words which routes are amicable (never by colour alone)', () => {
    render(<RoutesComparison />)
    expect(screen.getByText('Vous gardez la main')).toBeInTheDocument()
    expect(screen.getByText('Un juge décide pour vous')).toBeInTheDocument()
  })
})

describe('GuideList', () => {
  it('opens a guide on its numbered steps, tips and sources', async () => {
    const user = userEvent.setup()
    render(<GuideList />)
    const guide = guides.all[0]!
    const trigger = screen.getByRole('button', { name: guide.title })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    const steps = screen.getAllByRole('list')[0]!
    expect(steps.tagName).toBe('OL')
    expect(within(steps).getAllByRole('listitem')).toHaveLength(guide.steps.length)
    expect(screen.getByText('Bon à savoir')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: `${guide.sources[0]!.label} (nouvelle fenêtre)` }),
    ).toHaveAttribute('target', '_blank')
  })

  it('puts each guide title in a heading under the section h2', () => {
    render(<GuideList />)
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(guides.all.length)
  })
})

describe('PreparationChecklist', () => {
  it('counts what is ready, politely announced', async () => {
    const user = userEvent.setup()
    render(<PreparationChecklist />)
    const boxes = screen.getAllByRole('checkbox')
    expect(boxes).toHaveLength(checklist.all.length)
    const status = screen.getByText(/sur \d+ prêt/)
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveTextContent(`0 sur ${boxes.length} prêt`)

    for (const box of boxes) await user.click(box)
    expect(status).toHaveTextContent('vous êtes prêt(e) pour votre rendez-vous')
    await user.click(boxes[0]!)
    expect(status).toHaveTextContent(`${boxes.length - 1} sur ${boxes.length} prêts`)
  })

  it('gives each item its help as a description, and can be printed', async () => {
    // happy-dom has no window.print.
    const print = vi.fn()
    vi.stubGlobal('print', print)
    const user = userEvent.setup()
    render(<PreparationChecklist />)
    const item = checklist.all[0]!
    expect(screen.getByRole('checkbox', { name: item.label })).toHaveAccessibleDescription(
      item.help!,
    )
    await user.click(screen.getByRole('button', { name: 'Imprimer la liste' }))
    expect(print).toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})
