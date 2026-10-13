import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import type { Channel, ConflictType } from '@/shared/simulation'

import { createConflictTypeStep } from './conflict-type-step'
import { createLossFrequencyStep } from './loss-frequency-step'
import { opennessStep } from './openness-step'
import { createSimulationResult } from './simulation-result'
import { SimulationForm } from './simulation-form'
import type { SimulationResult } from './types'

// Fixtures: channels and conflict types built here (never the shared content, which the content
// team will change).
const channel = (slug: string, attributes: Partial<Channel>): Channel => ({
  slug,
  name: `Canal ${slug}`,
  family: 'dialogue',
  description: `Description du canal ${slug}.`,
  forYouIf: `Vous êtes dans le cas ${slug}.`,
  disputes: [],
  excluded: [],
  amicable: true,
  free: true,
  inSimulation: true,
  sources: [],
  ...attributes,
})

const talk = channel('talk', {})
const neutral = channel('neutral', {
  family: 'conciliation',
  law: { text: 'Le texte de loi du canal neutre.', references: ['Code, art. 1'] },
  disputes: ['Litige A'],
  excluded: ['Litige B'],
  access: 'Par courrier.',
  contact: { url: 'https://example.org/neutral', phone: '01 23 45 67 89' },
  cost: 'Partagé entre les parties',
  agreement: 'Homologable par le juge',
  sources: [{ label: 'Source officielle', href: 'https://example.org/source' }],
})
const court = channel('court', { family: 'judge', amicable: false, free: false })
const judgeOnly = channel('judge-only', { family: 'conciliation', inSimulation: false })
const other = channel('other', { family: 'mediation', conflictTypes: ['ailleurs'] })
const channels = [court, neutral, talk, judgeOnly, other]

const conflictType: ConflictType = {
  slug: 'commerce',
  label: 'Type commerce',
  description: 'Description commerce.',
  examples: [],
  lossKinds: ['money'],
  followUpQuestions: [],
}
const elsewhere: ConflictType = { ...conflictType, slug: 'ailleurs', label: 'Type ailleurs' }

const Result = createSimulationResult({ channels, conflictTypes: [conflictType, elsewhere] })

const answers = (userOpenness: string, otherPartyOpenness: string): SimulationResult => ({
  'conflict-type': { type: 'commerce' },
  'loss-frequency': { money: 150, frequency: 'monthly' },
  openness: { userOpenness, otherPartyOpenness },
})

function renderResult(result: SimulationResult, onRestart = vi.fn()) {
  const user = userEvent.setup()
  const view = render(<Result result={result} onRestart={onRestart} />)
  return { user, onRestart, ...view }
}

async function expectNoAxeViolation(container: HTMLElement) {
  const results = await axe.run(container, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    rules: { 'color-contrast': { enabled: false } },
  })
  expect(results.violations).toEqual([])
}

const solutions = () => screen.getByRole('radiogroup', { name: /Quelle solution correspond/ })
const chosen = (name: string) => screen.getByRole('region', { name })

