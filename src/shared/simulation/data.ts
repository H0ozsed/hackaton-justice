import type { ChannelInput, ConflictTypeInput } from './schema'

// EXEMPLES à remplacer par l'équipe contenu (voir src/shared/README.md).

export const conflictTypesData: ConflictTypeInput[] = [
  {
    slug: 'voisinage',
    label: 'EXEMPLE — Conflit de voisinage',
    description: 'EXEMPLE — à remplacer.',
    examples: ['EXEMPLE — bruit', 'EXEMPLE — haie non taillée'],
    lossKinds: ['time', 'health', 'relationship'],
    followUpQuestions: [
      {
        id: 'nature-trouble',
        kind: 'choice',
        label: 'EXEMPLE — Quelle est la nature du trouble ?',
        options: [
          { value: 'bruit', label: 'Bruit' },
          { value: 'odeurs', label: 'Odeurs' },
          { value: 'vegetation', label: 'Végétation' },
        ],
        multiple: true,
      },
      {
        id: 'deja-parle',
        kind: 'yesNo',
        label: 'EXEMPLE — En avez-vous déjà parlé avec votre voisin ?',
      },
    ],
  },
  {
    slug: 'consommation',
    label: 'EXEMPLE — Litige avec un commerçant',
    description: 'EXEMPLE — à remplacer.',
    lossKinds: ['money', 'time'],
    followUpQuestions: [
      {
        id: 'montant-achat',
        kind: 'number',
        label: 'EXEMPLE — Montant de l’achat',
        unit: '€',
        min: 0,
      },
    ],
  },
]

export const channelsData: ChannelInput[] = [
  {
    slug: 'discussion-directe',
    name: 'EXEMPLE — En parler directement',
    description: 'EXEMPLE — à remplacer.',
    amicable: true,
    free: true,
  },
  {
    slug: 'conciliateur-de-justice',
    name: 'EXEMPLE — Conciliateur de justice',
    description: 'EXEMPLE — à remplacer.',
    amicable: true,
    free: true,
    contact: { url: 'https://example.org/a-remplacer' },
  },
  {
    slug: 'tribunal',
    name: 'EXEMPLE — Saisir le tribunal',
    description: 'EXEMPLE — à remplacer.',
    amicable: false,
    free: false,
  },
]
