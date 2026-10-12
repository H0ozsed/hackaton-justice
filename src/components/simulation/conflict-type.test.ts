import { describe, expect, it } from 'vitest'

import type { ConflictType } from '@/shared/simulation'

import { CONFLICT_TYPE_FIELD, CONFLICT_TYPE_STEP_ID, getChosenConflictType } from './conflict-type'

const type = (slug: string): ConflictType => ({
  slug,
  label: slug,
  description: 'Fixture',
  examples: [],
  lossKinds: ['money'],
  followUpQuestions: [],
})

const types = [type('voisinage'), type('commerce')]
const answer = (slug: unknown) => ({ [CONFLICT_TYPE_STEP_ID]: { [CONFLICT_TYPE_FIELD]: slug } })

describe('getChosenConflictType', () => {
  it('returns the conflict type whose slug was chosen', () => {
    expect(getChosenConflictType(answer('commerce'), types)).toBe(types[1])
  })

  it('returns undefined when nothing was chosen yet', () => {
    expect(getChosenConflictType({}, types)).toBeUndefined()
  })

  it('returns undefined for a slug that is not in the content', () => {
    expect(getChosenConflictType(answer('unknown'), types)).toBeUndefined()
  })

  it('returns undefined when the stored value is not a slug', () => {
    expect(getChosenConflictType(answer(42), types)).toBeUndefined()
  })

  it('uses the step id and field that #13 must provide', () => {
    expect(CONFLICT_TYPE_STEP_ID).toBe('conflict-type')
    expect(CONFLICT_TYPE_FIELD).toBe('type')
  })
})
