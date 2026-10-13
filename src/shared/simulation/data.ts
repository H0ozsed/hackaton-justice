import type { ChannelInput, ConflictTypeInput } from './schema'

// Content of the simulation (see src/shared/README.md). Field names in English, content in
// French (shown to users). Facts checked against official sources (October 2026):
// - tentative amiable obligatoire: art. 750-1 du code de procédure civile (claims of 5,000 € or
//   less, troubles anormaux de voisinage), https://www.justice.fr/fiche/conciliateur-justice
// - conciliateur de justice: free, civil disputes, not family matters of the JAF,
//   https://www.justice.fr/fiche/conciliateur-justice
// - médiateur de la consommation: free for the consumer, written complaint to the professional
//   first, 90 days, https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques-et-les-faq/la-mediation-de-la-consommation-ce-que-vous-devez-savoir
// - médiation familiale: CAF scale based on income, https://caf.fr/professionnels/offres-et-services/dispositifs-partenaires/mediation-familiale
// To be proofread by the legal / content team before the demo.

export const conflictTypesData: ConflictTypeInput[] = [
  {
    slug: 'voisinage',
    label: 'Conflit de voisinage',
    description: 'Un trouble qui vient d’un voisin et qui dure : bruit, odeurs, haie, animaux…',
    examples: ['bruit tard le soir', 'haie qui dépasse', 'aboiements', 'travaux répétés'],
    lossKinds: ['time', 'health', 'relationship', 'money'],
    mandatoryAmicableAttempt: 'always',
    followUpQuestions: [
      {
        id: 'nature-trouble',
        kind: 'choice',
        label: 'Quelle est la nature du trouble ?',
        options: [
          { value: 'bruit', label: 'Bruit' },
          { value: 'odeurs', label: 'Odeurs' },
          { value: 'vegetation', label: 'Arbres ou haie' },
          { value: 'animaux', label: 'Animaux' },
          { value: 'stationnement', label: 'Stationnement ou passage' },
          { value: 'autre', label: 'Autre' },
        ],
        multiple: true,
      },
      {
        id: 'deja-parle',
        kind: 'yesNo',
        label: 'En avez-vous déjà parlé avec votre voisin ?',
      },
    ],
  },
  {
    slug: 'consommation',
    label: 'Litige avec un professionnel',
    description:
      'Un achat ou un service qui pose problème : colis non livré, produit défectueux, facture contestée, abonnement…',
    examples: ['colis jamais reçu', 'réparation mal faite', 'abonnement impossible à résilier'],
    lossKinds: ['money', 'time'],
    mandatoryAmicableAttempt: 'up-to-5000',
    followUpQuestions: [
      {
        id: 'montant',
        kind: 'number',
        label: 'Quel est le montant en jeu ?',
        help: 'Le prix de l’achat ou de la prestation, approximativement.',
        unit: '€',
        min: 0,
      },
      {
        id: 'reclamation-ecrite',
        kind: 'yesNo',
        label: 'Avez-vous déjà envoyé une réclamation écrite au professionnel ?',
        help: 'C’est nécessaire avant de saisir le médiateur de la consommation.',
      },
    ],
  },
  {
    slug: 'logement',
    label: 'Litige entre propriétaire et locataire',
    description:
      'Un désaccord sur le logement loué : dépôt de garantie, réparations, charges, loyers…',
    examples: ['dépôt de garantie non rendu', 'réparations jamais faites', 'charges contestées'],
    lossKinds: ['money', 'time', 'health', 'relationship'],
    mandatoryAmicableAttempt: 'up-to-5000',
    followUpQuestions: [
      {
        id: 'role',
        kind: 'choice',
        label: 'Vous êtes…',
        options: [
          { value: 'locataire', label: 'Locataire' },
          { value: 'proprietaire', label: 'Propriétaire' },
        ],
      },
      {
        id: 'montant',
        kind: 'number',
        label: 'Quel est le montant en jeu ?',
        help: 'Laissez vide si le litige ne porte pas sur une somme.',
        unit: '€',
        min: 0,
        required: false,
      },
    ],
  },
  {
    slug: 'argent-particuliers',
    label: 'Argent entre particuliers',
    description:
      'Une somme due par un proche ou un particulier : prêt non remboursé, vente entre particuliers…',
    examples: ['prêt à un ami jamais remboursé', 'objet vendu en ligne et non payé'],
    lossKinds: ['money', 'relationship'],
    mandatoryAmicableAttempt: 'up-to-5000',
    followUpQuestions: [
      {
        id: 'montant',
        kind: 'number',
        label: 'Quelle somme vous doit-on ?',
        unit: '€',
        min: 0,
      },
    ],
  },
  {
    slug: 'famille',
    label: 'Conflit familial',
    description:
      'Une séparation, l’organisation pour les enfants, une succession ou des relations familiales difficiles.',
    examples: ['garde des enfants', 'pension alimentaire', 'partage d’un héritage'],
    lossKinds: ['money', 'time', 'health', 'relationship'],
    followUpQuestions: [
      {
        id: 'sujet',
        kind: 'choice',
        label: 'Sur quoi porte le désaccord ?',
        options: [
          { value: 'enfants', label: 'Les enfants' },
          { value: 'argent', label: 'L’argent (pension, partage)' },
          { value: 'succession', label: 'Une succession' },
          { value: 'relations', label: 'Les relations familiales' },
        ],
        multiple: true,
      },
    ],
  },
]

