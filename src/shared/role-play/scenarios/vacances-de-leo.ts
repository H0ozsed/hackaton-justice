import type { ScenarioInput } from '../schema'

// Level 2, complainant: separated parents disagree on the summer holidays of their son.
// Family mediation: free information meeting, then sessions priced by income (Caf scale),
// with a qualified family mediator; the agreement can be approved (homologué) by the juge aux
// affaires familiales. Not offered in case of violence (none in this story). Sources:
// service-public.gouv.fr (médiation familiale), caf.fr. To be proofread before the demo.
export const vacancesDeLeo: ScenarioInput = {
  slug: 'vacances-de-leo',
  title: 'Les vacances de Léo',
  summary:
    'Séparés depuis un an, vous et le père de Léo voulez tous les deux l’été. Comment décider sans que Léo soit au milieu ?',
  level: 2,
  perspective: 'complainant',
  intro:
    'Vous êtes Nadia. Vous êtes séparée de Karim depuis un an, et votre fils Léo, 9 ans, vit une semaine chez chacun. Cet été, vous avez chacun prévu des vacances avec lui… en juillet.',
  characters: [
    { id: 'nadia', name: 'Nadia', role: 'Vous, la mère de Léo', avatar: 'player' },
    { id: 'karim', name: 'Karim', role: 'Le père de Léo', avatar: 'professional' },
    { id: 'garnier', name: 'Mme Garnier', role: 'Médiatrice familiale', avatar: 'official' },
  ],
  startSceneId: 'message',
  scenes: [
    // ---- Scene 1 -----------------------------------------------------------------
    {
      id: 'message',
      setting: 'Chez vous, un dimanche soir de mai',
      location: 'new-home',
      period: 'evening',
      lines: [
        { text: 'Un message de Karim arrive.', effect: 'phone' },
        {
          speaker: 'karim',
          text: 'Cet été, je prends Léo tout le mois de juillet. J’ai déjà réservé la location.',
        },
        {
          speaker: 'nadia',
          text: 'Sans m’en parler ? Juillet, c’est le mois où Léo voit ses grands-parents avec moi !',
          emotion: 'angry',
        },
      ],
      choices: [
        {
          id: 'parler',
          label: 'Lui proposer d’en parler de vive voix, à un moment calme, sans Léo',
          next: 'discussion',
          quality: 'good',
          action: 'phone',
          feedback:
            'Un désaccord entre parents se règle mieux de vive voix qu’à coups de messages, et toujours hors de la présence de l’enfant.',
        },
        {
          id: 'refus-sec',
          label: 'Répondre par message : « Hors de question. »',
          next: 'escalade',
          quality: 'bad',
          action: 'threaten',
          feedback:
            'Un refus sec ferme la discussion et pousse l’autre parent à camper sur sa position. Le conflit s’installe.',
          losses: { relationship: 3 },
        },
        {
          id: 'demander-leo',
          label: 'Demander à Léo de choisir chez qui il veut partir',
          next: 'escalade',
          quality: 'bad',
          action: 'talk',
          feedback:
            'Faire choisir l’enfant le place au milieu du conflit de ses parents : c’est un poids qu’il n’a pas à porter. La décision revient aux parents.',
          losses: { relationship: 2, health: 2 },
        },
      ],
    },

    // ---- Scene 2 -----------------------------------------------------------------
    {
      id: 'discussion',
      setting: 'En bas de chez Karim, le mercredi suivant',
      location: 'lobby',
      period: 'day',
      lines: [
        {
          speaker: 'karim',
          text: 'J’ai déjà payé la location. Et je vois si peu Léo pendant l’année…',
          emotion: 'sad',
        },
        {
          speaker: 'nadia',
          text: 'Je comprends. Mais ses grands-parents l’attendent aussi, ils ne le voient qu’en été.',
        },
      ],
      choices: [
        {
          id: 'partager',
          label:
            'Proposer de partager : du 1er au 20 juillet avec Karim, ensuite chez vous avec les grands-parents, et l’écrire',
          next: 'fin-accord-direct',
          quality: 'good',
          action: 'agree',
          feedback:
            'En tenant compte des besoins de chacun (la location de Karim, les grands-parents), vous trouvez une solution vous-mêmes. L’écrire évite les malentendus.',
        },
        {
          id: 'mediatrice',
          label: 'Proposer de voir ensemble une médiatrice familiale pour organiser tout l’été',
          next: 'mediation',
          quality: 'ok',
          action: 'appointment',
          feedback:
            'La médiation familiale est une très bonne idée quand le dialogue bloque. Ici, vous étiez près d’un accord : vous auriez pu le trouver directement, plus vite.',
          losses: { time: 3, money: 30 },
        },
      ],
    },

    // ---- Scene 3 -----------------------------------------------------------------
    {
      id: 'escalade',
      setting: 'Chez vous, quelques jours plus tard',
      location: 'new-home',
      period: 'night',
      lines: [
        {
          text: 'Les messages s’enveniment. Un soir, Léo vous entend vous disputer au téléphone avec son père.',
          effect: 'phone',
        },
        { text: 'Il demande, inquiet : « C’est à cause de moi ? »' },
      ],
      choices: [
        {
          id: 'mediation',
          label: 'Proposer à Karim une médiation familiale',
          next: 'mediation',
          quality: 'good',
          action: 'appointment',
          feedback:
            'Quand le dialogue est rompu, une médiatrice familiale offre un cadre neutre pour reparler. Le premier entretien d’information est gratuit, les séances suivent un barème selon vos revenus.',
          losses: { time: 3, money: 30 },
        },
        {
          id: 'juge',
          label: 'Saisir directement le juge aux affaires familiales',
          next: 'fin-juge',
          quality: 'ok',
          action: 'court',
          feedback:
            'Le juge peut trancher, mais c’est long, et la décision ne viendra pas de vous. Tenter d’abord la médiation est souvent plus rapide et plus apaisant pour l’enfant.',
          losses: { time: 20, money: 300, health: 2 },
        },
      ],
    },

    // ---- Scene 4 -----------------------------------------------------------------
    {
      id: 'mediation',
      setting: 'Au service de médiation familiale, trois semaines plus tard',
      location: 'office',
      period: 'day',
      lines: [
        {
          speaker: 'garnier',
          text: 'Ici, on parle de ce dont Léo a besoin. Chacun s’exprime, je ne prends le parti de personne, et ce qui se dit reste entre nous.',
        },
        {
          speaker: 'karim',
          text: 'J’ai l’impression de n’être qu’un parent du week-end.',
          emotion: 'sad',
        },
      ],
      choices: [
        {
          id: 'besoins-leo',
          label:
            'Parler de ce qui est bon pour Léo : du temps avec son père, et ses grands-parents en été',
          next: 'fin-accord',
          quality: 'good',
          action: 'agree',
          feedback:
            'Recentrer la discussion sur l’enfant change tout : il ne s’agit plus de gagner contre l’autre parent, mais d’organiser l’été de Léo.',
        },
        {
          id: 'reproches',
          label: 'Rappeler tous les torts passés de Karim',
          next: 'fin-echec',
          quality: 'bad',
          action: 'threaten',
          feedback:
            'Ressasser le passé du couple bloque la médiation. La médiatrice vous ramènera à l’avenir, celui de Léo, mais la confiance est entamée.',
          losses: { relationship: 3 },
        },
      ],
    },

    // ---- Endings -------------------------------------------------------------------
    {
      id: 'fin-accord-direct',
      location: 'new-home',
      period: 'evening',
      lines: [
        {
          text: 'Le soir même, vous vous envoyez le planning de l’été par écrit. Léo part trois semaines avec son père, puis rejoint ses grands-parents.',
          effect: 'phone',
        },
        { speaker: 'nadia', text: 'Finalement, on y arrive quand on se parle.', emotion: 'happy' },
      ],
      ending: { title: 'Accord entre parents' },
    },
    {
      id: 'fin-accord',
      location: 'office',
      period: 'day',
      lines: [
        {
          text: 'Avec la médiatrice, vous écrivez un accord pour l’été, et même pour les vacances suivantes. Vous pourrez le faire homologuer par le juge aux affaires familiales.',
          effect: 'paper',
        },
        { speaker: 'garnier', text: 'Léo a de la chance d’avoir deux parents qui se parlent.' },
      ],
      ending: { title: 'Accord en médiation familiale' },
    },
    {
      id: 'fin-echec',
      location: 'office',
      period: 'day',
      lines: [
        {
          text: 'La séance tourne aux reproches. Karim se lève. Il faudra demander au juge aux affaires familiales de décider.',
          effect: 'door',
        },
      ],
      ending: { title: 'Médiation interrompue' },
    },
    {
      id: 'fin-juge',
      location: 'courthouse',
      period: 'day',
      lines: [
        {
          text: 'Des mois plus tard, le juge aux affaires familiales fixe le calendrier des vacances. L’été est déjà passé, et la décision ne vient ni de vous ni de Karim.',
          effect: 'paper',
        },
      ],
      ending: { title: 'Décision du juge' },
    },
  ],
}
