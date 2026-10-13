import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

// Mini-games of /apprendre (night work #80), played to the end with automatic accessibility
// checks at each state. Written without knowing the content: always the first reply.

const expectNoAxeViolation = async (page: Page) => {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(results.violations).toEqual([])
}

test('Désamorcer can be reached from /apprendre and played to its summary', async ({ page }) => {
  await page.goto('/apprendre')
  await page.getByRole('link', { name: 'Jouer à Désamorcer' }).click()
  await expect(page).toHaveURL('/apprendre/desamorcer')
  await expect(page).toHaveTitle('Désamorcer | Apprendre | Hackaton Justice')
  await expectNoAxeViolation(page)

  await page.getByRole('button', { name: 'Valider' }).click()
  await expect(page.getByText('Erreur : choisissez une réponse.')).toBeVisible()
  await expectNoAxeViolation(page)

  for (let i = 0; i < 20; i++) {
    await page.getByRole('radio').first().click()
    await page.getByRole('button', { name: 'Valider' }).click()
    if (i === 0) await expectNoAxeViolation(page)
    const next = page.getByRole('button', { name: /^(Situation suivante|Voir mon bilan)$/ })
    const label = await next.textContent()
    await next.click()
    if (label === 'Voir mon bilan') break
  }
  await expect(page.getByRole('heading', { name: 'Votre bilan' })).toBeFocused()
  await expectNoAxeViolation(page)
})
