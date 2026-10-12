import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

// One full run of /mise-en-situation. Written without knowing the scenario: it always
// takes the first choice, so it keeps working when the content changes.

const expectNoAxeViolation = async (page: Page) => {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(results.violations).toEqual([])
}

/** Reads the scene up to its choices or ending; returns true on the ending. */
async function readScene(page: Page) {
  const advance = page.getByRole('button', { name: /^(Tout afficher|Suivant|Continuer)$/ })
  const outcome = page
    .getByRole('group', { name: 'Que faites-vous ?' })
    .or(page.getByRole('button', { name: 'Rejouer' }))
  while (!(await outcome.isVisible())) await advance.click()
  return page.getByRole('button', { name: 'Rejouer' }).isVisible()
}

test('a full run, from the intro to the ending, then play again', async ({ page }) => {
  await page.goto('/mise-en-situation')
  await expectNoAxeViolation(page)
  await page.getByRole('button', { name: 'Commencer' }).click()
  await expect(page.getByRole('heading', { name: /^Scène 1/ })).toBeFocused()

  let scenes = 0
  while (!(await readScene(page))) {
    scenes += 1
    if (scenes === 1) await expectNoAxeViolation(page) // choices shown
    await page.getByRole('group', { name: 'Que faites-vous ?' }).getByRole('button').first().click()
    await expect(
      page.getByRole('heading', { name: new RegExp(`^Scène ${scenes + 1}`) }),
    ).toBeFocused()
  }

  await expect(page.getByRole('heading', { name: /^Fin : / })).toBeFocused()
  await expectNoAxeViolation(page)

  await page.getByRole('button', { name: 'Rejouer' }).click()
  await expect(page.getByRole('heading', { name: /^Scène 1/ })).toBeFocused()
})

test('with reduced motion, the text is shown at once', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/mise-en-situation')
  await page.getByRole('button', { name: 'Commencer' }).click()
  await expect(page.getByRole('button', { name: /^(Suivant|Continuer)$/ })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Tout afficher' })).toHaveCount(0)
})
