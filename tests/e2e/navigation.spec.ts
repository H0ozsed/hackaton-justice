import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const PAGES = [
  { path: '/', title: 'Hackaton Justice', nav: 'Accueil' },
  { path: '/simulation', title: 'J’ai un conflit ? | Hackaton Justice', nav: 'J’ai un conflit ?' },
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
  await expect(page.locator('main#main-content')).toBeFocused()
})

// Regulatory pages (#24, #25): reached from the footer of every page.
const FOOTER_PAGES = [
  {
    path: '/mentions-legales',
    title: 'Mentions légales | Hackaton Justice',
    link: 'Mentions légales',
  },
  {
    path: '/confidentialite',
    title: 'Données personnelles | Hackaton Justice',
    link: 'Données personnelles',
  },
  { path: '/cookies', title: 'Cookies | Hackaton Justice', link: 'Cookies' },
  { path: '/accessibilite', title: 'Accessibilité | Hackaton Justice', link: /^Accessibilité/ },
]

test('the cookie policy is linked from the footer of every page', async ({ page }) => {
  // Many pages in one test: on a cold dev server each first visit compiles the page.
  test.slow()
  const paths = [
    ...PAGES.map(({ path }) => path),
    ...FOOTER_PAGES.map(({ path }) => path),
    '/mise-en-situation/voisin-du-dessus',
    '/apprendre/lexique',
    '/apprendre/desamorcer',
    '/apprendre/qui-fait-quoi',
    '/page-qui-n-existe-pas',
  ]
  for (const path of paths) {
    await page.goto(path)
    await expect(
      page.getByRole('navigation', { name: 'Liens réglementaires' }).getByRole('link', {
        name: 'Cookies',
      }),
      path,
    ).toHaveAttribute('href', '/cookies')
  }
})

for (const { path, title, link } of FOOTER_PAGES) {
  test(`the footer leads to ${path}, with one h1 and no automatic accessibility violation`, async ({
    page,
  }) => {
    await page.goto('/simulation')
    await page
      .getByRole('navigation', { name: 'Liens réglementaires' })
      .getByRole('link', { name: link })
      .click()
    await expect(page).toHaveURL(path)
    await expect(page).toHaveTitle(title)
    await expect(page.locator('h1')).toHaveCount(1)

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    expect(results.violations).toEqual([])
  })
}

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
