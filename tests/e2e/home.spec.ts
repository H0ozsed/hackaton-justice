import { expect, test } from '@playwright/test'

const JOURNEYS = [
  { cta: 'Commencer la simulation', path: '/simulation' },
  { cta: 'Lancer la mise en situation', path: '/mise-en-situation' },
  { cta: 'Découvrir les notions clés', path: '/apprendre' },
]

test('the home page explains the service and lists the 3 journeys', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Comprendre et gérer votre conflit' }),
  ).toBeVisible()
  const journeys = page.getByRole('region', { name: 'Choisissez votre parcours' })
  await expect(journeys.getByRole('heading', { level: 3 })).toHaveText([
    'Simulation',
    'Mise en situation',
    'Apprendre',
  ])
})

test('the home page sections follow the h1 > h2 heading order', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 2 })).toHaveText([
    'Choisissez votre parcours',
    'Infos pratiques',
    'Questions fréquentes',
  ])
})

test('a home FAQ question opens and closes from the keyboard', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard navigation is tested on desktop')
  await page.goto('/')
  const faq = page.getByRole('region', { name: 'Questions fréquentes' })
  const question = faq.getByRole('button').first()
  await expect(question).toHaveAttribute('aria-expanded', 'false')
  await question.focus()
  await page.keyboard.press('Enter')
  await expect(question).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Space')
  await expect(question).toHaveAttribute('aria-expanded', 'false')
})

for (const { cta, path } of JOURNEYS) {
  test(`opens ${path} in one click from the home page`, async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: cta }).click()
    await expect(page).toHaveURL(path)
  })
}
