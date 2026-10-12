import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { Quiz } from '@/shared/quiz'

import { QuizPlayer } from './quiz-player'

// The real <Definition> needs real glossary slugs; the content team will change them.
vi.mock('@/components/glossary/definition', () => ({
  Definition: ({ slug }: { slug: string }) => <span data-testid="definition">{slug}</span>,
}))

const QUIZ: Quiz = {
  slug: 'test',
  title: 'Quiz de test',
  questions: [
    {
      id: 'q1',
      prompt: 'Une seule réponse ?',
      choices: [
        { id: 'a', label: 'Réponse A' },
        { id: 'b', label: 'Réponse B' },
      ],
      correctChoiceIds: ['a'],
      explanation: 'Explication 1.',
      glossary: ['conciliation'],
    },
    {
      id: 'q2',
      prompt: 'Plusieurs réponses ?',
      choices: [
        { id: 'a', label: 'Choix A' },
        { id: 'b', label: 'Choix B' },
        { id: 'c', label: 'Choix C' },
      ],
      correctChoiceIds: ['a', 'c'],
      explanation: 'Explication 2.',
      glossary: [],
    },
  ],
}

const setup = () => {
  const user = userEvent.setup()
  render(<QuizPlayer quiz={QUIZ} />)
  return user
}

describe('QuizPlayer', () => {
  it('shows the quiz title, the progress and the first question as a group legend', () => {
    setup()
    expect(screen.getByRole('heading', { level: 2, name: 'Quiz de test' })).toBeInTheDocument()
    expect(screen.getByText('Question 1 sur 2')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Une seule réponse ?' })).toBeInTheDocument()
  })

  it('uses radio buttons when there is one right answer', () => {
    setup()
    expect(screen.getAllByRole('radio')).toHaveLength(2)
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.queryByText('Plusieurs réponses possibles.')).not.toBeInTheDocument()
  })

  it('refuses to validate without an answer, with a linked error message', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Valider' }))

    const error = await screen.findByText(/Choisissez une réponse/)
    expect(error.closest('p')).toHaveTextContent('Erreur : Choisissez une réponse.')
    const group = screen.getByRole('group', { name: 'Une seule réponse ?' })
    expect(group.getAttribute('aria-describedby')).toContain(error.closest('p')!.id)
    expect(screen.queryByText('Bonne réponse !')).not.toBeInTheDocument()
  })

  it('shows and focuses the feedback for a right answer, then locks the question', async () => {
    const user = setup()
    await user.click(screen.getByRole('radio', { name: 'Réponse A' }))
    await user.click(screen.getByRole('button', { name: 'Valider' }))

    const heading = screen.getByRole('heading', { level: 3, name: 'Bonne réponse !' })
    expect(heading.parentElement).toHaveFocus()
    expect(screen.getByText('Explication 1.')).toBeInTheDocument()
    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Valider' })).not.toBeInTheDocument()
  })

  it('explains a wrong answer with text, not only colour', async () => {
    const user = setup()
    await user.click(screen.getByRole('radio', { name: 'Réponse B' }))
    await user.click(screen.getByRole('button', { name: 'Valider' }))

    expect(screen.getByRole('heading', { name: 'Mauvaise réponse' })).toBeInTheDocument()
    expect(screen.getByText(/La bonne réponse :/)).toHaveTextContent('La bonne réponse : Réponse A')
    expect(screen.getByText('Bonne réponse')).toBeInTheDocument()
    expect(screen.getByText('Votre réponse, incorrecte')).toBeInTheDocument()
  })

  it('links the glossary terms of the question in the feedback', async () => {
    const user = setup()
    await user.click(screen.getByRole('radio', { name: 'Réponse A' }))
    await user.click(screen.getByRole('button', { name: 'Valider' }))
    expect(screen.getByTestId('definition')).toHaveTextContent('conciliation')
  })

  it('uses checkboxes and a visible hint when several answers are right', async () => {
    const user = setup()
    await user.click(screen.getByRole('radio', { name: 'Réponse A' }))
    await user.click(screen.getByRole('button', { name: 'Valider' }))
    await user.click(screen.getByRole('button', { name: 'Question suivante' }))

    expect(screen.getByText('Question 2 sur 2')).toBeInTheDocument()
    expect(screen.getAllByRole('checkbox')).toHaveLength(3)
    const group = screen.getByRole('group', { name: 'Plusieurs réponses ?' })
    expect(within(group).getByText('Plusieurs réponses possibles.')).toBeInTheDocument()
    // The new question takes the focus.
    expect(screen.getByText('Plusieurs réponses ?')).toHaveFocus()
  })

  it('needs all the right answers, and only them, for a multiple-answer question', async () => {
    const user = setup()
    await user.click(screen.getByRole('radio', { name: 'Réponse A' }))
    await user.click(screen.getByRole('button', { name: 'Valider' }))
    await user.click(screen.getByRole('button', { name: 'Question suivante' }))
    await user.click(screen.getByRole('checkbox', { name: 'Choix A' }))
    await user.click(screen.getByRole('button', { name: 'Valider' }))

    expect(screen.getByRole('heading', { name: 'Mauvaise réponse' })).toBeInTheDocument()
    expect(screen.getByText(/Les bonnes réponses :/)).toHaveTextContent('Choix A, Choix C')
  })

  it('shows the final score with a recap, and can restart', async () => {
    const user = setup()
    await user.click(screen.getByRole('radio', { name: 'Réponse A' }))
    await user.click(screen.getByRole('button', { name: 'Valider' }))
    await user.click(screen.getByRole('button', { name: 'Question suivante' }))
    await user.click(screen.getByRole('checkbox', { name: 'Choix B' }))
    await user.click(screen.getByRole('button', { name: 'Valider' }))
    await user.click(screen.getByRole('button', { name: 'Voir mon score' }))

    const score = screen.getByRole('heading', { name: 'Votre score : 1 / 2 (50 %)' })
    expect(score.parentElement).toHaveFocus()
    const recap = screen.getAllByRole('listitem').map((li) => li.textContent)
    expect(recap).toEqual(['Une seule réponse ? — Réussie', 'Plusieurs réponses ? — Ratée'])

    await user.click(screen.getByRole('button', { name: 'Recommencer' }))
    expect(screen.getByText('Question 1 sur 2')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Réponse A' })).not.toBeChecked()
  })

  it('can be completed with the keyboard only', async () => {
    const user = setup()
    await user.tab() // first radio
    await user.keyboard(' ') // select it
    expect(screen.getByRole('radio', { name: 'Réponse A' })).toBeChecked()
    await user.tab() // Valider
    expect(screen.getByRole('button', { name: 'Valider' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('heading', { name: 'Bonne réponse !' })).toBeInTheDocument()
  })

  it('does not steal the focus on page load', () => {
    setup()
    expect(document.body).toHaveFocus()
  })
})
