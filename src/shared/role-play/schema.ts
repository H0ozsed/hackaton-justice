import { z } from 'zod'

import { isUnique, slugSchema } from '@/lib/content'
import { lossKindSchema } from '@/shared/simulation'

import { hasBrokenMarkup } from './rich-text'

// A scenario is a graph of scenes. A scene shows lines of dialogue, then either offers
// choices (each one leads to another scene) or ends the game. The graph must have no
// cycle and every scene must be reachable: every run then ends, with no dead end.

/** Text that may contain glossary markup: `[[slug]]` or `[[slug|displayed text]]`. */
const richTextSchema = z
  .string()
  .min(1)
  .refine(
    (t) => !hasBrokenMarkup(t),
    'malformed glossary markup, expected [[slug]] or [[slug|text]]',
  )

/** Look of a character portrait. Fixed list: each one has its own icon and color in the UI. */
export const avatarSchema = z.enum(['player', 'neighbor', 'official', 'professional', 'relative'])
export type Avatar = z.infer<typeof avatarSchema>

export const characterSchema = z.object({
  id: slugSchema,
  name: z.string().min(1),
  /** Short description shown under the name ("Votre voisin du dessus"). */
  role: z.string().min(1),
  avatar: avatarSchema,
})

export const lineSchema = z.object({
  /** Character id. Omitted: the narrator speaks. */
  speaker: slugSchema.optional(),
  text: richTextSchema,
})

/** How good a choice is. Drives the score (see engine.ts) and the corrections. */
export const choiceQualitySchema = z.enum(['good', 'ok', 'bad'])
export type ChoiceQuality = z.infer<typeof choiceQualitySchema>

export const choiceSchema = z.object({
  id: slugSchema,
  /** Plain text: a choice is a button, it cannot hold a glossary link (another button). */
  label: z
    .string()
    .min(1)
    .refine((t) => !t.includes('[['), 'no glossary markup in a choice label (it is a button)'),
  /** Id of the scene this choice leads to. */
  next: slugSchema,
  quality: choiceQualitySchema,
  /** Why this choice is good or not. Shown in the results as the correction. */
  feedback: richTextSchema,
  /** What this choice costs: money in €, time in hours, health and relationship in points. */
  losses: z.partialRecord(lossKindSchema, z.number().nonnegative()).default({}),
})

export const sceneSchema = z
  .object({
    id: slugSchema,
    /** Where the scene takes place ("Dans l’escalier, un mardi soir"). */
    setting: z.string().min(1).optional(),
    lines: z.array(lineSchema).min(1),
    choices: z
      .array(choiceSchema)
      .default([])
      .refine((c) => isUnique(c.map((x) => x.id)), 'choice ids must be unique'),
    /** Present on final scenes only. */
    ending: z.object({ title: z.string().min(1) }).optional(),
  })
  .refine((s) => (s.ending ? s.choices.length === 0 : s.choices.length > 0), {
    message: 'a scene has either choices or an ending, not both or neither',
    path: ['choices'],
  })

export const scenarioSchema = z
  .object({
    slug: slugSchema,
    title: z.string().min(1),
    /** Shown before the game starts. */
    intro: richTextSchema,
    characters: z.array(characterSchema).min(1),
    startSceneId: slugSchema,
    scenes: z.array(sceneSchema).min(1),
  })
  .superRefine((scenario, ctx) => {
    const fail = (message: string, path: (string | number)[]) =>
      ctx.addIssue({ code: 'custom', message, path })

    if (!isUnique(scenario.characters.map((c) => c.id)))
      fail('character ids must be unique', ['characters'])
    const characterIds = new Set(scenario.characters.map((c) => c.id))

    const scenes = new Map(scenario.scenes.map((s) => [s.id, s]))
    if (scenes.size !== scenario.scenes.length) fail('scene ids must be unique', ['scenes'])
    if (!scenes.has(scenario.startSceneId))
      fail(`unknown scene "${scenario.startSceneId}"`, ['startSceneId'])

    let brokenLinks = false
    scenario.scenes.forEach((scene, i) => {
      scene.lines.forEach((line, j) => {
        if (line.speaker && !characterIds.has(line.speaker))
          fail(`unknown character "${line.speaker}"`, ['scenes', i, 'lines', j, 'speaker'])
      })
      scene.choices.forEach((choice, j) => {
        if (!scenes.has(choice.next)) {
          brokenLinks = true
          fail(`unknown scene "${choice.next}"`, ['scenes', i, 'choices', j, 'next'])
        }
      })
    })
    if (brokenLinks || !scenes.has(scenario.startSceneId)) return

    // Depth-first walk from the start: finds unreachable scenes and cycles.
    const done = new Set<string>()
    const onPath = new Set<string>()
    const visit = (id: string): boolean => {
      if (onPath.has(id)) {
        fail(`cycle: scene "${id}" can be reached again from itself`, ['scenes'])
        return false
      }
      if (done.has(id)) return true
      onPath.add(id)
      const ok = scenes.get(id)!.choices.every((c) => visit(c.next))
      onPath.delete(id)
      done.add(id)
      return ok
    }
    if (!visit(scenario.startSceneId)) return

    for (const id of scenes.keys()) {
      if (!done.has(id)) fail(`scene "${id}" cannot be reached from the start`, ['scenes'])
    }
  })

export type Scenario = z.output<typeof scenarioSchema>
export type ScenarioInput = z.input<typeof scenarioSchema>
export type Scene = z.output<typeof sceneSchema>
export type Choice = z.output<typeof choiceSchema>
export type Character = z.output<typeof characterSchema>
export type Line = z.output<typeof lineSchema>
