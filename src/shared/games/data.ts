import type { RephraseRoundInput, WhoStatementInput } from './schema'

// Rounds of "Désamorcer" (night work #80): turn what you feel like saying into a request the
// other person can hear. The non-violent reply follows the four steps of non-violent
// communication: a fact, a feeling, a need, a precise request. Content in French.
export const rephraseRoundsData: RephraseRoundInput[] = [
  {
    slug: 'musique',
    situation: 'Votre voisin écoute de la musique fort, tard le soir, depuis une semaine.',
    impulse: 'Vous êtes vraiment sans-gêne avec votre musique !',
    other: 'neighbor',
    location: 'landing',
    replies: [
      {
        id: 'cnv',
        kind: 'nvc',
        text: 'Depuis lundi, j’entends votre musique après minuit. Je suis épuisée, je me lève à 6 h. Pourriez-vous baisser le son après 22 h ?',
      },
      {
        id: 'jugement',
        kind: 'judgement',
        text: 'Tout l’immeuble pense que vous êtes un égoïste.',
      },
      { id: 'menace', kind: 'threat', text: 'La prochaine fois, j’appelle directement la police.' },
    ],
    explanation:
      'Un fait daté (« depuis lundi, après minuit »), ce que vous ressentez (« épuisée »), votre besoin (dormir) et une demande précise (« baisser le son après 22 h ») : votre voisin sait exactement quoi faire, sans se sentir accusé.',
  },
  {
    slug: 'vaisselle',
    situation: 'En colocation, la vaisselle s’entasse et c’est toujours vous qui la faites.',
    impulse: 'Tu ne fais jamais rien ici !',
    other: 'relative',
    location: 'new-home',
    replies: [
      { id: 'jugement', kind: 'judgement', text: 'Tu es vraiment flemmard.' },
      {
        id: 'cnv',
        kind: 'nvc',
        text: 'Cette semaine, la vaisselle est restée trois jours dans l’évier. Ça m’agace, j’ai besoin d’une cuisine propre pour cuisiner. On fait un planning ensemble ?',
      },
      {
        id: 'evitement',
        kind: 'avoidance',
        text: 'Laisse tomber, je ferai tout moi-même, comme d’habitude.',
      },
    ],
    explanation:
      '« Jamais » et « toujours » sont des généralisations qui appellent un contre-exemple. Un fait précis et une proposition concrète (un planning) ouvrent une discussion au lieu d’un reproche.',
  },
  {
    slug: 'commande',
    situation: 'Votre commande de 649 € n’est jamais arrivée et le service client ne répond plus.',
    impulse: 'Votre service client est nul, vous m’arnaquez !',
    other: 'professional',
    location: 'new-home',
    replies: [
      {
        id: 'menace',
        kind: 'threat',
        text: 'Je vais vous détruire sur les réseaux sociaux.',
      },
      { id: 'jugement', kind: 'judgement', text: 'Vous êtes des voleurs.' },
      {
        id: 'cnv',
        kind: 'nvc',
        text: 'J’ai commandé le 2 mars et je n’ai rien reçu, malgré trois relances. Je suis inquiet pour mes 649 €. Pouvez-vous me rembourser sous 8 jours ?',
      },
    ],
    explanation:
      'Des faits vérifiables (date, relances, montant) et un délai précis rendent votre demande sérieuse. C’est aussi la base de la réclamation écrite, nécessaire pour saisir ensuite le médiateur de la consommation.',
  },
  {
    slug: 'depot',
    situation: 'Votre ancien propriétaire veut garder tout le dépôt de garantie pour des rayures.',
    impulse: 'Vous voulez juste garder mon argent, c’est du vol.',
    other: 'professional',
    location: 'lobby',
    replies: [
      {
        id: 'cnv',
        kind: 'nvc',
        text: 'Pour moi, ces rayures étaient là à mon arrivée. Je suis inquiète, j’ai besoin de cette somme pour mon nouveau loyer. Pouvons-nous comparer les deux états des lieux ensemble ?',
      },
      {
        id: 'evitement',
        kind: 'avoidance',
        text: 'Gardez-le, je ne veux plus jamais avoir affaire à vous.',
      },
      { id: 'jugement', kind: 'judgement', text: 'Tous les propriétaires sont des escrocs.' },
    ],
    explanation:
      'Proposer de vérifier ensemble (les états des lieux) déplace la discussion des accusations vers les preuves. Et abandonner, c’est renoncer à une somme que la loi vous permet souvent de récupérer.',
  },
  {
    slug: 'haie',
    situation: 'La haie de votre voisin dépasse sur votre jardin et cache le soleil.',
    impulse: 'Votre haie est une catastrophe, taillez-la !',
    other: 'neighbor',
    location: 'landing',
    replies: [
      { id: 'jugement', kind: 'judgement', text: 'Vous ne savez pas entretenir un jardin.' },
      {
        id: 'menace',
        kind: 'threat',
        text: 'Si vous ne faites rien, je la coupe moi-même ce week-end.',
      },
      {
        id: 'cnv',
        kind: 'nvc',
        text: 'Votre haie dépasse d’environ un mètre chez moi et cache le soleil de mon potager. J’aimerais en profiter cet été. Pourriez-vous la tailler d’ici fin mai ?',
      },
    ],
    explanation:
      'Couper vous-même les branches du voisin n’est pas permis : vous pouvez lui demander de les couper, et un juge peut l’y obliger. Une demande précise, avec une date, a bien plus de chances d’aboutir.',
  },
  {
    slug: 'heritage',
    situation: 'Votre frère propose de garder la maison de vos parents sans en avoir parlé.',
    impulse: 'Tu as toujours été le préféré, tu veux tout garder !',
    other: 'neighbor',
    location: 'new-home',
    replies: [
      {
        id: 'cnv',
        kind: 'nvc',
        text: 'Quand tu proposes de garder la maison sans qu’on en parle, je me sens mis de côté. J’ai besoin qu’on décide ensemble. Et si on voyait une médiatrice familiale ?',
      },
      {
        id: 'evitement',
        kind: 'avoidance',
        text: 'Fais ce que tu veux, je ne viendrai pas à la réunion.',
      },
      { id: 'jugement', kind: 'judgement', text: 'Tu es égoïste depuis qu’on est petits.' },
    ],
    explanation:
      'Parler de vous (« je me sens mis de côté ») plutôt que de lui (« tu es égoïste ») évite de rouvrir de vieilles blessures. Proposer une médiation familiale offre un cadre neutre pour décider ensemble.',
  },
  {
    slug: 'garage',
    situation: 'Une voiture est encore garée devant votre garage ce matin.',
    impulse: 'Encore garé devant mon garage, vous le faites exprès !',
    other: 'professional',
    location: 'lobby',
    replies: [
      { id: 'jugement', kind: 'judgement', text: 'Vous n’avez aucun respect pour les autres.' },
      {
        id: 'cnv',
        kind: 'nvc',
        text: 'Ce matin, votre voiture bloquait mon garage et je suis arrivé en retard au travail. J’ai besoin de pouvoir sortir. Pouvez-vous vous garer ailleurs à l’avenir ?',
      },
      {
        id: 'menace',
        kind: 'threat',
        text: 'La prochaine fois, je vous fais enlever par la fourrière.',
      },
    ],
    explanation:
      '« Vous le faites exprès » prête une intention : la personne va surtout se défendre. Décrire la conséquence concrète (« en retard au travail ») fait comprendre la gêne.',
  },
  {
    slug: 'chien',
    situation:
      'Le chien de votre voisine aboie quand elle n’est pas là, et vous travaillez chez vous.',
    impulse: 'Votre chien aboie toute la journée, c’est insupportable !',
    other: 'relative',
    location: 'stairwell',
    replies: [
      {
        id: 'evitement',
        kind: 'avoidance',
        text: 'Je ne dis rien, ça finira bien par s’arrêter.',
      },
      {
        id: 'cnv',
        kind: 'nvc',
        text: 'Votre chien aboie souvent le matin quand vous êtes absente, de 9 h à 12 h environ. Je travaille chez moi et j’ai besoin de calme. Pourrions-nous en parler pour trouver une solution ?',
      },
      { id: 'jugement', kind: 'judgement', text: 'Vous ne savez pas élever un chien.' },
    ],
    explanation:
      'Votre voisine ne peut pas savoir ce qui se passe en son absence : lui donner les horaires précis l’informe au lieu de l’accuser. Et se taire laisse la gêne s’accumuler jusqu’à l’explosion.',
  },
]