describe('simulation result screen', () => {
  describe('the solutions to choose from', () => {
    it('lists the solutions of the conflict type, grouped from talking to the judge', () => {
      renderResult(answers('yes', 'unknown'))

      const group = (name: string) => within(solutions()).getByRole('group', { name })
      expect(within(solutions()).getAllByRole('group')).toHaveLength(3)
      expect(within(group('Se parler')).getByRole('radio', { name: 'Canal talk' })).toBeVisible()
      expect(
        within(group('Conciliation')).getByRole('radio', { name: 'Canal neutral' }),
      ).toBeVisible()
      expect(within(group('Le juge')).getByRole('radio', { name: 'Canal court' })).toBeVisible()
    })

    it('leaves out the solutions meant for another conflict, or that only a judge starts', () => {
      renderResult(answers('yes', 'unknown'))

      expect(screen.queryByRole('radio', { name: 'Canal other' })).not.toBeInTheDocument()
      expect(screen.queryByRole('radio', { name: 'Canal judge-only' })).not.toBeInTheDocument()
    })

    it('chooses nothing for the person, whatever their answers', () => {
      for (const [user, other] of [
        ['yes', 'yes'],
        ['no', 'no'],
      ]) {
        const { unmount } = renderResult(answers(user, other))
        expect(within(solutions()).queryAllByRole('radio', { checked: true })).toHaveLength(0)
        expect(screen.queryByText('La solution choisie')).not.toBeInTheDocument()
        unmount()
      }
    })

    it('says « C’est pour vous si… » and the cost of each solution, tied to its choice', () => {
      renderResult(answers('yes', 'unknown'))

      expect(screen.getByRole('radio', { name: 'Canal neutral' })).toHaveAccessibleDescription(
        'C’est pour vous si : Vous êtes dans le cas neutral. Partagé entre les parties',
      )
      expect(screen.getByRole('radio', { name: 'Canal court' })).toHaveAccessibleDescription(
        /Peut avoir un coût\.$/,
      )
    })
  })

  describe('the chosen solution', () => {
    it('shows its details, what the law says first', async () => {
      const { user } = renderResult(answers('yes', 'unknown'))
      await user.click(screen.getByRole('radio', { name: 'Canal neutral' }))

      const region = chosen('Canal neutral')
      const terms = within(region)
        .getAllByRole('term')
        .map((dt) => dt.textContent)
      expect(terms[0]).toBe('Ce que dit la loi')
      expect(region).toHaveTextContent('Le texte de loi du canal neutre.')
      expect(region).toHaveTextContent('Code, art. 1')
      expect(terms).toEqual(
        expect.arrayContaining([
          'En bref',
          'Litiges concernés',
          'Ne traite pas',
          'Comment y accéder',
          'Coût',
          'Valeur de l’accord',
          'Pour aller plus loin',
        ]),
      )
      expect(region).toHaveTextContent('Voie amiable')
    })

    it('links to its contact and its official sources in a new window, said in the link text', async () => {
      const { user } = renderResult(answers('yes', 'unknown'))
      await user.click(screen.getByRole('radio', { name: 'Canal neutral' }))

      const contact = screen.getByRole('link', {
        name: 'Contact : Canal neutral (nouvelle fenêtre)',
      })
      expect(contact).toHaveAttribute('href', 'https://example.org/neutral')
      expect(contact).toHaveAttribute('target', '_blank')
      expect(contact).toHaveAttribute('rel', 'noopener noreferrer')
      expect(
        screen.getByRole('link', { name: 'Source : Source officielle (nouvelle fenêtre)' }),
      ).toHaveAttribute('href', 'https://example.org/source')
      expect(screen.getByRole('link', { name: '01 23 45 67 89' })).toHaveAttribute(
        'href',
        'tel:0123456789',
      )
    })

    it('changes with the choice, and says in words when it is the judge', async () => {
      const { user } = renderResult(answers('yes', 'unknown'))
      await user.click(screen.getByRole('radio', { name: 'Canal neutral' }))
      await user.click(screen.getByRole('radio', { name: 'Canal court' }))

      expect(screen.queryByRole('region', { name: 'Canal neutral' })).not.toBeInTheDocument()
      expect(chosen('Canal court')).toHaveTextContent('Voie judiciaire')
      expect(chosen('Canal court')).toHaveTextContent('Peut avoir un coût')
    })
  })

  describe('around the solutions', () => {
    it('points to free information before choosing (points-justice, CDAD)', () => {
      renderResult(answers('no', 'no'))

      const region = screen.getByRole('region', { name: 'Besoin d’en parler avant de choisir ?' })
      expect(region).toHaveTextContent('CDAD')
      expect(within(region).getByRole('link')).toHaveAttribute('target', '_blank')
      expect(within(region).getByRole('link')).toHaveAccessibleName(/nouvelle fenêtre/)
    })

    it('shows what to know first for the conflict type (emergency numbers…)', () => {
      const Warned = createSimulationResult({
        channels,
        conflictTypes: [{ ...conflictType, warning: 'En danger : appelez le 17.' }],
      })
      render(<Warned result={answers('yes', 'yes')} onRestart={vi.fn()} />)
      expect(screen.getByRole('region', { name: 'À savoir d’abord' })).toHaveTextContent(
        'En danger : appelez le 17.',
      )
    })

    it('recalls what the person answered', () => {
      renderResult(answers('maybe', 'no'))

      const recap = screen.getByRole('region', { name: 'Vos réponses' })
      expect(recap).toHaveTextContent('Type de conflit')
      expect(recap).toHaveTextContent('Type commerce')
      expect(recap).toHaveTextContent('150 €')
      expect(recap).toHaveTextContent('Peut-être, cela dépend')
    })

    it('says the orientation is indicative, not legal advice', () => {
      renderResult(answers('yes', 'yes'))
      expect(
        screen.getByText(/ne remplace pas l’avis d’un professionnel du droit/),
      ).toBeInTheDocument()
    })
  })

  describe('start over, and edge cases', () => {
    it('lets the person start over', async () => {
      const { user, onRestart } = renderResult(answers('yes', 'yes'))
      await user.click(screen.getByRole('button', { name: 'Recommencer le questionnaire' }))
      expect(onRestart).toHaveBeenCalledOnce()
    })

    it('still offers solutions, and a way to start over, when nothing was answered', async () => {
      const { user, onRestart } = renderResult({})

      expect(
        screen.getByRole('heading', { level: 2, name: 'Votre orientation' }),
      ).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: 'Canal neutral' })).toBeInTheDocument()
      expect(screen.queryByRole('region', { name: 'Vos réponses' })).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Recommencer le questionnaire' }))
      expect(onRestart).toHaveBeenCalled()
    })

    it('says so when the content has no solution, and still lets the person start over', () => {
      const None = createSimulationResult({ channels: [], conflictTypes: [conflictType] })
      render(<None result={answers('yes', 'yes')} onRestart={() => {}} />)

      expect(
        screen.getByText('Aucune solution n’est disponible pour le moment.'),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Recommencer le questionnaire' }),
      ).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has one h2 and h3 sections each named by their heading', async () => {
      const { user } = renderResult(answers('yes', 'unknown'))
      await user.click(screen.getByRole('radio', { name: 'Canal talk' }))

      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1)
      expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
        'Qui peut vous aider ?',
        'Canal talk',
        'Besoin d’en parler avant de choisir ?',
        'Vos réponses',
      ])
    })

    it('has no automatic WCAG A/AA violation, before and after a choice, and with no solution', async () => {
      const { container, user, unmount } = renderResult(answers('yes', 'no'))
      await expectNoAxeViolation(container)
      await user.click(screen.getByRole('radio', { name: 'Canal neutral' }))
      await expectNoAxeViolation(container)
      unmount()

      const None = createSimulationResult({ channels: [], conflictTypes: [conflictType] })
      const none = render(<None result={{}} onRestart={() => {}} />)
      await expectNoAxeViolation(none.container)
    })
  })
})

