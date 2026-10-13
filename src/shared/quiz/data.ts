import type { QuizInput } from './schema'

// Field names in English, content in French (shown to users). See src/shared/README.md.
// Facts checked against justice.fr, service-public.gouv.fr and the DGCCRF (October 2026).
export const quizzesData: QuizInput[] = [
  {
    slug: 'bases',
    title: 'Les bases de l’amiable',
    description: 'Sept questions pour savoir comment régler un litige sans aller devant le juge.',
    questions: [
      {
        id: 'cout-conciliateur',
        prompt: 'Combien coûte un rendez-vous avec un conciliateur de justice ?',
        choices: [
          { id: 'gratuit', label: 'Rien, c’est gratuit' },
          { id: '50', label: '50 €' },
          { id: 'revenus', label: 'Cela dépend de vos revenus' },
        ],
        correctChoiceIds: ['gratuit'],
        explanation:
          'Le conciliateur de justice est un bénévole : la conciliation est gratuite, sans limite de montant pour le litige.',
        glossary: ['conciliateur-de-justice'],
      },
      {
        id: 'qui-decide',
        prompt: 'En conciliation ou en médiation, qui décide de la solution ?',
        choices: [
          { id: 'parties', label: 'Les parties elles-mêmes' },
          { id: 'tiers', label: 'Le conciliateur ou le médiateur' },
          { id: 'juge', label: 'Le juge' },
        ],
        correctChoiceIds: ['parties'],
        explanation:
          'Le tiers est neutre : il aide à trouver un accord mais ne tranche pas. Rien n’est imposé, chacun reste libre d’accepter.',
        glossary: ['conciliation', 'mediation'],
      },
      {
        id: 'obligatoire',
        prompt: 'Pour quels litiges faut-il tenter l’amiable avant de saisir le juge ?',
        choices: [
          { id: 'somme', label: 'Une demande de paiement de 5 000 € ou moins' },
          { id: 'voisinage', label: 'Un trouble anormal de voisinage' },
          { id: 'penal', label: 'Une infraction pénale' },
        ],
        correctChoiceIds: ['somme', 'voisinage'],
        explanation:
          'Pour ces litiges, la tentative amiable est obligatoire, sinon la demande peut être irrecevable (article 750-1 du code de procédure civile). Le pénal ne se règle pas devant un conciliateur.',
        glossary: ['tentative-amiable-prealable', 'irrecevable'],
      },
      {
        id: 'force-accord',
        prompt: 'Un accord trouvé en médiation peut-il avoir la force d’un jugement ?',
        choices: [
          { id: 'homologue', label: 'Oui, s’il est homologué par un juge' },
          { id: 'jamais', label: 'Non, jamais' },
          { id: 'automatique', label: 'Oui, dès qu’il est signé' },
        ],
        correctChoiceIds: ['homologue'],
        explanation:
          'Signé, l’accord engage les parties. À leur demande, le juge peut l’homologuer, après une médiation comme après une conciliation : il a alors force exécutoire, comme un jugement.',
        glossary: ['homologation', 'force-executoire'],
      },
      {
        id: 'conciliateur-ou-mediateur',
        prompt: 'Quelle différence entre le conciliateur de justice et le médiateur ?',
        choices: [
          { id: 'cout', label: 'Le conciliateur est gratuit, le médiateur est en général payant' },
          {
            id: 'propose',
            label:
              'Le conciliateur peut proposer des solutions, le médiateur aide les parties à construire la leur',
          },
          { id: 'tranche', label: 'Le médiateur tranche le litige comme un juge' },
        ],
        correctChoiceIds: ['cout', 'propose'],
        explanation:
          'Les deux sont neutres et ne tranchent pas. Le conciliateur, bénévole, est gratuit ; le médiateur, professionnel, est payé par les parties, en général à parts égales. Si le juge désigne un médiateur, c’est avec l’accord des parties, et l’aide juridictionnelle peut le prendre en charge.',
        glossary: ['conciliateur-de-justice', 'mediateur'],
      },
      {
        id: 'confidentiel',
        prompt: 'Ce qui est dit pendant une médiation…',
        choices: [
          { id: 'confidentiel', label: 'reste confidentiel' },
          { id: 'juge', label: 'peut être rapporté au juge' },
          { id: 'public', label: 'est rendu public' },
        ],
        correctChoiceIds: ['confidentiel'],
        explanation:
          'La confidentialité permet de parler librement : en principe, rien de ce qui est dit ne peut être utilisé ensuite devant le juge.',
        glossary: ['mediation'],
      },
      {
        id: 'mediateur-conso',
        prompt: 'Le médiateur de la consommation…',
        choices: [
          { id: 'gratuit', label: 'est gratuit pour le consommateur' },
          { id: 'reclamation', label: 'se saisit après une réclamation écrite au professionnel' },
          { id: 'paye', label: 'est payé par le consommateur' },
          { id: 'raison', label: 'doit donner raison au client' },
        ],
        correctChoiceIds: ['gratuit', 'reclamation'],
        explanation:
          'Le professionnel paie la médiation. Le médiateur, neutre, propose une solution dans les 90 jours : chacun reste libre de l’accepter.',
        glossary: ['mediateur-de-la-consommation'],
      },
    ],
  },
  {
    slug: 'bien-reagir',
    title: 'Bien réagir dans un conflit',
    description: 'Cinq situations du quotidien : quel est le bon réflexe ?',
    questions: [
      {
        id: 'premier-reflexe',
        prompt: 'Votre voisin fait du bruit chaque soir. Quel est le premier réflexe ?',
        choices: [
          { id: 'parler', label: 'Lui en parler calmement' },
          { id: 'police', label: 'Appeler la police' },
          { id: 'plafond', label: 'Taper au plafond' },
        ],
        correctChoiceIds: ['parler'],
        explanation:
          'Beaucoup de voisins ne se rendent pas compte du bruit qu’ils font. En parler, à tête reposée, règle souvent le problème et préserve la relation.',
        glossary: ['trouble-anormal-de-voisinage'],
      },
      {
        id: 'par-ecrit',
        prompt: 'Pourquoi confirmer par écrit ce qui a été dit à l’oral ?',
        choices: [
          { id: 'preuve', label: 'Pour garder une preuve' },
          { id: 'malentendus', label: 'Pour éviter les malentendus' },
          { id: 'obligatoire', label: 'Parce que parler à son voisin sans écrit est interdit' },
        ],
        correctChoiceIds: ['preuve', 'malentendus'],
        explanation:
          'Un écrit daté prouve votre démarche, utile si la tentative amiable doit être démontrée, et fixe ce que chacun a accepté.',
      },
      {
        id: 'phrase',
        prompt: 'Quelle phrase a le plus de chances d’apaiser la situation ?',
        choices: [
          {
            id: 'besoin',
            label:
              '« Je n’arrive plus à dormir depuis deux semaines. Pourrait-on trouver une solution ? »',
          },
          { id: 'reproche', label: '« Vous êtes vraiment sans-gêne. »' },
          { id: 'menace', label: '« Si ça continue, j’appelle mon avocat. »' },
        ],
        correctChoiceIds: ['besoin'],
        explanation:
          'Parler de ce que vous vivez et de votre besoin, plutôt que juger l’autre, l’aide à entendre le problème sans se défendre.',
      },
      {
        id: 'colis',
        prompt: 'Un colis indiqué « livré » n’est jamais arrivé. Qui en est responsable ?',
        choices: [
          { id: 'vendeur', label: 'Le vendeur, tant que vous n’avez pas le colis en main' },
          { id: 'transporteur', label: 'Le transporteur uniquement' },
          { id: 'vous', label: 'Vous, puisque c’est marqué « livré »' },
        ],
        correctChoiceIds: ['vendeur'],
        explanation:
          'Le vendeur porte le risque jusqu’à ce que vous preniez possession du bien (article L. 216-4 du code de la consommation). Réclamez-lui par écrit, puis saisissez son médiateur si besoin.',
        glossary: ['mediateur-de-la-consommation'],
      },
      {
        id: 'delai',
        prompt:
          'En général, combien de temps avez-vous pour agir en justice dans un litige civil ?',
        choices: [
          { id: '5-ans', label: '5 ans' },
          { id: '1-an', label: '1 an' },
          { id: '30-ans', label: '30 ans' },
        ],
        correctChoiceIds: ['5-ans'],
        explanation:
          'C’est le délai de prescription de droit commun (article 2224 du code civil). Une conciliation ou une médiation le suspend pendant sa durée.',
        glossary: ['prescription'],
      },
    ],
  },
]
