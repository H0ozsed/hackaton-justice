import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import type { Channel, ConflictType } from '@/shared/simulation'

import { createConflictTypeStep } from './conflict-type-step'
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
const mediator = channel('mediator', { family: 'mediation', free: false })
const channels = [court, mediator, neutral, talk, judgeOnly, other]

const conflictType: ConflictType = {
  slug: 'commerce',
  label: 'Type commerce',
  description: 'Description commerce.',
  examples: [],
  followUpQuestions: [],
}
const elsewhere: ConflictType = { ...conflictType, slug: 'ailleurs', label: 'Type ailleurs' }

const Result = createSimulationResult({ channels, conflictTypes: [conflictType, elsewhere] })

const answers = (): SimulationResult => ({
  'conflict-type': { type: 'commerce' },
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

const amicable = () => screen.getByRole('region', { name: 'Vers un accord à l’amiable' })

describe('simulation result screen', () => {
  describe('towards an amicable agreement', () => {
    it('shows conciliation then mediation, with their third parties for the conflict type', () => {
      renderResult(answers())

      const families = within(amicable())
        .getAllByRole('heading', { level: 4 })
        .map((h) => h.textContent)
      expect(families).toEqual(['Conciliation', 'Médiation'])
      expect(
        within(amicable())
          .getAllByRole('heading', { level: 5 })
          .map((h) => h.textContent),
      ).toEqual(['Canal neutral', 'Canal mediator'])
      expect(amicable()).toHaveTextContent('Pour « Type commerce », voici')
    })

    it('never shows talking, the judge, another conflict’s third party or what a judge starts', () => {
      renderResult(answers())

      for (const name of ['Canal talk', 'Canal court', 'Canal other', 'Canal judge-only']) {
        expect(screen.queryByRole('heading', { name })).not.toBeInTheDocument()
      }
    })

    it('asks nothing: no choice to make, the essentials first, then what the law says', () => {
      renderResult(answers())

      expect(within(amicable()).queryByRole('radio')).not.toBeInTheDocument()
      expect(within(amicable()).queryByRole('button')).not.toBeInTheDocument()
      const neutralCard = screen.getByRole('article', { name: 'Canal neutral' })
      const terms = within(neutralCard)
        .getAllByRole('term')
        .map((dt) => dt.textContent)
      expect(terms.slice(0, 4)).toEqual([
        'Qui c’est',
        'Comment le joindre',
        'Coût',
        'Valeur de l’accord',
      ])
      expect(terms).toContain('Ce que dit la loi')
      expect(terms.at(-1)).toBe('Pour aller plus loin')
      expect(neutralCard).toHaveTextContent('Le texte de loi du canal neutre.')
      expect(neutralCard).toHaveTextContent('Code, art. 1')
      // The result only shows the person's conflict: no list of disputes.
      expect(terms).not.toContain('Litiges concernés')
    })

    it('links to the contact and the official sources in a new window, said in the link text', () => {
      renderResult(answers())

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

    it('links to every conciliator and mediator on /apprendre', () => {
      renderResult(answers())
      expect(
        screen.getByRole('link', { name: 'voir tous les conciliateurs et médiateurs' }),
      ).toHaveAttribute('href', '/apprendre#qui-peut-vous-aider')
    })
  })

  describe('around the solutions', () => {
    it('points to free information (points-justice, CDAD)', () => {
      renderResult(answers())

      const region = screen.getByRole('region', {
        name: 'Être informé gratuitement près de chez vous',
      })
      expect(region).toHaveTextContent('CDAD')
      expect(within(region).getByRole('link')).toHaveAttribute('target', '_blank')
      expect(within(region).getByRole('link')).toHaveAccessibleName(/nouvelle fenêtre/)
    })

    it('shows what to know first for the conflict type (emergency numbers…)', () => {
      const Warned = createSimulationResult({
        channels,
        conflictTypes: [{ ...conflictType, warning: 'En danger : appelez le 17.' }],
      })
      render(<Warned result={answers()} onRestart={vi.fn()} />)
      expect(screen.getByRole('region', { name: 'À savoir d’abord' })).toHaveTextContent(
        'En danger : appelez le 17.',
      )
    })

    it('recalls what the person answered', () => {
      renderResult(answers())

      const recap = screen.getByRole('region', { name: 'Vos réponses' })
      expect(recap).toHaveTextContent('Type de conflit')
      expect(recap).toHaveTextContent('Type commerce')
    })

    it('says the orientation is indicative, not legal advice', () => {
      renderResult(answers())
      expect(
        screen.getByText(/ne remplace pas l’avis d’un professionnel du droit/),
      ).toBeInTheDocument()
    })
  })

  describe('start over, and edge cases', () => {
    it('lets the person start over', async () => {
      const { user, onRestart } = renderResult(answers())
      await user.click(screen.getByRole('button', { name: 'Recommencer le questionnaire' }))
      expect(onRestart).toHaveBeenCalledOnce()
    })

    it('still shows the amicable solutions, and a way to start over, when nothing was answered', async () => {
      const { user, onRestart } = renderResult({})

      expect(
        screen.getByRole('heading', { level: 2, name: 'Votre orientation' }),
      ).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Canal neutral' })).toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: 'Canal talk' })).not.toBeInTheDocument()
      expect(screen.queryByRole('region', { name: 'Vos réponses' })).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Recommencer le questionnaire' }))
      expect(onRestart).toHaveBeenCalled()
    })

    it('says so when the content has no solution, and still lets the person start over', () => {
      const None = createSimulationResult({
        channels: [talk, court],
        conflictTypes: [conflictType],
      })
      render(<None result={answers()} onRestart={() => {}} />)

      expect(
        screen.getByText('Aucune solution n’est disponible pour le moment.'),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Recommencer le questionnaire' }),
      ).toBeInTheDocument()
    })
  })

  it('says in two sentences why the amicable route first, and links to the one comparison (#109)', () => {
    renderResult(answers())
    const why = screen.getByRole('region', { name: 'Pourquoi l’amiable d’abord ?' })
    expect(why).toHaveTextContent('c’est le juge qui décide')
    expect(within(why).queryByRole('table')).not.toBeInTheDocument()
    expect(
      within(why).getByRole('link', { name: /Comparer toutes les solutions/ }),
    ).toHaveAttribute('href', '/apprendre#comparer')
  })

  describe('accessibility', () => {
    it('has one h2, then h3 sections, h4 families and h5 third parties', () => {
      renderResult(answers())

      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1)
      expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
        'Vers un accord à l’amiable',
        'Pourquoi l’amiable d’abord ?',
        'Être informé gratuitement près de chez vous',
        'Vos réponses',
      ])
      expect(within(amicable()).getAllByRole('heading', { level: 4 })).toHaveLength(2)
      expect(within(amicable()).getAllByRole('heading', { level: 5 })).toHaveLength(2)
    })

    it('has no automatic WCAG A/AA violation, with solutions and with none', async () => {
      const { container, unmount } = renderResult(answers())
      await expectNoAxeViolation(container)
      unmount()

      const None = createSimulationResult({ channels: [], conflictTypes: [conflictType] })
      const none = render(<None result={{}} onRestart={() => {}} />)
      await expectNoAxeViolation(none.container)
    })
  })
})

// The whole flow with the real steps and this result screen: the result gets typed answers from
// all the steps and shows the amicable solutions of the chosen type.
describe('from the form to the result', () => {
  function renderFlow() {
    const user = userEvent.setup()
    const steps = [createConflictTypeStep([conflictType])]
    render(<SimulationForm steps={steps} ResultView={Result} />)
    return user
  }

  async function answerAll(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('radio', { name: 'Type commerce' }))
    await user.click(screen.getByRole('button', { name: 'Terminer' }))
  }

  it('ends on the amicable solutions, with the result in focus, without asking what the person is ready to do', async () => {
    const user = renderFlow()
    await answerAll(user)

    const region = await screen.findByRole('region', { name: 'Résultat' })
    expect(region).toHaveFocus()
    expect(within(region).getByRole('article', { name: 'Canal neutral' })).toBeInTheDocument()
    expect(within(region).getByRole('region', { name: 'Vos réponses' })).toHaveTextContent(
      'Type commerce',
    )
  })

  it('starts over from the result, back to the first step with nothing kept', async () => {
    const user = renderFlow()
    await answerAll(user)
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

  it('is said before the solutions', () => {
    render(
      <NeighboursResult
        result={{ ...answers(), 'conflict-type': { type: 'voisins' } }}
        onRestart={vi.fn()}
      />,
    )
    const notice = screen.getByRole('region', { name: 'Une tentative amiable est obligatoire' })
    expect(notice).toHaveTextContent('article 750-1 du code de procédure civile')
    expect(notice).toHaveTextContent('Une simple discussion ne suffit pas')
  })

  it('is not shown when the law requires nothing', () => {
    renderResult(answers())
    expect(
      screen.queryByRole('region', { name: 'Une tentative amiable est obligatoire' }),
    ).not.toBeInTheDocument()
  })
})
