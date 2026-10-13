import type { ChecklistItem, GuideInput, KeyFigure, Route } from './schema'

// Content of /demarches (see src/shared/README.md). Field names in English, content in French.
// Facts checked against official sources in October 2026 (listed with each entry); to be
// proofread by the legal / content team before the demo.

const INFOSTAT = {
  label: 'Ministère de la Justice, Infostat Justice n° 201 (août 2025), données 2023',
  href: 'https://www.justice.gouv.fr/sites/default/files/2025-08/Infostat_Justice_201.pdf',
}
const JUSTICE_CONCILIATEUR = {
  label: 'justice.fr : le conciliateur de justice',
  href: 'https://www.justice.fr/fiche/conciliateur-justice',
}
const JUSTICE_MEDIATEUR = {
  label: 'justice.fr : le médiateur civil',
  href: 'https://www.justice.fr/fiche/mediateur-civil',
}
const DGCCRF_CONSO = {
  label: 'DGCCRF : la médiation de la consommation',
  href: 'https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques-et-les-faq/la-mediation-de-la-consommation-ce-que-vous-devez-savoir',
}
const SP_MEDIATION_FAMILIALE = {
  label: 'service-public.gouv.fr : la médiation familiale',
  href: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F34355',
}
const CAF_MEDIATION_FAMILIALE = {
  label: 'Caf : la médiation familiale et son barème',
  href: 'https://caf.fr/professionnels/offres-et-services/dispositifs-partenaires/mediation-familiale',
}

export const keyFiguresData: KeyFigure[] = [
  {
    slug: 'saisines',
    value: '189 790',
    label: 'demandes traitées par les conciliateurs de justice en une année',
    source: INFOSTAT,
  },
  {
    slug: 'accords',
    value: '48 %',
    label: 'des demandes faites directement à un conciliateur se terminent par un accord',
    source: INFOSTAT,
  },
  {
    slug: 'conciliateurs',
    value: '2 888',
    label: 'conciliateurs de justice bénévoles partout en France',
    source: INFOSTAT,
  },
  {
    slug: 'gratuit',
    value: '0 €',
    label: 'pour rencontrer un conciliateur de justice',
    source: JUSTICE_CONCILIATEUR,
  },
]

export const routesData: Route[] = [
  {
    slug: 'discussion',
    name: 'En parler directement',
    amicable: true,
    helper: 'Personne : vous discutez entre vous',
    cost: 'Gratuit',
    decides: 'Vous deux',
    duration: 'Quelques jours',
    outcome: 'Un accord écrit et signé engage les deux parties',
  },
  {
    slug: 'conciliation',
    name: 'Conciliation',
    amicable: true,
    helper: 'Un conciliateur de justice, bénévole et neutre',
    cost: 'Gratuit',
    decides: 'Vous deux (le conciliateur peut proposer des solutions)',
    duration: 'Quelques semaines en général',
    outcome: 'Un constat d’accord signé, que le juge peut rendre exécutoire',
  },
  {
    slug: 'mediation',
    name: 'Médiation',
    amicable: true,
    helper: 'Un médiateur formé, neutre et tenu à la confidentialité',
    cost: 'Payant, partagé entre les parties (aide juridictionnelle possible si le juge l’ordonne)',
    decides: 'Vous deux',
    duration: '5 mois au plus si le juge l’ordonne (renouvelable 3 mois)',
    outcome: 'Un accord que le juge peut homologuer : il vaut alors un jugement',
  },
  {
    slug: 'mediation-consommation',
    name: 'Médiation de la consommation',
    amicable: true,
    helper: 'Le médiateur désigné par le professionnel',
    cost: 'Gratuit pour le consommateur',
    decides: 'Vous deux : le médiateur propose une solution, libre à chacun de l’accepter',
    duration: '90 jours au plus après la recevabilité',
    outcome: 'La solution acceptée engage les deux parties',
  },
  {
    slug: 'juge',
    name: 'Saisir le juge',
    amicable: false,
    helper: 'Un juge, éventuellement un avocat',
    cost: 'Frais possibles (avocat, commissaire de justice, expertise)',
    decides: 'Le juge',
    duration: 'Plusieurs mois, parfois plus',
    outcome: 'Un jugement qui s’impose, même s’il ne vous satisfait pas',
  },
]

