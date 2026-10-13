import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { RadioGroupField, TextField } from './form-fields'
import { SimulationForm } from './simulation-form'
import type { ResultViewProps, SimulationStep, StepFieldsProps } from './types'

// Neutral fixture steps and result screen: the form is tested through its behaviour, never
// through the temporary demo steps. The texts below are fixtures, not site content.

function ChoiceFields() {
  return (
    <RadioGroupField
      name="extra"
      legend="Poser la seconde question ?"
      options={[
        { value: 'yes', label: 'Oui' },
        { value: 'no', label: 'Non' },
      ]}
    />
  )
}

function NoteFields() {
  return <TextField name="note" label="Votre note" hint="Au moins 3 caractères." />
}

const firstStep: SimulationStep = {
  id: 'first',
  title: 'Première question',
  schema: z.object({ extra: z.enum(['yes', 'no'], { error: 'Choisissez une réponse.' }) }),
  Fields: ChoiceFields,
}

const secondStep: SimulationStep = {
  id: 'second',
  title: 'Seconde question',
  schema: z.object({ note: z.string().trim().min(3, { error: 'Saisissez 3 caractères.' }) }),
  isActive: (answers) => answers.first?.extra === 'yes',
  Fields: NoteFields,
}

// A step whose rules and fields depend on the answer of the first step: with "yes" it needs 5
// characters, otherwise 1.
const codeLength = (previous: Record<string, Record<string, unknown> | undefined>) =>
  previous.first?.extra === 'yes' ? 5 : 1

function DependentFields({ answers }: StepFieldsProps) {
  return (
    <>
      <p>Choix précédent : {String(answers.first?.extra)}</p>
      <TextField name="code" label="Code" />
    </>
  )
}

const dependentStep: SimulationStep = {
  id: 'dependent',
  title: 'Question dépendante',
  schema: (previous) =>
    z.object({
      code: z
        .string()
        .trim()
        .min(codeLength(previous), { error: `${codeLength(previous)} caractères au moins.` }),
    }),
  isActive: (answers) => answers.first !== undefined,
  Fields: DependentFields,
}

function ResultFixture({ result, onRestart }: ResultViewProps) {
  return (
    <div>
      <h2>Fin du test</h2>
      <p>{JSON.stringify(result)}</p>
      <button type="button" onClick={onRestart}>
        Recommencer
      </button>
    </div>
  )
}

function renderForm(steps: SimulationStep[] = [firstStep, secondStep]) {
  const user = userEvent.setup()
  const view = render(<SimulationForm steps={steps} ResultView={ResultFixture} />)
  return { user, ...view }
}

const stepHeading = (title: RegExp) => screen.findByRole('heading', { level: 2, name: title })
const progress = () => screen.getByRole('progressbar')

// Layout-dependent rules (colour contrast...) cannot run in happy-dom: the E2E axe scan covers
// them. The WCAG A/AA rules that depend on the markup only are checked here.
async function expectNoAxeViolation(container: HTMLElement) {
  const results = await axe.run(container, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    rules: { 'color-contrast': { enabled: false } },
  })
  expect(results.violations).toEqual([])
}

