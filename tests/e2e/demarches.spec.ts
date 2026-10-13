import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

// /demarches (night work #80): guides open, checklist, amicable letter.

const expectNoAxeViolation = async (page: Page) => {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(results.violations).toEqual([])
}

test('a guide opens on its steps, accessibly', async ({ page }) => {
  await page.goto('/demarches')
  await page.getByRole('button', { name: 'Saisir un conciliateur de justice' }).click()
  await expect(page.getByText('Trouvez une permanence')).toBeVisible()
  await expectNoAxeViolation(page)
})

test('the amicable letter: errors first, then the letter', async ({ page }) => {
  await page.goto('/demarches#courrier')
  const write = page.getByRole('button', { name: 'Écrire mon courrier' })
  await write.click()
  const alert = page.locator('main').getByRole('alert')
  await expect(alert).toBeFocused()
  await expectNoAxeViolation(page)

  await page.getByLabel('Votre nom').fill('Camille Durand')
  await page.getByLabel('Nom du destinataire').fill('M. Martin')
  await page.getByLabel('Objet du courrier').selectOption('voisinage')
  await page.getByLabel('Ce qui s’est passé').fill('Depuis le 3 mars, de la batterie après 23 h.')
  await page.getByLabel('Ce que vous demandez').fill('Ne plus jouer après 21 h en semaine.')
  await write.click()

  await expect(page.getByRole('heading', { name: 'Votre courrier' })).toBeFocused()
  await expect(page.getByTestId('letter')).toContainText('Objet : Trouble de voisinage')
  await expectNoAxeViolation(page)
})
