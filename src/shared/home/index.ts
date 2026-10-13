import { assertReferences, defineCollection } from '@/lib/content'
import { JOURNEYS, type Journey } from '@/lib/site'
import { glossary } from '@/shared/glossary'
import { hasBrokenMarkup, parseRichText, plainText } from '@/shared/role-play'

import { aboutData, explainerData, irisQuestionsData, orientationData } from './data'
import {
  aboutSchema,
  explainerCardSchema,
  orientationOptionSchema,
  type ExplainerCard,
  type JourneyPath,
} from './schema'

export type { About, ExplainerCard, JourneyPath, OrientationOption } from './schema'

export const explainer = defineCollection('home explainer', explainerCardSchema, explainerData)
export const orientation = defineCollection(
  'home orientation',
  orientationOptionSchema,
  orientationData,
)

const aboutResult = aboutSchema.safeParse(aboutData)
if (!aboutResult.success) {
  const lines = aboutResult.error.issues.map(
    ({ path, message }) => `  - ${path.join('.')}: ${message}`,
  )
  throw new Error(`Invalid content in "home about":\n${lines.join('\n')}`)
}
export const about = aboutResult.data

/** Questions IRIS suggests when its conversation is empty on the home page. */
export const homeIrisQuestions: readonly string[] = irisQuestionsData.filter((q) => q.trim())

for (const card of explainer.all) {
  if (hasBrokenMarkup(card.body)) {
    throw new Error(`Invalid content in "home explainer": "${card.slug}" > body has broken [[ ]]`)
  }
}

assertReferences(
  'home explainer',
  { name: 'glossary term', has: glossary.has },
  explainer.all.flatMap((card) =>
    parseRichText(card.body).flatMap((segment) =>
      segment.kind === 'term' ? [[`"${card.slug}" > body`, segment.slug] as const] : [],
    ),
  ),
)

/** The journey (title, button text, icon) a path of the orientation leads to. */
export function journeyFor(path: JourneyPath): Journey {
  const journey = JOURNEYS.find((j) => j.href === path)
  if (!journey) throw new Error(`No journey for "${path}" in JOURNEYS (src/lib/site.ts)`)
  return journey
}

// Fails at load time if JOURNEYS and the orientation drift apart.
for (const option of orientation.all) journeyFor(option.journey)

/** An explainer card without markup, glossary terms written as in the glossary (IRIS, meta). */
export function explainerText(card: ExplainerCard) {
  return plainText(card.body, (slug) => glossary.get(slug).term)
}
