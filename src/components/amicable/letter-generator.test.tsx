import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { LetterGenerator } from './letter-generator'

const today = () => new Date(2026, 9, 13)

describe('LetterGenerator', () => {
  it('lists the fields to fix in a focused summary, each error bound to its field', async () => {
    const user = userEvent.setup()
    render(<LetterGenerator today={today} />)
    await user.click(screen.getByRole('button', { name: 'Écrire mon courrier' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveFocus()
    expect(alert).toHaveTextContent(/Erreur : \d+ champs à corriger/)
    expect(within(alert).getByRole('link', { name: 'Votre nom' })).toBeInTheDocument()
    const name = screen.getByRole('textbox', { name: 'Votre nom' })
    expect(name).toHaveAttribute('aria-invalid', 'true')
    expect(name).toHaveAccessibleDescription('Erreur : indiquez votre nom.')
  })

  it('writes the letter, focuses it, and copies it', async () => {
    // user-event replaces the clipboard with its own, readable one.
    const user = userEvent.setup()
    render(<LetterGenerator today={today} />)

    await user.type(screen.getByRole('textbox', { name: 'Votre nom' }), 'Camille Durand')
    await user.type(screen.getByRole('textbox', { name: 'Nom du destinataire' }), 'M. Martin')
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Objet du courrier' }),
      'voisinage',
    )
    await user.type(
      screen.getByRole('textbox', { name: 'Ce qui s’est passé' }),
      'Depuis le 3 mars, de la batterie après 23 h.',
    )
    await user.type(
      screen.getByRole('textbox', { name: 'Ce que vous demandez' }),
      'Ne plus jouer après 21 h.',
    )
    await user.click(screen.getByRole('button', { name: 'Écrire mon courrier' }))

    expect(screen.getByRole('heading', { name: 'Votre courrier' })).toHaveFocus()
    const letter = screen.getByTestId('letter')
    expect(letter).toHaveTextContent('Objet : Trouble de voisinage')
    expect(letter).toHaveTextContent('Le 13 octobre 2026')

    await user.click(screen.getByRole('button', { name: 'Copier le courrier' }))
    expect(await navigator.clipboard.readText()).toContain('Madame, Monsieur,')
    expect(screen.getByText(/Courrier copié/)).toBeInTheDocument()
  })

  it('prints the letter alone', async () => {
    const print = vi.fn(() => expect(document.body.dataset.print).toBe('letter'))
    vi.stubGlobal('print', print)
    const user = userEvent.setup()
    render(<LetterGenerator today={today} />)
    await user.type(screen.getByRole('textbox', { name: 'Votre nom' }), 'Camille')
    await user.type(screen.getByRole('textbox', { name: 'Nom du destinataire' }), 'M. Martin')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Objet du courrier' }), 'autre')
    await user.type(
      screen.getByRole('textbox', { name: 'Ce qui s’est passé' }),
      'Un long récit des faits.',
    )
    await user.type(
      screen.getByRole('textbox', { name: 'Ce que vous demandez' }),
      'Une demande claire.',
    )
    await user.click(screen.getByRole('button', { name: 'Écrire mon courrier' }))

    await user.click(screen.getByRole('button', { name: 'Imprimer le courrier' }))
    expect(print).toHaveBeenCalled()
    expect(screen.getByTestId('letter')).toHaveAttribute('data-print-area')
    window.dispatchEvent(new Event('afterprint'))
    expect(document.body.dataset.print).toBeUndefined()
    vi.unstubAllGlobals()
  })
})
