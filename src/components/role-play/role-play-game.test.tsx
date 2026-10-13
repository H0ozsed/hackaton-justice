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
        {
          id: 'crier',
          label: 'Crier',
          next: 'fin',
          quality: 'bad',
          feedback: 'Non.',
          losses: { relationship: 3 },
        },
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

    // The sound switch comes first, then the start button.
    await user.tab()
    expect(screen.getByRole('button', { name: 'Son' })).toHaveFocus()
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
    while (!screen.queryByRole('button', { name: 'Voir mon bilan' })) {
      await user.keyboard('{Enter}')
    }
    expect(screen.getByRole('heading', { name: 'Fin : Accord' })).toHaveFocus()

    await user.tab()
    await user.keyboard('{Enter}')
    expect(await screen.findByRole('heading', { name: 'Votre bilan' })).toHaveFocus()

    await user.tab()
    while (document.activeElement?.textContent !== 'Rejouer') await user.tab()
    await user.keyboard('{Enter}')
    expect(await screen.findByRole('heading', { name: /Scène 1/ })).toHaveFocus()
  })

  it('ends with results consistent with the choices made', async () => {
    const user = userEvent.setup()
    render(<RolePlayGame scenario={scenario} />)
    await user.click(screen.getByRole('button', { name: 'Commencer' }))
    await screen.findByRole('heading', { name: /Scène 1/ })
    await readScene(user)
    await user.click(screen.getByRole('button', { name: 'Crier' }))
    await screen.findByRole('heading', { name: 'Scène 2' })
    await readScene(user)
    await user.click(screen.getByRole('button', { name: 'Voir mon bilan' }))

    const results = await screen.findByRole('region', { name: 'Votre bilan' })
    expect(results).toHaveTextContent('0 %')
    expect(results).toHaveTextContent('0 bon choix sur 1')

    const corrections = within(screen.getByRole('region', { name: 'Corrections' }))
    const correction = corrections.getByRole('listitem')
    expect(correction).toHaveTextContent('Votre choix : Crier À éviter')
    expect(correction).toHaveTextContent('Non.')
    expect(correction).toHaveTextContent('Meilleur choix : Discuter')

    const losses = within(screen.getByRole('region', { name: 'Ce que vos choix vous ont coûté' }))
    expect(losses.getByText('Relations').closest('div')).toHaveTextContent('Moyenne')
    expect(losses.getByText('Argent').closest('div')).toHaveTextContent('0 €')
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

  it('draws each scene on a decorative stage with a title card', async () => {
    const user = userEvent.setup()
    render(<RolePlayGame scenario={scenario} />)
    // No cast list before the game: characters are discovered while playing.
    expect(screen.queryByText('M. Martin')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Commencer' }))

    const stage = await screen.findByTestId('stage')
    expect(stage.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByTestId('title-card')).toHaveTextContent('Scène 1Sur le palier')
    expect(stage.querySelectorAll('[data-character]')).toHaveLength(2)
    // Narrator first, then M. Martin speaks.
    expect(stage.querySelector('[data-speaking]')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Tout afficher' }))
    await user.click(screen.getByRole('button', { name: 'Suivant' }))
    expect(stage.querySelector('[data-speaking]')).toHaveAttribute('data-character', 'voisin')
  })

  it('shows the life gauges in text and announces what a choice cost', async () => {
    const user = userEvent.setup()
    const { container } = render(<RolePlayGame scenario={scenario} />)
    await user.click(screen.getByRole('button', { name: 'Commencer' }))
    await screen.findByRole('heading', { name: /Scène 1/ })

    const gauges = () => screen.getByRole('list', { name: 'Vos jauges' })
    expect(gauges()).toHaveTextContent('Relation10/1010 sur 10')
    await readScene(user)
    await user.click(screen.getByRole('button', { name: 'Crier' }))
    await screen.findByRole('heading', { name: 'Scène 2' })

    expect(gauges()).toHaveTextContent('Relation7/107 sur 10')
    expect(gauges()).toHaveTextContent('Santé10/1010 sur 10')
    const [, notice] = container.querySelectorAll('[aria-live="polite"]')
    expect(notice).toHaveTextContent('Relation moins 3.')
  })

  it('shows no title card when reduced motion is preferred', async () => {
    motion.reduce = true
    const user = userEvent.setup()
    render(<RolePlayGame scenario={scenario} />)
    await user.click(screen.getByRole('button', { name: 'Commencer' }))

    expect(await screen.findByTestId('stage')).toBeInTheDocument()
    expect(screen.queryByTestId('title-card')).toBeNull()
  })

  it('has a sound switch, off by default, remembered on the device', async () => {
    window.localStorage.clear()
    const user = userEvent.setup()
    const { unmount } = render(<RolePlayGame scenario={scenario} />)
    const button = screen.getByRole('button', { name: 'Son' })
    expect(button).toHaveAttribute('aria-pressed', 'false')

    await user.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'true')
    // Playing with the sound on works even without Web Audio (silent).
    await user.click(screen.getByRole('button', { name: 'Commencer' }))
    await user.click(await screen.findByRole('button', { name: 'Tout afficher' }))
    unmount()

    render(<RolePlayGame scenario={scenario} />)
    expect(await screen.findByRole('button', { name: 'Son', pressed: true })).toBeInTheDocument()
    window.localStorage.clear()
  })
})

// Scenario with an opening, roles to discover and choices with actions.
const staged = scenarioSchema.parse({
  slug: 'staged',
  title: 'Histoire animée',
  intro: 'Résumé.',
  opening: [
    { shot: 'street', text: 'Un soir, dans la rue.' },
    { shot: 'bedroom', text: 'Dans votre chambre.' },
  ],
  characters: [
    { id: 'moi', name: 'Camille', role: 'Locataire', avatar: 'player' },
    { id: 'voisin', name: 'M. Martin', role: 'Votre voisin', avatar: 'neighbor' },
  ],
  startSceneId: 'debut',
  scenes: [
    {
      id: 'debut',
      lines: [
        { speaker: 'voisin', text: 'Bonsoir.' },
        { speaker: 'voisin', text: 'Encore moi.' },
      ],
      choices: [
        {
          id: 'balai',
          label: 'Taper au plafond',
          next: 'fin',
          quality: 'bad',
          feedback: 'Non.',
          action: 'broom',
        },
      ],
    },
    { id: 'fin', lines: [{ speaker: 'voisin', text: 'Au revoir.' }], ending: { title: 'Fin' } },
  ],
})

describe('RolePlayGame, staged scenario', () => {
  it('plays the opening shot by shot, and can start at any time', async () => {
    motion.reduce = true // captions shown at once
    const user = userEvent.setup()
    const { container } = render(<RolePlayGame scenario={staged} />)

    expect(screen.getByTestId('caption')).toHaveTextContent('Un soir, dans la rue.')
    expect(screen.getByTestId('opening').querySelector('[data-shot="street"]')).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Commencer' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Suivant' }))
    expect(screen.getByTestId('caption')).toHaveTextContent('Dans votre chambre.')
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(
      'Narrateur : Dans votre chambre.',
    )
    // Last shot: only the start button.
    expect(screen.queryByRole('button', { name: 'Suivant' })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Commencer' }))
    expect(await screen.findByRole('heading', { name: 'Scène 1' })).toHaveFocus()
  })

  it('gives the role of a character the first time they speak only', async () => {
    motion.reduce = true
    const user = userEvent.setup()
    render(<RolePlayGame scenario={staged} />)
    await user.click(screen.getByRole('button', { name: 'Commencer' }))

    expect(await screen.findByTestId('bubble')).toHaveTextContent(
      'M. Martin (Votre voisin)Bonsoir.',
    )
    await user.click(screen.getByRole('button', { name: 'Suivant' }))
    expect(screen.getByTestId('bubble')).toHaveTextContent(/^M\. MartinEncore moi\.$/)
  })

  it('animates the choice made before the next scene, skippable', async () => {
    const user = userEvent.setup()
    render(<RolePlayGame scenario={staged} />)
    await user.click(screen.getByRole('button', { name: 'Commencer' }))
    await screen.findByRole('heading', { name: 'Scène 1' })
    await readScene(user)
    await user.click(screen.getByRole('button', { name: 'Taper au plafond' }))

    expect(await screen.findByRole('heading', { name: 'Scène 2' })).toHaveFocus()
    expect(screen.getByTestId('caption')).toHaveTextContent('Votre choixTaper au plafond')
    expect(screen.getByTestId('stage').querySelector('[data-action="broom"]')).not.toBeNull()

    await user.click(screen.getByRole('button', { name: 'Suivant' }))
    expect(screen.getByTestId('stage').querySelector('[data-action]')).toBeNull()
    expect(screen.getByTestId('bubble')).toBeInTheDocument()
  })

  it('does not animate the choice with reduced motion', async () => {
    motion.reduce = true
    const user = userEvent.setup()
    render(<RolePlayGame scenario={staged} />)
    await user.click(screen.getByRole('button', { name: 'Commencer' }))
    await readScene(user)
    await user.click(screen.getByRole('button', { name: 'Taper au plafond' }))

    await screen.findByRole('heading', { name: 'Scène 2' })
    expect(screen.getByTestId('stage').querySelector('[data-action]')).toBeNull()
    expect(screen.getByTestId('bubble')).toHaveTextContent('Au revoir.')
  })
})
