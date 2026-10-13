import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'

import {
  questionSchema,
  type ConflictType,
  type LossKind,
  type Question,
} from '@/shared/simulation'

import { createConflictTypeStep } from './conflict-type-step'
import { createFollowUpStep } from './follow-up-step'
import { createLossFrequencyStep } from './loss-frequency-step'
import { SimulationForm } from './simulation-form'
import type { ResultViewProps, SimulationStep } from './types'

// Fixtures: conflict types and questions built here (never the shared example content, which the
// content team will replace), through the real question schema so that defaults are applied.
const q = (input: Record<string, unknown>): Question =>
  questionSchema.parse({ id: 'q', label: 'Question', ...input })

const type = (
  slug: string,
  lossKinds: LossKind[],
  followUpQuestions: Question[] = [],
): ConflictType => ({
  slug,
  label: `Type ${slug}`,
  description: `Description ${slug}.`,
  examples: [`exemple ${slug}`, `autre ${slug}`],
  lossKinds,
  followUpQuestions,
})

const alpha = type(
  'alpha',
  ['money'],
  [
    q({
      id: 'nature',
      kind: 'choice',
      label: 'Quelle est la nature du problème ?',
      help: 'Une seule réponse.',
      options: [
        { value: 'bruit', label: 'Bruit' },
        { value: 'odeurs', label: 'Odeurs' },
      ],
    }),
    q({
      id: 'effects',
      kind: 'choice',
      multiple: true,
      label: 'Quels effets constatez-vous ?',
      options: [
        { value: 'sommeil', label: 'Sommeil' },
        { value: 'stress', label: 'Stress' },
        { value: 'frais', label: 'Frais' },
      ],
    }),
    q({ id: 'amount', kind: 'number', label: 'Montant concerné', unit: '€', min: 0, max: 100 }),
    q({ id: 'talked', kind: 'yesNo', label: 'En avez-vous déjà parlé ?' }),
  ],
)
const beta = type('beta', ['health']) // no follow-up question
const gamma = type(
  'gamma',
  ['time'],
  [
    q({ id: 'witness', kind: 'yesNo', label: 'Avez-vous un témoin ?', required: false }),
    q({ id: 'times', kind: 'number', label: 'Nombre de fois', required: false }),
    q({
      id: 'tags',
      kind: 'choice',
      multiple: true,
      required: false,
      label: 'Autres éléments',
      options: [
        { value: 'a', label: 'Élément A' },
        { value: 'b', label: 'Élément B' },
      ],
    }),
  ],
)
const types = [alpha, beta, gamma]

function ResultFixture({ result }: ResultViewProps) {
  return <p>{JSON.stringify(result)}</p>
}

// The conflict type and its follow-up questions only, or with the losses step after them.
function renderFlow({ withLosses = false } = {}) {
  const user = userEvent.setup()
  const steps: SimulationStep[] = [createConflictTypeStep(types), createFollowUpStep(types)]
  if (withLosses) steps.push(createLossFrequencyStep(types))
  const view = render(<SimulationForm steps={steps} ResultView={ResultFixture} />)
  return { user, ...view }
}

type User = ReturnType<typeof userEvent.setup>

const heading = (title: RegExp) => screen.findByRole('heading', { level: 2, name: title })
const next = (user: User) => user.click(screen.getByRole('button', { name: 'Suivant' }))
const finish = (user: User) => user.click(screen.getByRole('button', { name: 'Terminer' }))
// Before a type is chosen the conflict type step is the only active one: its button says "Terminer".
const submit = (user: User) =>
  user.click(screen.getByRole('button', { name: /^(Suivant|Terminer)$/ }))

async function goToFollowUp(user: User, typeLabel = 'Type alpha') {
  await user.click(screen.getByRole('radio', { name: typeLabel }))
  await next(user)
  return heading(/Précisions sur votre situation/)
}

const NATURE = 'Quelle est la nature du problème ?'
const EFFECTS = 'Quels effets constatez-vous ?'
const TALKED = 'En avez-vous déjà parlé ?'
const TYPE_QUESTION = /Quel type de conflit/
const radioIn = (legend: string | RegExp, label: string) =>
  within(screen.getByRole('radiogroup', { name: legend })).getByRole('radio', { name: label })
