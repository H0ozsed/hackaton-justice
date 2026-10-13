import { expect, test, type Page } from '@playwright/test'

// Responsive guard (#26): no horizontal scroll on any page, from 320 px (WCAG 1.4.10 reflow,
// RGAA 10.11) to desktop, at normal text size and with the text enlarged to 200 % (RGAA 10.4).
// Widths are set here, so it runs once (desktop project).

const PAGES = [
  '/',
  '/simulation',
  '/mise-en-situation',
  '/apprendre',
  '/apprendre/lexique',
  '/apprendre/desamorcer',
  '/apprendre/qui-fait-quoi',
  '/mentions-legales',
  '/confidentialite',
  '/accessibilite',
]
const WIDTHS = [320, 375, 768, 1280]

async function horizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const root = document.documentElement
    if (root.scrollWidth <= root.clientWidth + 1) return null
    // Name the elements sticking out, to make the failure easy to fix.
    return [...document.querySelectorAll('body *')]
      .filter((el) => el.getBoundingClientRect().right > root.clientWidth + 1)
      .slice(0, 3)
      .map((el) => `<${el.tagName.toLowerCase()} class="${String(el.className).slice(0, 60)}">`)
  })
}

test.describe('responsive', () => {
  test.skip(({ isMobile }) => isMobile, 'widths are set by the test itself')

  for (const path of PAGES) {
    test(`${path}: no horizontal scroll from 320 px, at 100 % and 200 % text`, async ({ page }) => {
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 800 })
        await page.goto(path)
        expect(await horizontalOverflow(page), `${width}px, 100 % text`).toBeNull()

        await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })
        expect(await horizontalOverflow(page), `${width}px, 200 % text`).toBeNull()
      }
    })
  }

  test('footer links and simulation choices are at least 24 px tall (touch targets)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 })
    await page.goto('/simulation')
    const targets = page.locator('footer a, main input[type="radio"]')
    for (const target of await targets.all()) {
      const box = await target.boundingBox()
      expect(
        box?.height ?? 0,
        await target.evaluate((el) => el.outerHTML.slice(0, 80)),
      ).toBeGreaterThanOrEqual(24)
    }
  })
})
