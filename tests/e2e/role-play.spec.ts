import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

// The first scenario (the list of scenarios is /mise-en-situation).
const SCENARIO = '/mise-en-situation/voisin-du-dessus'

// Full runs of /mise-en-situation. Written without knowing the scenario: a run takes
// always the first or always the last choice, so it keeps working when the content changes.

/**
 * Waits for the transitions to end before an axe scan: axe would otherwise read the
 * intermediate colours of a fading text as a contrast failure (#140).
 * - the "Scène N" title card (decorative, shown 1.8 s then faded out by framer-motion,
 *   whose JS-driven frames are not in document.getAnimations());
 * - the finite CSS / Web animations (infinite loops such as idle sprites are ignored).
 */
async function settleAnimations(page: Page) {
  await expect(page.getByTestId('title-card')).toHaveCount(0, { timeout: 5_000 })
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every(
        (a) => a.playState !== 'running' || a.effect?.getComputedTiming().iterations === Infinity,
      ),
  )
}

const expectNoAxeViolation = async (page: Page) => {
  await settleAnimations(page)
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(results.violations).toEqual([])
}

const choices = (page: Page) =>
  page.getByRole('group', { name: 'Que faites-vous ?' }).getByRole('button')

/** Reads the scene up to its choices or ending; returns true on the ending. */
async function readScene(page: Page) {
  const advance = page.getByRole('button', { name: /^(Tout afficher|Suivant|Continuer)$/ })
  const results = page.getByRole('button', { name: 'Voir mon bilan' })
  const outcome = page.getByRole('group', { name: 'Que faites-vous ?' }).or(results)
  while (!(await outcome.isVisible())) await advance.click()
  return results.isVisible()
}

/** Plays a whole run, picking the choice given by `pick`; returns the labels chosen. */
async function playRun(page: Page, pick: 'first' | 'last', { axe = false } = {}) {
  const chosen: string[] = []
  await page.getByRole('button', { name: 'Commencer' }).click()
  await expect(page.getByRole('heading', { name: /^Scène 1/ })).toBeFocused()

  while (!(await readScene(page))) {
    if (axe && chosen.length === 0) await expectNoAxeViolation(page) // choices shown
    const choice = choices(page)[pick]()
    chosen.push((await choice.textContent()) ?? '')
    await choice.click()
    await expect(
      page.getByRole('heading', { name: new RegExp(`^Scène ${chosen.length + 1}`) }),
    ).toBeFocused()
  }
  await expect(page.getByRole('heading', { name: /^Fin : / })).toBeFocused()
  return chosen
}

test('a full run up to the results, then play again', async ({ page }) => {
  await page.goto(SCENARIO)
  await expectNoAxeViolation(page)
  await playRun(page, 'first', { axe: true })
  await expectNoAxeViolation(page)

  await page.getByRole('button', { name: 'Voir mon bilan' }).click()
  const results = page.getByRole('region', { name: 'Votre bilan' })
  await expect(page.getByRole('heading', { name: 'Votre bilan' })).toBeFocused()
  await expect(results).toContainText(/\d+ %/)
  await expect(
    results.getByRole('region', { name: 'Ce que vos choix vous ont coûté' }),
  ).toBeVisible()
  await expect(results.getByRole('region', { name: 'Corrections' })).toBeVisible()
  await expectNoAxeViolation(page)

  await page.getByRole('button', { name: 'Rejouer' }).click()
  await expect(page.getByRole('heading', { name: /^Scène 1/ })).toBeFocused()
})

test('the results list the choices that were not the best', async ({ page }) => {
  await page.goto(SCENARIO)
  const chosen = await playRun(page, 'last')
  await page.getByRole('button', { name: 'Voir mon bilan' }).click()

  const corrections = page.getByRole('region', { name: 'Corrections' }).getByRole('listitem')
  const score = await page.getByRole('region', { name: 'Votre bilan' }).textContent()
  if (score?.includes('100 %')) {
    await expect(corrections).toHaveCount(0)
  } else {
    // Every correction is about a choice the user actually made.
    for (const item of await corrections.all()) {
      const text = (await item.textContent()) ?? ''
      expect(chosen.some((label) => text.includes(`Votre choix : ${label}`))).toBe(true)
    }
  }
})

test('with reduced motion, the text is shown at once', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(SCENARIO)
  await page.getByRole('button', { name: 'Commencer' }).click()
  await expect(page.getByRole('button', { name: /^(Suivant|Continuer)$/ })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Tout afficher' })).toHaveCount(0)
})

test('the scene is played on a decorative stage, with life gauges in text', async ({ page }) => {
  await page.goto(SCENARIO)
  await expect(page.getByTestId('opening').locator('svg').first()).toHaveAttribute(
    'aria-hidden',
    'true',
  )
  await page.getByRole('button', { name: 'Commencer' }).click()

  const stage = page.getByTestId('stage')
  await expect(stage).toBeVisible()
  await expect(stage.locator('svg').first()).toHaveAttribute('aria-hidden', 'true')
  const gauges = page.getByRole('list', { name: 'Vos jauges' })
  await expect(gauges.getByRole('listitem')).toHaveCount(4)
  await expect(gauges).toContainText('10 sur 10')

  // Next scene after a choice: still on stage, the page stays accessible.
  await readScene(page)
  await choices(page).last().click()
  await expect(page.getByRole('heading', { name: /^Scène 2/ })).toBeFocused()
  await expect(stage).toBeVisible()
  await expectNoAxeViolation(page)
})

test('the sound switch is off by default and keeps its name', async ({ page }) => {
  await page.goto(SCENARIO)
  const sound = page.getByRole('button', { name: 'Son' })
  await expect(sound).toHaveAttribute('aria-pressed', 'false')
  await sound.click()
  await expect(sound).toHaveAttribute('aria-pressed', 'true')
  await page.reload()
  await expect(page.getByRole('button', { name: 'Son' })).toHaveAttribute('aria-pressed', 'true')
})

test('the list of scenarios leads to each one, and remembers the best score', async ({ page }) => {
  await page.goto('/mise-en-situation')
  await expectNoAxeViolation(page)
  const play = page.getByRole('link', { name: /^(Jouer|Rejouer) : / })
  const count = await play.count()
  expect(count).toBeGreaterThan(1)

  await page.getByRole('link', { name: 'Jouer : Le voisin du dessus' }).click()
  await expect(page).toHaveURL(SCENARIO)
  await playRun(page, 'first')
  await page.getByRole('button', { name: 'Voir mon bilan' }).click()
  await page.getByRole('link', { name: 'Toutes les mises en situation' }).click()
  await expect(page.getByText(/Terminé, meilleur score : \d+ %/)).toBeVisible()
  await expect(page.getByRole('link', { name: 'Rejouer : Le voisin du dessus' })).toBeVisible()
})

test('every scenario of the list can be played to its results', async ({ page }) => {
  test.setTimeout(180_000)
  await page.goto('/mise-en-situation')
  const hrefs = await page
    .getByRole('link', { name: /^(Jouer|Rejouer) : / })
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')!))
  for (const [i, href] of hrefs.entries()) {
    await page.goto(href)
    await playRun(page, i % 2 === 0 ? 'last' : 'first', { axe: true })
    await page.getByRole('button', { name: 'Voir mon bilan' }).click()
    await expect(page.getByRole('heading', { name: 'Votre bilan' })).toBeFocused()
  }
})
