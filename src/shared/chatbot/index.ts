import { getFaqForPage, type FaqPage } from '@/shared/faq'
import { homeIrisQuestions } from '@/shared/home'

export * from './schema'
export { IRIS, IRIS_ERRORS, IRIS_SMALL_TALK } from './messages'

/**
 * Questions suggested when the conversation is empty. Home: the questions in line with
 * its explainer (#127) first; then the first FAQ questions of the page.
 */
export function starterQuestions(page: FaqPage = 'home', count = 3) {
  const own = page === 'home' ? homeIrisQuestions : []
  const faqQuestions = getFaqForPage(page).map((entry) => entry.question)
  return [...new Set([...own, ...faqQuestions])].slice(0, count)
}
