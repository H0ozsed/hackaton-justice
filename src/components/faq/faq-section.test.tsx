import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { FaqEntry, FaqPage } from '@/shared/faq'

import { FaqSection } from './faq-section'

// Test data instead of the real content, which the content team will replace.
const ENTRIES: FaqEntry[] = [
  { slug: 'q-home', question: 'Question accueil ?', answer: 'Réponse accueil.', pages: ['home'] },
  {
    slug: 'q-both',
    question: 'Question partout ?',
    answer: 'Premier paragraphe.\n\nDeuxième paragraphe.',
    pages: ['home', 'learn'],
  },
  { slug: 'q-learn', question: 'Question apprendre ?', answer: 'Réponse.', pages: ['learn'] },
]

vi.mock('@/shared/faq', () => ({
  getFaqForPage: (page: FaqPage) => ENTRIES.filter((entry) => entry.pages.includes(page)),
}))

describe('FaqSection', () => {
  it('shows only the questions of the requested page', () => {
    render(<FaqSection page="home" />)
    const questions = screen.getAllByRole('button').map((b) => b.textContent)
    expect(questions).toEqual(['Question accueil ?', 'Question partout ?'])
  })

  it('renders a labelled section with an h2 and questions as h3 by default', () => {
    render(<FaqSection page="home" />)
    const section = screen.getByRole('region', { name: 'Questions fréquentes' })
    expect(within(section).getByRole('heading', { level: 2 })).toHaveTextContent(
      'Questions fréquentes',
    )
    expect(within(section).getAllByRole('heading', { level: 3 })).toHaveLength(2)
  })

  it('shifts the question headings with the section heading level', () => {
    render(<FaqSection page="learn" title="FAQ" headingLevel={3} />)
    expect(screen.getByRole('heading', { level: 3, name: 'FAQ' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(2)
  })

  it('opens and closes an answer on click, announcing the state', async () => {
    const user = userEvent.setup()
    render(<FaqSection page="home" />)
    const question = screen.getByRole('button', { name: 'Question accueil ?' })

    expect(question).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Réponse accueil.')).not.toBeInTheDocument()

    await user.click(question)
    expect(question).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Réponse accueil.')).toBeVisible()

    await user.click(question)
    expect(question).toHaveAttribute('aria-expanded', 'false')
  })

  it('keeps several answers open at once', async () => {
    const user = userEvent.setup()
    render(<FaqSection page="home" />)
    await user.click(screen.getByRole('button', { name: 'Question accueil ?' }))
    await user.click(screen.getByRole('button', { name: 'Question partout ?' }))
    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveAttribute('aria-expanded', 'true')
    }
  })

  it('works with the keyboard: Enter/Space toggle, arrows move between questions', async () => {
    const user = userEvent.setup()
    render(<FaqSection page="home" />)
    const [first, second] = screen.getAllByRole('button')

    await user.tab()
    expect(first).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(first).toHaveAttribute('aria-expanded', 'true')

    await user.keyboard('{ArrowDown}')
    expect(second).toHaveFocus()
    await user.keyboard(' ')
    expect(second).toHaveAttribute('aria-expanded', 'true')
  })

  it('splits an answer into paragraphs on blank lines', async () => {
    const user = userEvent.setup()
    render(<FaqSection page="home" />)
    await user.click(screen.getByRole('button', { name: 'Question partout ?' }))
    expect(screen.getByText('Premier paragraphe.').tagName).toBe('P')
    expect(screen.getByText('Deuxième paragraphe.').tagName).toBe('P')
  })

  it('renders nothing when the page has no question', () => {
    vi.spyOn(ENTRIES, 'filter').mockReturnValueOnce([])
    const { container } = render(<FaqSection page="home" />)
    expect(container).toBeEmptyDOMElement()
  })
})
