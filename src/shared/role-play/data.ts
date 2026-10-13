import type { ScenarioInput } from './schema'

// Role-play scenarios (see src/shared/README.md to write one).
// Field names in English, content in French (shown to users).
// Amounts and legal references to be proofread by the content team before the demo.
export const scenariosData: ScenarioInput[] = [
  {
    slug: 'voisin-du-dessus',
    title: 'Le voisin du dessus',
    intro:
      'Vous êtes Camille et vous louez un appartement au deuxième étage. Depuis quelques semaines, votre voisin du dessus joue de la batterie tard le soir. Vous dormez mal et la fatigue s’accumule. À vous de choisir comment réagir face à ce [[trouble-anormal-de-voisinage|trouble de voisinage]].',
    characters: [
      { id: 'camille', name: 'Camille', role: 'Vous, locataire', avatar: 'player' },
      { id: 'martin', name: 'M. Martin', role: 'Votre voisin du dessus', avatar: 'neighbor' },
      { id: 'diallo', name: 'Mme Diallo', role: 'La gardienne', avatar: 'relative' },
      {
        id: 'roche',
        name: 'Mme Roche',
        role: 'Conciliatrice de justice',
        avatar: 'official',
      },
    ],
    startSceneId: 'debut',
    scenes: [
      // ---- Scene 1 ---------------------------------------------------------------
      {
        id: 'debut',
        setting: 'Chez vous, un mardi, 23 h',
        location: 'bedroom',
        period: 'night',
        lines: [
          {
            text: 'Boum, boum, tchak… Pour le troisième soir de suite, la batterie résonne au-dessus de votre lit.',
            effect: 'drums',
          },
          {
            speaker: 'camille',
            text: 'Encore ! Je travaille tôt demain, je n’en peux plus…',
            emotion: 'tired',
          },
          { text: 'Vous n’avez encore jamais parlé de ce bruit avec M. Martin.' },
        ],
        choices: [
          {
            id: 'parler-demain',
            label: 'Aller le voir demain pour en parler calmement',
            next: 'discussion',
            quality: 'good',
            feedback:
              'Parler directement, à tête reposée, est la première chose à faire : beaucoup de voisins ne se rendent pas compte du bruit qu’ils font. C’est gratuit, rapide, et ça préserve la relation.',
          },
          {
            id: 'balai',
            label: 'Taper au plafond avec un balai',
            next: 'le-ton-monte',
            quality: 'bad',
            feedback:
              'Répondre au bruit par du bruit n’explique rien à votre voisin et le met sur la défensive. Le conflit démarre sur de mauvaises bases.',
            losses: { relationship: 2 },
          },
          {
            id: 'police',
            label: 'Appeler la police pour tapage nocturne',
            next: 'apres-la-police',
            quality: 'ok',
            feedback:
              'Le [[tapage-nocturne|tapage nocturne]] est bien une infraction et la police peut intervenir. Mais sans avoir prévenu votre voisin, il se sent humilié et le dialogue devient plus difficile. À garder pour quand la discussion a échoué.',
            losses: { time: 2, relationship: 2 },
          },
        ],
      },

      // ---- Scene 2 ---------------------------------------------------------------
      {
        id: 'discussion',
        setting: 'Sur le palier, le lendemain soir',
        location: 'landing',
        period: 'evening',
        lines: [
          {
            speaker: 'camille',
            text: 'Bonsoir monsieur Martin, je suis votre voisine du dessous. Je peux vous parler deux minutes ?',
            emotion: 'neutral',
          },
          {
            speaker: 'martin',
            text: 'Bonsoir ! Oui, bien sûr. Il y a un souci ?',
            emotion: 'happy',
          },
          {
            speaker: 'camille',
            text: 'La batterie s’entend beaucoup chez moi le soir, parfois jusqu’à minuit. J’ai du mal à dormir.',
          },
          {
            speaker: 'martin',
            text: 'Ah… Je suis désolé, je ne pensais pas que ça s’entendait autant. Je répète pour un concert le mois prochain.',
            emotion: 'surprised',
          },
        ],
        choices: [
          {
            id: 'arrangement',
            label: 'Proposer un arrangement précis : pas de batterie après 21 h',
            next: 'fin-calme',
            quality: 'good',
            feedback:
              'Un accord concret (un horaire, des jours) est bien plus solide qu’une promesse vague : chacun sait exactement à quoi il s’engage.',
          },
          {
            id: 'promesse',
            label: 'Le remercier et se contenter de sa promesse de faire attention',
            next: 'ca-recommence',
            quality: 'ok',
            feedback:
              'Le dialogue est un bon début, mais « faire attention » ne veut pas dire la même chose pour tout le monde. Sans engagement précis, le problème risque de revenir.',
            losses: { health: 1 },
          },
        ],
      },
      {
        id: 'le-ton-monte',
        setting: 'Dans l’escalier, le lendemain matin',
        location: 'stairwell',
        period: 'morning',
        lines: [
          {
            speaker: 'martin',
            text: 'C’est vous qui tapiez au plafond hier soir ? Vous auriez pu venir me parler au lieu de faire ce vacarme !',
            emotion: 'angry',
          },
          {
            speaker: 'camille',
            text: 'Vous faites du bruit tous les soirs jusqu’à minuit !',
            emotion: 'angry',
          },
          {
            speaker: 'diallo',
            text: 'Allons, allons, calmez-vous tous les deux. Ce n’est pas comme ça que vous allez régler ça.',
            emotion: 'sad',
          },
        ],
        choices: [
          {
            id: 'excuses',
            label: 'S’excuser pour le balai et expliquer calmement la gêne',
            next: 'ca-recommence',
            quality: 'good',
            feedback:
              'Reconnaître son erreur fait retomber la tension et rouvre le dialogue. C’est souvent ce qui permet ensuite de trouver une solution amiable.',
          },
          {
            id: 'menace',
            label: 'Le menacer de lui envoyer une mise en demeure',
            next: 'dialogue-rompu',
            quality: 'bad',
            feedback:
              'Une [[mise-en-demeure|mise en demeure]] est un outil utile, mais brandie comme une menace en pleine dispute, elle ferme la porte à toute discussion.',
            losses: { relationship: 2, health: 1 },
          },
        ],
      },
      {
        id: 'apres-la-police',
        setting: 'Dans le hall, deux jours plus tard',
        location: 'lobby',
        period: 'day',
        lines: [
          {
            speaker: 'diallo',
            text: 'Les policiers sont passés chez M. Martin l’autre soir. Il est très vexé, il dit à tout le monde qu’on l’a dénoncé sans même le prévenir.',
            emotion: 'sad',
          },
          { speaker: 'martin', emotion: 'angry', effect: 'door', text: '…' },
          {
            text: 'M. Martin passe devant vous sans vous dire bonjour. Le bruit s’est arrêté… pour l’instant.',
          },
        ],
        choices: [
          {
            id: 'mot',
            label: 'Lui laisser un mot pour proposer d’en parler',
            next: 'ca-recommence',
            quality: 'good',
            feedback:
              'Même après un faux pas, proposer de discuter montre votre bonne foi. Cela sera aussi utile si le conflit doit aller plus loin : vous aurez tenté une solution amiable.',
          },
          {
            id: 'attendre',
            label: 'Ne rien faire et attendre de voir',
            next: 'dialogue-rompu',
            quality: 'bad',
            feedback:
              'Laisser la situation pourrir ne règle rien : le malaise s’installe, et le problème de fond (les répétitions le soir) n’est pas traité.',
            losses: { health: 2 },
          },
        ],
      },

      // ---- Scene 3 ---------------------------------------------------------------
      {
        id: 'ca-recommence',
        setting: 'Chez vous, trois semaines plus tard',
        location: 'bedroom',
        period: 'night',
        lines: [
          {
            text: 'Pendant quelques jours, tout allait mieux. Mais ce soir, à 23 h 30, la batterie a repris.',
            effect: 'drums',
          },
          {
            speaker: 'camille',
            text: 'Je lui en ai déjà parlé… Qu’est-ce que je fais maintenant ?',
            emotion: 'tired',
          },
          {
            speaker: 'diallo',
            text: 'Vous savez qu’il existe un [[conciliateur-de-justice|conciliateur de justice]] à la mairie ? C’est gratuit, et il reçoit les deux voisins ensemble.',
            emotion: 'happy',
          },
        ],
        choices: [
          {
            id: 'courrier-conciliateur',
            label: 'Lui écrire un courrier amiable et proposer de voir le conciliateur',
            next: 'conciliation',
            quality: 'good',
            feedback:
              'Un courrier garde une trace de vos démarches, et le [[conciliateur-de-justice|conciliateur de justice]] est gratuit. Pour un [[trouble-anormal-de-voisinage|trouble anormal de voisinage]], tenter une solution amiable est en principe obligatoire avant d’aller au tribunal.',
            losses: { time: 3 },
          },
          {
            id: 'avocat',
            label: 'Faire envoyer une mise en demeure par un avocat',
            next: 'conciliation',
            quality: 'ok',
            feedback:
              'Une [[mise-en-demeure|mise en demeure]] montre que vous êtes sérieuse, mais passer par un avocat coûte cher à ce stade. Vous pouvez l’écrire vous-même, et le conciliateur reste la solution la plus économique.',
            losses: { money: 150, time: 2, relationship: 1 },
          },
          {
            id: 'tribunal-direct',
            label: 'Faire constater le bruit par un commissaire de justice et saisir le tribunal',
            next: 'fin-irrecevable',
            quality: 'bad',
            feedback:
              'Un constat de [[commissaire-de-justice|commissaire de justice]] est payant, et saisir le [[tribunal-judiciaire|tribunal judiciaire]] sans avoir tenté de solution amiable rend en principe votre demande [[irrecevable|irrecevable]].',
            losses: { money: 250, time: 10, relationship: 3 },
          },
        ],
      },
      {
        id: 'dialogue-rompu',
        setting: 'Chez vous, trois semaines plus tard',
        location: 'bedroom',
        period: 'night',
        lines: [
          {
            text: 'M. Martin ne vous adresse plus la parole. Et ce soir, la batterie a repris, plus fort que jamais.',
            effect: 'drums',
          },
          {
            speaker: 'camille',
            text: 'Je ne vais quand même pas supporter ça toute l’année…',
            emotion: 'sad',
          },
          {
            speaker: 'diallo',
            text: 'Vous devriez essayer le [[conciliateur-de-justice|conciliateur de justice]]. Il est gratuit, et il a déjà réglé une histoire de bruit au troisième.',
          },
        ],
        choices: [
          {
            id: 'conciliateur',
            label: 'Prendre rendez-vous avec le conciliateur de justice',
            next: 'conciliation',
            quality: 'good',
            feedback:
              'Même quand le dialogue est rompu, un tiers neutre peut aider à renouer. Le [[conciliateur-de-justice|conciliateur de justice]] est gratuit et c’est l’étape attendue avant tout procès.',
            losses: { time: 2 },
          },
          {
            id: 'tribunal',
            label: 'Saisir directement le tribunal',
            next: 'fin-irrecevable',
            quality: 'bad',
            feedback:
              'Saisir le [[tribunal-judiciaire|tribunal judiciaire]] sans tentative de solution amiable rend en principe la demande [[irrecevable|irrecevable]] : vous perdez du temps et la relation se dégrade encore.',
            losses: { time: 10, relationship: 2 },
          },
          {
            id: 'demenager',
            label: 'Déménager pour ne plus l’entendre',
            next: 'fin-demenagement',
            quality: 'bad',
            feedback:
              'Déménager est très coûteux et ne règle pas le problème : il existe des solutions gratuites, comme le conciliateur de justice, pour faire valoir vos droits.',
            losses: { money: 2000, time: 40, health: 1 },
          },
        ],
      },

      // ---- Scene 4 ---------------------------------------------------------------
      {
        id: 'conciliation',
        setting: 'À la mairie, permanence de la conciliatrice',
        location: 'town-hall',
        period: 'day',
        lines: [
          {
            speaker: 'roche',
            text: 'Bonjour à tous les deux. Je suis là pour vous aider à trouver un accord, pas pour juger. Madame, je vous écoute.',
          },
          {
            speaker: 'camille',
            text: 'Je n’arrive plus à dormir à cause de la batterie le soir, parfois jusqu’à minuit.',
            emotion: 'tired',
          },
          {
            speaker: 'martin',
            text: 'Je travaille en journée, le soir c’est le seul moment où je peux répéter. Et mon concert approche.',
            emotion: 'sad',
          },
          { speaker: 'roche', text: 'Chacun a ses contraintes. Madame, que proposeriez-vous ?' },
        ],
        choices: [
          {
            id: 'compromis',
            label:
              'Proposer un compromis : répétitions jusqu’à 21 h en semaine et un tapis anti-bruit',
            next: 'fin-accord',
            quality: 'good',
            feedback:
              'Tenir compte des contraintes de l’autre permet un accord que chacun respectera. Écrit dans un [[constat-d-accord|constat d’accord]], il engage les deux voisins.',
          },
          {
            id: 'silence-total',
            label: 'Exiger qu’il arrête complètement la batterie',
            next: 'fin-echec',
            quality: 'bad',
            feedback:
              'Exiger tout sans rien céder bloque la conciliation. Le but n’est pas de gagner contre l’autre mais de trouver une solution vivable pour les deux.',
            losses: { relationship: 2, time: 2 },
          },
        ],
      },

      // ---- Endings ---------------------------------------------------------------
      {
        id: 'fin-calme',
        location: 'landing',
        period: 'evening',
        lines: [
          {
            speaker: 'martin',
            text: 'D’accord pour 21 h. Et si un soir je dépasse, venez frapper, sans hésiter !',
            emotion: 'happy',
          },
          {
            text: 'Les semaines suivantes, M. Martin respecte l’horaire. Vous dormez enfin, et vous êtes même invitée à son concert.',
            effect: 'sleep',
          },
        ],
        ending: { title: 'Le calme retrouvé' },
      },
      {
        id: 'fin-accord',
        location: 'town-hall',
        period: 'day',
        lines: [
          {
            speaker: 'martin',
            text: 'Ça me va. Je vais acheter un tapis épais, et je préviendrai avant les répétitions du week-end.',
            emotion: 'happy',
          },
          {
            speaker: 'roche',
            text: 'Parfait. Je rédige un [[constat-d-accord|constat d’accord]] que vous signerez tous les deux.',
            emotion: 'happy',
            effect: 'paper',
          },
          { text: 'L’accord est signé. Le bruit diminue nettement et les relations s’apaisent.' },
        ],
        ending: { title: 'Un accord signé' },
      },
      {
        id: 'fin-echec',
        location: 'town-hall',
        period: 'day',
        lines: [
          { speaker: 'martin', emotion: 'angry', text: 'Arrêter complètement ? Hors de question.' },
          {
            speaker: 'roche',
            text: 'Je constate que vous n’êtes pas parvenus à un accord. Vous pourrez saisir le [[tribunal-judiciaire|tribunal judiciaire]] si vous le souhaitez.',
          },
          {
            text: 'Vous repartez sans solution. Une procédure judiciaire serait longue, et son issue incertaine.',
          },
        ],
        ending: { title: 'La conciliation échoue' },
      },
      {
        id: 'fin-irrecevable',
        location: 'courthouse',
        period: 'day',
        lines: [
          {
            text: 'Plusieurs mois plus tard, le tribunal rend sa décision : votre demande est [[irrecevable|irrecevable]], faute de tentative de solution amiable.',
            effect: 'paper',
          },
          { speaker: 'camille', text: 'Tout ça pour revenir au point de départ…', emotion: 'sad' },
          { text: 'Et pendant ce temps, la batterie a continué.', effect: 'drums' },
        ],
        ending: { title: 'Demande irrecevable' },
      },
      {
        id: 'fin-demenagement',
        location: 'new-home',
        period: 'day',
        lines: [
          {
            text: 'Vous trouvez un autre appartement, plus cher et plus loin de votre travail. Frais d’agence, caution, camion : la note est salée.',
          },
          {
            speaker: 'camille',
            text: 'Au moins, c’est calme… Mais j’aurais peut-être pu éviter tout ça.',
            emotion: 'tired',
          },
        ],
        ending: { title: 'Partir' },
      },
    ],
  },
]
