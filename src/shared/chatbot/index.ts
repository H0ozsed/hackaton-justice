import { getFaqForPage } from '@/shared/faq'

export * from './schema'
export { IRIS, IRIS_ERRORS } from './messages'

/** Questions suggested when the conversation is empty: the first home FAQ questions. */
export function starterQuestions(count = 3) {
  return getFaqForPage('home')
    .slice(0, count)
    .map((entry) => entry.question)
}
