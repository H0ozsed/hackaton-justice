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
// - every channel lists its legal texts and official sources below (« Ce que dit la loi »)
// - points-justice and CDAD (free legal information), #94,
//   https://www.cours-appel.justice.fr/saint-denis/acces-au-droit-la-reunion
// To be proofread by the legal / content team before the demo.

export const conflictTypesData: ConflictTypeInput[] = [
  {
    slug: 'voisinage',
    label: 'Conflit de voisinage',
    description: 'Un trouble qui vient d’un voisin et qui dure : bruit, odeurs, haie, animaux…',
    examples: ['bruit tard le soir', 'haie qui dépasse', 'aboiements', 'travaux répétés'],
    mandatoryAmicableAttempt: 'always',
  },
  {
    slug: 'consommation',
    label: 'Litige avec un professionnel',
    description:
      'Un achat ou un service qui pose problème : colis non livré, produit défectueux, facture contestée, abonnement…',
    examples: ['colis jamais reçu', 'réparation mal faite', 'abonnement impossible à résilier'],
    mandatoryAmicableAttempt: 'up-to-5000',
    followUpQuestions: [
      {
        id: 'montant',
        kind: 'number',
        label: 'Quel est le montant en jeu ?',
        help: 'Le prix de l’achat ou de la prestation, approximativement. Il sert à savoir si la loi impose une tentative amiable (5 000 € ou moins).',
        unit: '€',
        min: 0,
      },
    ],
  },
  {
    slug: 'logement',
    label: 'Litige entre propriétaire et locataire',
    description:
      'Un désaccord sur le logement loué : dépôt de garantie, réparations, charges, loyers…',
    examples: ['dépôt de garantie non rendu', 'réparations jamais faites', 'charges contestées'],
    mandatoryAmicableAttempt: 'up-to-5000',
    followUpQuestions: [
      {
        id: 'montant',
        kind: 'number',
        label: 'Quel est le montant en jeu ?',
        help: 'Il sert à savoir si la loi impose une tentative amiable (5 000 € ou moins). Laissez vide si le litige ne porte pas sur une somme.',
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
    mandatoryAmicableAttempt: 'up-to-5000',
    followUpQuestions: [
      {
        id: 'montant',
        kind: 'number',
        label: 'Quelle somme vous doit-on ?',
        help: 'Elle sert à savoir si la loi impose une tentative amiable (5 000 € ou moins).',
        unit: '€',
        min: 0,
      },
    ],
  },
  {
    slug: 'famille',
    label: 'Conflit familial',
    description:
      'Une séparation ou un divorce, l’organisation pour les enfants, une pension, une succession, les liens avec les grands-parents ou un parent âgé.',
    examples: ['garde des enfants', 'pension alimentaire', 'partage d’un héritage', 'parent âgé'],
    warning:
      'En cas de violences, la médiation familiale n’est pas proposée. En danger : appelez le 17 ou le 112. Violences conjugales : le 3919, gratuit et anonyme. Enfance en danger : le 119.',
  },
  {
    slug: 'travail',
    label: 'Conflit au travail',
    description:
      'Un désaccord avec votre employeur ou avec un salarié : salaire, heures, sanction, licenciement, relations dans l’équipe…',
    examples: ['salaire impayé', 'heures supplémentaires', 'licenciement contesté'],
    warning:
      'Attention aux délais : une action sur la rupture du contrat de travail (licenciement…) se prescrit en principe par 12 mois.',
  },
  {
    slug: 'administration',
    label: 'Litige avec une administration',
    description:
      'Un désaccord avec un service public : Caf, impôts, Assurance maladie, France Travail, préfecture, mairie…',
    examples: ['aide supprimée', 'trop-perçu réclamé', 'dossier bloqué'],
    warning:
      'Attention aux délais : pour contester une décision administrative devant le juge, vous avez en général 2 mois. Saisir un médiateur ou le Défenseur des droits ne suspend pas toujours ce délai.',
  },
  {
    slug: 'scolaire',
    label: 'Conflit lié à l’école',
    description:
      'Avec un établissement scolaire, le rectorat ou une université (décision, sanction, inscription…), ou entre élèves.',
    examples: [
      'décision contestée',
      'conflit entre élèves',
      'relation difficile avec un enseignant',
    ],
    warning:
      'Le harcèlement scolaire n’est pas un simple conflit : c’est un délit. Appelez le 3018, gratuit et anonyme, et prévenez l’établissement.',
  },
]

// Official pages the facts come from (checked in October 2026).
const SOURCES = {
  conciliateur: {
    label: 'justice.fr : le conciliateur de justice',
    href: 'https://www.justice.fr/fiche/conciliateur-justice',
  },
  conciliateurSp: {
    label: 'service-public.gouv.fr : le conciliateur de justice',
    href: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F1736',
  },
  mediateur: {
    label: 'justice.fr : le médiateur civil',
    href: 'https://www.justice.fr/fiche/mediateur-civil',
  },
  mediationFamiliale: {
    label: 'service-public.gouv.fr : la médiation familiale',
    href: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F34355',
  },
  caf: {
    label: 'Caf : la médiation familiale',
    href: 'https://caf.fr/professionnels/offres-et-services/dispositifs-partenaires/mediation-familiale',
  },
  consommation: {
    label: 'justice.fr : la médiation des litiges de consommation',
    href: 'https://www.justice.fr/fiche/mediation-litiges-consommation',
  },
  dgccrf: {
    label: 'DGCCRF : la médiation de la consommation',
    href: 'https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques-et-les-faq/la-mediation-de-la-consommation-ce-que-vous-devez-savoir',
  },
  cdc: {
    label: 'INC : à quoi servent les commissions départementales de conciliation ?',
    href: 'https://www.inc-conso.fr/content/quoi-servent-les-commissions-departementales-de-conciliation',
  },
  prudhommes: {
    label: 'justice.fr : le déroulement d’une affaire aux prud’hommes',
    href: 'https://www.justice.fr/fiche/conseil-prud-hommes-cph-deroulement-affaire',
  },
  defenseur: {
    label: 'justice.fr : saisir le Défenseur des droits',
    href: 'https://www.justice.fr/fiche/litige-administration-defenseur-droits',
  },
  education: {
    label: 'education.gouv.fr : faire appel au médiateur de l’éducation nationale',
    href: 'https://www.education.gouv.fr/les-modalites-pour-faire-appel-au-mediateur-de-l-education-nationale-et-de-l-enseignement-superieur-9788',
  },
  cjaMediation: {
    label: 'CNB : la médiation dans le code de justice administrative',
    href: 'https://www.cnb.avocat.fr/fr/actualites/la-mediation-introduite-dans-le-code-de-justice-administrative',
  },
  justice: { label: 'justice.fr', href: 'https://www.justice.fr' },
} as const

export const channelsData: ChannelInput[] = [
  // ---- Dialogue --------------------------------------------------------------------------
  {
    slug: 'discussion-directe',
    name: 'En parler directement',
    family: 'dialogue',
    description:
      'Une discussion calme, puis un courrier qui résume ce que vous proposez. C’est gratuit, rapide, et cela garde une trace de votre démarche.',
    forYouIf:
      'Vous pouvez encore parler avec l’autre personne et le conflit n’a pas trop dégénéré.',
    law: {
      text: 'Vous êtes toujours libres de trouver un accord entre vous. Attention : quand la loi impose une tentative amiable avant le juge, une simple discussion ne suffit pas ; il faut une conciliation par un conciliateur de justice, une médiation ou une procédure participative.',
      references: ['Code de procédure civile, art. 750-1'],
    },
    amicable: true,
    free: true,
    cost: 'Gratuit',
    agreement: 'Un accord écrit et signé engage les parties',
    conflictTypes: [
      'voisinage',
      'consommation',
      'logement',
      'argent-particuliers',
      'famille',
      'travail',
      'scolaire',
    ],
  },
  {
    slug: 'reclamation',
    name: 'Réclamation ou recours amiable',
    family: 'dialogue',
    description:
      'Vous écrivez au service qui a pris la décision (recours gracieux) ou à son supérieur (recours hiérarchique) pour lui demander de la revoir, en expliquant pourquoi et avec vos justificatifs.',
    forYouIf:
      'Vous contestez une décision d’une administration, d’un organisme public ou d’un établissement scolaire et vous ne lui avez pas encore écrit.',
    law: {
      text: 'Toute décision administrative peut faire l’objet d’un recours gracieux ou hiérarchique. C’est souvent une condition pour saisir un médiateur ou le Défenseur des droits, et certains recours préalables sont obligatoires avant le juge. Le délai pour contester une décision devant le juge administratif est en général de 2 mois.',
      references: [
        'Code des relations entre le public et l’administration, art. L410-1 et suivants',
        'Code de justice administrative, art. R421-1',
      ],
    },
    amicable: true,
    free: true,
    cost: 'Gratuit',
    agreement: 'Une nouvelle décision du service, ou le maintien de la première',
    conflictTypes: ['administration', 'scolaire'],
  },

  // ---- Conciliation ------------------------------------------------------------------------
  {
    slug: 'conciliateur-de-justice',
    name: 'Conciliateur de justice',
    family: 'conciliation',
    description:
      'Un bénévole neutre, nommé par la justice, que vous contactez directement. Il reçoit les parties (deux ou plus) et les aide à trouver un accord ; il peut proposer des solutions.',
    forYouIf:
      'Votre litige est du quotidien (voisin, logement, achat, argent) et vous voulez une aide gratuite, par quelqu’un qui peut proposer des solutions.',
    law: {
      text: 'Auxiliaire de justice bénévole, nommé par le premier président de la cour d’appel pour 1 an, puis pour 3 ans renouvelables. Il doit être majeur, avoir une formation ou une expérience juridique, ne pas avoir de mandat électif dans son secteur ni d’activité judiciaire. Il prête serment et respecte 7 devoirs : probité, indépendance, impartialité, neutralité, confidentialité, diligence et réserve. Avec l’accord des parties, il peut se rendre sur les lieux et entendre toute personne utile, si elle l’accepte. Désigné par le juge, il a 5 mois au plus (une prolongation de 3 mois possible).',
      references: [
        'Décret n° 78-381 du 20 mars 1978 relatif aux conciliateurs de justice',
        'Code de l’organisation judiciaire, art. R131-12',
        'Code de procédure civile, art. 1531 à 1537',
      ],
    },
    disputes: [
      'Voisinage (bornage, droit de passage, mur mitoyen, bruit)',
      'Propriétaires et locataires',
      'Impayés et argent entre particuliers',
      'Consommation (sauf clauses abusives)',
      'Litiges entre commerçants, droit rural',
      'Aucune limite de montant',
    ],
    excluded: [
      'État civil (mariage, filiation, adoption)',
      'Droit pénal',
      'Conflits familiaux du juge aux affaires familiales (pension, résidence des enfants)',
      'Litiges avec l’administration',
    ],
    access:
      'Vous le contactez directement, par téléphone, en ligne ou par courrier : près de chez vous, du lieu du litige ou de l’autre partie (conciliateurs.fr, point-justice, tribunal). Pendant un procès, le juge peut aussi le désigner, avec votre accord.',
    amicable: true,
    free: true,
    cost: 'Gratuit',
    agreement: 'Constat d’accord signé, que le juge peut homologuer (force exécutoire)',
    conflictTypes: ['voisinage', 'consommation', 'logement', 'argent-particuliers'],
    contact: { url: 'https://www.conciliateurs.fr' },
    sources: [SOURCES.conciliateur, SOURCES.conciliateurSp],
  },
  {
    slug: 'commission-departementale-de-conciliation',
    name: 'Commission départementale de conciliation',
    family: 'conciliation',
    description:
      'Une commission de la préfecture, avec autant de représentants des propriétaires que des locataires, qui reçoit les deux parties et cherche un accord sur un litige de location.',
    forYouIf:
      'Vous louez ou mettez en location votre résidence principale et le désaccord porte sur le loyer, le dépôt de garantie, l’état des lieux, les charges, les réparations, la décence du logement ou le congé.',
    law: {
      text: 'Placée auprès du préfet de chaque département, elle est composée à parts égales de représentants des bailleurs et des locataires et présidée tour à tour par chacun. Elle concilie les parties sur les litiges de location du logement, qu’il soit loué par un particulier ou un bailleur social.',
      references: ['Loi n° 89-462 du 6 juillet 1989, art. 20'],
    },
    disputes: [
      'Loyer et complément de loyer',
      'Dépôt de garantie, état des lieux',
      'Charges et réparations locatives',
      'Décence du logement, congé',
      'Litiges collectifs d’un immeuble',
    ],
    excluded: ['Les autres litiges ne sont pas examinés'],
    access:
      'Écrivez d’abord à l’autre partie. Puis saisissez le secrétariat de la commission du département où se trouve le logement, par courrier ou en ligne.',
    amicable: true,
    free: true,
    cost: 'Gratuit',
    agreement:
      'Un document de conciliation signé par les parties ; sinon, vous pouvez saisir le juge',
    conflictTypes: ['logement'],
    sources: [SOURCES.cdc],
  },
  {
    slug: 'conciliation-prud-hommes',
    name: 'Conciliation aux prud’hommes',
    family: 'conciliation',
    description:
      'Quand vous saisissez le conseil de prud’hommes, l’affaire commence en général par une séance de conciliation : deux conseillers, un employeur et un salarié, cherchent un accord avec vous.',
    forYouIf:
      'Vous êtes salarié(e) ou employeur, le désaccord porte sur le contrat de travail (salaire, heures, licenciement…) et le dialogue dans l’entreprise n’a rien donné.',
    law: {
      text: 'Le conseil de prud’hommes règle les litiges nés du contrat de travail entre employeurs et salariés. Son bureau de conciliation et d’orientation, composé d’un conseiller employeur et d’un conseiller salarié, s’efforce d’abord de concilier les parties. La séance n’est pas publique et chacun peut être entendu séparément. Certains litiges vont directement au jugement (prise d’acte, requalification d’un CDD…). Attention : une action sur la rupture du contrat de travail se prescrit en principe par 12 mois.',
      references: [
        'Code du travail, art. L1411-1',
        'Code du travail, art. L1423-13 et L1454-1',
        'Code du travail, art. L1471-1',
      ],
    },
    access:
      'En saisissant le conseil de prud’hommes, au greffe ou en ligne : la conciliation fait partie de la procédure. Un avocat n’est pas obligatoire.',
    amicable: true,
    free: true,
    cost: 'Gratuit',
    agreement:
      'Un procès-verbal de conciliation pour ce qui est réglé ; le reste va au bureau de jugement',
    conflictTypes: ['travail'],
    sources: [SOURCES.prudhommes],
  },
  {
    slug: 'audience-de-reglement-amiable',
    name: 'Audience de règlement amiable',
    family: 'conciliation',
    description:
      'Une fois le procès engagé, un juge qui ne jugera pas l’affaire reçoit les parties pour les aider à trouver un accord.',
    forYouIf:
      'Un procès est déjà engagé devant le tribunal judiciaire et vous voulez encore tenter un accord, avec l’aide d’un juge.',
    law: {
      text: 'Depuis le 1er novembre 2023, le juge saisi d’une affaire peut, à la demande d’une partie ou de lui-même, renvoyer les parties à une audience de règlement amiable, tenue par un autre juge qui ne fera pas partie de la formation de jugement.',
      references: ['Décret n° 2023-686 du 29 juillet 2023'],
    },
    access: 'Demandez-la au juge pendant la procédure ; il peut aussi la proposer.',
    amicable: true,
    free: true,
    cost: 'Pas de frais en plus de ceux du procès',
    agreement: 'Un accord qui met fin au litige ; sinon, l’affaire est jugée',
    inSimulation: false,
    sources: [SOURCES.justice],
  },

  // ---- Mediation ---------------------------------------------------------------------------
  {
    slug: 'mediateur',
    name: 'Médiateur civil',
    family: 'mediation',
    description:
      'Un professionnel formé, neutre et tenu à la confidentialité, qui aide à renouer le dialogue quand la relation compte. Il ne propose pas de solution : il vous aide à construire la vôtre.',
    forYouIf:
      'La relation compte (voisin, proche, collègue, bailleur) et vous voulez prendre le temps de renouer le dialogue et de construire vous-mêmes la solution, quitte à payer un professionnel.',
    law: {
      text: 'Tiers indépendant et impartial, choisi par les parties (médiation conventionnelle) ou désigné par le juge avec leur accord (médiation judiciaire). Ce peut être une personne ou une association. Il ne doit pas avoir de condamnation ou de sanction contraire à l’honneur et à la probité, doit avoir une formation ou une expérience de la médiation et présenter des garanties d’indépendance. Un juge ou un conciliateur de justice ne peut pas être médiateur civil. Tout ce qui se dit en médiation est confidentiel. Le juge peut aussi enjoindre aux parties de rencontrer un médiateur pour une réunion d’information : ne pas s’y rendre sans motif légitime expose à une amende civile de 10 000 € au plus. Médiation judiciaire : 5 mois au plus, renouvelable une fois 3 mois.',
      references: [
        'Loi n° 95-125 du 8 février 1995, art. 21 à 25',
        'Code de procédure civile, art. 1530 à 1530-2 et 1533 à 1537',
      ],
    },
    disputes: [
      'Voisinage, location, propriété',
      'Argent entre particuliers',
      'Travail, commerce',
      'Famille (hors violences)',
    ],
    excluded: ['Droit pénal'],
    // Mediators are reached through mediation centres, not individually nor through a
    // point-justice (#124, feedback of 13 Oct 2026). TO VALIDATE (#120).
    access:
      'Adressez-vous directement à un centre ou une association de médiation : il vous met en relation avec l’un de ses médiateurs. Chaque cour d’appel publie aussi une liste de médiateurs. Pendant un procès, le juge peut en désigner un, avec votre accord.',
    amicable: true,
    free: false,
    cost: 'Payant : honoraires fixés avec les parties et partagés à parts égales sauf accord ou décision du juge ; l’aide juridictionnelle peut prendre en charge une médiation ordonnée par le juge',
    agreement:
      'Accord écrit, que le juge peut homologuer à la demande des parties (force exécutoire)',
    conflictTypes: ['voisinage', 'logement', 'argent-particuliers', 'travail'],
    contact: {
      url: 'https://www.cours-appel.justice.fr/saint-denis/acces-au-droit-la-reunion',
    },
    sources: [SOURCES.mediateur],
  },
  {
    slug: 'mediation-familiale',
    name: 'Médiateur familial',
    family: 'mediation',
    description:
      'Un médiateur familial diplômé aide à renouer le dialogue et à trouver des solutions pour les enfants, l’argent, une succession ou les liens familiaux. Il n’a aucun pouvoir de décision.',
    forYouIf:
      'Le conflit est familial (séparation, enfants, pension, héritage, grands-parents, parent âgé) et il n’y a pas de violences.',
    law: {
      text: 'Le médiateur familial est un professionnel qualifié, indépendant, impartial et tenu à la confidentialité. Le diplôme d’État de médiateur familial (DEMF) est défini par le code de l’action sociale et des familles ; il est exigé dans les services de médiation familiale financés par la Caf. Le juge aux affaires familiales peut proposer une médiation, ou enjoindre aux parents de rencontrer un médiateur familial pour un entretien d’information ; ne pas s’y rendre sans motif légitime expose à une amende civile de 10 000 € au plus. La médiation n’est pas possible en cas de violences d’un parent sur l’autre ou sur l’enfant.',
      references: [
        'Code civil, art. 255 et 373-2-10',
        'Code de l’action sociale et des familles, art. R451-66 à R451-72',
        'Code de procédure civile, art. 1530 et suivants',
      ],
    },
    disputes: [
      'Séparation ou divorce : autorité parentale, résidence des enfants, droit de visite, pension, partage des biens',
      'Liens entre grands-parents et petits-enfants',
      'Succession entre héritiers',
      'Relations familiales difficiles, par exemple avec un parent âgé',
    ],
    excluded: ['Violences d’un parent sur l’autre ou sur l’enfant'],
    access:
      'Contactez un service de médiation familiale (Caf, association conventionnée) ou un médiateur familial diplômé. Le juge peut aussi vous y orienter.',
    amicable: true,
    free: false,
    cost: 'Entretien d’information gratuit ; ensuite, en service financé par la Caf, de 2 € à 131 € par séance et par personne selon vos revenus ; l’aide juridictionnelle peut couvrir une médiation ordonnée par le juge',
    agreement:
      'Accord écrit, que le juge aux affaires familiales peut homologuer (force exécutoire)',
    conflictTypes: ['famille'],
    contact: { url: SOURCES.caf.href },
    sources: [SOURCES.mediationFamiliale, SOURCES.caf],
  },
  {
    slug: 'mediateur-consommation',
    name: 'Médiateur de la consommation',
    family: 'mediation',
    description:
      'Gratuit pour vous : le professionnel doit indiquer son médiateur (site, conditions générales, contrat). Il propose une solution, que chacun reste libre d’accepter.',
    forYouIf:
      'Vous êtes un particulier en litige avec un professionnel (achat, livraison, réparation, abonnement…) et votre réclamation écrite n’a rien donné.',
    law: {
      text: 'Tout professionnel doit permettre à ses clients de recourir gratuitement à un médiateur de la consommation et leur indiquer ses coordonnées. Le médiateur doit être référencé par la commission d’évaluation et de contrôle de la médiation de la consommation (CECMC). On ne peut le saisir qu’après une réclamation écrite au professionnel, dans l’année qui suit, si le litige n’a pas déjà été examiné par un autre médiateur ou un juge. Il propose une solution dans les 90 jours. Une clause qui obligerait le consommateur à passer par la médiation avant le juge est interdite.',
      references: ['Code de la consommation, art. L611-1 à L616-3'],
    },
    excluded: [
      'Litiges entre professionnels',
      'Services de santé, enseignement supérieur public',
      'Action engagée par le professionnel contre le consommateur',
    ],
    access:
      'Réclamez d’abord par écrit au professionnel. Sans réponse satisfaisante, saisissez le médiateur qu’il indique, en ligne ou par courrier, dans l’année.',
    amicable: true,
    free: true,
    cost: 'Gratuit pour le consommateur',
    agreement: 'Une proposition de solution, libre à chacun de l’accepter',
    conflictTypes: ['consommation'],
    contact: { url: SOURCES.dgccrf.href },
    sources: [SOURCES.consommation, SOURCES.dgccrf],
  },
  {
    slug: 'mediateurs-de-secteur',
    name: 'Médiateurs publics de secteur',
    family: 'mediation',
    description:
      'Dans certains secteurs, un médiateur public traite les litiges des consommateurs : énergie, eau, communications électroniques, assurance, tourisme et voyage. Il existe aussi un médiateur bancaire, un médiateur SNCF Voyageurs, et des médiateurs des notaires et des avocats.',
    forYouIf:
      'Votre litige concerne l’électricité, le gaz, l’eau, votre opérateur téléphone ou internet, une assurance, une banque, un voyage ou un train.',
    law: {
      text: 'Ces médiateurs sont des médiateurs de la consommation propres à un secteur. Ils interviennent gratuitement après une réclamation au service client du professionnel. Le médiateur national de l’énergie, par exemple, est créé par la loi et recommande des solutions aux litiges avec les fournisseurs d’électricité et de gaz.',
      references: [
        'Code de la consommation, art. L611-1 à L616-3',
        'Code de l’énergie, art. L122-1',
      ],
    },
    access:
      'Réclamez d’abord au service client. Les coordonnées du médiateur figurent sur votre contrat ou vos factures.',
    amicable: true,
    free: true,
    cost: 'Gratuit',
    agreement: 'Une proposition de solution, libre à chacun de l’accepter',
    conflictTypes: ['consommation'],
    sources: [SOURCES.consommation],
  },
  {
    slug: 'mediateurs-des-administrations',
    name: 'Médiateurs des administrations',
    family: 'mediation',
    description:
      'De nombreux organismes publics ont leur médiateur : Caf, Assurance maladie, France Travail, ministères économiques et financiers (impôts)… Il ne décide pas à la place du service, mais peut obtenir le réexamen de votre dossier.',
    forYouIf:
      'Vous êtes en désaccord avec une décision d’un organisme (Caf, Assurance maladie, France Travail, impôts…) et votre réclamation n’a rien donné.',
    law: {
      text: 'Ces médiateurs interviennent gratuitement, après une réclamation restée sans solution, et seulement si aucun recours en justice n’est engagé. Ils ne remplacent pas les commissions de recours amiable. France Travail, par exemple, a un médiateur prévu par la loi.',
      references: ['Code du travail, art. L5312-12-1 (médiateur de France Travail)'],
    },
    access: 'Sur le site de l’organisme, rubrique « médiateur », après votre réclamation.',
    amicable: true,
    free: true,
    cost: 'Gratuit',
    agreement: 'Une révision du dossier ou une meilleure explication ; il ne décide pas',
    conflictTypes: ['administration'],
  },
  {
    slug: 'mediateur-education',
    name: 'Médiateur de l’éducation nationale',
    family: 'mediation',
    description:
      'Le médiateur de l’éducation nationale et de l’enseignement supérieur, et le médiateur de votre académie, cherchent une solution amiable aux désaccords avec l’administration de l’éducation, de la maternelle à l’université.',
    forYouIf:
      'Vous êtes élève, parent, étudiant ou membre du personnel, en désaccord avec une décision d’un établissement, du rectorat ou d’une université, ou en conflit avec un membre de la communauté éducative.',
    law: {
      text: 'Il faut d’abord contester la décision auprès de l’établissement ou du service qui l’a prise. Le recours est gratuit. Le médiateur contacte l’autre partie et propose une solution amiable, ou explique mieux la décision maintenue. Il ne peut pas remettre en cause une décision de justice, et ne traite ni ce qui est hors de l’éducation, ni la vie privée. Le saisir n’interrompt pas les délais de recours devant le juge.',
      references: ['Code de l’éducation, art. L23-10-1 et D222-37 à D222-42-1'],
    },
    access:
      'En ligne, sur le site du ministère de l’Éducation nationale, ou auprès du médiateur de l’académie de La Réunion.',
    amicable: true,
    free: true,
    cost: 'Gratuit',
    agreement: 'Une solution amiable ou une meilleure explication de la décision',
    conflictTypes: ['scolaire'],
    contact: { url: SOURCES.education.href },
    sources: [SOURCES.education],
  },
  {
    slug: 'mediation-administrative',
    name: 'Médiation administrative',
    family: 'mediation',
    description:
      'Une médiation avec une administration, organisée par les parties ou ordonnée par le tribunal administratif, avant ou pendant un procès.',
    forYouIf:
      'Votre désaccord avec une administration risque d’aller devant le tribunal administratif et vous voulez tenter un accord en protégeant vos délais de recours.',
    law: {
      text: 'Le médiateur est choisi par les parties ou désigné par la juridiction avec leur accord ; il agit avec compétence, impartialité, neutralité et diligence, et la médiation est confidentielle. Engagée avant de saisir le juge, elle interrompt les délais de recours et suspend les prescriptions. Les parties peuvent demander au juge d’homologuer leur accord. Pour certaines décisions concernant les agents publics, une médiation préalable est obligatoire.',
      references: ['Code de justice administrative, art. L213-1 à L213-14'],
    },
    access:
      'Demandez au président du tribunal administratif de désigner un médiateur, ou proposez une médiation à l’administration.',
    amicable: true,
    free: false,
    cost: 'Selon le médiateur ; gratuite quand la médiation préalable est obligatoire',
    agreement: 'Accord que le juge administratif peut homologuer',
    conflictTypes: ['administration', 'scolaire'],
    sources: [SOURCES.cjaMediation],
  },

  // ---- Other amicable recourse --------------------------------------------------------------
  {
    slug: 'defenseur-des-droits',
    name: 'Défenseur des droits',
    family: 'other',
    description:
      'Une autorité indépendante qui défend vos droits face aux services publics, lutte contre les discriminations et défend les droits de l’enfant. Ses délégués tiennent des permanences près de chez vous.',
    forYouIf:
      'Vous êtes en désaccord avec un service public, vous subissez une discrimination (travail, logement, école…), ou les droits d’un enfant ne sont pas respectés.',
    law: {
      text: 'Autorité indépendante créée par la loi organique. Il peut régler le litige à l’amiable, proposer une médiation ou faire des recommandations ; il ne peut pas remettre en cause une décision de justice. Il faut d’abord avoir fait une réclamation au service concerné. Le saisir n’interrompt pas et ne suspend pas les délais de recours.',
      references: [
        'Loi organique n° 2011-333 du 29 mars 2011',
        'Décret n° 2011-904 du 29 juillet 2011',
      ],
    },
    excluded: [
      'Litiges commerciaux avec une entreprise publique (voir son médiateur)',
      'Litiges entre une administration et ses agents, sauf discrimination',
    ],
    access:
      'En ligne, par courrier, ou sur rendez-vous avec un délégué territorial (permanences en préfecture, sous-préfecture, maison de justice et du droit).',
    amicable: true,
    free: true,
    cost: 'Gratuit',
    agreement:
      'Un règlement amiable ou une recommandation ; ce n’est pas une décision qui s’impose',
    conflictTypes: ['administration', 'travail', 'scolaire'],
    contact: { url: 'https://www.defenseurdesdroits.fr' },
    sources: [SOURCES.defenseur],
  },

  // ---- The judge -----------------------------------------------------------------------------
  {
    slug: 'tribunal',
    name: 'Saisir le juge',
    family: 'judge',
    description:
      'Un juge tranche le litige et sa décision s’impose. C’est plus long, et l’issue n’est plus entre vos mains. Pour de nombreux litiges, une tentative amiable est obligatoire avant.',
    forYouIf:
      'Le dialogue est impossible, la tentative amiable a échoué ou n’est pas obligatoire, ou il y a urgence.',
    law: {
      text: 'Devant le tribunal judiciaire, une tentative de conciliation, de médiation ou de procédure participative est obligatoire avant de demander une somme de 5 000 € ou moins, ou pour un trouble anormal de voisinage, un bornage, une servitude, la distance des plantations ou l’élagage. Sinon, la demande est irrecevable. Exceptions : urgence manifeste, aucun conciliateur disponible dans les 3 mois, demande d’homologation d’un accord, recours préalable obligatoire…',
      references: [
        'Code de procédure civile, art. 750-1',
        'Code de l’organisation judiciaire, art. R211-3-4 et R211-3-8',
      ],
    },
    access:
      'Selon le litige : tribunal judiciaire (dont le juge aux affaires familiales), conseil de prud’hommes, tribunal administratif. Au tribunal judiciaire, l’avocat est en principe obligatoire au-delà de 10 000 €.',
    amicable: false,
    free: false,
    cost: 'Frais possibles (avocat, commissaire de justice, expertise) ; aide juridictionnelle selon vos revenus',
    agreement: 'Un jugement qui s’impose aux parties',
    contact: { url: 'https://www.justice.fr' },
    sources: [SOURCES.mediateur, SOURCES.conciliateur],
  },
]

/** Free information before choosing (#94): shown on every result of the simulation. */
export const freeInformationData = {
  title: 'Être informé gratuitement près de chez vous',
  text: 'Les points-justice vous informent gratuitement sur vos droits et vous orientent vers la bonne démarche ; on y rencontre souvent un conciliateur de justice. À La Réunion, ils sont coordonnés par le CDAD (conseil départemental de l’accès au droit).',
  link: {
    label: 'L’accès au droit à La Réunion (cour d’appel de Saint-Denis)',
    href: 'https://www.cours-appel.justice.fr/saint-denis/acces-au-droit-la-reunion',
  },
}
