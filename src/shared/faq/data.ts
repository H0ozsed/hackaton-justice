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
      'Le site est gratuit, sans compte, et vos réponses restent sur votre appareil.\n\nCôté démarches : le conciliateur de justice est gratuit, comme le médiateur de la consommation pour le consommateur et l’information dans un point-justice. La médiation est en général payante et partagée entre les parties : quand le juge désigne un médiateur, c’est avec l’accord des parties, il fixe la somme à verser, et l’aide juridictionnelle peut la prendre en charge. La médiation familiale suit un barème selon vos revenus.',
    pages: ['home', 'learn'],
  },
  {
    slug: 'difference-conciliation-mediation',
    question: 'Quelle différence entre conciliation et médiation ?',
    answer:
      'Dans les deux cas, une personne neutre aide deux personnes ou plus à trouver un accord, et ce sont elles qui décident.\n\nLe conciliateur de justice est un bénévole gratuit, que vous contactez directement (conciliateurs.fr, point-justice), pour les litiges du quotidien. Il peut proposer des solutions et, avec l’accord des parties, se rendre sur les lieux et entendre toute personne utile.\n\nLe médiateur est un professionnel formé, payant, en général partagé entre les parties. Vous le choisissez ensemble, ou le juge le désigne avec votre accord pendant un procès ; l’aide juridictionnelle peut alors le prendre en charge. Il ne propose pas de solution : il aide à renouer le dialogue quand la relation compte (famille, voisins, associés).\n\nDans les deux cas, l’accord peut être homologué par le juge si les parties le demandent.',
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
      'Un accord écrit et signé engage les parties. Pour plus de sécurité, demandez au juge de l’homologuer : c’est possible après une conciliation (constat d’accord) comme après une médiation. L’accord a alors force exécutoire, comme un jugement : s’il n’est pas respecté, il peut être exécuté de force.',
    pages: ['learn'],
  },
  {
    slug: 'information-gratuite',
    question: 'Où être informé gratuitement près de chez moi ?',
    answer:
      'Dans un point-justice : on vous y donne une information juridique gratuite et on vous oriente vers la bonne démarche. Selon les lieux, vous pouvez y rencontrer un juriste, un avocat, un conciliateur de justice ou un médiateur.\n\nLes points-justice sont coordonnés dans chaque département par le CDAD (conseil départemental de l’accès au droit). À La Réunion, la cour d’appel de Saint-Denis présente l’accès au droit sur son site.',
    pages: ['home', 'learn'],
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
