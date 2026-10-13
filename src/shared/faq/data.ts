import type { FaqEntryInput } from './schema'

// Field names in English, content in French (shown to users). See src/shared/README.md.
// A blank line in an answer starts a new paragraph. Facts checked against justice.fr,
// service-public.gouv.fr and the DGCCRF (October 2026); to be proofread before the demo.
export const faqData: FaqEntryInput[] = [
  {
    slug: 'a-qui-sert-le-site',
    question: 'À qui s’adresse ce site ?',
    answer:
      'À toute personne qui vit un conflit du quotidien (voisinage, achat, logement, argent, famille) et veut le régler sans aller directement devant un juge.\n\nLe site explique la conciliation et la médiation, vous oriente vers le bon interlocuteur et vous permet de vous entraîner avec des mises en situation.',
    pages: ['home', 'learn'],
  },
  {
    slug: 'est-ce-gratuit',
    question: 'Est-ce gratuit ?',
    answer:
      'Le site est gratuit, sans compte, et vos réponses restent sur votre appareil.\n\nCôté démarches : le conciliateur de justice est gratuit, comme le médiateur de la consommation pour le consommateur. La médiation est en général payante et partagée entre les parties ; la médiation familiale suit un barème selon vos revenus.',
    pages: ['home', 'learn'],
  },
  {
    slug: 'difference-conciliation-mediation',
    question: 'Quelle différence entre conciliation et médiation ?',
    answer:
      'Dans les deux cas, une personne neutre vous aide à trouver un accord, et c’est vous qui décidez.\n\nLe conciliateur de justice est un bénévole gratuit, pour les litiges du quotidien ; il peut proposer des solutions. Le médiateur est un professionnel formé, souvent payant, qui aide surtout à renouer le dialogue quand la relation compte (famille, voisins, associés).',
    pages: ['home', 'learn'],
  },
  {
    slug: 'amiable-obligatoire',
    question: 'Faut-il tenter l’amiable avant d’aller en justice ?',
    answer:
      'Souvent, oui. Pour une demande de 5 000 € ou moins, ou pour un trouble anormal de voisinage, la loi impose de tenter une conciliation, une médiation ou une procédure participative avant de saisir le juge. Sinon, la demande peut être déclarée irrecevable (article 750-1 du code de procédure civile).\n\nGardez une preuve de votre tentative : courriers, convocation, attestation du conciliateur.',
    pages: ['home', 'learn'],
  },
  {
    slug: 'refus-autre-partie',
    question: 'Et si l’autre partie refuse ?',
    answer:
      'Personne ne peut être forcé d’accepter un accord. Si l’autre partie refuse ou ne vient pas, vous pouvez saisir le juge : votre tentative compte, gardez-en la preuve.\n\nPendant un procès, le juge peut aussi ordonner aux parties de rencontrer un médiateur pour une réunion d’information.',
    pages: ['learn'],
  },
  {
    slug: 'accord-non-respecte',
    question: 'Que faire si l’accord n’est pas respecté ?',
    answer:
      'Un accord écrit et signé engage les deux parties. Pour plus de sécurité, faites-le homologuer par le juge : il a alors la même force qu’un jugement, et peut être exécuté de force s’il n’est pas respecté.',
    pages: ['learn'],
  },
  {
    slug: 'confidentialite',
    question: 'Ce que je dis en médiation peut-il être utilisé contre moi ?',
    answer:
      'Non. Le médiateur est tenu à la confidentialité : ce qui est dit pendant la médiation ne peut pas, en principe, être utilisé ensuite devant le juge. C’est ce qui permet de parler librement.',
    pages: ['learn'],
  },
  {
    slug: 'avocat',
    question: 'Ai-je besoin d’un avocat ?',
    answer:
      'Pas pour une conciliation ou une médiation : vous pouvez y aller seul, ou accompagné de la personne de votre choix. Devant le tribunal judiciaire, l’avocat devient en principe obligatoire pour les litiges de plus de 10 000 €. Si vos revenus sont modestes, l’aide juridictionnelle peut prendre en charge ses frais.',
    pages: ['learn'],
  },
]
