import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { RadioGroupField } from './form-fields'
import { getOpennessAnswers } from './openness'
import { opennessStep } from './openness-step'
import { SimulationForm } from './simulation-form'
import type { ResultViewProps, SimulationStep } from './types'

// Fixtures: a minimal step before the one under test (to go back and forth) and a result screen
// that reads the answers the way #16 will, through `getOpennessAnswers`.
function BeforeFields() {
  return (
    <RadioGroupField
      name="ready"
      legend="Prêt à continuer ?"
      options={[{ value: 'yes', label: 'Prêt' }]}
    />
  )
}

const beforeStep: SimulationStep = {
  id: 'before',
  title: 'Étape précédente',
  schema: z.object({ ready: z.enum(['yes'], { error: 'Cochez la case.' }) }),
  Fields: BeforeFields,
}

function ResultFixture({ result }: ResultViewProps) {
  const openness = getOpennessAnswers(result)
  return (
    <div>
      <p>{JSON.stringify(result)}</p>
      <p>
        Lu par le résultat : {openness?.userOpenness} / {openness?.otherPartyOpenness}
      </p>
    </div>
  )
}

function renderStep(steps: SimulationStep[] = [opennessStep]) {
  const user = userEvent.setup()
  const view = render(<SimulationForm steps={steps} ResultView={ResultFixture} />)
  return { user, ...view }
}

const USER_QUESTION = /Seriez-vous prêt\(e\) à discuter/
const OTHER_QUESTION = /l’autre partie serait-elle prête/
const radioIn = (group: RegExp, label: string) =>
  within(screen.getByRole('radiogroup', { name: group })).getByRole('radio', { name: label })

async function expectNoAxeViolation(container: HTMLElement) {
  const results = await axe.run(container, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    rules: { 'color-contrast': { enabled: false } },
  })
  expect(results.violations).toEqual([])
}

