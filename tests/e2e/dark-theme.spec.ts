import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

// Dark theme (#132): follows the system preference, the header toggle stores a choice,
// no white flash, and every page passes the automatic accessibility scan in dark too
// (contrast included).

const PAGES = [
  '/',
  '/simulation',
  '/mise-en-situation',
  '/mise-en-situation/voisin-du-dessus',
  '/apprendre',
  '/apprendre/lexique',
  '/apprendre/qui-fait-quoi',
  '/apprendre/desamorcer',
  '/mentions-legales',
  '/confidentialite',
  '/accessibilite',
]

const isDark = (page: Page) =>
  page.evaluate(() => document.documentElement.classList.contains('dark'))

async function expectNoViolations(page: Page, state: string) {
  // Let fade-in animations finish: a half-transparent text is not a contrast failure.
  await page.waitForTimeout(600)
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .exclude('nextjs-portal')
    .analyze()
  const summary = results.violations.map(
    (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
  )
  expect(summary, state).toEqual([])
}

test.describe('with the system in dark mode', () => {
  test.use({ colorScheme: 'dark' })

  test('the page is dark before the app loads (no white flash)', async ({ page }) => {
    await page.route(/\/_next\/static\/.*\.js$/, (route) => route.abort())
    await page.goto('/')
    expect(await isDark(page)).toBe(true)
    const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    expect(background).toBe('rgb(22, 22, 22)')
  })

  test('the toggle shows the dark theme as on, and switches to light', async ({ page }) => {
    await page.goto('/')
    const toggle = page.getByRole('button', { name: 'Thème sombre' })
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    expect(await isDark(page)).toBe(false)

    // The choice is kept on the device, over the system preference.
    await page.reload()
    expect(await isDark(page)).toBe(false)
  })

  for (const path of PAGES) {
    test(`${path}: no automatic accessibility violation in dark`, async ({ page }) => {
      await page.goto(path)
      expect(await isDark(page)).toBe(true)
      await expectNoViolations(page, `${path} (dark)`)
    })
  }

  // The home FAQ moved to /apprendre (#161): its dark state is covered by the /apprendre scans.
  test('home states in dark: definition and IRIS open', async ({ page }) => {
    await page.goto('/')
    await page
      .getByRole('region', { name: 'L’amiable en 1 minute' })
      .getByRole('button', { name: /voir la définition/ })
      .first()
      .click()
    const definition = page.getByRole('dialog', { name: /^Définition/ })
    await expect(definition).toBeVisible()
    await expectNoViolations(page, 'definition open (dark)')
    await page.keyboard.press('Escape')
    // The popover fades out before leaving the page.
    await expect(definition).toHaveCount(0)

    await page.getByRole('button', { name: 'Poser une question à IRIS' }).click()
    await expect(page.getByRole('dialog', { name: 'IRIS' })).toBeVisible()
    await expectNoViolations(page, 'IRIS open (dark)')
  })
})

test.describe('with the system in light mode', () => {
  test.use({ colorScheme: 'light' })

  test('the site is light, and the toggle switches it to dark for the next pages', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/')
    expect(await isDark(page)).toBe(false)
    await page.getByRole('button', { name: 'Thème sombre' }).click()
    expect(await isDark(page)).toBe(true)

    if (isMobile) await page.getByRole('button', { name: 'Ouvrir le menu' }).click()
    await page.getByRole('link', { name: 'Apprendre', exact: true }).first().click()
    await expect(page).toHaveURL('/apprendre')
    expect(await isDark(page)).toBe(true)
    await expect(page.getByRole('button', { name: 'Thème sombre' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
