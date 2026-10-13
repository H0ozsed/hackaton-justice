import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import type { ConflictType, LossKind } from '@/shared/simulation'

import { CONFLICT_TYPE_FIELD, CONFLICT_TYPE_STEP_ID } from './conflict-type'
import { RadioGroupField } from './form-fields'
import { createLossFrequencyStep } from './loss-frequency-step'
import { SimulationForm } from './simulation-form'
import type { ResultViewProps, SimulationStep } from './types'

// Fixtures: conflict types built here (never the shared content, which the content team will
// replace), a stand-in for the conflict type step of #13, and a minimal result screen.
const type = (slug: string, lossKinds: LossKind[]): ConflictType => ({
  slug,
  label: `Type ${slug}`,
  description: 'Fixture',
  examples: [],
  lossKinds,
  followUpQuestions: [],
})

const types = [
  type('commerce', ['money', 'time']),
  type('voisinage', ['health', 'relationship']),
  type('complet', ['money', 'time', 'health', 'relationship']),
]

function TypeFields() {
  return (
    <RadioGroupField
      name={CONFLICT_TYPE_FIELD}
      legend="Type de conflit"
      options={types.map((t) => ({ value: t.slug, label: t.label }))}
    />
  )
}

const typeStep: SimulationStep = {
  id: CONFLICT_TYPE_STEP_ID,
  title: 'Choix du type',
  schema: z.object({
    [CONFLICT_TYPE_FIELD]: z.enum(['commerce', 'voisinage', 'complet'], {
      error: 'Choisissez un type.',
    }),
  }),
  Fields: TypeFields,
}

function ResultFixture({ result }: ResultViewProps) {
  return <p>{JSON.stringify(result)}</p>
}

function renderFlow() {
  const user = userEvent.setup()
  const view = render(
    <SimulationForm
      steps={[typeStep, createLossFrequencyStep(types)]}
      ResultView={ResultFixture}
    />,
  )
  return { user, ...view }
}

type User = ReturnType<typeof userEvent.setup>

async function goToLossStep(user: User, typeLabel: string) {
  await user.click(screen.getByRole('radio', { name: typeLabel }))
  await user.click(screen.getByRole('button', { name: 'Suivant' }))
  return screen.findByRole('heading', { level: 2, name: /Pertes et fréquence/ })
}

const money = () => screen.getByRole('textbox', { name: 'Montant estimé, en euros (€)' })
const duration = () => screen.getByRole('textbox', { name: 'Durée estimée' })
const group = (name: string | RegExp) => screen.queryByRole('group', { name })
const radiogroup = (name: string | RegExp) => screen.getByRole('radiogroup', { name })
const radioIn = (groupName: string | RegExp, label: string) =>
  within(radiogroup(groupName)).getByRole('radio', { name: label })

const FREQUENCY = 'À quelle fréquence le conflit se produit-il ?'

async function expectNoAxeViolation(container: HTMLElement) {
  const results = await axe.run(container, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    rules: { 'color-contrast': { enabled: false } },
  })
  expect(results.violations).toEqual([])
}