// The whole flow with the real steps and this result screen: the result gets typed answers from
// all the steps and offers the solutions of the chosen type.
describe('from the form to the result', () => {
  function renderFlow() {
    const user = userEvent.setup()
    const steps = [
      createConflictTypeStep([conflictType]),
      createLossFrequencyStep([conflictType]),
      opennessStep,
    ]
    render(<SimulationForm steps={steps} ResultView={Result} />)
    return user
  }

  async function answerAll(user: ReturnType<typeof userEvent.setup>, own: string, other: string) {
    await user.click(screen.getByRole('radio', { name: 'Type commerce' }))
    await user.click(screen.getByRole('button', { name: 'Suivant' }))
    await screen.findByRole('heading', { level: 2, name: /Pertes et fréquence/ })
    await user.type(screen.getByRole('textbox', { name: 'Montant estimé, en euros (€)' }), '150')
    await user.click(screen.getByRole('radio', { name: 'Une seule fois' }))
    await user.click(screen.getByRole('button', { name: 'Suivant' }))
    await screen.findByRole('heading', { level: 2, name: /Ouverture à la discussion/ })
    const group = (name: RegExp) => screen.getByRole('radiogroup', { name })
    await user.click(within(group(/Seriez-vous prêt/)).getByRole('radio', { name: own }))
    await user.click(
      within(group(/l’autre partie serait-elle prête/)).getByRole('radio', { name: other }),
    )
    await user.click(screen.getByRole('button', { name: 'Terminer' }))
  }

  it('ends on the solutions to choose from, with the result in focus', async () => {
    const user = renderFlow()
    await answerAll(user, 'Oui', 'Je ne sais pas')

    const region = await screen.findByRole('region', { name: 'Résultat' })
    expect(region).toHaveFocus()
    expect(within(region).getByRole('radio', { name: 'Canal neutral' })).toBeInTheDocument()
    expect(within(region).getByRole('region', { name: 'Vos réponses' })).toHaveTextContent('150 €')
  })

  it('starts over from the result, back to the first step with nothing kept', async () => {
    const user = renderFlow()
    await answerAll(user, 'Oui', 'Oui')
    await user.click(await screen.findByRole('button', { name: 'Recommencer le questionnaire' }))

    expect(await screen.findByRole('heading', { level: 2, name: /Type de conflit/ })).toHaveFocus()
    expect(screen.getByRole('radio', { name: 'Type commerce' })).not.toBeChecked()
  })
})

describe('mandatory amicable attempt', () => {
  const neighbours: ConflictType = {
    ...conflictType,
    slug: 'voisins',
    label: 'Type voisins',
    mandatoryAmicableAttempt: 'always',
  }
  const NeighboursResult = createSimulationResult({ channels, conflictTypes: [neighbours] })

  it('is said before the solutions, whatever the answers', () => {
    render(
      <NeighboursResult
        result={{ ...answers('no', 'no'), 'conflict-type': { type: 'voisins' } }}
        onRestart={vi.fn()}
      />,
    )
    const notice = screen.getByRole('region', { name: 'Une tentative amiable est obligatoire' })
    expect(notice).toHaveTextContent('article 750-1 du code de procédure civile')
    expect(notice).toHaveTextContent('Une simple discussion ne suffit pas')
  })

  it('is not shown when the law requires nothing', () => {
    renderResult(answers('no', 'no'))
    expect(
      screen.queryByRole('region', { name: 'Une tentative amiable est obligatoire' }),
    ).not.toBeInTheDocument()
  })
})
