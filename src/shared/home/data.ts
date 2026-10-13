import type { AboutInput, ExplainerCardInput, OrientationOptionInput } from './schema'

// Home page content (#127, #104). Field names in English, content in French.
//
// DRAFT: every legal fact below is still TO VALIDATE by a conciliator or a mediator
// (#120) before going live. Facts to check are marked « TO VALIDATE ». Do not add a
// fact that does not come from a validated source.

/** « L'amiable en 1 minute »: the essentials, read before choosing a journey. */
export const explainerData: ExplainerCardInput[] = [
  {
    slug: 'regler-a-l-amiable',
    title: 'Régler un conflit à l’amiable',
    // TO VALIDATE (#120): general definition.
    body: 'C’est chercher avec l’autre personne une solution acceptée par chacun, plutôt que de laisser un juge trancher. Vous gardez la main sur l’accord.',
  },
  {
    slug: 'les-voies-possibles',
    title: 'Plusieurs voies possibles',
    // TO VALIDATE (#120, #93): the routes and their order.
    body: 'Discuter directement avec l’autre personne, demander l’aide d’un [[conciliateur-de-justice|conciliateur de justice]] (la [[conciliation|conciliation]]) ou d’un médiateur (la [[mediation|médiation]]). Le juge reste le dernier recours.',
  },
  {
    slug: 'pourquoi-essayer-d-abord',
    title: 'Pourquoi essayer d’abord',
    // TO VALIDATE (#120, #109, #122): time, cost and uncertainty of a trial.
    body: 'Un accord amiable est souvent plus rapide et moins coûteux qu’un procès, dont l’issue reste incertaine. Il aide aussi à préserver la relation avec l’autre personne.',
  },
  {
    slug: 'qui-peut-vous-aider',
    title: 'Qui peut vous aider',
    // TO VALIDATE (#120, #94): role of the points-justice and of the CDAD.
    body: 'Le conciliateur de justice et le médiateur vous accompagnent vers un accord. Pour vous informer, les points-justice, coordonnés par le CDAD (conseil départemental de l’accès au droit), sont là pour vous.',
  },
]

/** « Par où commencer ? »: each situation leads to one journey. */
export const orientationData: OrientationOptionInput[] = [
  {
    slug: 'conflit-en-cours',
    situation: 'Je vis un conflit en ce moment',
    journey: '/simulation',
  },
  {
    slug: 'comprendre-avant-d-agir',
    situation: 'Je veux comprendre avant d’agir',
    journey: '/mise-en-situation',
  },
  {
    slug: 'apprendre-ou-sensibiliser',
    situation: 'Je veux apprendre, seul ou avec un groupe (classe, atelier)',
    journey: '/apprendre',
  },
]

/** What the site is for (#104). DRAFT: to be agreed by the team. */
export const aboutData: AboutInput = {
  purpose:
    'Ce site vous aide à comprendre les solutions amiables pour régler un conflit du quotidien, et vous oriente vers la démarche ou l’interlocuteur adapté.',
  audiences: [
    'Toute personne en désaccord avec un voisin, un propriétaire, un employeur ou un commerçant.',
    'Les jeunes, en classe ou lors d’ateliers de sensibilisation.',
    'Les professionnels et les associations qui informent le public sur l’accès au droit.',
  ],
  differences: [
    'Il part de votre situation pour vous orienter, au lieu de vous laisser chercher seul.',
    'Il vous fait vivre un conflit fictif pour voir les conséquences de vos choix.',
    'Son assistant IRIS répond uniquement à partir du contenu de ce site.',
  ],
  limits: [
    'Ce n’est pas un avocat : il ne donne pas de conseil juridique personnalisé.',
    'Ce n’est pas une démarche officielle : rien n’est transmis à un tribunal.',
    'Il ne prend aucune décision à votre place.',
  ],
}

/** Questions IRIS suggests on the home page, in line with the explainer (#127). */
export const irisQuestionsData: string[] = [
  'Qu’est-ce que régler un conflit à l’amiable ?',
  'Qui peut m’aider à trouver un accord ?',
  'Par où commencer sur ce site ?',
]