describe('openness to discussion step', () => {
  describe('questions', () => {
    it('asks about the person and about the other party, as two groups of radio buttons', () => {
      renderStep()

      expect(
        screen.getByRole('heading', { level: 2, name: /Ouverture à la discussion/ }),
      ).toBeInTheDocument()
      const user = screen.getByRole('radiogroup', { name: USER_QUESTION })
      const other = screen.getByRole('radiogroup', { name: OTHER_QUESTION })
      expect(
        within(user)
          .getAllByRole('radio')
          .map((r) => r.getAttribute('value')),
      ).toEqual(['yes', 'maybe', 'no'])
      expect(
        within(other)
          .getAllByRole('radio')
          .map((r) => r.getAttribute('value')),
      ).toEqual(['yes', 'maybe', 'no', 'unknown'])
    })

    it('lets the person say they do not know about the other party only', () => {
      renderStep()
      expect(radioIn(OTHER_QUESTION, 'Je ne sais pas')).toBeInTheDocument()
      expect(
        within(screen.getByRole('radiogroup', { name: USER_QUESTION })).queryByRole('radio', {
          name: 'Je ne sais pas',
        }),
      ).not.toBeInTheDocument()
    })

    it('flags both questions as required and explains the second one', () => {
      renderStep()
      expect(screen.getByRole('radiogroup', { name: USER_QUESTION })).toBeRequired()
      expect(screen.getByRole('radiogroup', { name: OTHER_QUESTION })).toBeRequired()
      expect(screen.getByRole('radiogroup', { name: OTHER_QUESTION })).toHaveAccessibleDescription(
        /Votre ressenti suffit/,
      )
    })
  })

  describe('validation', () => {
    it('refuses to finish without any answer, with one clear message per question', async () => {
      const { user } = renderStep()
      await user.click(screen.getByRole('button', { name: 'Terminer' }))

      const alert = await screen.findByRole('alert')
      expect(alert).toHaveTextContent('2 erreurs à corriger')
      expect(alert).toHaveTextContent(
        'Indiquez si vous seriez prêt(e) à discuter avec l’autre partie.',
      )
      expect(alert).toHaveTextContent('ou répondez « Je ne sais pas »')
      expect(alert).toHaveFocus()
      expect(screen.queryByRole('region', { name: 'Résultat' })).not.toBeInTheDocument()
    })

    it('links each error to its question, for assistive technologies', async () => {
      const { user } = renderStep()
      await user.click(screen.getByRole('button', { name: 'Terminer' }))
      await screen.findByRole('alert')

      const group = screen.getByRole('radiogroup', { name: USER_QUESTION })
      expect(group).toBeInvalid()
      expect(group).toHaveAccessibleDescription(
        'Erreur : Indiquez si vous seriez prêt(e) à discuter avec l’autre partie.',
      )
      expect(screen.getByRole('radiogroup', { name: OTHER_QUESTION })).toBeInvalid()
    })

    it('names only the question that is still unanswered', async () => {
      const { user } = renderStep()
      await user.click(radioIn(USER_QUESTION, 'Oui'))
      await user.click(screen.getByRole('button', { name: 'Terminer' }))

      const alert = await screen.findByRole('alert')
      expect(alert).toHaveTextContent('Une erreur à corriger')
      expect(screen.getByRole('radiogroup', { name: USER_QUESTION })).toBeValid()
      expect(screen.getByRole('radiogroup', { name: OTHER_QUESTION })).toBeInvalid()
    })

    it('leads from the error summary to the first radio button of the question', async () => {
      const { user } = renderStep()
      await user.click(screen.getByRole('button', { name: 'Terminer' }))

      const alert = await screen.findByRole('alert')
      await user.click(within(alert).getAllByRole('link')[0])
      expect(radioIn(USER_QUESTION, 'Oui')).toHaveFocus()
    })
  })

  describe('answers for the result', () => {
    it('makes the answers available to the result screen, typed', async () => {
      const { user } = renderStep()
      await user.click(radioIn(USER_QUESTION, 'Peut-être, cela dépend'))
      await user.click(radioIn(OTHER_QUESTION, 'Je ne sais pas'))
      await user.click(screen.getByRole('button', { name: 'Terminer' }))

      const result = await screen.findByRole('region', { name: 'Résultat' })
      expect(result).toHaveFocus()
      expect(result).toHaveTextContent(
        '{"openness":{"userOpenness":"maybe","otherPartyOpenness":"unknown"}}',
      )
      expect(result).toHaveTextContent('Lu par le résultat : maybe / unknown')
    })
  })

  describe('navigation', () => {
    it('keeps the answers given when going back and returning', async () => {
      const { user } = renderStep([beforeStep, opennessStep])
      await user.click(screen.getByRole('radio', { name: 'Prêt' }))
      await user.click(screen.getByRole('button', { name: 'Suivant' }))
      await screen.findByRole('heading', { level: 2, name: /Ouverture à la discussion/ })

      await user.click(radioIn(USER_QUESTION, 'Non'))
      await user.click(radioIn(OTHER_QUESTION, 'Oui'))
      await user.click(screen.getByRole('button', { name: 'Précédent' }))
      await screen.findByRole('heading', { level: 2, name: /Étape précédente/ })
      await user.click(screen.getByRole('button', { name: 'Suivant' }))
      await screen.findByRole('heading', { level: 2, name: /Ouverture à la discussion/ })

      expect(radioIn(USER_QUESTION, 'Non')).toBeChecked()
      expect(radioIn(OTHER_QUESTION, 'Oui')).toBeChecked()
    })

    it('puts the focus on its title when reached', async () => {
      const { user } = renderStep([beforeStep, opennessStep])
      await user.click(screen.getByRole('radio', { name: 'Prêt' }))
      await user.click(screen.getByRole('button', { name: 'Suivant' }))

      expect(
        await screen.findByRole('heading', { level: 2, name: /Ouverture à la discussion/ }),
      ).toHaveFocus()
    })
  })

  describe('accessibility', () => {
    it('has no automatic WCAG A/AA violation, with and without errors', async () => {
      const { user, container } = renderStep()
      await expectNoAxeViolation(container)

      await user.click(screen.getByRole('button', { name: 'Terminer' }))
      await screen.findByRole('alert')
      await expectNoAxeViolation(container)
    })
  })
})
