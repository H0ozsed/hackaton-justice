import { describe, expect, it } from 'vitest'

import {
  OPENNESS_STEP_ID,
  OTHER_PARTY_OPENNESS_OPTIONS,
  USER_OPENNESS_OPTIONS,
  getOpennessAnswers,
  opennessSchema,
} from './openness'

const messagesOf = (input: unknown) => {
  const result = opennessSchema.safeParse(input)
  if (result.success) return {}
  return Object.fromEntries(
    result.error.issues.map((issue) => [issue.path.join('.'), issue.message]),
  )
}

describe('opennessSchema', () => {
  it.each(['yes', 'maybe', 'no'])('accepts "%s" as the openness of the person', (value) => {
    expect(
      opennessSchema.safeParse({ userOpenness: value, otherPartyOpenness: 'yes' }).success,
    ).toBe(true)
  })

  it.each(['yes', 'maybe', 'no', 'unknown'])(
    'accepts "%s" as the openness of the other party',
    (value) => {
      expect(
        opennessSchema.safeParse({ userOpenness: 'yes', otherPartyOpenness: value }).success,
      ).toBe(true)
    },
  )

  it('lets the person say they do not know about the other party, but not about themselves', () => {
    expect(messagesOf({ userOpenness: 'unknown', otherPartyOpenness: 'unknown' })).toEqual({
      userOpenness: expect.any(String),
    })
  })

  it('requires both answers, with a message for each', () => {
    const messages = messagesOf({})
    expect(messages.userOpenness).toMatch(/prêt\(e\) à discuter/)
    expect(messages.otherPartyOpenness).toMatch(/Je ne sais pas/)
  })

  it('names only the missing answer', () => {
    expect(Object.keys(messagesOf({ userOpenness: 'no' }))).toEqual(['otherPartyOpenness'])
    expect(Object.keys(messagesOf({ otherPartyOpenness: 'no' }))).toEqual(['userOpenness'])
  })

  it('refuses an unknown value', () => {
    expect(Object.keys(messagesOf({ userOpenness: 'sure', otherPartyOpenness: 'yes' }))).toEqual([
      'userOpenness',
    ])
  })
})

describe('options', () => {
  it('offers exactly the values the schema accepts, each with a label', () => {
    for (const { value, label } of USER_OPENNESS_OPTIONS) {
      expect(label.trim()).not.toBe('')
      expect(opennessSchema.shape.userOpenness.safeParse(value).success).toBe(true)
    }
    for (const { value, label } of OTHER_PARTY_OPENNESS_OPTIONS) {
      expect(label.trim()).not.toBe('')
      expect(opennessSchema.shape.otherPartyOpenness.safeParse(value).success).toBe(true)
    }
    expect(USER_OPENNESS_OPTIONS.map((o) => o.value)).toEqual(['yes', 'maybe', 'no'])
    expect(OTHER_PARTY_OPENNESS_OPTIONS.map((o) => o.value)).toEqual([
      'yes',
      'maybe',
      'no',
      'unknown',
    ])
  })
})

describe('getOpennessAnswers', () => {
  it('gives the typed answers of the step from the answers of the result', () => {
    const answers = { [OPENNESS_STEP_ID]: { userOpenness: 'maybe', otherPartyOpenness: 'unknown' } }
    expect(getOpennessAnswers(answers)).toEqual({
      userOpenness: 'maybe',
      otherPartyOpenness: 'unknown',
    })
  })

  it('ignores the answers of the other steps', () => {
    const answers = {
      other: { userOpenness: 'no' },
      [OPENNESS_STEP_ID]: { userOpenness: 'yes', otherPartyOpenness: 'no' },
    }
    expect(getOpennessAnswers(answers)).toEqual({ userOpenness: 'yes', otherPartyOpenness: 'no' })
  })

  it('returns undefined when the step is not answered, or its answers are not valid', () => {
    expect(getOpennessAnswers({})).toBeUndefined()
    expect(getOpennessAnswers({ [OPENNESS_STEP_ID]: { userOpenness: 'yes' } })).toBeUndefined()
  })

  it('uses the step id that the result screen will look for', () => {
    expect(OPENNESS_STEP_ID).toBe('openness')
  })
})
