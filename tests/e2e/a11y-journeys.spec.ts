import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

// The first scenario (the list of scenarios is /mise-en-situation).
const SCENARIO = '/mise-en-situation/voisin-du-dessus'

// Accessibility of the interactive states (#24): every journey is played and the axe scan
// (WCAG 2.1 A/AA, the basis of RGAA 4) runs at each state, not only on page load.
// Content-agnostic on purpose: it answers whatever questions the content team writes.
// See docs/RGAA_AUDIT.md for what automated checks do not cover.

async function expectNoViolations(page: Page, state: string) {
  // Wait for fade-in animations to finish: a half-transparent text would be reported as a
  // contrast failure while it is only appearing. Stable = opacities unchanged over 200 ms
  // (some elements stay half-transparent on purpose, e.g. disabled buttons).
  const opacities = () =>
    page.evaluate(() =>
      [...document.querySelectorAll('main *, [role="dialog"] *')]
        .map((el) => getComputedStyle(el).opacity)
        .join(','),
    )
  for (let previous = await opacities(), i = 0; i < 15; i++) {
    await page.waitForTimeout(200)
    const current = await opacities()
    if (current === previous) break
    previous = current
  }
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    // Next.js dev overlay, only present with E2E_DEV=1.
    .exclude('nextjs-portal')
    .analyze()
  const summary = results.violations.map(
    (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
  )
  expect(summary, state).toEqual([])
}

test('home: mobile menu, explainer definition, FAQ and IRIS chat widget', async ({
  page,
  isMobile,
}) => {
  await page.goto('/')
  if (isMobile) {
    await page.getByRole('button', { name: 'Ouvrir le menu' }).click()
    await expectNoViolations(page, 'mobile menu open')
    await page.getByRole('button', { name: 'Fermer le menu' }).click()
  }

  await page
    .getByRole('region', { name: 'L’amiable en 1 minute' })
    .getByRole('button', { name: /voir la définition/ })
    .first()
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expectNoViolations(page, 'explainer definition open')
  await page.keyboard.press('Escape')

  const question = page.locator('main [data-slot="accordion-trigger"]').first()
  if (await question.count()) {
    await question.click()
    await expectNoViolations(page, 'FAQ answer open')
  }

  await page.getByRole('button', { name: 'Poser une question à IRIS' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expectNoViolations(page, 'IRIS widget open')
})

test('simulation: error state, every step and the result', async ({ page }) => {
  await page.goto('/simulation')
  await expectNoViolations(page, 'introduction')
  await page.getByRole('button', { name: 'Commencer' }).click()
  const main = page.locator('main')
  const forward = main.getByRole('button', { name: /^(Suivant|Terminer)$/ })

  await forward.click()
  await expectNoViolations(page, 'step 1 submitted empty (errors shown)')

  for (let step = 1; step <= 10 && (await forward.count()) > 0; step++) {
    for (const name of await main
      .locator('input[type="radio"]')
      .evaluateAll((inputs) => [...new Set(inputs.map((i) => (i as HTMLInputElement).name))])) {
      await main.locator(`input[type="radio"][name="${name}"]`).first().check()
    }
    for (const input of await main.locator('input[type="number"]').all()) await input.fill('1')
    for (const input of await main.locator('input[type="text"], textarea').all()) {
      if (await input.inputValue()) continue
      const numeric = /numeric|decimal/.test((await input.getAttribute('inputmode')) ?? '')
      await input.fill(numeric ? '2' : 'Test')
    }
    const checkbox = main.locator('input[type="checkbox"]').first()
    if ((await checkbox.count()) && !(await checkbox.isChecked())) await checkbox.check()

    await forward.click()
    await expectNoViolations(page, `after step ${step}`)
  }
  await expect(forward).toHaveCount(0)
})

test('role-play: a full game until the results', async ({ page }) => {
  await page.goto(SCENARIO)
  await page.getByRole('button', { name: 'Commencer' }).click()
  await expectNoViolations(page, 'first scene')

  const main = page.locator('main')
  let choices = 0
  for (let i = 0; i < 80; i++) {
    const results = main.getByRole('button', { name: 'Voir mon bilan' })
    if (await results.count()) {
      await expectNoViolations(page, 'ending')
      await results.click()
      break
    }
    const choiceGroup = main.getByRole('group', { name: 'Que faites-vous ?' })
    if (await choiceGroup.count()) {
      await expectNoViolations(page, `choice ${++choices}`)
      await choiceGroup.getByRole('button').first().click()
      // The previous scene stays in the DOM during its exit animation: wait until it is gone.
      await expect(choiceGroup).toHaveCount(0)
      continue
    }
    await main.getByRole('button', { name: /^(Tout afficher|Suivant|Continuer)$/ }).click()
  }

  await expect(main.getByRole('button', { name: 'Rejouer' })).toBeVisible()
  await expectNoViolations(page, 'results screen')

  const definition = main.getByRole('button', { name: /voir la définition/ }).first()
  if (await definition.count()) {
    await definition.click()
    await expectNoViolations(page, 'definition popover open')
  }
})

test('learn: quiz error, feedback, definition and score', async ({ page }) => {
  // Up to 20 questions with an axe scan each: about 17 s alone, over the 30 s default
  // when the whole suite runs in parallel (#140).
  test.slow()
  await page.goto('/apprendre')
  // The first quiz (there can be several on the page).
  const quiz = page.getByRole('region', { name: 'Questionnaires' }).getByRole('region').first()
  const validate = quiz.getByRole('button', { name: 'Valider' })
  test.skip((await validate.count()) === 0, 'no quiz on /apprendre')

  await validate.click()
  await expectNoViolations(page, 'quiz submitted empty (error shown)')

  for (let i = 0; i < 20; i++) {
    if (await validate.count()) {
      const form = quiz
        .locator('form')
        .filter({ has: page.getByRole('button', { name: 'Valider' }) })
      await form.locator('[role="radio"], [role="checkbox"]').first().click()
      await validate.click()
      await expectNoViolations(page, `quiz feedback ${i + 1}`)
      const definition = page.getByRole('button', { name: /voir la définition/ }).first()
      if (i === 0 && (await definition.count())) {
        await definition.click()
        await expectNoViolations(page, 'definition popover open')
        await page.keyboard.press('Escape')
      }
    }
    const next = quiz.getByRole('button', { name: /^(Question suivante|Voir mon score)$/ })
    if (!(await next.count())) break
    await next.click()
  }
  await expect(quiz.getByRole('heading', { name: /^Votre score/ })).toBeVisible()
  await expectNoViolations(page, 'quiz score')
})

test('glossary: search with no result', async ({ page }) => {
  await page.goto('/apprendre/lexique')
  await page.getByLabel('Rechercher un terme').fill('zzzzzz')
  await expect(page.getByRole('status').filter({ hasText: 'Aucun terme' })).toBeVisible()
  await expectNoViolations(page, 'glossary empty search')
})
