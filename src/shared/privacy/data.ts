import type { BrowserStorageInput, ProcessingInput } from './schema'

// Personal data inventory (#25). Site content: French. Keep it in sync with the code: the test
// next to index.ts fails if a storage key used in the code is missing here.

export const processingsData: ProcessingInput[] = [
  {
    slug: 'courrier-amiable',
    title: 'Courrier amiable (page Démarches)',
    data: 'Votre nom, le nom du destinataire, les faits, votre demande et le délai que vous saisissez.',
    purpose: 'Rédiger le courrier amiable que vous pouvez ensuite copier ou imprimer.',
    legalBasis: 'Aucune transmission : le courrier est préparé sur votre appareil.',
    location: 'device',
    retention:
      'Le temps de votre visite : tout est effacé quand vous quittez ou rechargez la page.',
  },
  {
    slug: 'simulation',
    title: 'J’ai un conflit ?',
    data: 'Vos réponses : type de conflit et, si besoin, montant en jeu.',
    purpose: 'Vous orienter vers la solution amiable la plus adaptée.',
    legalBasis: 'Aucune transmission : les réponses restent sur votre appareil.',
    location: 'device',
    retention:
      'Le temps de votre visite : tout est effacé quand vous quittez ou rechargez la page. Vos réponses ne sont jamais enregistrées, ni pour des statistiques, ni pour reprendre plus tard.',
  },
  {
    slug: 'quiz-et-jeux',
    title: 'Quiz, jeux et mise en situation',
    data: 'Vos choix, vos réponses et vos scores.',
    purpose:
      'Vous montrer vos résultats et, pour la mise en situation, votre meilleur score par scénario.',
    legalBasis: 'Aucune transmission : tout reste sur votre appareil.',
    location: 'device',
    retention:
      'Le temps de votre visite, sauf le meilleur score de chaque scénario de mise en situation, gardé dans votre navigateur jusqu’à ce que vous l’effaciez (voir la page Cookies).',
  },
  {
    slug: 'questions-iris',
    title: 'Questions posées à IRIS',
    data: 'Le texte de votre question et des échanges précédents de la conversation.',
    purpose: 'Rédiger la réponse d’IRIS à partir du contenu du site.',
    legalBasis: 'Intérêt légitime : répondre à la question que vous posez (article 6.1.f du RGPD).',
    location: 'server',
    retention:
      'Aucune conservation : la question est traitée le temps de la réponse puis oubliée. Elle n’est ni enregistrée, ni transmise à un tiers, ni utilisée pour entraîner un modèle (IRIS fonctionne sur notre serveur).',
  },
  {
    slug: 'adresse-ip',
    title: 'Adresse IP (assistante IRIS)',
    data: 'L’adresse IP de votre connexion.',
    purpose:
      'Limiter le nombre de questions à 20 par minute et par visiteur, pour que le service reste disponible pour tous.',
    legalBasis:
      'Intérêt légitime : assurer le bon fonctionnement du service (article 6.1.f du RGPD).',
    location: 'server',
    retention: 'Une minute au plus, en mémoire uniquement : elle n’est jamais écrite sur disque.',
  },
]

export const browserStorageData: BrowserStorageInput[] = [
  {
    slug: 'conversation-iris',
    key: 'iris-conversation',
    storage: 'sessionStorage',
    purpose:
      'Garder votre conversation avec IRIS quand vous changez de page, pour ne pas la perdre.',
    retention: 'Jusqu’à la fermeture de l’onglet.',
  },
  {
    slug: 'iris-ouverte',
    key: 'iris-opened',
    storage: 'sessionStorage',
    purpose: 'Se souvenir que vous avez déjà ouvert IRIS, pour ne plus animer son bouton.',
    retention: 'Jusqu’à la fermeture de l’onglet.',
  },
  {
    slug: 'progression-mise-en-situation',
    key: 'role-play-progress',
    storage: 'localStorage',
    purpose: 'Afficher votre meilleur score pour chaque scénario de mise en situation.',
    retention: 'Jusqu’à ce que vous l’effaciez (bouton ci-dessous ou réglages du navigateur).',
  },
  {
    slug: 'son-mise-en-situation',
    key: 'role-play-sound',
    storage: 'localStorage',
    purpose: 'Se souvenir si vous avez activé ou coupé le son de la mise en situation.',
    retention: 'Jusqu’à ce que vous l’effaciez (bouton ci-dessous ou réglages du navigateur).',
  },
  {
    slug: 'theme-affichage',
    key: 'theme',
    storage: 'localStorage',
    purpose: 'Se souvenir du thème d’affichage choisi (clair ou sombre).',
    retention: 'Jusqu’à ce que vous l’effaciez (bouton ci-dessous ou réglages du navigateur).',
  },
]
