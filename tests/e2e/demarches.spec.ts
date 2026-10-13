import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

// Practical sections of /apprendre (formerly /demarches, night work #80): guides open,
// checklist, and the old address redirects. The site only informs: no letter is written for
// the user.

const expectNoAxeViolation = async (page: Page) => {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(results.violations).toEqual([])
}

test('the old /demarches address leads to /apprendre', async ({ page }) => {
  await page.goto('/demarches')
  await expect(page).toHaveURL(/\/apprendre$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Apprendre' })).toBeVisible()
})

test('a guide opens on its steps, accessibly', async ({ page }) => {
  await page.goto('/apprendre#pas-a-pas')
  await page.getByRole('button', { name: 'Saisir un conciliateur de justice' }).click()
  await expect(page.getByText('Trouvez une permanence')).toBeVisible()
  await expectNoAxeViolation(page)
})
