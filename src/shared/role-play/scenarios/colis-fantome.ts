import type { ScenarioInput } from '../schema'

// Level 2, complainant: a consumer dispute with an online shop.
// Legal references: the seller bears the risk until the consumer takes physical possession of
// the goods (art. L. 216-4 du code de la consommation); consumer mediation: written complaint
// first, free for the consumer, 90 days, proposal free to accept (DGCCRF); claims of 5,000 € or
// less need an amicable attempt before court (art. 750-1 CPC). To be proofread before the demo.
export const colisFantome: ScenarioInput = {
  slug: 'colis-fantome',
  title: 'Le colis fantôme',
  summary:
    'Votre ordinateur est « livré »… mais vous n’avez rien reçu. Le vendeur ne veut rien savoir.',
  level: 2,
  perspective: 'complainant',
  intro:
    'Vous êtes Sam. Vous avez commandé un ordinateur portable à 649 € sur un site marchand. Le suivi indique « livré », mais aucun colis n’est arrivé. À vous de récupérer votre argent sans y laisser vos nerfs.',
  characters: [
    { id: 'sam', name: 'Sam', role: 'Vous, client(e)', avatar: 'player' },
    { id: 'lea', name: 'Léa', role: 'Conseillère du service client', avatar: 'clerk' },
    {
      id: 'benali',
      name: 'M. Benali',
      role: 'Médiateur de la consommation',
      avatar: 'mediator',
    },
  ],
  startSceneId: 'livre',
  scenes: [
    // ---- Scene 1 -----------------------------------------------------------------
    {
      id: 'livre',
      setting: 'Chez vous, un jeudi soir',
      location: 'new-home',
      period: 'evening',
      lines: [
        { text: 'Notification : « Votre colis a été livré. »', effect: 'phone' },
        {
          speaker: 'sam',
          text: 'Livré ? Je suis là depuis 17 h, personne n’a sonné. Rien dans la boîte aux lettres…',
          emotion: 'surprised',
        },
      ],
      choices: [
        {
          id: 'ecrire',
          label:
            'Contacter le service client par écrit (formulaire ou courriel), avec le numéro de commande',
          next: 'service-client',
          quality: 'good',
          action: 'letter',
          feedback:
            'Un écrit daté garde la trace de votre signalement. C’est la base de toutes les étapes suivantes.',
        },
        {
          id: 'appeler',
          label: 'Appeler le service client',
          next: 'service-client',
          quality: 'ok',
          action: 'phone',
          feedback:
            'Appeler peut aller vite, mais un appel ne laisse pas de trace : confirmez toujours par écrit ce qui a été dit.',
          losses: { time: 1 },
        },
        {
          id: 'avis',
          label: 'Publier un avis furieux sur les réseaux sociaux',
          next: 'service-client',
          quality: 'bad',
          action: 'threaten',
          feedback:
            'Un avis public peut soulager, mais il ne règle rien et braque le vendeur. Commencez par une réclamation : c’est elle qui ouvre les recours.',
          losses: { health: 1, time: 1 },
        },
      ],
    },

    // ---- Scene 2 -----------------------------------------------------------------
    {
      id: 'service-client',
      setting: 'Au service client, le lendemain',
      location: 'shop',
      period: 'day',
      lines: [
        {
          speaker: 'lea',
          text: 'Le transporteur affirme avoir livré. Pour nous, la commande est terminée.',
        },
        { speaker: 'sam', text: 'Mais je n’ai rien reçu !', emotion: 'angry' },
        {
          speaker: 'lea',
          text: 'Je suis désolée, je ne peux rien faire de plus.',
          emotion: 'sad',
        },
      ],
      choices: [
        {
          id: 'reclamation',
          label:
            'Envoyer une réclamation écrite : le vendeur reste responsable tant que vous n’avez pas eu le colis en main',
          next: 'silence',
          quality: 'good',
          action: 'letter',
          feedback:
            'Bien vu : le vendeur porte le risque jusqu’à ce que vous preniez possession du bien (article L. 216-4 du code de la consommation). Une réclamation écrite est aussi indispensable pour saisir ensuite le médiateur de la consommation.',
        },
        {
          id: 'abandonner',
          label: 'Abandonner : tant pis pour les 649 €',
          next: 'fin-abandon',
          quality: 'bad',
          action: 'wait',
          feedback:
            'Abandonner, c’est perdre une somme que la loi vous permet de récupérer. La médiation de la consommation est gratuite pour vous.',
          losses: { money: 649 },
        },
      ],
    },

    // ---- Scene 3 -----------------------------------------------------------------
    {
      id: 'silence',
      setting: 'Chez vous, trois semaines plus tard',
      location: 'new-home',
      period: 'day',
      lines: [
        { text: 'Trois semaines ont passé. Aucune réponse à votre réclamation.' },
        {
          speaker: 'sam',
          text: 'Dans les conditions générales de vente, il y a les coordonnées d’un médiateur de la consommation…',
        },
      ],
      choices: [
        {
          id: 'mediateur',
          label: 'Saisir le médiateur de la consommation, avec la réclamation et les preuves',
          next: 'mediation',
          quality: 'good',
          action: 'letter',
          feedback:
            'C’est la bonne porte : gratuit pour vous, et le médiateur doit proposer une solution dans les 90 jours. La [[mediation|médiation]] suspend aussi le délai pour agir en justice.',
          losses: { time: 1 },
        },
        {
          id: 'tribunal-direct',
          label: 'Saisir directement le tribunal',
          next: 'fin-irrecevable',
          quality: 'bad',
          action: 'court',
          feedback:
            'Pour une somme de 5 000 € ou moins, la loi impose une tentative amiable avant de saisir le juge (article 750-1 du code de procédure civile). Sans elle, votre demande risque d’être [[irrecevable]].',
          losses: { time: 6, money: 50 },
        },
      ],
    },

    // ---- Scene 4 -----------------------------------------------------------------
    {
      id: 'mediation',
      setting: 'Chez le médiateur de la consommation, deux mois plus tard',
      location: 'office',
      period: 'day',
      lines: [
        {
          speaker: 'benali',
          text: 'J’ai étudié votre dossier et la réponse du vendeur. Il ne prouve pas que le colis vous a été remis.',
        },
        {
          speaker: 'benali',
          text: 'Je propose le remboursement intégral sous 14 jours. Vous êtes libres, le vendeur et vous, d’accepter ou non.',
        },
      ],
      choices: [
        {
          id: 'accepter',
          label: 'Accepter la proposition',
          next: 'fin-rembourse',
          quality: 'good',
          action: 'agree',
          feedback:
            'La proposition règle tout le litige, gratuitement. Une fois acceptée par les deux, elle les engage.',
        },
        {
          id: 'refuser',
          label: 'Refuser et exiger 500 € de dommages et intérêts en plus',
          next: 'fin-tribunal',
          quality: 'bad',
          action: 'threaten',
          feedback:
            'Vous pouvez refuser, mais vous repartez de zéro devant le juge, pour une issue incertaine. La médiation vous offrait l’essentiel : votre argent.',
          losses: { time: 15, money: 100, health: 2 },
        },
      ],
    },

    // ---- Endings -------------------------------------------------------------------
    {
      id: 'fin-rembourse',
      location: 'new-home',
      period: 'day',
      lines: [
        {
          text: 'Le vendeur accepte. Dix jours plus tard, les 649 € sont sur votre compte.',
          effect: 'phone',
        },
        { speaker: 'sam', text: 'Et sans un euro de frais !', emotion: 'happy' },
      ],
      ending: { title: 'Remboursé grâce à la médiation' },
    },
    {
      id: 'fin-abandon',
      location: 'new-home',
      period: 'evening',
      lines: [
        { text: 'Vous rachetez un ordinateur ailleurs. Les 649 € sont perdus.', emotion: 'sad' },
      ],
      ending: { title: 'Abandon' },
    },
    {
      id: 'fin-irrecevable',
      location: 'courthouse',
      period: 'day',
      lines: [
        {
          text: 'Le juge relève que vous n’avez fait aucune tentative de conciliation ou de médiation. Votre demande est déclarée irrecevable : tout est à refaire.',
          effect: 'paper',
        },
      ],
      ending: { title: 'Demande irrecevable' },
    },
    {
      id: 'fin-tribunal',
      location: 'courthouse',
      period: 'day',
      lines: [
        {
          text: 'Des mois plus tard, le juge vous accorde le remboursement… mais pas les dommages et intérêts, faute de préjudice prouvé.',
          effect: 'paper',
        },
      ],
      ending: { title: 'Remboursé, mais bien plus tard' },
    },
  ],
}
