import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { whoStatements } from '@/shared/games'

import { WhoDoesWhat } from './who-does-what'

const statements = whoStatements.all.slice(0, 3)

describe('WhoDoesWhat', () => {
  it('asks who each statement is about, in a fieldset named by the statement', () => {
    render(<WhoDoesWhat statements={statements} />)
    const group = screen.getByRole('group', { name: `« ${statements[0]!.statement} »` })
    expect(
      within(group)
        .getAllByRole('checkbox')
        .map((c) => c.getAttribute('id')),
    ).toHaveLength(3)
    expect(within(group).getByRole('checkbox', { name: 'Juge' })).toBeInTheDocument()
  })

  it('lists the cards left empty in an error summary, each with its own error', async () => {
    const user = userEvent.setup()
    render(<WhoDoesWhat statements={statements} />)
    await user.click(
      within(screen.getAllByRole('group')[0]!).getByRole('checkbox', { name: 'Juge' }),
    )
    await user.click(screen.getByRole('button', { name: 'Vérifier mes réponses' }))

    const alert = screen.getByRole('alert')
    expect(alert).toHaveFocus()
    expect(alert).toHaveTextContent('Erreur : 2 cartes sans réponse.')
    expect(within(alert).getAllByRole('link')).toHaveLength(2)
    expect(screen.getAllByRole('group')[1]).toHaveAccessibleDescription(
      'Erreur : cochez au moins une personne.',
    )
  })

  it('scores exact answers only, says what was right, and restarts', async () => {
    const user = userEvent.setup()
    render(<WhoDoesWhat statements={statements} />)
    const groups = screen.getAllByRole('group')
    // First card: exactly right; the others: always "Juge".
    for (const actor of statements[0]!.actors) {
      const label = {
        conciliator: 'Conciliateur de justice',
        mediator: 'Médiateur',
        judge: 'Juge',
      }[actor]
      await user.click(within(groups[0]!).getByRole('checkbox', { name: label }))
    }
    for (const group of groups.slice(1)) {
      await user.click(within(group).getByRole('checkbox', { name: 'Juge' }))
    }
    await user.click(screen.getByRole('button', { name: 'Vérifier mes réponses' }))

    const expected = statements.filter(
      (s, i) => i === 0 || (s.actors.length === 1 && s.actors[0] === 'judge'),
    ).length
    expect(screen.getByRole('heading', { name: `Votre score : ${expected} sur 3` })).toHaveFocus()
    expect(within(groups[0]!).getByText('Juste')).toBeInTheDocument()
    expect(screen.getAllByRole('checkbox')[0]).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Recommencer' }))
    expect(screen.queryByRole('heading', { name: /Votre score/ })).not.toBeInTheDocument()
    expect(
      screen.getAllByRole('checkbox').filter((c) => c.getAttribute('data-state') === 'checked'),
    ).toHaveLength(0)
  })
})
