import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

// Full runs of /simulation, from the conflict type to the orientation. Written without knowing
// the content (conflict types, follow-up questions, losses): every question gets the first
// possible answer, so the runs keep working when the content team replaces the examples. The
// result always leads to an amicable agreement (conciliation or mediation): nothing to choose.

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

/** Opens « J’ai un conflit ? » and leaves the introduction for the first question. */
async function openForm(page: Page) {
  await page.goto('/simulation')
  await page.getByRole('button', { name: 'Commencer' }).click()
}

/** Goes through every step with the first possible answers, up to the result. */
async function runJourney(page: Page) {
  if (!(await stepTitle(page).isVisible())) await openForm(page)
  for (let step = 0; step < 20 && !(await result(page).isVisible()); step++) {
    const before = await stepTitle(page).textContent()
    await answerFirstChoices(page)
    await goOn(page).click()
    // Either the next step is shown (new title) or the result is.
    await expect(async () => {
      const showsResult = await result(page).isVisible()
      expect(showsResult || (await stepTitle(page).textContent()) !== before).toBe(true)
    }).toPass()
  }
  await expect(result(page)).toBeVisible()
}

test('a full journey up to the amicable solutions, then start over', async ({ page }) => {
  await page.goto('/simulation')
  await expect(page.getByRole('heading', { level: 1, name: 'J’ai un conflit ?' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: 'Comment ça marche ?' })).toBeVisible()
  await expectNoAxeViolation(page) // introduction

  await page.getByRole('button', { name: 'Commencer' }).click()
  await expect(stepTitle(page)).toBeFocused()
  await expectNoAxeViolation(page) // first step

  await runJourney(page)
  await expect(result(page)).toBeFocused()
  await expect(page.getByRole('heading', { level: 2, name: 'Votre orientation' })).toBeVisible()
  const amicable = result(page).getByRole('region', { name: 'Vers un accord à l’amiable' })
  await expect(amicable.getByRole('heading', { level: 4, name: 'Conciliation' })).toBeVisible()
  await expect(amicable.getByRole('heading', { level: 4, name: 'Médiation' })).toBeVisible()
  // Nothing to choose: every third party is shown, what the law says first.
  await expect(amicable.getByRole('radio')).toHaveCount(0)
  await expect(amicable.getByRole('article').first().getByRole('term').first()).toHaveText(
    'Ce que dit la loi',
  )
  await expect(result(page).getByRole('heading', { name: 'Vos réponses' })).toBeVisible()
  await expectNoAxeViolation(page) // result

  await page.getByRole('button', { name: 'Recommencer le questionnaire' }).click()
  await expect(stepTitle(page)).toBeFocused()
  await expect(stepTitle(page)).toContainText('Étape 1 sur')
  await expect(page.getByRole('radio', { checked: true })).toHaveCount(0)
})

test('never asks what the person is ready to do', async ({ page }) => {
  await openForm(page)
  await runJourney(page)
  await expect(page.getByText(/prêt\(e\) à discuter/)).toHaveCount(0)
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
