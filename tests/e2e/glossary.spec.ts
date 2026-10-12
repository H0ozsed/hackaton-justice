import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.describe('/apprendre/lexique', () => {
  test('has a title, one h1, Apprendre as current page and no axe violation', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/apprendre/lexique')
    await expect(page).toHaveTitle('Lexique | Hackaton Justice')
    await expect(page.locator('h1')).toHaveCount(1)

    if (isMobile) await page.getByRole('button', { name: 'Ouvrir le menu' }).click()
    const menu = page.getByRole('navigation', { name: 'Menu principal' })
    await expect(menu.getByRole('link', { name: 'Apprendre', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    )

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    expect(results.violations).toEqual([])
  })

  test('is reachable from /apprendre', async ({ page }) => {
    await page.goto('/apprendre')
    await page.getByRole('link', { name: 'Consulter le lexique' }).click()
    await expect(page).toHaveURL('/apprendre/lexique')
  })

  test('opens directly on a term from its anchor', async ({ page }) => {
    await page.goto('/apprendre/lexique')
    // Content changes: take the last term, the one furthest down the page.
    const slug = await page.getByRole('term').last().getAttribute('id')
    await page.goto(`/apprendre/lexique#${slug}`)
    await expect(page.locator(`[id="${slug}"]`)).toBeInViewport()
  })

  test('search filters the list and announces the count', async ({ page }) => {
    await page.goto('/apprendre/lexique')
    const first = (await page.getByRole('term').first().textContent()) ?? ''
    await page.getByLabel('Rechercher un terme').fill(first)
    await expect(page.getByRole('term').first()).toHaveText(first)
    await page.getByLabel('Rechercher un terme').fill('zzzzzz')
    await expect(page.getByRole('status').filter({ hasText: 'Aucun terme' })).toBeVisible()
  })
})
