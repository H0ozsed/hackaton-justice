// Small talk ("bonjour", "merci", "au revoir") needs neither the site content nor
// the model: IRIS answers it directly.

export type SmallTalk = 'greeting' | 'thanks' | 'goodbye'

const SMALL_TALK: [SmallTalk, RegExp][] = [
  ['greeting', /^(bonjour|bonsoir|salut|coucou|hello|hi|hey)\b/],
  ['thanks', /^(merci|thanks|thank you|super merci|parfait merci)\b/],
  ['goodbye', /^(au revoir|bye|à bientôt|a bientot|bonne (journée|soirée))\b/],
]

/**
 * A greeting, a thank-you or a goodbye on its own ("Bonjour IRIS !", "merci
 * beaucoup"). A real question after it ("Bonjour, c'est quoi la médiation ?") is
 * not small talk.
 */
export function smallTalk(text: string): SmallTalk | undefined {
  if (text.includes('?')) return undefined
  const clean = text
    .trim()
    .toLowerCase()
    .replace(/[!.,;:…\s]+$/u, '')
  if (clean.split(/\s+/).length > 4) return undefined
  return SMALL_TALK.find(([, pattern]) => pattern.test(clean))?.[0]
}
