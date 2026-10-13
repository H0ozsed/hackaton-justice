import { describe, expect, it } from 'vitest'

import { routes } from '@/shared/amicable'
import { channels as content, conflictTypes, type Channel } from '@/shared/simulation'

import { CONFLICT_TYPE_STEP_ID } from './conflict-type'
import {
  channelsFor,
  comparedRoutes,
  groupByFamily,
  mandatoryAttemptNotice,
  solutionsFor,
} from './solutions'

const channel = (slug: string, attributes: Partial<Channel>): Channel => ({
  slug,
  name: `Canal ${slug}`,
  family: 'dialogue',
  description: `Description ${slug}.`,
  forYouIf: `Pour vous ${slug}.`,
  disputes: [],
  excluded: [],
  amicable: true,
  free: true,
  inSimulation: true,
  sources: [],
  ...attributes,
})

const talk = channel('talk', {})
const conciliator = channel('conciliator', { family: 'conciliation', conflictTypes: ['a'] })
const mediator = channel('mediator', { family: 'mediation', free: false, conflictTypes: ['b'] })
const court = channel('court', { family: 'judge', amicable: false, free: false })
const judgeOnly = channel('judge-only', { family: 'conciliation', inSimulation: false })
const channels = [court, mediator, talk, conciliator, judgeOnly]

const typeAnswer = (type: string) => ({ [CONFLICT_TYPE_STEP_ID]: { type } })

describe('channelsFor', () => {
  it('keeps the channels meant for the type, and the channels for every type', () => {
    expect(channelsFor('a', channels).map((c) => c.slug)).toEqual([
      'court',
      'talk',
      'conciliator',
      'judge-only',
    ])
  })

  it('keeps every channel when the type is unknown', () => {
    expect(channelsFor(undefined, channels)).toHaveLength(channels.length)
  })
})

describe('groupByFamily', () => {
  it('orders the families from talking to the judge, and leaves out the empty ones', () => {
    const groups = groupByFamily([court, mediator, talk])
    expect(groups.map((g) => g.family)).toEqual(['dialogue', 'mediation', 'judge'])
    expect(groups.map((g) => g.label)).toEqual(['Se parler', 'Médiation', 'Le juge'])
  })
})

describe('solutionsFor', () => {
  it('offers the solutions of the chosen type, without the ones a judge starts', () => {
    const slugs = solutionsFor(typeAnswer('a'), channels).flatMap((g) =>
      g.channels.map((c) => c.slug),
    )
    expect(slugs).toEqual(['talk', 'conciliator', 'court'])
  })

  it('never offers a solution meant for another conflict type', () => {
    const slugs = solutionsFor(typeAnswer('b'), channels).flatMap((g) =>
      g.channels.map((c) => c.slug),
    )
    expect(slugs).not.toContain('conciliator')
    expect(slugs).toContain('mediator')
  })

  it('makes no choice for the person: no channel is marked as recommended', () => {
    for (const group of solutionsFor(typeAnswer('a'), channels)) {
      expect(group).not.toHaveProperty('recommended')
    }
  })
})

describe('mandatoryAttemptNotice', () => {
  const type = (mandatoryAmicableAttempt?: 'always' | 'up-to-5000') => ({
    slug: 't',
    label: 'Type',
    description: 'Description.',
    examples: [],
    lossKinds: ['money' as const],
    followUpQuestions: [],
    mandatoryAmicableAttempt,
  })
  const amount = (montant: number) => ({ 'follow-up': { montant } })

  it('says the attempt is mandatory, that talking is not enough, and why', () => {
    const notice = mandatoryAttemptNotice(type('always'), {})
    expect(notice).toMatch(/^Pour ce type de litige, la loi impose une tentative amiable/)
    expect(notice).toContain('Une simple discussion ne suffit pas')
    expect(notice).toContain('article 750-1 du code de procédure civile')
    expect(notice).toContain('irrecevable')
  })

  it('depends on the amount for an "up-to-5000" type', () => {
    expect(mandatoryAttemptNotice(type('up-to-5000'), amount(5000))).toMatch(
      /^Pour une somme de 5 000 € ou moins/,
    )
    expect(mandatoryAttemptNotice(type('up-to-5000'), amount(5001))).toBeUndefined()
    expect(mandatoryAttemptNotice(type('up-to-5000'), {})).toMatch(/^Si vous réclamez 5 000 €/)
  })

  it('says nothing when the law requires no attempt', () => {
    expect(mandatoryAttemptNotice(type(), {})).toBeUndefined()
    expect(mandatoryAttemptNotice(undefined, {})).toBeUndefined()
  })
})

describe('the real content', () => {
  const slugsFor = (type: string) =>
    solutionsFor(typeAnswer(type), content.all).flatMap((g) => g.channels.map((c) => c.slug))

  it('offers at least one amicable solution and the judge for every conflict type', () => {
    for (const type of conflictTypes.all) {
      const offered = solutionsFor(typeAnswer(type.slug), content.all).flatMap((g) => g.channels)
      expect(
        offered.some((c) => c.amicable),
        type.slug,
      ).toBe(true)
      expect(
        offered.some((c) => c.family === 'judge'),
        type.slug,
      ).toBe(true)
    }
  })

  it('offers the specialised third party of each kind of dispute', () => {
    expect(slugsFor('consommation')).toContain('mediateur-consommation')
    expect(slugsFor('famille')).toContain('mediation-familiale')
    expect(slugsFor('logement')).toContain('commission-departementale-de-conciliation')
    expect(slugsFor('travail')).toContain('conciliation-prud-hommes')
    expect(slugsFor('administration')).toContain('defenseur-des-droits')
    expect(slugsFor('scolaire')).toContain('mediateur-education')
  })

  it('gives every solution a « C’est pour vous si… » and, except talking, its legal texts', () => {
    for (const channel of content.all) {
      expect(channel.forYouIf, channel.slug).not.toBe('')
      if (channel.slug !== 'discussion-directe') expect(channel.law, channel.slug).toBeDefined()
    }
  })
})

describe('comparedRoutes (#109)', () => {
  it('compares the main amicable way of the conflict with the judge', () => {
    expect(comparedRoutes('voisinage')).toEqual(['conciliation', 'juge'])
    expect(comparedRoutes('consommation')).toEqual(['mediation-consommation', 'juge'])
    expect(comparedRoutes('famille')).toEqual(['mediation', 'juge'])
  })

  it('compares talking directly with the judge otherwise', () => {
    expect(comparedRoutes('travail')).toEqual(['discussion', 'juge'])
    expect(comparedRoutes(undefined)).toEqual(['discussion', 'juge'])
  })

  it('only names routes of the comparison content, for every conflict type', () => {
    for (const type of [...conflictTypes.all.map((t) => t.slug), undefined]) {
      for (const slug of comparedRoutes(type)) expect(routes.has(slug)).toBe(true)
    }
  })
})
