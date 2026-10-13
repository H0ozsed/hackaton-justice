import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

// /apprendre: the learning hub assembles the quizzes, the FAQ and the practical info.
// Written without knowing the content (placeholders today), so it survives content changes.

const expectNoAxeViolation = async (page: Page) => {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(results.violations).toEqual([])
}

test('the hub is a path in three steps: h1 > h2 step > h3 section (#106)', async ({ page }) => {
  await page.goto('/apprendre')
  await expect(page.getByRole('heading', { level: 1, name: 'Apprendre' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2 })).toHaveText([
    '1. Comprendre les bases',
    '2. Tester ses connaissances',
    '3. Aller plus loin',
  ])
  await expect(page.getByRole('heading', { level: 3 })).toContainText([
    'Conciliateur ou médiateur ?',
    'Qui peut vous aider ?',
    'Questionnaires',
    'Mini-jeux',
    'Lexique',
    'Questions fréquentes',
    'Infos pratiques',
    'Sensibiliser en groupe',
  ])
})

test('the suggested path says where to start and leads to each step and section', async ({
  page,
}) => {
  await page.goto('/apprendre')
  const path = page.getByRole('navigation', { name: 'Par où commencer ?' })
  await expect(path.getByRole('listitem').first()).toContainText('1. Comprendre les bases')

  for (const name of ['2. Tester ses connaissances', '3. Aller plus loin']) {
    await path.getByRole('link', { name }).click()
    await expect(page.getByRole('heading', { level: 2, name })).toBeInViewport()
  }
  for (const name of [
    'Conciliateur ou médiateur ?',
    'Qui peut vous aider ?',
    'Questionnaires',
    'Lexique',
    'Questions fréquentes',
    'Infos pratiques',
    'Sensibiliser en groupe',
  ]) {
    await path.getByRole('link', { name, exact: true }).click()
    await expect(page.getByRole('heading', { level: 3, name })).toBeInViewport()
  }
  await expectNoAxeViolation(page)
})

test('a quiz can be answered up to its score, then restarted', async ({ page }) => {
  await page.goto('/apprendre')
  const quizzes = page.getByRole('region', { name: 'Questionnaires' })
  const quiz = quizzes.getByRole('region').first()

  // Answer every question with its first choice until the score shows.
  const score = quiz.getByRole('heading', { name: /^Votre score : / })
  for (let i = 0; i < 20 && !(await score.isVisible()); i++) {
    const question = quiz.getByRole('group').first()
    await question.getByRole('radio').or(question.getByRole('checkbox')).first().check()
    await quiz.getByRole('button', { name: 'Valider' }).click()
    await quiz.getByRole('button', { name: /^(Question suivante|Voir mon score)$/ }).click()
  }
  await expect(score).toBeVisible()
  await expectNoAxeViolation(page)

  await quiz.getByRole('button', { name: 'Recommencer' }).click()
  await expect(quiz.getByRole('group').first()).toBeVisible()
})

test('compares the conciliator and the mediator side by side', async ({ page }) => {
  await page.goto('/apprendre')
  const section = page.getByRole('region', { name: 'Conciliateur ou médiateur ?' })
  const comparison = section
    .getByRole('table', { name: 'Conciliation et médiation comparées' })
    .or(section.getByRole('list'))
  await expect(comparison.first()).toBeVisible()
  await expect(section.getByText('Gratuit', { exact: true }).first()).toBeAttached()
  await expectNoAxeViolation(page)
})

test('presents every conciliator and mediator, what the law says first', async ({ page }) => {
  await page.goto('/apprendre')
  const section = page.getByRole('region', { name: 'Qui peut vous aider ?' })
  await expect(section.getByRole('heading', { level: 3, name: 'Médiation' })).toBeVisible()

  await section.getByRole('button', { name: 'Médiateur familial' }).click()
  const familyMediator = section.getByRole('region', { name: 'Médiateur familial' })
  await expect(familyMediator.getByRole('term').first()).toHaveText('Ce que dit la loi')
  await expect(familyMediator).toContainText('diplôme d’État de médiateur familial')
  await expectNoAxeViolation(page)
})

test('no automatic accessibility violation with the FAQ open', async ({ page }) => {
  await page.goto('/apprendre')
  const faq = page.getByRole('region', { name: 'Questions fréquentes' })
  await faq.getByRole('button').first().click()
  await expectNoAxeViolation(page)
})
