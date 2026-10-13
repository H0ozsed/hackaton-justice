import type { ChatErrorCode } from './schema'

// Fixed texts of IRIS (site content: French). Kept here rather than in the
// components: the API sends some of them too.

export const IRIS = {
  name: 'IRIS',
  /** Meaning of the acronym. */
  tagline: 'Identifier, Rechercher, Informer, Suggérer',
  greeting:
    'Bonjour, je suis IRIS. Je réponds à vos questions sur les solutions amiables à partir du contenu de ce site.',
  notice:
    'Information générale, pas un conseil juridique. Ne partagez pas d’informations personnelles.',
  noAnswer:
    'Je n’ai pas cette information sur le site. Vous pouvez consulter la FAQ ou reformuler votre question.',
} as const

export const IRIS_ERRORS: Record<ChatErrorCode, string> = {
  unavailable:
    'IRIS est indisponible pour le moment. Les réponses aux questions fréquentes restent accessibles dans la FAQ.',
  invalid: 'Votre question n’a pas pu être envoyée. Vérifiez qu’elle fait moins de 500 caractères.',
  'rate-limited': 'Vous avez posé beaucoup de questions d’un coup. Patientez une minute.',
}

/**
 * Answers given without the model: small talk and IRIS presenting itself. They use
 * the same light formatting as the model's answers (**bold**, "- " lists).
 */
export const IRIS_SMALL_TALK = {
  greeting:
    'Bonjour ! Je suis **IRIS**. Je vous aide à comprendre les solutions amiables (conciliation, médiation…) et je vous oriente vers la bonne démarche ou le bon interlocuteur. Quelle est votre question ?',
  thanks: 'Avec plaisir ! N’hésitez pas si vous avez une autre question.',
  goodbye: 'Au revoir, et bonne continuation dans vos démarches.',
  about: `Je suis **IRIS**, l’assistant de ce site :
- **I**dentifier : je cherche à bien comprendre votre situation et votre besoin.
- **R**echercher : je trouve l’information exacte dans le contenu de ce site.
- **I**nformer : je vous la restitue de façon claire, neutre et accessible.
- **S**uggérer : je vous indique des pistes, et le choix final vous appartient.

Concrètement :
- Je vous explique simplement les solutions amiables : conciliation, médiation, accord entre les personnes.
- Je vous oriente vers la page du site ou l’interlocuteur adapté à votre situation.
- Je réponds uniquement à partir du contenu de ce site, et j’indique toujours mes sources.

Je ne suis ni avocat, ni médiateur, ni juge : je ne donne pas de conseil et je ne prends aucune décision à votre place.`,
} as const
