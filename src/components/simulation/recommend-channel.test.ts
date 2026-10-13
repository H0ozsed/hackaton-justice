import { describe, expect, it } from 'vitest'

import { channels as channelsContent, type Channel } from '@/shared/simulation'

import { OPENNESS_STEP_ID } from './openness'
import {
  channelsFor,
  mandatoryAttemptNotice,
  pickChannel,
  recommendChannel,
  routeFor,
  type Route,
} from './recommend-channel'

// Neutral fixture channels: the rules are written on the attributes of the channels, not on their
// slugs, so any content with the right attributes works.
const channel = (slug: string, attributes: Partial<Channel>): Channel => ({
  slug,
  name: `Canal ${slug}`,
  description: `Description ${slug}.`,
  amicable: true,
  free: true,
  ...attributes,
})

const talk = channel('talk', {}) // amicable, no contact: talking to the other party
const neutral = channel('neutral', { contact: { url: 'https://example.org/neutral' } })
const court = channel('court', { amicable: false, free: false })
const channels = [talk, neutral, court]

const USER = ['yes', 'maybe', 'no'] as const
const OTHER = ['yes', 'maybe', 'no', 'unknown'] as const

const answers = (userOpenness?: string, otherPartyOpenness?: string) =>
  userOpenness === undefined ? {} : { [OPENNESS_STEP_ID]: { userOpenness, otherPartyOpenness } }

// What the rules say, written out: the route for every combination of the openness answers.
const EXPECTED: Record<(typeof USER)[number], Record<(typeof OTHER)[number], Route>> = {
  yes: { yes: 'direct', maybe: 'assisted', no: 'assisted', unknown: 'assisted' },
  maybe: { yes: 'direct', maybe: 'assisted', no: 'assisted', unknown: 'assisted' },
  no: { yes: 'judicial', maybe: 'judicial', no: 'judicial', unknown: 'judicial' },
}
const combinations = USER.flatMap((user) => OTHER.map((other) => [user, other] as const))

describe('routeFor', () => {
  it.each(combinations)('leads "%s" / "%s" to the route written in the rules', (user, other) => {
    expect(routeFor({ userOpenness: user, otherPartyOpenness: other })).toBe(EXPECTED[user][other])
  })

  it('reads a missing answer as the most prudent one: assisted', () => {
    expect(routeFor(undefined)).toBe('assisted')
  })
})

describe('recommendChannel', () => {
  describe('every combination of answers leads to a result', () => {
    it.each(combinations)('"%s" / "%s" gives a recommendation', (user, other) => {
      const result = recommendChannel(answers(user, other), channels)

      expect(result).toBeDefined()
      expect(result?.route).toBe(EXPECTED[user][other])
      expect(channels).toContain(result?.channel)
      expect(result?.reasons.length).toBeGreaterThanOrEqual(3)
    })

    it('gives a recommendation even when nothing was answered', () => {
      const result = recommendChannel({}, channels)
      expect(result?.route).toBe('assisted')
      expect(result?.reasons[0]).toMatch(/pas indiqué/)
    })

    it('gives a recommendation for any other answers of the simulation', () => {
      const result = recommendChannel(
        {
          'conflict-type': { type: 'whatever' },
          'loss-frequency': { money: 99999, frequency: 'daily' },
          ...answers('yes', 'yes'),
        },
        channels,
      )
      expect(result?.route).toBe('direct')
    })
  })

  describe('the channel of each route', () => {
    it('recommends the channel to talk to the other party for the direct route', () => {
      expect(recommendChannel(answers('yes', 'yes'), channels)?.channel).toBe(talk)
    })

    it('recommends the amicable channel with contact details for the assisted route', () => {
      expect(recommendChannel(answers('yes', 'unknown'), channels)?.channel).toBe(neutral)
    })

    it('recommends the channel where a judge decides for the judicial route', () => {
      expect(recommendChannel(answers('no', 'yes'), channels)?.channel).toBe(court)
    })

    it('does not let the losses or the conflict type change the route', () => {
      const base = recommendChannel(answers('no', 'no'), channels)
      const other = recommendChannel(
        { 'loss-frequency': { money: 1, frequency: 'once' }, ...answers('no', 'no') },
        channels,
      )
      expect(other?.route).toBe(base?.route)
    })
  })

  describe('reasons', () => {
    it('says what the person answered, then what the route means, then the cost', () => {
      const { reasons } = recommendChannel(answers('yes', 'yes'), channels)!
      expect(reasons[0]).toMatch(/Vous seriez prêt\(e\) à discuter/)
      expect(reasons[1]).toMatch(/L’autre partie semble prête/)
      expect(reasons[2]).toMatch(/en parler directement/)
      expect(reasons.at(-1)).toBe('Ce canal est gratuit.')
    })

    it('says so when the channel can cost something', () => {
      const { reasons } = recommendChannel(answers('no', 'no'), channels)!
      expect(reasons[0]).toMatch(/Vous ne souhaitez pas discuter/)
      expect(reasons[1]).toMatch(/ne semble pas prête/)
      expect(reasons.at(-1)).toBe('Ce canal peut avoir un coût.')
    })

    it('says when the person does not know about the other party', () => {
      expect(recommendChannel(answers('maybe', 'unknown'), channels)?.reasons).toContain(
        'Vous ne savez pas si l’autre partie est prête à discuter.',
      )
    })
  })

  describe('alternatives', () => {
    it('lists every other channel of the content, in its order', () => {
      expect(recommendChannel(answers('yes', 'unknown'), channels)?.alternatives).toEqual([
        talk,
        court,
      ])
    })

    it('is empty when there is a single channel', () => {
      expect(recommendChannel(answers('yes', 'yes'), [talk])?.alternatives).toEqual([])
    })
  })

  it('has nothing to recommend when the content has no channel', () => {
    expect(recommendChannel(answers('yes', 'yes'), [])).toBeUndefined()
  })
})

