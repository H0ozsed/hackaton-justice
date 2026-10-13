import type { ChatErrorCode } from './schema'

// Fixed texts of IRIS (site content: French). Kept here rather than in the
// components: the API sends some of them too.

export const IRIS = {
  name: 'IRIS',
  /** Meaning of the acronym. */
  tagline: 'Identifier, Rechercher, Informer, Suggérer',
  greeting:
    'Bonjour, je suis IRIS, votre assistante. Je vous guide vers les solutions amiables pour régler votre conflit.',
  notice:
    'Information générale, pas un conseil juridique. Ne partagez pas d’informations personnelles.',
  // No answer on the site: never a dead end, IRIS says who can help (#135).
  // TO VALIDATE (#120, #94): role of the point-justice, emergency numbers.
  noAnswer: `Je n’ai pas la réponse sur ce site. Pour une question précise ou personnelle, un professionnel pourra vous aider :
- un **point-justice**, pour être informé gratuitement sur vos droits ;
- un **conciliateur de justice** ou un **médiateur**, pour chercher un accord avec l’autre personne.

En cas de danger, appelez le **17** ou le **112**.`,
  // Sensitive question (violence, danger, distress): fixed answer, no search, no model (#135).
  // TO VALIDATE (#120): numbers and their scope.
  sensitive: `Votre situation mérite l’aide d’un professionnel : je ne peux pas y répondre ici.
- En cas de danger immédiat : le **17** (police) ou le **112** (urgences).
- Violences conjugales ou sexuelles : le **3919**, gratuit et anonyme.
- Enfant en danger : le **119**.
- Détresse, idées suicidaires : le **3114**.
- Pour vos droits et vos démarches : un **point-justice**, gratuitement.

Ces services peuvent vous écouter et vous orienter.`,
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
    'Bonjour ! Je suis **IRIS**, votre assistante. Je vous guide vers les solutions amiables (conciliation, médiation…) et vers la bonne démarche ou le bon interlocuteur. Quelle est votre question ?',
  thanks: 'Avec plaisir ! N’hésitez pas si vous avez une autre question.',
  goodbye: 'Au revoir, et bonne continuation dans vos démarches.',
  about: `Je suis **IRIS**, l’assistante de ce site :
- **I**dentifier : je cherche à bien comprendre votre situation et votre besoin.
- **R**echercher : je trouve l’information exacte dans le contenu de ce site.
- **I**nformer : je vous la restitue de façon claire, neutre et accessible.
- **S**uggérer : je vous indique des pistes, et le choix final vous appartient.

Concrètement :
- Je vous explique simplement les solutions amiables : conciliation, médiation, accord entre les personnes.
- Je vous oriente vers la page du site ou l’interlocuteur adapté à votre situation.
- Je réponds uniquement à partir du contenu de ce site, et j’indique toujours mes sources.

Je ne suis ni avocate, ni médiatrice, ni juge : je ne donne pas de conseil et je ne prends aucune décision à votre place.`,
} as const
