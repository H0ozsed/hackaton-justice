import { getFaqForPage, type FaqPage } from '@/shared/faq'

export * from './schema'
export { IRIS, IRIS_ERRORS } from './messages'

/** Questions suggested when the conversation is empty: the first FAQ questions of the page. */
export function starterQuestions(page: FaqPage = 'home', count = 3) {
  return getFaqForPage(page)
    .slice(0, count)
    .map((entry) => entry.question)
}
