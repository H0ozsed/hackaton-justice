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

test('without an answer, IRIS points to professionals and to their contacts (#135)', async ({
  page,
}) => {
  await mockIris(page, [
    { type: 'status', step: 'search' },
    {
      type: 'no-answer',
      text: 'Je n’ai pas la réponse sur ce site. Un professionnel pourra vous aider :\n- un **point-justice** ;\n- un **conciliateur de justice**.',
      suggestions: [],
    },
  ])
  await page.goto('/')
  await page.getByRole('button', { name: 'Poser une question à IRIS' }).click()
  const iris = page.getByRole('dialog', { name: 'IRIS' })
  await iris.getByLabel('Votre question').fill('Quelle est la capitale du Pérou ?')
  await iris.getByRole('button', { name: 'Envoyer' }).click()

  await expect(iris.getByText('un point-justice ;', { exact: true })).toBeVisible()
  await iris.getByRole('link', { name: 'Trouver de l’aide près de chez vous' }).click()
  await expect(page).toHaveURL('/apprendre#infos-pratiques')
})