const amount = () => screen.getByRole('textbox', { name: 'Montant concerné' })

// Answers every question of `alpha` validly.
async function answerAlpha(user: User) {
  await user.click(radioIn(NATURE, 'Bruit'))
  await user.click(
    within(screen.getByRole('group', { name: EFFECTS })).getByRole('checkbox', { name: 'Sommeil' }),
  )
  await user.click(
    within(screen.getByRole('group', { name: EFFECTS })).getByRole('checkbox', { name: 'Frais' }),
  )
  await user.type(amount(), '12,5')
  await user.click(radioIn(TALKED, 'Oui'))
}

async function expectNoAxeViolation(container: HTMLElement) {
  const results = await axe.run(container, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    rules: { 'color-contrast': { enabled: false } },
  })
  expect(results.violations).toEqual([])
}

describe('conflict type step', () => {
  it('lists the conflict types of the content, with their description and examples', () => {
    renderFlow()

    const group = screen.getByRole('radiogroup', { name: TYPE_QUESTION })
    expect(
      within(group)
        .getAllByRole('radio')
        .map((r) => r.getAttribute('value')),
    ).toEqual(['alpha', 'beta', 'gamma'])
    expect(radioIn(TYPE_QUESTION, 'Type alpha')).toHaveAccessibleDescription(
      'Description alpha. Exemples : exemple alpha, autre alpha.',
    )
  })

  it('is the first step and is required', () => {
    renderFlow()
    expect(screen.getByRole('heading', { level: 2, name: /Type de conflit/ })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: TYPE_QUESTION })).toBeRequired()
  })

  it('refuses to go on without a choice, with a clear message', async () => {
    const { user } = renderFlow()
    await submit(user)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(
      'Choisissez le type de conflit qui correspond le mieux à votre situation.',
    )
    expect(alert).toHaveFocus()
    expect(screen.getByRole('radiogroup', { name: TYPE_QUESTION })).toBeInvalid()
  })

  it('counts the follow-up step only for a conflict type that has questions', async () => {
    const { user } = renderFlow()
    const progress = () => screen.getByRole('progressbar')

    await user.click(screen.getByRole('radio', { name: 'Type alpha' }))
    expect(await screen.findByText('Étape 1 sur 2')).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Type beta' }))
    expect(await screen.findByText('Étape 1 sur 1')).toBeInTheDocument()
    expect(progress()).toHaveAttribute('aria-valuetext', 'Étape 1 sur 1')
  })

  it('goes straight to the next step for a conflict type without follow-up question', async () => {
    const { user } = renderFlow({ withLosses: true })
    await user.click(screen.getByRole('radio', { name: 'Type beta' }))
    await next(user)

    expect(await heading(/Ce que le conflit vous coûte/)).toHaveFocus()
    expect(screen.queryByRole('heading', { name: /Précisions sur votre situation/ })).toBeNull()
  })
})

