import { glossary } from '@/shared/glossary'
import { assertReferences, defineCollection } from '@/lib/content'

import { scenariosData } from './data'
import { termSlugs } from './rich-text'
import { scenarioSchema, type Scenario } from './schema'

export type { Avatar, Character, Choice, ChoiceQuality, Line, Scenario, Scene } from './schema'
export { scenarioSchema } from './schema'
export * from './engine'
export * from './results'
export { parseRichText, plainText, type RichTextSegment } from './rich-text'

export const scenarios = defineCollection('scenarios', scenarioSchema, scenariosData)

/** Every [location, glossary slug] pair referenced by the texts of a scenario. */
export function glossaryReferences(scenario: Scenario) {
  const refs = (location: string, text: string) =>
    termSlugs(text).map((slug) => [`"${scenario.slug}" > ${location}`, slug] as const)
  return [
    ...refs('intro', scenario.intro),
    ...scenario.scenes.flatMap((scene) => [
      ...scene.lines.flatMap((line, i) => refs(`"${scene.id}".lines.${i}`, line.text)),
      ...scene.choices.flatMap((c) => refs(`"${scene.id}" > "${c.id}".feedback`, c.feedback)),
    ]),
  ]
}

assertReferences(
  'scenarios',
  { name: 'glossary term', has: glossary.has },
  scenarios.all.flatMap(glossaryReferences),
)