describe('pickChannel', () => {
  const paidNeutral = channel('paid-neutral', { free: false, contact: { phone: '01 23 45 67 89' } })

  it('prefers a free channel, then the order of the content', () => {
    expect(pickChannel('assisted', [paidNeutral, neutral])).toBe(neutral)
    expect(pickChannel('assisted', [neutral, paidNeutral])).toBe(neutral)
  })

  it('takes the first channel when none is free', () => {
    const other = channel('other-paid', { free: false, contact: { phone: '02' } })
    expect(pickChannel('assisted', [paidNeutral, other])).toBe(paidNeutral)
  })

  describe('when no channel fits the route, falls back on the closest one', () => {
    it('assisted without a channel with contact details: any amicable channel', () => {
      expect(pickChannel('assisted', [talk, court])).toBe(talk)
    })

    it('direct without a channel that is only talking: any amicable channel', () => {
      expect(pickChannel('direct', [neutral, court])).toBe(neutral)
    })

    it('judicial without a judicial channel: any amicable channel', () => {
      expect(pickChannel('judicial', [talk, neutral])).toBe(talk)
    })

    it('with only judicial channels, every route leads to one', () => {
      for (const route of ['direct', 'assisted', 'judicial'] as const) {
        expect(pickChannel(route, [court])).toBe(court)
      }
    })

    it('with no channel at all: nothing', () => {
      expect(pickChannel('direct', [])).toBeUndefined()
    })
  })
})

// Guard on the CONTENT, not on the rules: the example channels will be replaced by the content
// team. If the new channels leave a route without a channel that fits it, this fails with a clear
// message, instead of the result silently recommending an unsuitable channel.
describe('the channels of the content', () => {
  const route = (name: Route) => pickChannel(name, channelsContent.all)

  it('has a channel that fits each route', () => {
    expect(route('direct')?.amicable, 'no amicable channel without contact for "direct"').toBe(true)
    expect(
      route('direct')?.contact,
      'the "direct" channel must not have contact details',
    ).toBeUndefined()
    expect(route('assisted')?.amicable, 'no amicable channel for "assisted"').toBe(true)
    expect(route('assisted')?.contact, 'the "assisted" channel needs contact details').toBeDefined()
    expect(route('judicial')?.amicable, 'no judicial channel (amicable: false)').toBe(false)
  })

  it('leads every combination of answers to a recommendation', () => {
    for (const [user, other] of combinations) {
      expect(recommendChannel(answers(user, other), channelsContent.all)).toBeDefined()
    }
  })
})

describe('channels of a conflict type', () => {
  const generic = channel('generic', { contact: { url: 'https://example.org/generic' } })
  const consumer = channel('consumer', {
    contact: { url: 'https://example.org/consumer' },
    conflictTypes: ['conso'],
  })
  const family = channel('family', {
    free: false,
    contact: { url: 'https://example.org/family' },
    conflictTypes: ['famille'],
  })
  const all = [talk, generic, consumer, family, court]
  const withType = (type: string) => ({
    'conflict-type': { type },
    [OPENNESS_STEP_ID]: { userOpenness: 'yes', otherPartyOpenness: 'unknown' },
  })

  it('keeps the channels meant for the type, and the channels for every type', () => {
    expect(channelsFor('conso', all)).toEqual([talk, generic, consumer, court])
    expect(channelsFor(undefined, all)).toEqual(all)
  })

  it('recommends the most specific channel, even when it is not free', () => {
    expect(recommendChannel(withType('conso'), all)?.channel).toBe(consumer)
    expect(recommendChannel(withType('famille'), all)?.channel).toBe(family)
    expect(recommendChannel(withType('autre'), all)?.channel).toBe(generic)
  })

  it('never suggests a channel meant for another conflict type', () => {
    const alternatives = recommendChannel(withType('conso'), all)?.alternatives
    expect(alternatives).not.toContain(family)
    expect(alternatives).toContain(generic)
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

  it('says the attempt is mandatory, and why, for an "always" type', () => {
    const notice = mandatoryAttemptNotice(type('always'), {})
    expect(notice).toMatch(/^Pour ce type de litige, la loi impose une tentative amiable/)
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
  it('has a channel for every route, for every conflict type', () => {
    const routes: Route[] = ['direct', 'assisted', 'judicial']
    for (const type of [
      'voisinage',
      'consommation',
      'logement',
      'argent-particuliers',
      'famille',
    ]) {
      const relevant = channelsFor(type, channelsContent.all)
      for (const route of routes) {
        const picked = pickChannel(route, relevant)
        expect(picked, `${type} / ${route}`).toBeDefined()
        if (route === 'judicial') expect(picked?.amicable).toBe(false)
        else expect(picked?.amicable, `${type} / ${route}`).toBe(true)
      }
    }
  })

  it('sends a consumer dispute to the consumer mediator and a family one to family mediation', () => {
    const assisted = (type: string) =>
      pickChannel('assisted', channelsFor(type, channelsContent.all))?.slug
    expect(assisted('consommation')).toBe('mediateur-consommation')
    expect(assisted('famille')).toBe('mediation-familiale')
    expect(assisted('voisinage')).toBe('conciliateur-de-justice')
  })
})
