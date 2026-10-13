import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { glossary } from '@/shared/glossary'

import { Definition } from './definition'

// Uses the real glossary: any existing term works, its text is read from the data.
const entry = glossary.all[0]

describe('Definition', () => {
  it('shows the term as a button, with a hint for screen readers', () => {
    render(<Definition slug={entry.slug} />)
    expect(
      screen.getByRole('button', { name: `${entry.term} (voir la définition)` }),
    ).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens the definition on click', async () => {
    const user = userEvent.setup()
    render(<Definition slug={entry.slug} />)

    await user.click(screen.getByRole('button'))
    const dialog = screen.getByRole('dialog', { name: `Définition : ${entry.term}` })
    expect(dialog).toHaveTextContent(entry.definition)
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
  })

  it('opens with Enter and closes with Escape, giving the focus back', async () => {
    const user = userEvent.setup()
    render(<Definition slug={entry.slug} />)

    await user.tab()
    expect(screen.getByRole('button')).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('dialog')).toHaveTextContent(entry.definition)

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('button')).toHaveFocus()
  })

  it('links to the full entry on the glossary page, reachable with Tab', async () => {
    const user = userEvent.setup()
    render(<Definition slug={entry.slug} />)

    await user.click(screen.getByRole('button'))
    const link = screen.getByRole('link', { name: `Voir dans le lexique : ${entry.term}` })
    expect(link).toHaveAttribute('href', `/apprendre/lexique#${entry.slug}`)

    // The popover takes the focus when it opens; the link is the next stop.
    for (let i = 0; i < 3 && document.activeElement !== link; i++) await user.tab()
    expect(link).toHaveFocus()
  })

  it('shows another text in the sentence when given children', () => {
    render(<Definition slug={entry.slug}>autre forme</Definition>)
    expect(screen.getByRole('button')).toHaveTextContent('autre forme')
  })

  it('finds a term by its text, ignoring case', async () => {
    const user = userEvent.setup()
    render(<Definition term={entry.term.toUpperCase()} />)
    expect(screen.getByRole('button')).toHaveTextContent(entry.term.toUpperCase())
    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('dialog')).toHaveTextContent(entry.definition)
  })

  it('finds a term by one of its aliases', async () => {
    const withAlias = glossary.all.find((t) => t.aliases.length > 0)
    if (!withAlias) return
    const user = userEvent.setup()
    render(<Definition term={withAlias.aliases[0]} />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('dialog')).toHaveTextContent(withAlias.definition)
  })

  it('throws an explicit error when the term is not in the glossary', () => {
    // React logs the thrown error: keep the test output clean.
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Definition slug="terme-inconnu" />)).toThrow(
      '<Definition>: slug "terme-inconnu" is not in the glossary',
    )
    expect(() => render(<Definition term="Inconnu" />)).toThrow(
      '<Definition>: term "Inconnu" is not in the glossary',
    )
    log.mockRestore()
  })
})
