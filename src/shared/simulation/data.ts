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
// - médiateur (conventional or judicial mediation): usually paid and shared between the parties;
//   the judge appoints one only with the parties' agreement and sets the provision, legal aid
//   can cover it; the agreement can be homologated by the judge at the parties' request,
//   https://www.justice.fr/fiche/mediateur-civil (coaching feedback of 13 Oct 2026: #93, #113, #122)
// - points-justice and CDAD (free legal information), #94,
//   https://www.cours-appel.justice.fr/saint-denis/acces-au-droit-la-reunion
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
    cost: 'Gratuit',
    agreement: 'Un accord écrit et signé engage les parties',
  },
  {
    slug: 'conciliateur-de-justice',
    name: 'Conciliateur de justice',
    description:
      'Un bénévole neutre, nommé par la justice, que vous contactez directement. Il reçoit les parties (deux ou plus) et les aide à trouver un accord ; il peut proposer des solutions. Gratuit, près de chez vous (point-justice, tribunal). L’accord est écrit dans un constat d’accord, que le juge peut homologuer.',
    amicable: true,
    free: true,
    cost: 'Gratuit',
    agreement: 'Constat d’accord, que le juge peut homologuer (force exécutoire)',
    conflictTypes: ['voisinage', 'consommation', 'logement', 'argent-particuliers'],
    contact: { url: 'https://www.conciliateurs.fr' },
  },
  {
    slug: 'mediateur',
    name: 'Médiateur',
    description:
      'Un professionnel formé, neutre et tenu à la confidentialité, qui aide à renouer le dialogue quand la relation compte (voisins, proches, bailleur et locataire). Il ne propose pas de solution : il vous aide à construire la vôtre. Vous le choisissez ensemble, ou le juge le désigne avec votre accord pendant un procès.',
    amicable: true,
    free: false,
    cost: 'Payant, en général partagé entre les parties ; l’aide juridictionnelle peut le prendre en charge si le juge l’a désigné',
    agreement:
      'Accord écrit, que le juge peut homologuer à la demande des parties (force exécutoire)',
    conflictTypes: ['voisinage', 'consommation', 'logement', 'argent-particuliers'],
    contact: { url: 'https://www.justice.fr/fiche/mediateur-civil' },
  },
  {
    slug: 'mediateur-consommation',
    name: 'Médiateur de la consommation',
    description:
      'Gratuit pour vous : le professionnel doit indiquer son médiateur (site, conditions générales, contrat). Faites d’abord une réclamation écrite au professionnel, puis saisissez le médiateur dans l’année. Il a 90 jours pour proposer une solution, que chacun reste libre d’accepter.',
    amicable: true,
    free: true,
    cost: 'Gratuit pour le consommateur',
    agreement: 'Une proposition de solution, que chacun reste libre d’accepter',
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
    cost: 'Selon vos revenus (barème de la Caf)',
    agreement: 'Accord écrit, que le juge aux affaires familiales peut homologuer',
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
    cost: 'Frais possibles (avocat, commissaire de justice), aide juridictionnelle selon vos revenus',
    agreement: 'Un jugement qui s’impose aux parties',
    contact: { url: 'https://www.justice.fr' },
  },
]

/** Free information before choosing (#94): shown on every result of the simulation. */
export const freeInformationData = {
  title: 'Besoin d’en parler avant de choisir ?',
  text: 'Les points-justice vous informent gratuitement sur vos droits et vous orientent vers le bon interlocuteur : conciliateur, médiateur, avocat. À La Réunion, ils sont coordonnés par le CDAD (conseil départemental de l’accès au droit).',
  link: {
    label: 'L’accès au droit à La Réunion (cour d’appel de Saint-Denis)',
    href: 'https://www.cours-appel.justice.fr/saint-denis/acces-au-droit-la-reunion',
  },
}
