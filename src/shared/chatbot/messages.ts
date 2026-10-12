import type { ChatErrorCode } from './schema'

// Fixed texts of IRIS (site content: French). Kept here rather than in the
// components: the API sends some of them too.

export const IRIS = {
  name: 'IRIS',
  /** Meaning of the acronym. */
  tagline: 'Informer, Renseigner, Indiquer les Solutions',
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
