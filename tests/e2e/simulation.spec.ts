import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

// Full runs of /simulation, from the conflict type to the orientation. Written without knowing
// the content (conflict types, follow-up questions, losses): every question gets the first
// possible answer, so the runs keep working when the content team replaces the examples. Only the
// openness step is answered on purpose, because the orientation depends on it.

const expectNoAxeViolation = async (page: Page) => {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(results.violations).toEqual([])
}

const stepTitle = (page: Page) => page.locator('main h2').first()
const result = (page: Page) => page.getByRole('region', { name: 'Résultat' })
const goOn = (page: Page) => page.getByRole('button', { name: /^(Suivant|Terminer)$/ })

// A number a text field accepts: 1, or the minimum announced in its description if it is higher.
async function numberFor(field: Locator) {
  const description = await field.evaluate((input) =>
    (input.getAttribute('aria-describedby') ?? '')
      .split(' ')
      .map((id) => document.getElementById(id)?.textContent ?? '')
      .join(' '),
  )
  const minimum = /Valeur minimale : (-?\d+(?:[.,]\d+)?)/.exec(description)?.[1]
  return String(Math.max(1, Number(minimum?.replace(',', '.') ?? 1)))
}

/** Answers every question of the current step with the first possible answer. */
async function answerFirstChoices(page: Page) {
  for (const group of await page.getByRole('radiogroup').all()) {
    await group.getByRole('radio').first().check()
  }
  for (const group of await page.locator('main fieldset:not([role])').all()) {
    const boxes = group.getByRole('checkbox')
    if ((await boxes.count()) > 0) await boxes.first().check()
  }
  for (const field of await page.getByRole('textbox').all()) {
    await field.fill(await numberFor(field))
  }
}

const OWN_QUESTION = /Seriez-vous prêt\(e\) à discuter/
const OTHER_QUESTION = /l’autre partie serait-elle prête/

/** Opens « Ma situation ? » and leaves the introduction for the first question. */
async function openForm(page: Page) {
  await page.goto('/simulation')
  await page.getByRole('button', { name: 'Commencer' }).click()
}

/** Goes through every step; the openness step gets the answers given, the others the first ones. */
async function runJourney(page: Page, { own, other }: { own: string; other: string }) {
  if (!(await stepTitle(page).isVisible())) await openForm(page)
  for (let step = 0; step < 20 && !(await result(page).isVisible()); step++) {
    const before = await stepTitle(page).textContent()
    const openness = page.getByRole('radiogroup', { name: OWN_QUESTION })
    if (await openness.isVisible()) {
      await openness.getByRole('radio', { name: own, exact: true }).check()
      await page
        .getByRole('radiogroup', { name: OTHER_QUESTION })
        .getByRole('radio', { name: other, exact: true })
        .check()
    } else {
      await answerFirstChoices(page)
    }
    await goOn(page).click()
    // Either the next step is shown (new title) or the result is.
    await expect(async () => {
      const showsResult = await result(page).isVisible()
      expect(showsResult || (await stepTitle(page).textContent()) !== before).toBe(true)
    }).toPass()
  }
  await expect(result(page)).toBeVisible()
}

test('a full journey up to the orientation, then start over', async ({ page }) => {
  await page.goto('/simulation')
  await expect(page.getByRole('heading', { level: 1, name: 'Ma situation ?' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: 'Comment ça marche ?' })).toBeVisible()
  await expectNoAxeViolation(page) // introduction

  await page.getByRole('button', { name: 'Commencer' }).click()
  await expect(stepTitle(page)).toBeFocused()
  await expectNoAxeViolation(page) // first step

  await runJourney(page, { own: 'Oui', other: 'Oui' })
  await expect(result(page)).toBeFocused()
  await expect(page.getByRole('heading', { level: 2, name: 'Votre orientation' })).toBeVisible()
  await expect(result(page).getByText('Le canal conseillé')).toBeVisible()
  await expect(result(page).getByRole('heading', { name: 'Pourquoi ce canal ?' })).toBeVisible()
  await expect(result(page).getByRole('heading', { name: 'Vos réponses' })).toBeVisible()
  await expectNoAxeViolation(page) // orientation

  await page.getByRole('button', { name: 'Recommencer le questionnaire' }).click()
  await expect(stepTitle(page)).toBeFocused()
  await expect(stepTitle(page)).toContainText('Étape 1 sur')
  await expect(page.getByRole('radio', { checked: true })).toHaveCount(0)
})

test.describe('the openness answers decide the orientation', () => {
  const cases = [
    { own: 'Oui', other: 'Oui', route: /en parler directement/ },
    { own: 'Oui', other: 'Je ne sais pas', route: /l’aide d’une personne neutre/ },
    { own: 'Non', other: 'Oui', route: /la voie judiciaire/ },
  ]

  for (const { own, other, route } of cases) {
    test(`you: ${own}, the other party: ${other}`, async ({ page }) => {
      await runJourney(page, { own, other })

      const why = result(page).getByRole('region', { name: 'Pourquoi ce canal ?' })
      await expect(why).toContainText(route)
      await expect(result(page).getByRole('region', { name: 'Vos réponses' })).toContainText(own)
    })
  }
})

test('an empty step is refused with a clear message, and can be fixed', async ({ page }) => {
  await openForm(page)
  await goOn(page).click()

  // Inside <main>: Next adds its own role="alert" element (route announcer) to the page.
  const alert = page.locator('main').getByRole('alert')
  await expect(alert).toBeFocused()
  await expect(alert).toContainText('Choisissez le type de conflit')
  await expectNoAxeViolation(page)

  await page.getByRole('radiogroup').getByRole('radio').first().check()
  await goOn(page).click()
  await expect(stepTitle(page)).not.toContainText('Type de conflit')
})

test('going back keeps the answers', async ({ page }) => {
  await openForm(page)
  const firstChoice = page.getByRole('radiogroup').getByRole('radio').first()
  await firstChoice.check()
  await goOn(page).click()
  await expect(stepTitle(page)).toBeFocused()

  await page.getByRole('button', { name: 'Précédent' }).click()
  await expect(stepTitle(page)).toContainText('Type de conflit')
  await expect(page.getByRole('radiogroup').getByRole('radio').first()).toBeChecked()
})
