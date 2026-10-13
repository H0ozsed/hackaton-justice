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

test('the home page explains first, then orients, then lists the journeys', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('main').getByRole('heading', { level: 2 })).toHaveText([
    'L’amiable en 1 minute',
    'Par où commencer ?',
    'Choisissez votre parcours',
    'À propos de ce site',
    'Infos pratiques',
    'Questions fréquentes',
  ])
})

test('the home page says what the site is for, for search engines too', async ({ page }) => {
  await page.goto('/')
  const description = await page.locator('meta[name="description"]').getAttribute('content')
  expect(description).toBeTruthy()
  await expect(
    page.getByRole('region', { name: 'Comprendre et gérer votre conflit' }),
  ).toContainText(description!)
})

test('the hero link jumps to « Par où commencer ? »', async ({ page }) => {
  await page.goto('/')
  await page
    .getByRole('region', { name: 'Comprendre et gérer votre conflit' })
    .getByRole('link', { name: 'Par où commencer ?' })
    .click()
  await expect(page).toHaveURL(/#par-ou-commencer$/)
  await expect(page.getByRole('heading', { level: 2, name: 'Par où commencer ?' })).toBeInViewport()
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
    await page.getByRole('link', { name: cta, exact: true }).click()
    await expect(page).toHaveURL(path)
  })
}

const ORIENTATION = [
  { situation: 'Je vis un conflit en ce moment', path: '/simulation' },
  { situation: 'Je veux comprendre avant d’agir', path: '/mise-en-situation' },
  { situation: 'Je veux apprendre', path: '/apprendre' },
]

for (const { situation, path } of ORIENTATION) {
  test(`« ${situation} » leads to ${path} in one click`, async ({ page }) => {
    await page.goto('/')
    await page
      .getByRole('region', { name: 'Par où commencer ?' })
      .getByRole('link', { name: situation })
      .click()
    await expect(page).toHaveURL(path)
  })
}
