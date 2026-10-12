import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

// The IRIS API is mocked: E2E checks the widget in a real browser, not the model
// (CI has no Ollama; the API itself is covered by src/pages/api/chatbot.int.test.ts).

const ANSWER = [
  { type: 'sources', sources: [{ title: 'Médiation', url: '/apprendre/lexique#mediation' }] },
  { type: 'token', text: 'La médiation est une démarche amiable.' },
  { type: 'done', suggestions: ['La médiation est-elle payante ?'] },
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
      await expect(conversation).toContainText('est une démarche amiable.')
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
