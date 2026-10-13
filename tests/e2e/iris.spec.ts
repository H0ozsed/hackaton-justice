import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

// The IRIS API is mocked: E2E checks the widget in a real browser, not the model
// (CI has no Ollama; the API itself is covered by src/pages/api/chatbot.int.test.ts).

const ANSWER = [
  { type: 'status', step: 'search' },
  { type: 'status', step: 'read', count: 1 },
  { type: 'status', step: 'write' },
  {
    type: 'answer',
    text: 'La médiation est une démarche **amiable** :\n- gratuite\n- confidentielle',
    sources: [{ title: 'Médiation', url: '/apprendre/lexique#mediation' }],
    suggestions: ['La médiation est-elle payante ?'],
  },
]

async function mockIris(page: Page, events: unknown[] = ANSWER) {
  await page.route('**/api/chatbot', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/x-ndjson',
      body: events.map((e) => JSON.stringify(e)).join('\n'),
    }),
  )
}

// IRIS is on the home page and on the learn page.
for (const path of ['/', '/apprendre']) {
  test.describe(path, () => {
    test('asks IRIS a question and follows a source', async ({ page }) => {
      await mockIris(page)
      await page.goto(path)
      await page.getByRole('button', { name: 'Poser une question à IRIS' }).click()

      const iris = page.getByRole('dialog', { name: 'IRIS' })
      await iris.getByLabel('Votre question').fill('C’est quoi la médiation ?')
      await iris.getByRole('button', { name: 'Envoyer' }).click()

      const conversation = iris.getByRole('list', { name: 'Conversation avec IRIS' })
      await expect(conversation).toContainText('est une démarche amiable')
      await expect(conversation.getByText('gratuite', { exact: true })).toBeVisible()
      await iris.getByRole('link', { name: 'Médiation' }).click()
      await expect(page).toHaveURL('/apprendre/lexique#mediation')
    })

    test('IRIS has no automatic accessibility violation, with an answer shown', async ({
      page,
    }) => {
      await mockIris(page)
      await page.goto(path)
      await page.getByRole('button', { name: 'Poser une question à IRIS' }).click()
      const iris = page.getByRole('dialog', { name: 'IRIS' })
      await iris.getByLabel('Votre question').fill('C’est quoi la médiation ?')
      await iris.getByLabel('Votre question').press('Enter')
      await expect(iris.getByRole('link', { name: 'Médiation' })).toBeVisible()

      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
      expect(results.violations).toEqual([])
    })
  })
}

test('IRIS opens and closes from the keyboard', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard navigation is tested on desktop')
  await page.goto('/')
  const launcher = page.getByRole('button', { name: 'Poser une question à IRIS' })
  await launcher.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByLabel('Votre question')).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'IRIS' })).toBeHidden()
  await expect(page.getByRole('button', { name: 'Poser une question à IRIS' })).toBeFocused()
})

test.describe('launcher on arrival (#133)', () => {
  const teaser = (page: Page) => page.getByTestId('iris-teaser')

  test('a bubble catches the eye, then disappears once IRIS is opened', async ({ page }) => {
    await page.goto('/')
    await expect(teaser(page)).toBeVisible()
    await expect(teaser(page)).toHaveText('Une question ? Demandez à IRIS')
    await page.getByRole('button', { name: 'Poser une question à IRIS' }).click()
    await expect(teaser(page)).toBeHidden()

    // Same tab: IRIS was already opened, the launcher stays quiet on the next page.
    await page.goto('/apprendre')
    await expect(page.getByRole('button', { name: 'Poser une question à IRIS' })).toBeVisible()
    await expect(teaser(page)).toBeHidden()
  })

  test('the ring stops moving after 3 pulses (under 5 s)', async ({ page }) => {
    await page.goto('/')
    const ring = page.locator('div.fixed > span[aria-hidden]').first()
    const animation = await ring.evaluate((el) => {
      const style = getComputedStyle(el)
      return {
        name: style.animationName,
        count: style.animationIterationCount,
        duration: style.animationDuration,
      }
    })
    expect(animation).toEqual({ name: 'iris-ring', count: '3', duration: '1.5s' })
  })

  test('nothing moves with prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await expect(teaser(page)).toBeVisible()
    await expect(page.locator('div.fixed > span[aria-hidden]')).toBeHidden()
    expect(await teaser(page).evaluate((el) => getComputedStyle(el).animationName)).toBe('none')
  })

  test('the bubble passes the accessibility scan', async ({ page }) => {
    await page.goto('/')
    await expect(teaser(page)).toBeVisible()
    await page.waitForTimeout(600)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('nextjs-portal')
      .analyze()
    expect(results.violations.map((v) => v.id)).toEqual([])
  })
})
