import { render, screen, within } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { glossary } from '@/shared/glossary'
import { scenarioSchema } from '@/shared/role-play'

import { RolePlayGame } from './role-play-game'

// Reduced motion is read through framer-motion: switch it per test.
const motion = vi.hoisted(() => ({ reduce: false }))
vi.mock('framer-motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('framer-motion')>()),
  useReducedMotion: () => motion.reduce,
}))

// Long lines: the progressive text is still being typed when the test acts.
const long = (text: string) => `${text} ${'blabla '.repeat(40)}`
const term = glossary.all[0]

const scenario = scenarioSchema.parse({
  slug: 'test',
  title: 'Histoire de test',
  intro: 'Une introduction.',
  characters: [
    { id: 'moi', name: 'Camille', role: 'Locataire', avatar: 'player' },
    { id: 'voisin', name: 'M. Martin', role: 'Voisin', avatar: 'neighbor' },
  ],
  startSceneId: 'debut',
  scenes: [
    {
      id: 'debut',
      setting: 'Sur le palier',
      lines: [
        { text: long('Première réplique.') },
        { speaker: 'voisin', text: `Parlons de [[${term.slug}]].` },
      ],
      choices: [
        { id: 'parler', label: 'Discuter', next: 'fin', quality: 'good', feedback: 'Bien.' },
        { id: 'crier', label: 'Crier', next: 'fin', quality: 'bad', feedback: 'Non.' },
      ],
    },
    { id: 'fin', lines: [{ speaker: 'moi', text: 'Au revoir.' }], ending: { title: 'Accord' } },
  ],
})

/** Shows every line of the scene in full and goes to its choices or ending. */
async function readScene(user: UserEvent) {
  for (;;) {
    const button = screen.getByRole('button', { name: /Tout afficher|Suivant|Continuer/ })
    const label = button.textContent
    await user.click(button)
    if (label === 'Continuer') return
  }
}

beforeEach(() => {
  motion.reduce = false
})

describe('RolePlayGame', () => {
  it('starts with the intro, then moves the focus to the first scene', async () => {
    const user = userEvent.setup()
    render(<RolePlayGame scenario={scenario} />)

    expect(screen.getByRole('heading', { name: 'Histoire de test' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Commencer' }))

    expect(await screen.findByRole('heading', { name: 'Scène 1 — Sur le palier' })).toHaveFocus()
  })

  it('lets the user skip the progressive text', async () => {
    const user = userEvent.setup()
    render(<RolePlayGame scenario={scenario} />)
    await user.click(screen.getByRole('button', { name: 'Commencer' }))

    await user.click(await screen.findByRole('button', { name: 'Tout afficher' }))
    expect(screen.getByText(/^Première réplique\./)).toBeVisible()
    expect(screen.getByRole('button', { name: 'Suivant' })).toBeInTheDocument()
  })

  it('announces each line in full to screen readers', async () => {
    const user = userEvent.setup()
    const { container } = render(<RolePlayGame scenario={scenario} />)
    await user.click(screen.getByRole('button', { name: 'Commencer' }))
    await screen.findByRole('button', { name: 'Tout afficher' })

    const live = container.querySelector('[aria-live="polite"]')
    expect(live).toHaveTextContent(/^Narrateur : Première réplique\./)
  })

  it('links difficult terms to their definition once the line is shown', async () => {
    const user = userEvent.setup()
    render(<RolePlayGame scenario={scenario} />)
    await user.click(screen.getByRole('button', { name: 'Commencer' }))
    await user.click(await screen.findByRole('button', { name: 'Tout afficher' }))
    await user.click(screen.getByRole('button', { name: 'Suivant' }))
    await user.click(screen.getByRole('button', { name: 'Tout afficher' }))

    await user.click(screen.getByRole('button', { name: `${term.term} (voir la définition)` }))
    expect(screen.getByRole('dialog')).toHaveTextContent(term.definition)
  })

  it('offers the choices as buttons in a named group, focusing the first one', async () => {
    const user = userEvent.setup()
    render(<RolePlayGame scenario={scenario} />)
    await user.click(screen.getByRole('button', { name: 'Commencer' }))
    await screen.findByRole('heading', { name: /Scène 1/ })
    await readScene(user)

    const group = screen.getByRole('group', { name: 'Que faites-vous ?' })
    const choices = within(group).getAllByRole('button')
    expect(choices.map((c) => c.textContent)).toEqual(['Discuter', 'Crier'])
    expect(choices[0]).toHaveFocus()
  })

  it('can be played to the end and restarted with the keyboard only', async () => {
    const user = userEvent.setup()
    render(<RolePlayGame scenario={scenario} />)

    await user.tab()
    expect(screen.getByRole('button', { name: 'Commencer' })).toHaveFocus()
    await user.keyboard('{Enter}')
    await screen.findByRole('heading', { name: /Scène 1/ })

    // Heading focused → Tab to the dialogue button, Enter until the choices.
    await user.tab()
    while (!screen.queryByRole('group')) await user.keyboard('{Enter}')
    await user.tab()
    expect(screen.getByRole('button', { name: 'Crier' })).toHaveFocus()
    await user.keyboard('{Enter}')

    expect(await screen.findByRole('heading', { name: 'Scène 2' })).toHaveFocus()
    await user.tab()
    while (!screen.queryByRole('button', { name: 'Rejouer' })) await user.keyboard('{Enter}')
    expect(screen.getByRole('heading', { name: 'Fin : Accord' })).toHaveFocus()

    await user.tab()
    await user.keyboard('{Enter}')
    expect(await screen.findByRole('heading', { name: /Scène 1/ })).toHaveFocus()
  })

  it('shows the text at once and without animation when reduced motion is preferred', async () => {
    motion.reduce = true
    const user = userEvent.setup()
    render(<RolePlayGame scenario={scenario} />)
    await user.click(screen.getByRole('button', { name: 'Commencer' }))

    expect(await screen.findByText(/^Première réplique\./)).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Tout afficher' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Suivant' })).toBeInTheDocument()
  })
})
