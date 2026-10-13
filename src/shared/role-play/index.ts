import { glossary } from '@/shared/glossary'
import { assertReferences, defineCollection } from '@/lib/content'

import { scenariosData } from './data'
import { termSlugs } from './rich-text'
import { scenarioSchema, type Perspective, type Scenario } from './schema'

export type {
  Action,
  Avatar,
  Character,
  Choice,
  ChoiceQuality,
  Effect,
  Emotion,
  Line,
  Location,
  OpeningShot,
  Period,
  Perspective,
  Scenario,
  Scene,
} from './schema'
export {
  actionSchema,
  avatarSchema,
  effectSchema,
  emotionSchema,
  locationSchema,
  openingShotSchema,
  periodSchema,
  perspectiveSchema,
  scenarioSchema,
} from './schema'
export * from './engine'
export * from './gauges'
export * from './results'
export { hasBrokenMarkup, parseRichText, plainText, type RichTextSegment } from './rich-text'

export const scenarios = defineCollection('scenarios', scenarioSchema, scenariosData)

/** Character played by the user: `playerId`, or the first character with the player avatar. */
export function playerOf(scenario: Scenario) {
  return scenario.playerId
    ? scenario.characters.find((c) => c.id === scenario.playerId)
    : scenario.characters.find((c) => c.avatar === 'player')
}

/** Labels of the perspectives (French, shown to users). */
export const PERSPECTIVE_LABELS: Record<Perspective, string> = {
  complainant: 'Vous subissez le trouble',
  respondent: 'On vous reproche le trouble',
  mediator: 'Vous êtes le médiateur',
}

/** Labels of the levels (French, shown to users). */
export const LEVEL_LABELS: Record<number, string> = {
  1: 'Niveau 1 : découvrir',
  2: 'Niveau 2 : approfondir',
  3: 'Niveau 3 : maîtriser',
}

/** Every [location, glossary slug] pair referenced by the texts of a scenario. */
export function glossaryReferences(scenario: Scenario) {
  const refs = (location: string, text: string) =>
    termSlugs(text).map((slug) => [`"${scenario.slug}" > ${location}`, slug] as const)
  return [
    ...refs('intro', scenario.intro),
    ...(scenario.opening ?? []).flatMap((shot, i) => refs(`opening.${i}`, shot.text)),
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
