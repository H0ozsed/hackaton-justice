import { render, screen } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { rephraseRounds } from '@/shared/games'

import { RephraseGame } from './rephrase-game'

const rounds = rephraseRounds.all.slice(0, 2)

const pick = async (user: UserEvent, kind: 'nvc' | 'other', index: number) => {
  const round = rounds[index]!
  const reply = round.replies.find((r) => (kind === 'nvc' ? r.kind === 'nvc' : r.kind !== 'nvc'))!
  await user.click(screen.getByRole('radio', { name: `« ${reply.text} »` }))
  await user.click(screen.getByRole('button', { name: 'Valider' }))
}

describe('RephraseGame', () => {
  it('shows the situation and what you feel like saying, with the tension in text', () => {
    render(<RephraseGame rounds={rounds} />)
    expect(screen.getByRole('heading', { name: 'Situation 1 sur 2' })).toBeInTheDocument()
    expect(screen.getByText(rounds[0]!.situation)).toBeInTheDocument()
    expect(screen.getByText(`« ${rounds[0]!.impulse} »`)).toBeInTheDocument()
    expect(screen.getByText('5 sur 10')).toBeInTheDocument()
    expect(screen.getByTestId('rephrase-stage').querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('asks for an answer before going on', async () => {
    const user = userEvent.setup()
    render(<RephraseGame rounds={rounds} />)
    await user.click(screen.getByRole('button', { name: 'Valider' }))
    expect(screen.getByText('Erreur : choisissez une réponse.')).toBeInTheDocument()
    expect(
      screen.getByRole('group', { name: 'Que dites-vous plutôt ?' }),
    ).toHaveAccessibleDescription('Erreur : choisissez une réponse.')
  })

  it('lowers the tension with a non-violent reply, and says why, with the focus on it', async () => {
    const user = userEvent.setup()
    render(<RephraseGame rounds={rounds} />)
    await pick(user, 'nvc', 0)
    expect(screen.getByRole('heading', { name: 'Bien joué : la tension baisse' })).toHaveFocus()
    expect(screen.getByText('3 sur 10')).toBeInTheDocument()
    expect(screen.getByText(rounds[0]!.explanation)).toBeInTheDocument()
  })

  it('raises it otherwise and shows the reply that calms things down', async () => {
    const user = userEvent.setup()
    render(<RephraseGame rounds={rounds} />)
    await pick(user, 'other', 0)
    expect(screen.getByRole('heading', { name: 'Aïe : la tension monte' })).toHaveFocus()
    expect(screen.getByText(/La réponse qui apaise/)).toBeInTheDocument()
  })

  it('ends with a summary and can be played again', async () => {
    const user = userEvent.setup()
    render(<RephraseGame rounds={rounds} />)
    await pick(user, 'nvc', 0)
    await user.click(screen.getByRole('button', { name: 'Situation suivante' }))
    expect(screen.getByRole('heading', { name: 'Situation 2 sur 2' })).toHaveFocus()
    await pick(user, 'nvc', 1)
    await user.click(screen.getByRole('button', { name: 'Voir mon bilan' }))

    expect(screen.getByRole('heading', { name: 'Votre bilan' })).toHaveFocus()
    expect(screen.getByText('2 sur 2')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Rejouer' }))
    expect(screen.getByRole('heading', { name: 'Situation 1 sur 2' })).toBeInTheDocument()
    expect(screen.getByText('5 sur 10')).toBeInTheDocument()
  })
})
