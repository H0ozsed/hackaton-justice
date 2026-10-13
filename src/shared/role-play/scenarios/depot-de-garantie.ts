import type { ScenarioInput } from '../schema'

// Level 3, mediator: the player leads a mediation between a former tenant and her landlord.
// The choices are mediation techniques: setting the frame (confidentiality, neutrality, equal
// speaking time), reformulation, open questions, needs behind positions, letting the parties
// build the solution, written agreement (that a judge can approve: homologation).
// Legal references: normal wear and tear (vétusté) cannot be charged to the tenant; the deposit
// is returned within one month (inventory matching) or two months (loi du 6 juillet 1989,
// art. 22). To be proofread by the content team before the demo.
export const depotDeGarantie: ScenarioInput = {
  slug: 'depot-de-garantie',
  title: 'La médiation du dépôt de garantie',
  summary:
    'Cette fois, vous êtes le médiateur. Deux personnes en colère, 1 200 € en jeu : aidez-les à trouver leur propre accord.',
  level: 3,
  perspective: 'mediator',
  playerId: 'vous',
  intro:
    'Vous êtes médiateur. Mme Haddad, ancienne locataire, et M. Durand, son propriétaire, se disputent le dépôt de garantie de 1 200 €. Votre rôle n’est pas de juger : c’est de les aider à trouver eux-mêmes une solution.',
  characters: [
    { id: 'vous', name: 'Vous', role: 'Médiateur ou médiatrice', avatar: 'mediator' },
    { id: 'ines', name: 'Mme Haddad', role: 'Ancienne locataire', avatar: 'clerk' },
    { id: 'durand', name: 'M. Durand', role: 'Propriétaire', avatar: 'professional' },
  ],
  startSceneId: 'accueil',
  scenes: [
    // ---- Scene 1 -----------------------------------------------------------------
    {
      id: 'accueil',
      setting: 'Votre bureau, première réunion',
      location: 'office',
      period: 'day',
      lines: [
        {
          speaker: 'durand',
          text: 'Le parquet est rayé dans tout le salon. Je garde le dépôt de garantie, point.',
          emotion: 'angry',
        },
        {
          speaker: 'ines',
          text: 'C’est de l’usure normale ! Vous gardez 1 200 € pour trois rayures ?',
          emotion: 'angry',
        },
      ],
      choices: [
        {
          id: 'cadre',
          label:
            'Poser le cadre : la médiation est confidentielle, vous êtes neutre, chacun parle sans être interrompu',
          next: 'expression',
          quality: 'good',
          action: 'talk',
          feedback:
            'Poser le cadre rassure : chacun sait que ce qu’il dit ne sera pas utilisé contre lui et qu’il aura le même temps de parole. C’est la première étape de toute [[mediation|médiation]].',
        },
        {
          id: 'trancher',
          label: 'Leur dire tout de suite qui a raison selon la loi',
          next: 'blocage',
          quality: 'bad',
          action: 'court',
          feedback:
            'Un médiateur ne juge pas. En donnant raison à l’un, vous perdez la confiance de l’autre, et la médiation s’arrête là.',
          losses: { relationship: 4 },
        },
        {
          id: 'durand-d-abord',
          label: 'Laisser M. Durand, le plus énervé, parler aussi longtemps qu’il veut',
          next: 'expression',
          quality: 'ok',
          action: 'wait',
          feedback:
            'Laisser s’exprimer la colère est utile, mais le temps de parole doit être équilibré : Mme Haddad se sent déjà moins écoutée.',
          losses: { relationship: 1, time: 1 },
        },
      ],
    },

    // ---- Scene 2 -----------------------------------------------------------------
    {
      id: 'expression',
      setting: 'Votre bureau, un peu plus tard',
      location: 'office',
      period: 'day',
      lines: [
        {
          speaker: 'ines',
          text: 'J’ai rendu l’appartement propre. Ces rayures… je crois qu’elles étaient déjà là.',
          emotion: 'sad',
        },
        {
          speaker: 'durand',
          text: 'Croire ne suffit pas. L’état des lieux d’entrée ne les mentionne pas.',
        },
      ],
      choices: [
        {
          id: 'reformuler',
          label:
            'Reformuler : « Madame, vous pensez que c’est de l’usure normale ; Monsieur, vous vous appuyez sur l’état des lieux. C’est bien ça ? »',
          next: 'besoins',
          quality: 'good',
          action: 'talk',
          feedback:
            'La reformulation montre à chacun qu’il a été compris, sans prendre parti. Souvent, la tension baisse dès cette étape.',
        },
        {
          id: 'question-fermee',
          label: 'Demander à Mme Haddad : « Avez-vous rayé le parquet, oui ou non ? »',
          next: 'blocage',
          quality: 'bad',
          action: 'threaten',
          feedback:
            'Une question fermée et accusatrice ressemble à un interrogatoire. Préférez les questions ouvertes : « Comment était le salon quand vous êtes partie ? »',
          losses: { relationship: 3 },
        },
      ],
    },

    // ---- Scene 3 -----------------------------------------------------------------
    {
      id: 'besoins',
      setting: 'Votre bureau',
      location: 'office',
      period: 'day',
      lines: [
        {
          text: 'Le ton baisse. Derrière les positions, il reste à comprendre ce qui compte vraiment pour chacun.',
        },
      ],
      choices: [
        {
          id: 'interets',
          label: 'Demander à chacun ce dont il a besoin, au fond',
          next: 'options',
          quality: 'good',
          action: 'talk',
          feedback:
            'C’est le cœur de la médiation : passer des positions (« je garde tout », « rendez tout ») aux besoins (relouer vite un logement en bon état, payer son nouveau loyer). Des besoins se concilient plus facilement que des positions.',
        },
        {
          id: 'couper',
          label: 'Proposer vous-même de couper la poire en deux : 600 € chacun',
          next: 'options',
          quality: 'ok',
          action: 'agree',
          feedback:
            'Une solution imposée par le médiateur est moins bien acceptée qu’une solution construite par les parties. Et « moitié-moitié » ne répond pas forcément au vrai problème.',
          losses: { relationship: 1 },
        },
      ],
    },

    // ---- Scene 4 -----------------------------------------------------------------
    {
      id: 'options',
      setting: 'Votre bureau, deuxième réunion',
      location: 'office',
      period: 'day',
      lines: [
        {
          speaker: 'durand',
          text: 'J’ai besoin de relouer vite. Un artisan m’a fait un devis : 400 € pour poncer et vitrifier le salon.',
        },
        {
          speaker: 'ines',
          text: 'Moi, j’ai besoin de cet argent pour mon nouveau loyer. Si c’est vraiment 400 €, je peux l’entendre.',
        },
      ],
      choices: [
        {
          id: 'accord-ecrit',
          label:
            'Les aider à écrire leur accord : 400 € retenus sur devis, 800 € rendus sous 8 jours, et leur expliquer qu’un juge peut l’homologuer',
          next: 'fin-accord',
          quality: 'good',
          action: 'agree',
          feedback:
            'Un accord écrit, précis et daté évite les malentendus. Homologué par le juge, il a la même force qu’un jugement.',
        },
        {
          id: 'oral',
          label: 'Considérer que c’est réglé, sans rien écrire',
          next: 'fin-fragile',
          quality: 'bad',
          action: 'wait',
          feedback:
            'Sans écrit, chacun se souviendra de l’accord à sa façon… et personne ne pourra prouver ce qui a été convenu.',
          losses: { relationship: 2 },
        },
      ],
    },

    // ---- Scene 5 -----------------------------------------------------------------
    {
      id: 'blocage',
      setting: 'Votre bureau, la tension monte',
      location: 'office',
      period: 'day',
      lines: [
        {
          speaker: 'ines',
          text: 'Vous êtes de son côté ! Je ne sais pas pourquoi je suis venue.',
          emotion: 'angry',
          effect: 'door',
        },
      ],
      choices: [
        {
          id: 'aparte',
          label: 'Proposer un entretien séparé à chacun, pour apaiser et rassurer',
          next: 'besoins',
          quality: 'good',
          action: 'talk',
          feedback:
            'L’aparté (entretien individuel) est un outil classique : chacun peut dire ce qu’il n’ose pas dire devant l’autre, et retrouver confiance dans votre neutralité.',
          losses: { time: 1 },
        },
        {
          id: 'arreter',
          label: 'Mettre fin à la médiation',
          next: 'fin-echec',
          quality: 'bad',
          action: 'move',
          feedback:
            'Arrêter au premier blocage, c’est renvoyer les parties devant le juge. Un blocage est souvent le moment où la médiation peut repartir.',
          losses: { relationship: 2 },
        },
      ],
    },

    // ---- Endings -------------------------------------------------------------------
    {
      id: 'fin-accord',
      location: 'office',
      period: 'day',
      lines: [
        {
          text: 'Mme Haddad et M. Durand signent leur accord. En partant, ils se serrent la main.',
          effect: 'paper',
        },
        { speaker: 'ines', text: 'Merci. Je ne pensais pas qu’on y arriverait.', emotion: 'happy' },
      ],
      ending: { title: 'Accord signé' },
    },
    {
      id: 'fin-fragile',
      location: 'office',
      period: 'evening',
      lines: [
        {
          text: 'Un mois plus tard, Mme Haddad vous rappelle : M. Durand n’a rien versé. Sans écrit, elle n’a aucune preuve de l’accord.',
          effect: 'phone',
        },
      ],
      ending: { title: 'Accord fragile' },
    },
    {
      id: 'fin-echec',
      location: 'courthouse',
      period: 'day',
      lines: [
        {
          text: 'Faute d’accord, Mme Haddad saisit le juge. Des mois de procédure pour 1 200 €, et une relation définitivement rompue.',
          effect: 'paper',
        },
      ],
      ending: { title: 'Retour au tribunal' },
    },
  ],
}
