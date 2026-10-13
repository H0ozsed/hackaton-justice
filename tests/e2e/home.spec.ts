import { expect, test } from '@playwright/test'

test('the home page explains the service and offers the 3 journeys', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Comprendre et gérer votre conflit' }),
  ).toBeVisible()
  const orientation = page.getByRole('region', { name: 'Par où commencer ?' })
  await expect(orientation.getByRole('link')).toHaveCount(3)
  for (const path of ['/simulation', '/mise-en-situation', '/apprendre']) {
    await expect(orientation.locator(`a[href="${path}"]`)).toHaveCount(1)
  }
})

test('the home page explains first, then orients', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('main').getByRole('heading', { level: 2 })).toHaveText([
    'L’amiable en 1 minute',
    'Par où commencer ?',
    'À propos de ce site',
    'Une question ?',
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

test('the home page links to the FAQ and the practical info of /apprendre', async ({ page }) => {
  await page.goto('/')
  const questions = page.getByRole('region', { name: 'Une question ?' })
  await expect(questions.getByRole('link', { name: 'Questions fréquentes' })).toHaveAttribute(
    'href',
    '/apprendre#questions-frequentes',
  )
  await expect(questions.getByRole('link', { name: 'Infos pratiques' })).toHaveAttribute(
    'href',
    '/apprendre#infos-pratiques',
  )
})

test('a FAQ question opens and closes from the keyboard', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard navigation is tested on desktop')
  await page.goto('/apprendre')
  const faq = page.getByRole('region', { name: 'Questions fréquentes' })
  const question = faq.getByRole('button').first()
  await expect(question).toHaveAttribute('aria-expanded', 'false')
  await question.focus()
  await page.keyboard.press('Enter')
  await expect(question).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Space')
  await expect(question).toHaveAttribute('aria-expanded', 'false')
})

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
