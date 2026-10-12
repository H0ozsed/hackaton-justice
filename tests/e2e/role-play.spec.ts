import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

// Full runs of /mise-en-situation. Written without knowing the scenario: a run takes
// always the first or always the last choice, so it keeps working when the content changes.

const expectNoAxeViolation = async (page: Page) => {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(results.violations).toEqual([])
}

const choices = (page: Page) =>
  page.getByRole('group', { name: 'Que faites-vous ?' }).getByRole('button')

/** Reads the scene up to its choices or ending; returns true on the ending. */
async function readScene(page: Page) {
  const advance = page.getByRole('button', { name: /^(Tout afficher|Suivant|Continuer)$/ })
  const results = page.getByRole('button', { name: 'Voir mon bilan' })
  const outcome = page.getByRole('group', { name: 'Que faites-vous ?' }).or(results)
  while (!(await outcome.isVisible())) await advance.click()
  return results.isVisible()
}

/** Plays a whole run, picking the choice given by `pick`; returns the labels chosen. */
async function playRun(page: Page, pick: 'first' | 'last', { axe = false } = {}) {
  const chosen: string[] = []
  await page.getByRole('button', { name: 'Commencer' }).click()
  await expect(page.getByRole('heading', { name: /^Scène 1/ })).toBeFocused()

  while (!(await readScene(page))) {
    if (axe && chosen.length === 0) await expectNoAxeViolation(page) // choices shown
    const choice = choices(page)[pick]()
    chosen.push((await choice.textContent()) ?? '')
    await choice.click()
    await expect(
      page.getByRole('heading', { name: new RegExp(`^Scène ${chosen.length + 1}`) }),
    ).toBeFocused()
  }
  await expect(page.getByRole('heading', { name: /^Fin : / })).toBeFocused()
  return chosen
}

test('a full run up to the results, then play again', async ({ page }) => {
  await page.goto('/mise-en-situation')
  await expectNoAxeViolation(page)
  await playRun(page, 'first', { axe: true })
  await expectNoAxeViolation(page)

  await page.getByRole('button', { name: 'Voir mon bilan' }).click()
  const results = page.getByRole('region', { name: 'Votre bilan' })
  await expect(page.getByRole('heading', { name: 'Votre bilan' })).toBeFocused()
  await expect(results).toContainText(/\d+ %/)
  await expect(
    results.getByRole('region', { name: 'Ce que vos choix vous ont coûté' }),
  ).toBeVisible()
  await expect(results.getByRole('region', { name: 'Corrections' })).toBeVisible()
  await expectNoAxeViolation(page)

  await page.getByRole('button', { name: 'Rejouer' }).click()
  await expect(page.getByRole('heading', { name: /^Scène 1/ })).toBeFocused()
})

test('the results list the choices that were not the best', async ({ page }) => {
  await page.goto('/mise-en-situation')
  const chosen = await playRun(page, 'last')
  await page.getByRole('button', { name: 'Voir mon bilan' }).click()

  const corrections = page.getByRole('region', { name: 'Corrections' }).getByRole('listitem')
  const score = await page.getByRole('region', { name: 'Votre bilan' }).textContent()
  if (score?.includes('100 %')) {
    await expect(corrections).toHaveCount(0)
  } else {
    // Every correction is about a choice the user actually made.
    for (const item of await corrections.all()) {
      const text = (await item.textContent()) ?? ''
      expect(chosen.some((label) => text.includes(`Votre choix : ${label}`))).toBe(true)
    }
  }
})

test('with reduced motion, the text is shown at once', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/mise-en-situation')
  await page.getByRole('button', { name: 'Commencer' }).click()
  await expect(page.getByRole('button', { name: /^(Suivant|Continuer)$/ })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Tout afficher' })).toHaveCount(0)
})
