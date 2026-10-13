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

// Fixtures: channels and conflict types built here (never the shared example content, which the
// content team will replace).
const channel = (slug: string, attributes: Partial<Channel>): Channel => ({
  slug,
  name: `Canal ${slug}`,
  description: `Description du canal ${slug}.`,
  amicable: true,
  free: true,
  ...attributes,
})

const talk = channel('talk', {})
const neutral = channel('neutral', {
  contact: { url: 'https://example.org/neutral', phone: '01 23 45 67 89' },
  cost: 'Partagé entre les parties',
  agreement: 'Homologable par le juge',
})
const court = channel('court', { amicable: false, free: false })
const channels = [talk, neutral, court]

const conflictType: ConflictType = {
  slug: 'commerce',
  label: 'Type commerce',
  description: 'Description commerce.',
  examples: [],
  lossKinds: ['money'],
  followUpQuestions: [],
}

const Result = createSimulationResult({ channels, conflictTypes: [conflictType] })

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

describe('simulation result screen', () => {
  describe('the recommended channel', () => {
    it('shows its name, description and what kind of channel it is', () => {
      renderResult(answers('yes', 'unknown'))

      const region = screen.getByRole('region', { name: 'Canal neutral' })
      expect(region).toHaveTextContent('Description du canal neutral.')
      expect(region).toHaveTextContent('Le canal conseillé')
      expect(region).toHaveTextContent('Voie amiable')
      // Its detailed cost replaces the short "Gratuit" label (never said twice).
      expect(region).not.toHaveTextContent('Gratuit')
      expect(region).toHaveTextContent('Coût : Partagé entre les parties')
    })

    it('says who pays and what the agreement is worth, when the content says it', () => {
      renderResult(answers('yes', 'unknown'))

      const region = screen.getByRole('region', { name: 'Canal neutral' })
      expect(region).toHaveTextContent('Coût : Partagé entre les parties')
      expect(region).toHaveTextContent('Valeur de l’accord : Homologable par le juge')
    })

    it('points to free information before choosing (points-justice, CDAD)', () => {
      renderResult(answers('no', 'no'))

      const region = screen.getByRole('region', { name: 'Besoin d’en parler avant de choisir ?' })
      expect(region).toHaveTextContent('CDAD')
      expect(within(region).getByRole('link')).toHaveAttribute('target', '_blank')
      expect(within(region).getByRole('link')).toHaveAccessibleName(/nouvelle fenêtre/)
    })

    it('says in words when it is a judicial channel that can cost something', () => {
      renderResult(answers('no', 'yes'))

      const region = screen.getByRole('region', { name: 'Canal court' })
      expect(region).toHaveTextContent('Voie judiciaire')
      expect(region).toHaveTextContent('Peut avoir un coût')
    })

    it('links to its website in a new window, said in the link text', () => {
      renderResult(answers('yes', 'maybe'))

      const link = screen.getByRole('link', {
        name: 'En savoir plus : Canal neutral (nouvelle fenêtre)',
      })
      expect(link).toHaveAttribute('href', 'https://example.org/neutral')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('gives its phone number as a link to call', () => {
      renderResult(answers('yes', 'maybe'))
      expect(screen.getByRole('link', { name: '01 23 45 67 89' })).toHaveAttribute(
        'href',
        'tel:0123456789',
      )
    })

    it('has no contact block when the channel has no contact details', () => {
      renderResult(answers('yes', 'yes'))

      const region = screen.getByRole('region', { name: 'Canal talk' })
      expect(within(region).queryByRole('link')).not.toBeInTheDocument()
    })

    it.each([
      ['yes', 'yes', 'Canal talk'],
      ['maybe', 'yes', 'Canal talk'],
      ['yes', 'no', 'Canal neutral'],
      ['maybe', 'unknown', 'Canal neutral'],
      ['no', 'yes', 'Canal court'],
      ['no', 'unknown', 'Canal court'],
    ])('recommends the right channel for "%s" / "%s": %s', (user, other, name) => {
      renderResult(answers(user, other))
      expect(screen.getByRole('region', { name })).toBeInTheDocument()
      expect(screen.getAllByRole('heading', { level: 3 })[0]).toHaveTextContent(name)
    })
  })

  describe('why and what else', () => {
    it('explains why this channel, from the answers', () => {
      renderResult(answers('yes', 'unknown'))

      const why = screen.getByRole('region', { name: 'Pourquoi ce canal ?' })
      const reasons = within(why)
        .getAllByRole('listitem')
        .map((li) => li.textContent)
      expect(reasons[0]).toBe('Vous seriez prêt(e) à discuter avec l’autre partie.')
      expect(reasons[1]).toBe('Vous ne savez pas si l’autre partie est prête à discuter.')
      expect(reasons.at(-1)).toBe('Ce canal est gratuit.')
    })

    it('lists the other channels as other options', () => {
      renderResult(answers('yes', 'unknown'))

      const others = screen.getByRole('region', { name: 'Autres pistes' })
      expect(
        within(others)
          .getAllByRole('listitem')
          .map((li) => li.textContent),
      ).toEqual(['Canal talkDescription du canal talk.', 'Canal courtDescription du canal court.'])
    })

    it('does not show other options when there is a single channel', () => {
      const Single = createSimulationResult({ channels: [talk], conflictTypes: [conflictType] })
      render(<Single result={answers('yes', 'yes')} onRestart={() => {}} />)
      expect(screen.queryByRole('region', { name: 'Autres pistes' })).not.toBeInTheDocument()
    })

    it('recalls what the person answered', () => {
      renderResult(answers('maybe', 'no'))

      const recap = screen.getByRole('region', { name: 'Vos réponses' })
      expect(recap).toHaveTextContent('Type de conflit')
      expect(recap).toHaveTextContent('Type commerce')
      expect(recap).toHaveTextContent('Argent')
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

    it('still gives a result, and a way to start over, when nothing was answered', async () => {
      const { user, onRestart } = renderResult({})

      expect(
        screen.getByRole('heading', { level: 2, name: 'Votre orientation' }),
      ).toBeInTheDocument()
      expect(screen.getByRole('region', { name: 'Canal neutral' })).toBeInTheDocument()
      expect(screen.queryByRole('region', { name: 'Vos réponses' })).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Recommencer le questionnaire' }))
      expect(onRestart).toHaveBeenCalled()
    })

    it('says so when the content has no channel, and still lets the person start over', () => {
      const None = createSimulationResult({ channels: [], conflictTypes: [conflictType] })
      render(<None result={answers('yes', 'yes')} onRestart={() => {}} />)

      expect(
        screen.getByText('Aucun canal d’orientation n’est disponible pour le moment.'),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Recommencer le questionnaire' }),
      ).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has one h2 and h3 sections each named by their heading', () => {
      renderResult(answers('yes', 'unknown'))

      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1)
      expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
        'Canal neutral',
        'Pourquoi ce canal ?',
        'Autres pistes',
        'Besoin d’en parler avant de choisir ?',
        'Vos réponses',
      ])
    })

    it('has no automatic WCAG A/AA violation, for each route and with no channel', async () => {
      for (const [user, other] of [
        ['yes', 'yes'],
        ['yes', 'no'],
        ['no', 'no'],
      ]) {
        const { container, unmount } = renderResult(answers(user, other))
        await expectNoAxeViolation(container)
        unmount()
      }
      const None = createSimulationResult({ channels: [], conflictTypes: [conflictType] })
      const { container } = render(<None result={{}} onRestart={() => {}} />)
      await expectNoAxeViolation(container)
    })
  })
})

// The whole flow with the real steps and this result screen: every route is reachable from the
// answers of the form, and the result gets typed answers from all the steps.
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

  it.each([
    ['Oui', 'Oui', 'Canal talk'],
    ['Oui', 'Je ne sais pas', 'Canal neutral'],
    ['Non', 'Oui', 'Canal court'],
  ])('answers "%s" / "%s" lead to %s, with the result in focus', async (own, other, name) => {
    const user = renderFlow()
    await answerAll(user, own, other)

    const region = await screen.findByRole('region', { name: 'Résultat' })
    expect(region).toHaveFocus()
    expect(within(region).getByRole('region', { name })).toBeInTheDocument()
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

  it('is said before the channel, even when the judicial route is recommended', () => {
    render(
      <NeighboursResult
        result={{ ...answers('no', 'no'), 'conflict-type': { type: 'voisins' } }}
        onRestart={vi.fn()}
      />,
    )
    const notice = screen.getByRole('region', { name: 'Une tentative amiable est obligatoire' })
    expect(notice).toHaveTextContent('article 750-1 du code de procédure civile')
    expect(screen.getByRole('region', { name: 'Canal court' })).toBeInTheDocument()
  })

  it('is not shown when the law requires nothing', () => {
    renderResult(answers('no', 'no'))
    expect(
      screen.queryByRole('region', { name: 'Une tentative amiable est obligatoire' }),
    ).not.toBeInTheDocument()
  })
})