describe('losses and frequency step', () => {
  describe('when it is asked', () => {
    it('comes after the conflict type, and only counts once a type is chosen', async () => {
      const { user } = renderFlow()
      expect(screen.getByRole('heading', { level: 2, name: /Choix du type/ })).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', 'Étape 1 sur 1')

      await user.click(screen.getByRole('radio', { name: 'Type commerce' }))
      expect(await screen.findByText('Étape 1 sur 2')).toBeInTheDocument()
    })

    it('puts the focus on its title when reached', async () => {
      const { user } = renderFlow()
      const heading = await goToLossStep(user, 'Type commerce')
      expect(heading).toHaveFocus()
    })
  })

  describe('which blocks are shown', () => {
    it('shows money and time for a type that declares them, and the frequency', async () => {
      const { user } = renderFlow()
      await goToLossStep(user, 'Type commerce')

      expect(group('Argent')).toBeInTheDocument()
      expect(group('Temps')).toBeInTheDocument()
      expect(money()).toBeInTheDocument()
      expect(duration()).toBeInTheDocument()
      expect(radiogroup('Unité de la durée')).toBeInTheDocument()
      expect(radiogroup(FREQUENCY)).toBeInTheDocument()
      expect(group('Bien-être')).not.toBeInTheDocument()
      expect(group('Relations')).not.toBeInTheDocument()
    })

    it('shows health and relationships for another type, and no money or time', async () => {
      const { user } = renderFlow()
      await goToLossStep(user, 'Type voisinage')

      expect(group('Bien-être')).toBeInTheDocument()
      expect(group('Relations')).toBeInTheDocument()
      expect(radiogroup(/bien-être/)).toBeInTheDocument()
      expect(radiogroup(/relations/)).toBeInTheDocument()
      expect(radiogroup(FREQUENCY)).toBeInTheDocument()
      expect(group('Argent')).not.toBeInTheDocument()
      expect(group('Temps')).not.toBeInTheDocument()
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    it('shows every block for a type that declares every loss kind', async () => {
      const { user } = renderFlow()
      await goToLossStep(user, 'Type complet')

      for (const name of ['Argent', 'Temps', 'Bien-être', 'Relations']) {
        expect(group(name)).toBeInTheDocument()
      }
    })
  })

  describe('validation', () => {
    it.each([
      ['abc', /Saisissez un montant en chiffres/],
      ['-5', /ne peut pas être négatif/],
      ['2000000', /trop élevé/],
      ['1,234', /au plus deux chiffres/],
      ['', /Saisissez un montant en chiffres/],
    ])(
      'refuses the amount "%s" with a clear message linked to the field',
      async (text, message) => {
        const { user } = renderFlow()
        await goToLossStep(user, 'Type commerce')

        if (text) await user.type(money(), text)
        await user.click(screen.getByRole('button', { name: 'Terminer' }))

        await screen.findByRole('alert')
        expect(money()).toBeInvalid()
        expect(money()).toHaveAccessibleDescription(message)
        expect(money()).toHaveAccessibleDescription(/^.*Erreur : /)
      },
    )

    it('refuses a duration without a unit, and one too long for its unit', async () => {
      const { user } = renderFlow()
      await goToLossStep(user, 'Type commerce')

      await user.type(duration(), '400')
      await user.click(screen.getByRole('button', { name: 'Terminer' }))
      await screen.findByRole('alert')
      expect(radiogroup('Unité de la durée')).toHaveAccessibleDescription(
        'Erreur : Choisissez l’unité de la durée : heures ou jours.',
      )

      await user.click(radioIn('Unité de la durée', 'Jours'))
      await user.click(screen.getByRole('button', { name: 'Terminer' }))
      await screen.findByText(/Plus d’un an \(365 jours\)/, { selector: 'p span' })
      expect(duration()).toBeInvalid()
      expect(duration()).toHaveAccessibleDescription(/365 jours/)
    })

    it('accepts the same duration once the unit makes it plausible', async () => {
      const { user } = renderFlow()
      await goToLossStep(user, 'Type commerce')
      await user.type(money(), '0')
      await user.type(duration(), '400')
      await user.click(radioIn('Unité de la durée', 'Heures'))
      await user.click(radioIn(FREQUENCY, 'Une seule fois'))
      await user.click(screen.getByRole('button', { name: 'Terminer' }))

      expect(await screen.findByRole('region', { name: 'Résultat' })).toBeInTheDocument()
    })

    it('refuses to finish without the frequency, and puts the focus on the error summary', async () => {
      const { user } = renderFlow()
      await goToLossStep(user, 'Type voisinage')
      await user.click(radioIn(/bien-être/, 'Faible'))
      await user.click(radioIn(/relations/, 'Aucun effet'))
      await user.click(screen.getByRole('button', { name: 'Terminer' }))

      const alert = await screen.findByRole('alert')
      expect(alert).toHaveTextContent('Indiquez à quelle fréquence le conflit se produit.')
      expect(alert).toHaveFocus()
      expect(radiogroup(FREQUENCY)).toBeInvalid()
    })

    it('lists every error in the summary, and each one leads to its field', async () => {
      const { user } = renderFlow()
      await goToLossStep(user, 'Type complet')
      await user.click(screen.getByRole('button', { name: 'Terminer' }))

      const alert = await screen.findByRole('alert')
      expect(alert).toHaveTextContent('6 erreurs à corriger')
      await user.click(within(alert).getByRole('link', { name: /montant en chiffres/ }))
      expect(money()).toHaveFocus()
    })
  })

  describe('error summary order', () => {
    const linkTargets = async () => {
      const alert = await screen.findByRole('alert')
      return within(alert)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href'))
    }

    it('lists the errors in the order of the fields on the page', async () => {
      const { user } = renderFlow()
      await goToLossStep(user, 'Type complet')
      await user.click(screen.getByRole('button', { name: 'Terminer' }))

      expect(await linkTargets()).toEqual([
        '#field-money',
        '#field-time',
        '#field-timeUnit',
        '#field-health',
        '#field-relationship',
        '#field-frequency',
      ])
    })

    it('keeps a rule on several fields in its place, not at the end', async () => {
      const { user } = renderFlow()
      await goToLossStep(user, 'Type commerce')
      await user.type(money(), 'abc')
      await user.type(duration(), '400')
      await user.click(radioIn('Unité de la durée', 'Jours'))
      await user.click(screen.getByRole('button', { name: 'Terminer' }))

      // "time" (too long for its unit) is reported last by zod but comes before the frequency.
      expect(await linkTargets()).toEqual(['#field-money', '#field-time', '#field-frequency'])
    })
  })

  describe('answers', () => {
    it('gives typed values for the declared loss kinds only', async () => {
      const { user } = renderFlow()
      await goToLossStep(user, 'Type commerce')
      await user.type(money(), '149,90')
      await user.type(duration(), '2,5')
      await user.click(radioIn('Unité de la durée', 'Heures'))
      await user.click(radioIn(FREQUENCY, 'Une ou plusieurs fois par semaine'))
      await user.click(screen.getByRole('button', { name: 'Terminer' }))

      const result = await screen.findByRole('region', { name: 'Résultat' })
      expect(result).toHaveTextContent(
        '"loss-frequency":{"money":149.9,"time":2.5,"timeUnit":"hours","frequency":"weekly"}',
      )
      expect(result).not.toHaveTextContent('health')
    })

    it('keeps what was typed, even invalid, when going back and returning', async () => {
      const { user } = renderFlow()
      await goToLossStep(user, 'Type commerce')
      await user.type(money(), 'abc')
      await user.type(duration(), '3')
      await user.click(radioIn('Unité de la durée', 'Jours'))

      await user.click(screen.getByRole('button', { name: 'Précédent' }))
      await screen.findByRole('heading', { level: 2, name: /Choix du type/ })
      expect(screen.getByRole('radio', { name: 'Type commerce' })).toBeChecked()

      await user.click(screen.getByRole('button', { name: 'Suivant' }))
      await screen.findByRole('heading', { level: 2, name: /Pertes et fréquence/ })
      expect(money()).toHaveValue('abc')
      expect(duration()).toHaveValue('3')
      expect(radioIn('Unité de la durée', 'Jours')).toBeChecked()
    })

    it('drops the loss answers of a previously chosen type when the type changes', async () => {
      const { user } = renderFlow()
      await goToLossStep(user, 'Type commerce')
      await user.type(money(), '500')
      await user.type(duration(), '3')
      await user.click(radioIn('Unité de la durée', 'Heures'))
      await user.click(radioIn(FREQUENCY, 'Tous les jours ou presque'))

      await user.click(screen.getByRole('button', { name: 'Précédent' }))
      await screen.findByRole('heading', { level: 2, name: /Choix du type/ })
      await user.click(screen.getByRole('radio', { name: 'Type voisinage' }))
      await user.click(screen.getByRole('button', { name: 'Suivant' }))
      await screen.findByRole('heading', { level: 2, name: /Pertes et fréquence/ })

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      expect(radioIn(FREQUENCY, 'Tous les jours ou presque')).toBeChecked()
      await user.click(radioIn(/bien-être/, 'Fort'))
      await user.click(radioIn(/relations/, 'Modéré'))
      await user.click(screen.getByRole('button', { name: 'Terminer' }))

      const result = await screen.findByRole('region', { name: 'Résultat' })
      expect(result).toHaveTextContent(
        '"loss-frequency":{"health":"high","relationship":"moderate","frequency":"daily"}',
      )
      expect(result).not.toHaveTextContent('money')
      expect(result).not.toHaveTextContent('time')
    })
  })

  describe('accessibility', () => {
    it('labels every field, groups the radio buttons and flags required fields', async () => {
      const { user } = renderFlow()
      await goToLossStep(user, 'Type complet')

      expect(money()).toBeRequired()
      expect(duration()).toBeRequired()
      expect(radiogroup('Unité de la durée')).toBeRequired()
      expect(radiogroup(FREQUENCY)).toBeRequired()
      expect(money()).toHaveAccessibleDescription(/Exemple : 150 ou 149,90/)
      expect(money()).toHaveAttribute('inputmode', 'decimal')
    })

    it('has no automatic WCAG A/AA violation, with every block and with every error', async () => {
      const { user, container } = renderFlow()
      await goToLossStep(user, 'Type complet')
      await expectNoAxeViolation(container)

      await user.click(screen.getByRole('button', { name: 'Terminer' }))
      await screen.findByRole('alert')
      await expectNoAxeViolation(container)
    })
  })
})
