import { faq } from '@/shared/faq'
import { glossary } from '@/shared/glossary'
import { practicalInfo } from '@/shared/practical-info'
import { quizzes } from '@/shared/quiz'
import { channels, conflictTypes } from '@/shared/simulation'

// IRIS's knowledge base: one chunk per content entry of src/shared. Nothing else
// is indexed, so IRIS can only rephrase what the site already says.

export type ChunkDomain =
  'faq' | 'practical-info' | 'glossary' | 'conflict-type' | 'channel' | 'quiz'

export type Chunk = {
  /** Stable id: `<domain>:<slug>`. */
  id: string
  domain: ChunkDomain
  /** Shown on the source link. */
  title: string
  /** Text embedded and given to the model. */
  text: string
  /** Page of the site the information comes from (source link). */
  url: string
}

/** Markers the content team puts on example text ("EXEMPLE — à remplacer."). */
const PLACEHOLDER_MARKERS = [/EXEMPLE\s*[—–-]\s*/gi, /à remplacer\.?/gi]

/** The text without the example markers: what the model and the embeddings see. */
export function withoutPlaceholderMarkers(text: string) {
  return PLACEHOLDER_MARKERS.reduce((t, marker) => t.replace(marker, ''), text)
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

/**
 * Text the content team has not written at all (only "EXEMPLE — à remplacer."): it
 * carries no information, so it is not indexed (the model would reason about it).
 */
export function isPlaceholder(text: string) {
  return withoutPlaceholderMarkers(text).length === 0
}

const lines = (...parts: (string | false | undefined)[]) =>
  withoutPlaceholderMarkers(parts.filter(Boolean).join('\n'))

export function buildChunks(): Chunk[] {
  return [
    ...faq.all
      .filter((entry) => !isPlaceholder(entry.answer))
      .map((entry): Chunk => ({
        id: `faq:${entry.slug}`,
        domain: 'faq',
        title: entry.question,
        text: lines(`Question : ${entry.question}`, `Réponse : ${entry.answer}`),
        url: entry.pages.includes('learn') ? '/apprendre#questions-frequentes' : '/',
      })),
    ...practicalInfo.all
      .filter((info) => !isPlaceholder(info.body))
      .map((info): Chunk => ({
        id: `practical-info:${info.slug}`,
        domain: 'practical-info',
        title: info.title,
        text: lines(
          info.title,
          info.body,
          info.links.length > 0 &&
            `Liens utiles : ${info.links.map((l) => `${l.label} (${l.href})`).join(', ')}`,
        ),
        url: '/apprendre#infos-pratiques',
      })),
    ...glossary.all
      .filter((term) => !isPlaceholder(term.definition))
      .map((term): Chunk => ({
        id: `glossary:${term.slug}`,
        domain: 'glossary',
        title: term.term,
        text: lines(
          `Définition de « ${term.term} » : ${term.definition}`,
          term.aliases.length > 0 && `Autres formes : ${term.aliases.join(', ')}`,
        ),
        url: `/apprendre/lexique#${term.slug}`,
      })),
    ...conflictTypes.all
      .filter((type) => !isPlaceholder(type.description))
      .map((type): Chunk => ({
        id: `conflict-type:${type.slug}`,
        domain: 'conflict-type',
        title: type.label,
        text: lines(
          `Type de conflit : ${type.label}`,
          type.description,
          type.examples.length > 0 && `Exemples : ${type.examples.join(', ')}`,
        ),
        url: '/simulation',
      })),
    ...channels.all
      .filter((channel) => !isPlaceholder(channel.description))
      .map((channel): Chunk => ({
        id: `channel:${channel.slug}`,
        domain: 'channel',
        title: channel.name,
        text: lines(
          `Interlocuteur : ${channel.name}`,
          channel.description,
          channel.amicable
            ? 'Voie amiable : on cherche un accord.'
            : 'Voie judiciaire : un juge décide.',
          channel.free ? 'Gratuit.' : 'Payant.',
          channel.contact?.url && `Site : ${channel.contact.url}`,
          channel.contact?.phone && `Téléphone : ${channel.contact.phone}`,
        ),
        url: '/simulation',
      })),
    ...quizzes.all.flatMap((quiz) =>
      quiz.questions
        .filter((q) => !isPlaceholder(q.explanation))
        .map((question): Chunk => {
          const correct = question.choices
            .filter((c) => question.correctChoiceIds.includes(c.id))
            .map((c) => c.label)
          return {
            id: `quiz:${quiz.slug}:${question.id}`,
            domain: 'quiz',
            title: quiz.title,
            text: lines(
              `Question : ${question.prompt}`,
              `Bonne réponse : ${correct.join(' ; ')}`,
              `Explication : ${question.explanation}`,
            ),
            url: '/apprendre#questionnaires',
          }
        }),
    ),
  ]
}