export const channelsData: ChannelInput[] = [
  {
    slug: 'discussion-directe',
    name: 'En parler directement',
    description:
      'Une discussion calme, puis un courrier qui résume ce que vous proposez. C’est gratuit, rapide, et cela garde une trace de votre démarche.',
    amicable: true,
    free: true,
  },
  {
    slug: 'conciliateur-de-justice',
    name: 'Conciliateur de justice',
    description:
      'Un bénévole neutre, nommé par la justice, qui reçoit les deux parties et les aide à trouver un accord. Gratuit, près de chez vous (mairie, tribunal, maison de justice). L’accord peut être écrit dans un constat d’accord.',
    amicable: true,
    free: true,
    conflictTypes: ['voisinage', 'consommation', 'logement', 'argent-particuliers'],
    contact: { url: 'https://www.conciliateurs.fr' },
  },
  {
    slug: 'mediateur-consommation',
    name: 'Médiateur de la consommation',
    description:
      'Gratuit pour vous : le professionnel doit indiquer son médiateur (site, conditions générales, contrat). Faites d’abord une réclamation écrite au professionnel, puis saisissez le médiateur dans l’année. Il a 90 jours pour proposer une solution, que chacun reste libre d’accepter.',
    amicable: true,
    free: true,
    conflictTypes: ['consommation'],
    contact: {
      url: 'https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques-et-les-faq/la-mediation-de-la-consommation-ce-que-vous-devez-savoir',
    },
  },
  {
    slug: 'mediation-familiale',
    name: 'Médiation familiale',
    description:
      'Un médiateur familial diplômé aide à renouer le dialogue et à trouver des solutions pour les enfants, l’argent ou une succession. Le coût dépend de vos revenus (barème de la Caf). Elle n’est pas proposée en cas de violences.',
    amicable: true,
    free: false,
    conflictTypes: ['famille'],
    contact: {
      url: 'https://caf.fr/professionnels/offres-et-services/dispositifs-partenaires/mediation-familiale',
    },
  },
  {
    slug: 'tribunal',
    name: 'Saisir le juge',
    description:
      'Un juge tranche le litige et sa décision s’impose. C’est plus long, et l’accord n’est plus entre vos mains. Pour de nombreux litiges, une tentative amiable est obligatoire avant.',
    amicable: false,
    free: false,
    contact: { url: 'https://www.justice.fr' },
  },
]
