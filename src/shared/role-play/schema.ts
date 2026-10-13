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
export const avatarSchema = z.enum([
  'player',
  'neighbor',
  'official',
  'professional',
  'relative',
  'clerk',
  'mediator',
])
export type Avatar = z.infer<typeof avatarSchema>

// ---- Staging (all optional): drives the pixel-art stage, never needed to understand ----
// the story (every piece of information is also in the text).

/** Illustrated place where a scene happens. Fixed list: each one is drawn in the UI. */
export const locationSchema = z.enum([
  'bedroom',
  'landing',
  'stairwell',
  'lobby',
  'point-justice',
  'courthouse',
  'new-home',
  'music-room',
  'shop',
  'office',
])
export type Location = z.infer<typeof locationSchema>

/** Time of day: sets the lighting of the place. */
export const periodSchema = z.enum(['morning', 'day', 'evening', 'night'])
export type Period = z.infer<typeof periodSchema>

/** Face of the speaking character. */
export const emotionSchema = z.enum(['neutral', 'happy', 'angry', 'sad', 'tired', 'surprised'])
export type Emotion = z.infer<typeof emotionSchema>

/** Visual effect played with a line (the line text must say what happens). */
export const effectSchema = z.enum(['drums', 'knock', 'door', 'phone', 'paper', 'sleep'])
export type Effect = z.infer<typeof effectSchema>

/** Shot of the animated opening shown before the game. */
export const openingShotSchema = z.enum(['street', 'cutaway', 'bedroom'])
export type OpeningShot = z.infer<typeof openingShotSchema>

/** Short animation of what the player does after a choice. */
export const actionSchema = z.enum([
  'talk',
  'broom',
  'phone',
  'letter',
  'wait',
  'agree',
  'threaten',
  'court',
  'appointment',
  'move',
])
export type Action = z.infer<typeof actionSchema>

/** Whose shoes the player is in. */
export const perspectiveSchema = z.enum(['complainant', 'respondent', 'mediator'])
export type Perspective = z.infer<typeof perspectiveSchema>

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
  /** Face of the speaker while this line shows (neutral when omitted). */
  emotion: emotionSchema.optional(),
  /** Visual effect played with this line. */
  effect: effectSchema.optional(),
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
  /** Animation played after this choice, before the next scene (none when omitted). */
  action: actionSchema.optional(),
})

export const sceneSchema = z
  .object({
    id: slugSchema,
    /** Where the scene takes place ("Dans l’escalier, un mardi soir"). */
    setting: z.string().min(1).optional(),
    /** Illustrated place (a neutral room when omitted). */
    location: locationSchema.optional(),
    /** Lighting (day when omitted). */
    period: periodSchema.optional(),
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
    /** One or two sentences for the list of scenarios, no spoiler (the intro when omitted). */
    summary: z.string().min(1).optional(),
    /** Difficulty, from 1 (discover) to 3 (expert). */
    level: z.number().int().min(1).max(3).default(1),
    /** Whose shoes the player is in. */
    perspective: perspectiveSchema.default('complainant'),
    /**
     * Character played by the user (drawn on the left, never introduced). Omitted: the first
     * character whose avatar is `player`.
     */
    playerId: slugSchema.optional(),
    /** Shown before the game starts. */
    intro: richTextSchema,
    /**
     * Animated opening: shots shown one after the other, each with a caption. Replaces the
     * plain intro text on screen (the intro stays the summary of the scenario).
     */
    opening: z
      .array(z.object({ shot: openingShotSchema, text: richTextSchema }))
      .min(1)
      .optional(),
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
    if (scenario.playerId && !characterIds.has(scenario.playerId))
      fail(`unknown character "${scenario.playerId}"`, ['playerId'])

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