export const guidesData: GuideInput[] = [
  {
    slug: 'conciliateur',
    title: 'Saisir un conciliateur de justice',
    when: 'Pour un litige du quotidien : voisinage, logement, consommation, argent entre particuliers.',
    steps: [
      {
        title: 'Tentez d’abord le dialogue',
        text: 'Parlez-en calmement, puis écrivez un courrier qui résume le problème et ce que vous proposez. Gardez-en une copie.',
      },
      {
        title: 'Trouvez une permanence',
        text: 'Sur conciliateurs.fr, cherchez un conciliateur près de chez vous, du lieu du litige ou de l’autre partie. Les permanences ont lieu en mairie, au tribunal ou dans une maison de justice.',
      },
      {
        title: 'Faites votre demande',
        text: 'Par téléphone, en ligne ou par courrier. Expliquez les faits en quelques lignes et joignez vos justificatifs (photos, courriers, factures).',
      },
      {
        title: 'Le rendez-vous',
        text: 'Chacun s’exprime, accompagné s’il le souhaite. Le conciliateur peut recevoir les parties ensemble ou séparément, et se rendre sur place avec leur accord.',
      },
      {
        title: 'L’issue',
        text: 'En cas d’accord, un constat d’accord est signé et chacun en reçoit un exemplaire. Sinon, vous pouvez saisir le juge : la tentative compte comme tentative amiable.',
      },
    ],
    good: [
      'C’est gratuit et sans limite de montant.',
      'Le conciliateur ne traite pas les affaires familiales (pension, garde des enfants), l’état civil, le pénal ni les conflits avec l’administration.',
    ],
    sources: [JUSTICE_CONCILIATEUR],
  },
  {
    slug: 'mediateur-consommation',
    title: 'Saisir le médiateur de la consommation',
    when: 'Pour un litige avec un professionnel : achat, livraison, réparation, abonnement…',
    steps: [
      {
        title: 'Réclamez par écrit au professionnel',
        text: 'Écrivez au service client en décrivant le problème et ce que vous demandez. Sans cette réclamation écrite, le médiateur ne peut pas être saisi.',
      },
      {
        title: 'Trouvez le médiateur',
        text: 'Le professionnel doit indiquer son médiateur sur son site, dans ses conditions générales ou sur le contrat. La liste des médiateurs est aussi publiée par le ministère de l’Économie.',
      },
      {
        title: 'Saisissez-le dans l’année',
        text: 'Vous avez un an à partir de votre réclamation écrite. Joignez la réclamation, la réponse éventuelle et vos justificatifs.',
      },
      {
        title: 'Attendez sa proposition',
        text: 'Le médiateur vérifie d’abord que la demande est recevable (3 semaines), puis il a 90 jours pour proposer une solution.',
      },
      {
        title: 'Acceptez ou refusez',
        text: 'Chacun reste libre. Une solution acceptée engage les deux parties ; en cas de refus, vous pouvez encore saisir le juge.',
      },
    ],
    good: [
      'Gratuit pour vous : le professionnel paie la médiation.',
      'La médiation suspend le délai pour agir en justice pendant toute sa durée.',
    ],
    sources: [DGCCRF_CONSO],
  },
  {
    slug: 'mediation',
    title: 'Recourir à une médiation',
    when: 'Quand la relation compte (voisins, famille élargie, associés) et que le dialogue est rompu.',
    steps: [
      {
        title: 'Proposez la médiation',
        text: 'Par écrit, proposez à l’autre partie de rencontrer un médiateur. Le juge peut aussi l’ordonner, même sans votre accord.',
      },
      {
        title: 'Choisissez un médiateur',
        text: 'Chaque cour d’appel publie une liste de médiateurs. Vérifiez sa formation et ses tarifs avant de vous engager.',
      },
      {
        title: 'Rencontrez-le',
        text: 'Un premier entretien explique le déroulement. Les échanges sont confidentiels : rien de ce qui est dit ne peut être utilisé ensuite devant le juge.',
      },
      {
        title: 'Construisez l’accord',
        text: 'Le médiateur ne tranche pas : il vous aide à trouver vous-mêmes une solution que chacun peut accepter.',
      },
      {
        title: 'Faites-le homologuer',
        text: 'L’accord écrit peut être homologué par le juge : il a alors la même force qu’un jugement.',
      },
    ],
    good: [
      'Le médiateur fixe ses honoraires, partagés entre les parties. Si le juge ordonne la médiation, l’aide juridictionnelle peut la prendre en charge.',
      'Médiation ordonnée par le juge : 5 mois au plus, renouvelable une fois 3 mois.',
    ],
    sources: [JUSTICE_MEDIATEUR, SP_MEDIATION_FAMILIALE],
  },
  {
    slug: 'mediation-familiale',
    title: 'Recourir à la médiation familiale',
    when: 'Séparation, organisation pour les enfants, pension, succession, relations avec les grands-parents.',
    steps: [
      {
        title: 'Trouvez un service',
        text: 'Contactez la Caf de votre département ou une association de médiation familiale conventionnée.',
      },
      {
        title: 'L’entretien d’information',
        text: 'Gratuit, il vous présente la médiation. Vous décidez ensuite de vous engager ou non.',
      },
      {
        title: 'Les séances',
        text: 'Des entretiens d’environ 1 h 30 à 2 h, souvent 6 au plus, avec un médiateur familial diplômé.',
      },
      {
        title: 'L’accord',
        text: 'Les décisions prises ensemble peuvent être écrites puis homologuées par le juge aux affaires familiales.',
      },
    ],
    good: [
      'Le prix dépend de vos revenus : de 2 € à 131 € par séance et par personne avec le barème de la Caf.',
      'La médiation familiale n’est pas proposée en cas de violences.',
    ],
    sources: [SP_MEDIATION_FAMILIALE, CAF_MEDIATION_FAMILIALE],
  },
]

export const checklistData: ChecklistItem[] = [
  {
    slug: 'faits',
    label: 'J’ai résumé les faits en quelques lignes, avec les dates',
    help: 'Ce qui s’est passé, depuis quand, combien de fois.',
  },
  {
    slug: 'preuves',
    label: 'J’ai rassemblé mes justificatifs',
    help: 'Photos, courriers, courriels, factures, attestations de témoins.',
  },
  {
    slug: 'demande',
    label: 'Je sais ce que je demande',
    help: 'Une somme, un geste, un horaire : une demande précise est plus facile à accepter.',
  },
  {
    slug: 'concessions',
    label: 'J’ai réfléchi à ce que je peux accepter',
    help: 'Ce sur quoi je peux céder, et ce qui compte vraiment pour moi.',
  },
  {
    slug: 'autre-partie',
    label: 'J’ai pensé au point de vue de l’autre partie',
    help: 'Ses contraintes, ce qui pourrait l’aider à dire oui.',
  },
  {
    slug: 'trace',
    label: 'Je garde une trace de ma démarche',
    help: 'Copies de mes courriers et preuve du rendez-vous : elles prouvent la tentative amiable.',
  },
]
