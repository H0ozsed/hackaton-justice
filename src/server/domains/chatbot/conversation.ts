// Messages that need neither the site content nor the model: small talk
// ("bonjour", "merci", "au revoir") and questions about IRIS itself ("qui es-tu ?",
// "tu sers à quoi ?"). IRIS answers them with fixed texts.

export type SmallTalk = 'greeting' | 'thanks' | 'goodbye' | 'about'

/** Lowercase, no accents, no curly apostrophes, no trailing punctuation. */
function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/[!.?,;:…\s]+$/u, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// A greeting or "iris" may come first: "Bonjour IRIS, tu sers à quoi ?".
const OPENING = String.raw`(?:(?:bonjour|bonsoir|salut|coucou|hello)[ ,]*)?(?:iris[ ,]*)?`
const CLOSING = String.raw`(?:[ ,]*iris)?`

/** Questions about IRIS itself, written in many ways. */
const ABOUT = [
  String.raw`(?:qui es[- ]tu|tu es qui|t'es qui|qui etes[- ]vous|vous etes qui)`,
  String.raw`(?:c'est (?:qui|quoi) iris|qui est iris|iris c'est (?:qui|quoi))`,
  String.raw`(?:tu sers a quoi|a quoi (?:sers[- ]tu|tu sers|sert iris)|tu fais quoi|que fais[- ]tu)`,
  String.raw`(?:(?:que|qu'est[- ]ce que tu) (?:peux|sais)(?:[- ]tu)? faire|tu peux faire quoi|tu sais faire quoi)`,
  String.raw`(?:comment (?:tu fonctionnes|fonctionnes[- ]tu|tu marches)|tu fonctionnes comment)`,
  String.raw`(?:presente[- ]toi|tu peux te presenter|peux[- ]tu te presenter)`,
  String.raw`(?:(?:tu es|es[- ]tu|t'es) (?:un robot|une ia|une intelligence artificielle|un humain|humain|un avocat|un mediateur|un conseiller))`,
]
const ABOUT_PATTERN = new RegExp(`^${OPENING}(?:${ABOUT.join('|')})${CLOSING}$`)

const SHORT: [Exclude<SmallTalk, 'about'>, RegExp][] = [
  ['greeting', /^(bonjour|bonsoir|salut|coucou|hello|hi|hey)\b/],
  ['thanks', /^(merci|thanks|thank you|super merci|parfait merci)\b/],
  ['goodbye', /^(au revoir|bye|a bientot|bonne (journee|soiree))\b/],
]

/**
 * What kind of fixed answer the message calls for, if any. A real question after a
 * greeting ("Bonjour, c'est quoi la médiation ?") is left to the search.
 */
export function smallTalk(text: string): SmallTalk | undefined {
  const clean = normalize(text)
  if (ABOUT_PATTERN.test(clean)) return 'about'
  if (text.includes('?') || clean.split(' ').length > 4) return undefined
  return SHORT.find(([, pattern]) => pattern.test(clean))?.[0]
}
