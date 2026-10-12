import { describe, expect, it } from 'vitest'

import { scenarioSchema, type ScenarioInput } from './schema'

const base = (scenes: ScenarioInput['scenes'], startSceneId = 'start'): ScenarioInput => ({
  slug: 'test',
  title: 'Test',
  intro: 'Intro',
  characters: [{ id: 'me', name: 'Moi', role: 'Joueur', avatar: 'player' }],
  startSceneId,
  scenes,
})

const choice = (id: string, next: string) => ({
  id,
  label: id,
  next,
  quality: 'good' as const,
  feedback: '...',
})
const end = (id: string) => ({ id, lines: [{ text: 'Fin' }], ending: { title: 'Fin' } })

const errors = (input: ScenarioInput) => {
  const result = scenarioSchema.safeParse(input)
  return result.success ? [] : result.error.issues.map((i) => i.message)
}

describe('scenarioSchema', () => {
  it('accepts a valid scenario', () => {
    expect(
      errors(
        base([{ id: 'start', lines: [{ text: 'x' }], choices: [choice('a', 'end')] }, end('end')]),
      ),
    ).toEqual([])
  })

  it('rejects an unknown start scene', () => {
    expect(errors(base([end('end')], 'nope'))).toContain('unknown scene "nope"')
  })

  it('rejects a choice leading to an unknown scene', () => {
    expect(
      errors(base([{ id: 'start', lines: [{ text: 'x' }], choices: [choice('a', 'nope')] }])),
    ).toContain('unknown scene "nope"')
  })

  it('rejects a scene that cannot be reached', () => {
    expect(
      errors(
        base([
          { id: 'start', lines: [{ text: 'x' }], choices: [choice('a', 'end')] },
          end('end'),
          end('orphan'),
        ]),
      ),
    ).toContain('scene "orphan" cannot be reached from the start')
  })

  it('rejects a cycle, which would make a game that never ends', () => {
    expect(
      errors(
        base([
          { id: 'start', lines: [{ text: 'x' }], choices: [choice('a', 'loop')] },
          {
            id: 'loop',
            lines: [{ text: 'x' }],
            choices: [choice('b', 'start'), choice('c', 'end')],
          },
          end('end'),
        ]),
      ).some((m) => m.startsWith('cycle')),
    ).toBe(true)
  })

  it('rejects a scene with neither choices nor ending (a dead end)', () => {
    expect(errors(base([{ id: 'start', lines: [{ text: 'x' }] }]))).toContain(
      'a scene has either choices or an ending, not both or neither',
    )
  })

  it('rejects a line spoken by an unknown character', () => {
    expect(errors(base([{ ...end('start'), lines: [{ speaker: 'ghost', text: 'x' }] }]))).toContain(
      'unknown character "ghost"',
    )
  })

  it('rejects duplicate scene ids', () => {
    expect(errors(base([end('start'), end('start')]))).toContain('scene ids must be unique')
  })

  it('rejects glossary markup in a choice label, which is a button', () => {
    expect(
      errors(
        base([
          {
            id: 'start',
            lines: [{ text: 'x' }],
            choices: [{ ...choice('a', 'end'), label: 'Une [[mise-en-demeure]]' }],
          },
          end('end'),
        ]),
      ),
    ).toContain('no glossary markup in a choice label (it is a button)')
  })

  it('rejects malformed glossary markup', () => {
    expect(
      errors(base([{ ...end('start'), lines: [{ text: 'Une [[mise-en-demeure' }] }])),
    ).toContain('malformed glossary markup, expected [[slug]] or [[slug|text]]')
  })
})
