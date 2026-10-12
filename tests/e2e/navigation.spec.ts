import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const PAGES = [
  { path: '/', title: 'Hackaton Justice', nav: 'Accueil' },
  { path: '/simulation', title: 'Simulation | Hackaton Justice', nav: 'Simulation' },
  {
    path: '/mise-en-situation',
    title: 'Mise en situation | Hackaton Justice',
    nav: 'Mise en situation',
  },
  { path: '/apprendre', title: 'Apprendre | Hackaton Justice', nav: 'Apprendre' },
]

for (const { path, title, nav } of PAGES) {
  test.describe(path, () => {
    test('has a unique title, one h1 and no automatic accessibility violation', async ({
      page,
    }) => {
      await page.goto(path)
      await expect(page).toHaveTitle(title)
      await expect(page.locator('h1')).toHaveCount(1)

      // Automatic WCAG A/AA checks (a subset of RGAA, see docs/TESTING.md).
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
      expect(results.violations).toEqual([])
    })

    test('marks its navbar entry as the current page', async ({ page, isMobile }) => {
      await page.goto(path)
      if (isMobile) await page.getByRole('button', { name: 'Ouvrir le menu' }).click()
      const menu = page.getByRole('navigation', { name: 'Menu principal' })
      await expect(menu.getByRole('link', { name: nav, exact: true })).toHaveAttribute(
        'aria-current',
        'page',
      )
    })
  })
}

test('the skip link moves the keyboard focus to the main content', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard navigation is tested on desktop')
  await page.goto('/simulation')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Aller au contenu' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('main#contenu')).toBeFocused()
})

test('the navbar leads to every journey', async ({ page, isMobile }) => {
  await page.goto('/')
  for (const { path, nav } of PAGES.slice(1)) {
    if (isMobile) await page.getByRole('button', { name: 'Ouvrir le menu' }).click()
    await page
      .getByRole('navigation', { name: 'Menu principal' })
      .getByRole('link', { name: nav })
      .click()
    await expect(page).toHaveURL(path)
  }
})