// Statements of "Qui fait quoi ?" (night work #80). Sources: justice.fr (conciliateur de
// justice, médiateur civil), service-public.gouv.fr; confidentiality of conventional
// conciliation and mediation: art. 1531 du code de procédure civile. To be proofread.
export const whoStatementsData: WhoStatementInput[] = [
  {
    slug: 'benevole',
    statement: 'Il est bénévole.',
    actors: ['conciliator'],
    explanation:
      'Le conciliateur de justice est un bénévole nommé par la justice. Le médiateur est un professionnel rémunéré, le juge un magistrat.',
  },
  {
    slug: 'tranche',
    statement: 'Il tranche le litige : sa décision s’impose aux parties.',
    actors: ['judge'],
    explanation:
      'Seul le juge décide à la place des parties. Le conciliateur et le médiateur aident à trouver un accord, mais ne tranchent pas.',
  },
  {
    slug: 'neutre',
    statement: 'Il est neutre et impartial.',
    actors: ['conciliator', 'mediator', 'judge'],
    explanation: 'Tous les trois : aucun ne prend parti pour l’une des parties.',
  },
  {
    slug: 'accord',
    statement: 'Il aide les parties à trouver elles-mêmes un accord.',
    actors: ['conciliator', 'mediator'],
    explanation:
      'C’est le principe de l’amiable : les parties gardent la main sur la solution, avec l’aide d’un tiers neutre.',
  },
  {
    slug: 'gratuit',
    statement: 'Le rencontrer ne coûte rien.',
    actors: ['conciliator'],
    explanation:
      'La conciliation est gratuite. La médiation est en général payante, partagée entre les parties (sauf la médiation de la consommation, gratuite pour le consommateur).',
  },
  {
    slug: 'confidentiel',
    statement: 'Ce qui se dit devant lui reste confidentiel.',
    actors: ['conciliator', 'mediator'],
    explanation:
      'La conciliation et la médiation sont confidentielles : ce qui s’y dit ne peut pas, en principe, être utilisé ensuite devant le juge. Une audience au tribunal, elle, est en général publique.',
  },
  {
    slug: 'homologue',
    statement: 'Il peut homologuer un accord pour lui donner la force d’un jugement.',
    actors: ['judge'],
    explanation:
      'L’homologation est faite par le juge, à la demande des parties, après une conciliation ou une médiation réussie.',
  },
  {
    slug: 'condamne',
    statement: 'Il peut condamner à payer des dommages et intérêts.',
    actors: ['judge'],
    explanation:
      'Condamner est le rôle du juge. Le conciliateur et le médiateur n’ont aucun pouvoir de sanction.',
  },
  {
    slug: 'mairie',
    statement: 'On le rencontre souvent en mairie ou dans une maison de justice.',
    actors: ['conciliator'],
    explanation:
      'Les conciliateurs tiennent des permanences en mairie, au tribunal ou en maison de justice. On les trouve sur conciliateurs.fr.',
  },
  {
    slug: 'ordonne',
    statement: 'Le juge peut lui confier le litige pendant un procès.',
    actors: ['conciliator', 'mediator'],
    explanation:
      'Pendant une procédure, le juge peut désigner un conciliateur ou ordonner une médiation, pour tenter un accord avant de juger.',
  },
]