describe('SimulationForm', () => {
  it('shows the first step with its progress, without moving the focus', () => {
    renderForm()

    expect(screen.getByRole('heading', { level: 2, name: /Première question/ })).toBeInTheDocument()
    expect(progress()).toHaveAttribute('aria-valuenow', '1')
    expect(progress()).toHaveAttribute('aria-valuetext', 'Étape 1 sur 1')
    expect(screen.queryByRole('button', { name: 'Précédent' })).not.toBeInTheDocument()
    expect(document.body).toHaveFocus()
  })

  it('puts the focus on the first step title when shown after an introduction', () => {
    render(<SimulationForm steps={[firstStep, secondStep]} ResultView={ResultFixture} autoFocus />)

    expect(screen.getByRole('heading', { level: 2, name: /Première question/ })).toHaveFocus()
  })

  it('refuses to move on while the step is invalid, and announces the error', async () => {
    const { user } = renderForm()
    await user.click(screen.getByRole('button', { name: 'Terminer' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Choisissez une réponse.')
    expect(alert).toHaveFocus()
    expect(screen.getByRole('heading', { level: 2, name: /Première question/ })).toBeInTheDocument()

    const group = screen.getByRole('radiogroup', { name: 'Poser la seconde question ?' })
    expect(group).toBeInvalid()
    expect(group).toHaveAccessibleDescription('Erreur : Choisissez une réponse.')
  })

  it('updates the progress live when an answer adds or removes a step', async () => {
    const { user } = renderForm()

    await user.click(screen.getByRole('radio', { name: 'Oui' }))
    await waitFor(() => expect(progress()).toHaveAttribute('aria-valuetext', 'Étape 1 sur 2'))
    expect(screen.getByRole('button', { name: 'Suivant' })).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Non' }))
    await waitFor(() => expect(progress()).toHaveAttribute('aria-valuetext', 'Étape 1 sur 1'))
    expect(screen.getByRole('button', { name: 'Terminer' })).toBeInTheDocument()
  })

  it('moves to the next step and puts the focus on its title', async () => {
    const { user } = renderForm()
    await user.click(screen.getByRole('radio', { name: 'Oui' }))
    await user.click(screen.getByRole('button', { name: 'Suivant' }))

    const heading = await stepHeading(/Seconde question/)
    expect(heading).toHaveFocus()
    expect(progress()).toHaveAttribute('aria-valuetext', 'Étape 2 sur 2')
    expect(screen.getByRole('button', { name: 'Précédent' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Terminer' })).toBeInTheDocument()
  })

  it('validates a text field before finishing, linking the error to the field', async () => {
    const { user } = renderForm()
    await user.click(screen.getByRole('radio', { name: 'Oui' }))
    await user.click(screen.getByRole('button', { name: 'Suivant' }))
    await stepHeading(/Seconde question/)

    await user.type(screen.getByRole('textbox', { name: 'Votre note' }), 'ab')
    await user.click(screen.getByRole('button', { name: 'Terminer' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Saisissez 3 caractères.')
    const field = screen.getByRole('textbox', { name: 'Votre note' })
    expect(field).toBeInvalid()
    expect(field).toHaveAccessibleDescription(/Erreur : Saisissez 3 caractères\./)
    expect(field).toHaveValue('ab')
    expect(screen.queryByRole('region', { name: 'Résultat' })).not.toBeInTheDocument()
  })

  it('finishes with the answers of the active steps and focuses the result', async () => {
    const { user } = renderForm()
    await user.click(screen.getByRole('radio', { name: 'Oui' }))
    await user.click(screen.getByRole('button', { name: 'Suivant' }))
    await stepHeading(/Seconde question/)
    await user.type(screen.getByRole('textbox', { name: 'Votre note' }), 'abc')
    await user.click(screen.getByRole('button', { name: 'Terminer' }))

    const result = await screen.findByRole('region', { name: 'Résultat' })
    expect(result).toHaveFocus()
    expect(result).toHaveTextContent('"first":{"extra":"yes"}')
    expect(result).toHaveTextContent('"second":{"note":"abc"}')
  })

  it('keeps the validated answer and the unvalidated input when going back', async () => {
    const { user } = renderForm()
    await user.click(screen.getByRole('radio', { name: 'Oui' }))
    await user.click(screen.getByRole('button', { name: 'Suivant' }))
    await stepHeading(/Seconde question/)
    await user.type(screen.getByRole('textbox', { name: 'Votre note' }), 'xy')

    await user.click(screen.getByRole('button', { name: 'Précédent' }))
    const first = await stepHeading(/Première question/)
    expect(first).toHaveFocus()
    expect(screen.getByRole('radio', { name: 'Oui' })).toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Suivant' }))
    await stepHeading(/Seconde question/)
    expect(screen.getByRole('textbox', { name: 'Votre note' })).toHaveValue('xy')
  })

  it('leaves out of the result the step that an earlier answer made inactive', async () => {
    const { user } = renderForm()
    await user.click(screen.getByRole('radio', { name: 'Oui' }))
    await user.click(screen.getByRole('button', { name: 'Suivant' }))
    await stepHeading(/Seconde question/)
    await user.type(screen.getByRole('textbox', { name: 'Votre note' }), 'xyz')
    await user.click(screen.getByRole('button', { name: 'Précédent' }))
    await stepHeading(/Première question/)

    await user.click(screen.getByRole('radio', { name: 'Non' }))
    await user.click(screen.getByRole('button', { name: 'Terminer' }))

    const result = await screen.findByRole('region', { name: 'Résultat' })
    expect(result).toHaveTextContent('"first":{"extra":"no"}')
    expect(result).not.toHaveTextContent('second')
    expect(result).not.toHaveTextContent('xyz')
  })

  it('starts over with nothing kept when restarting', async () => {
    const { user } = renderForm()
    await user.click(screen.getByRole('radio', { name: 'Non' }))
    await user.click(screen.getByRole('button', { name: 'Terminer' }))
    await user.click(await screen.findByRole('button', { name: 'Recommencer' }))

    const first = await stepHeading(/Première question/)
    expect(first).toHaveFocus()
    expect(screen.getByRole('radio', { name: 'Oui' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'Non' })).not.toBeChecked()
    expect(screen.queryByRole('region', { name: 'Résultat' })).not.toBeInTheDocument()
  })

  describe('a step that depends on the previous answers', () => {
    it('gives its fields the answers of the steps before it', async () => {
      const { user } = renderForm([firstStep, dependentStep])
      await user.click(screen.getByRole('radio', { name: 'Oui' }))
      await user.click(screen.getByRole('button', { name: 'Suivant' }))

      await stepHeading(/Question dépendante/)
      expect(screen.getByText('Choix précédent : yes')).toBeInTheDocument()
    })

    it('builds its validation rules from the previous answers', async () => {
      const { user } = renderForm([firstStep, dependentStep])
      await user.click(screen.getByRole('radio', { name: 'Oui' }))
      await user.click(screen.getByRole('button', { name: 'Suivant' }))
      await stepHeading(/Question dépendante/)

      await user.type(screen.getByRole('textbox', { name: 'Code' }), 'abc')
      await user.click(screen.getByRole('button', { name: 'Terminer' }))
      expect(await screen.findByRole('alert')).toHaveTextContent('5 caractères au moins.')
    })

    it('applies other rules when the earlier answer is different', async () => {
      const { user } = renderForm([firstStep, dependentStep])
      await user.click(screen.getByRole('radio', { name: 'Non' }))
      await user.click(screen.getByRole('button', { name: 'Suivant' }))
      await stepHeading(/Question dépendante/)

      await user.type(screen.getByRole('textbox', { name: 'Code' }), 'a')
      await user.click(screen.getByRole('button', { name: 'Terminer' }))
      expect(await screen.findByRole('region', { name: 'Résultat' })).toHaveTextContent(
        '"code":"a"',
      )
    })
  })

  describe('accessibility', () => {
    it('exposes labelled controls grouped by a legend, with required fields flagged', async () => {
      const { user } = renderForm()
      const group = screen.getByRole('radiogroup', { name: 'Poser la seconde question ?' })
      expect(group).toBeRequired()
      expect(screen.getByRole('radio', { name: 'Oui' })).toBeInTheDocument()

      await user.click(screen.getByRole('radio', { name: 'Oui' }))
      await user.click(screen.getByRole('button', { name: 'Suivant' }))
      await stepHeading(/Seconde question/)
      const field = screen.getByRole('textbox', { name: 'Votre note' })
      expect(field).toBeRequired()
      expect(field).toHaveAccessibleDescription('Au moins 3 caractères.')
    })

    it('has no automatic WCAG A/AA violation on a step, with and without errors', async () => {
      const { user, container } = renderForm()
      await expectNoAxeViolation(container)

      await user.click(screen.getByRole('button', { name: 'Terminer' }))
      await screen.findByRole('alert')
      await expectNoAxeViolation(container)
    })

    it('has no automatic WCAG A/AA violation on the second step and on the result', async () => {
      const { user, container } = renderForm()
      await user.click(screen.getByRole('radio', { name: 'Oui' }))
      await user.click(screen.getByRole('button', { name: 'Suivant' }))
      await stepHeading(/Seconde question/)
      await expectNoAxeViolation(container)

      await user.type(screen.getByRole('textbox', { name: 'Votre note' }), 'abc')
      await user.click(screen.getByRole('button', { name: 'Terminer' }))
      await screen.findByRole('region', { name: 'Résultat' })
      await expectNoAxeViolation(container)
    })
  })
})