describe('follow-up questions step', () => {
  describe('rendering from the content, one case per kind', () => {
    it('renders a single choice as radio buttons, with its help text', async () => {
      const { user } = renderFlow()
      const title = await goToFollowUp(user)

      expect(title).toHaveFocus()
      const group = screen.getByRole('radiogroup', { name: NATURE })
      expect(
        within(group)
          .getAllByRole('radio')
          .map((r) => r.getAttribute('value')),
      ).toEqual(['bruit', 'odeurs'])
      expect(group).toBeRequired()
      expect(group).toHaveAccessibleDescription('Une seule réponse.')
    })

    it('renders a multiple choice as checkboxes, several can be checked', async () => {
      const { user } = renderFlow()
      await goToFollowUp(user)

      const group = screen.getByRole('group', { name: EFFECTS })
      const boxes = within(group).getAllByRole('checkbox')
      expect(boxes.map((b) => b.getAttribute('value'))).toEqual(['sommeil', 'stress', 'frais'])
      await user.click(boxes[0])
      await user.click(boxes[2])
      expect(boxes.map((b) => (b as HTMLInputElement).checked)).toEqual([true, false, true])
    })

    it('renders a number as a decimal text field, with its unit and bounds', async () => {
      const { user } = renderFlow()
      await goToFollowUp(user)

      expect(amount()).toHaveAttribute('inputmode', 'decimal')
      expect(amount()).toBeRequired()
      expect(amount()).toHaveAccessibleDescription(
        'Unité : €. Valeur minimale : 0. Valeur maximale : 100.',
      )
    })

    it('renders a yes/no question as two radio buttons', async () => {
      const { user } = renderFlow()
      await goToFollowUp(user)

      const group = screen.getByRole('radiogroup', { name: TALKED })
      expect(
        within(group)
          .getAllByRole('radio')
          .map((r) => r.getAttribute('value')),
      ).toEqual(['yes', 'no'])
      expect(radioIn(TALKED, 'Oui')).toBeInTheDocument()
      expect(radioIn(TALKED, 'Non')).toBeInTheDocument()
    })

    it('shows the questions of the chosen type only, in the content order', async () => {
      const { user } = renderFlow()
      await goToFollowUp(user, 'Type gamma')

      expect(screen.queryByRole('radiogroup', { name: NATURE })).not.toBeInTheDocument()
      expect(screen.getAllByRole('radiogroup').map((g) => g.id)).toEqual(['field-witness'])
      expect(screen.getByRole('group', { name: /Autres éléments/ })).toBeInTheDocument()
    })
  })

  describe('validation through followUpAnswersSchema', () => {
    it('refuses an empty step, saying each question is required, in page order', async () => {
      const { user } = renderFlow()
      await goToFollowUp(user)
      await finish(user)

      const alert = await screen.findByRole('alert')
      expect(alert).toHaveTextContent('4 erreurs à corriger')
      expect(alert).toHaveFocus()
      const links = within(alert).getAllByRole('link')
      expect(links.map((l) => l.getAttribute('href'))).toEqual([
        '#field-nature',
        '#field-effects',
        '#field-amount',
        '#field-talked',
      ])
      expect(links.map((l) => l.textContent)).toEqual(Array(4).fill('Ce champ est obligatoire'))
    })

    it('links each error to its field, checkboxes included', async () => {
      const { user } = renderFlow()
      await goToFollowUp(user)
      await finish(user)
      await screen.findByRole('alert')

      expect(screen.getByRole('radiogroup', { name: NATURE })).toBeInvalid()
      const effects = screen.getByRole('group', { name: EFFECTS })
      expect(effects).toHaveAccessibleDescription('Erreur : Ce champ est obligatoire')
      for (const box of within(effects).getAllByRole('checkbox')) expect(box).toBeInvalid()
      expect(amount()).toBeInvalid()
      expect(amount()).toHaveAccessibleDescription(/Erreur : Ce champ est obligatoire/)
    })

    it.each([
      ['abc', 'Saisissez un nombre en chiffres (exemple : 12 ou 12,5).'],
      ['-1', 'Minimum : 0'],
      ['101', 'Maximum : 100'],
    ])('refuses the number "%s" with "%s"', async (text, message) => {
      const { user } = renderFlow()
      await goToFollowUp(user)
      await user.type(amount(), text)
      await finish(user)

      await screen.findByRole('alert')
      expect(amount()).toHaveAccessibleDescription(
        new RegExp(`Erreur : ${message.replace(/[()?.]/g, '\\$&')}`),
      )
    })

    it('leads from the summary to the field of the error', async () => {
      const { user } = renderFlow()
      await goToFollowUp(user)
      await finish(user)

      const alert = await screen.findByRole('alert')
      await user.click(within(alert).getAllByRole('link')[2])
      expect(amount()).toHaveFocus()
    })
  })

  describe('answers', () => {
    it('gives typed answers: one value, a list, a number and yes/no', async () => {
      const { user } = renderFlow()
      await goToFollowUp(user)
      await answerAlpha(user)
      await finish(user)

      const result = await screen.findByRole('region', { name: 'Résultat' })
      expect(result).toHaveTextContent('"conflict-type":{"type":"alpha"}')
      expect(result).toHaveTextContent(
        '"follow-up":{"nature":"bruit","effects":["sommeil","frais"],"amount":12.5,"talked":"yes"}',
      )
    })

    it('marks optional questions "(facultatif)" and lets them be skipped', async () => {
      const { user } = renderFlow()
      await goToFollowUp(user, 'Type gamma')

      expect(
        screen.getByText(/Tous les champs sont obligatoires, sauf ceux marqués/),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('radiogroup', { name: /Avez-vous un témoin \? \(facultatif\)/ }),
      ).not.toBeRequired()
      expect(
        screen.getByRole('textbox', { name: 'Nombre de fois (facultatif)' }),
      ).not.toBeRequired()

      await finish(user)
      const result = await screen.findByRole('region', { name: 'Résultat' })
      expect(result).toHaveTextContent('"follow-up":{"tags":[]}')
    })

    it('still checks an optional question that was answered', async () => {
      const { user } = renderFlow()
      await goToFollowUp(user, 'Type gamma')
      await user.type(
        screen.getByRole('textbox', { name: 'Nombre de fois (facultatif)' }),
        'beaucoup',
      )
      await finish(user)

      expect(await screen.findByRole('alert')).toHaveTextContent('Saisissez un nombre en chiffres')
    })

    it('keeps what was typed, even invalid, when going back and returning', async () => {
      const { user } = renderFlow()
      await goToFollowUp(user)
      await user.click(radioIn(NATURE, 'Odeurs'))
      await user.type(amount(), 'abc')
      await user.click(
        within(screen.getByRole('group', { name: EFFECTS })).getByRole('checkbox', {
          name: 'Stress',
        }),
      )

      await user.click(screen.getByRole('button', { name: 'Précédent' }))
      await heading(/Type de conflit/)
      expect(screen.getByRole('radio', { name: 'Type alpha' })).toBeChecked()
      await next(user)
      await heading(/Précisions sur votre situation/)

      expect(radioIn(NATURE, 'Odeurs')).toBeChecked()
      expect(amount()).toHaveValue('abc')
      expect(
        within(screen.getByRole('group', { name: EFFECTS })).getByRole('checkbox', {
          name: 'Stress',
        }),
      ).toBeChecked()
    })

    it('shows the questions of another type, and drops the answers of the previous one', async () => {
      const { user } = renderFlow()
      await goToFollowUp(user)
      await answerAlpha(user)
      await user.click(screen.getByRole('button', { name: 'Précédent' }))
      await heading(/Type de conflit/)

      await user.click(screen.getByRole('radio', { name: 'Type gamma' }))
      await next(user)
      await heading(/Précisions sur votre situation/)
      expect(screen.queryByRole('radiogroup', { name: NATURE })).not.toBeInTheDocument()
      await finish(user)

      const result = await screen.findByRole('region', { name: 'Résultat' })
      expect(result).toHaveTextContent('"conflict-type":{"type":"gamma"}')
      expect(result).toHaveTextContent('"follow-up":{"tags":[]}')
      expect(result).not.toHaveTextContent('nature')
      expect(result).not.toHaveTextContent('amount')
    })
  })

  describe('accessibility', () => {
    it('has no automatic WCAG A/AA violation on the conflict type step', async () => {
      const { user, container } = renderFlow()
      await expectNoAxeViolation(container)

      await submit(user)
      await screen.findByRole('alert')
      await expectNoAxeViolation(container)
    })

    it('has no automatic WCAG A/AA violation on the questions, answered or with errors', async () => {
      const { user, container } = renderFlow()
      await goToFollowUp(user)
      await expectNoAxeViolation(container)

      await finish(user)
      await screen.findByRole('alert')
      await expectNoAxeViolation(container)
    })

    it('has no automatic WCAG A/AA violation on optional questions', async () => {
      const { user, container } = renderFlow()
      await goToFollowUp(user, 'Type gamma')
      await expectNoAxeViolation(container)
    })
  })
})
