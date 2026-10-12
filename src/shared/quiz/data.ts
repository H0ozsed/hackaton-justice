import type { QuizInput } from './schema'

// EXAMPLES to be replaced by the content team (see src/shared/README.md).
// Field names in English, content in French (shown to users).
export const quizzesData: QuizInput[] = [
  {
    slug: 'bases',
    title: 'EXEMPLE — Les bases',
    questions: [
      {
        id: 'q1',
        prompt: 'EXEMPLE — Question à une seule bonne réponse ?',
        choices: [
          { id: 'a', label: 'EXEMPLE — Réponse A' },
          { id: 'b', label: 'EXEMPLE — Réponse B' },
        ],
        correctChoiceIds: ['a'],
        explanation: 'EXEMPLE — à remplacer.',
        glossary: ['conciliation'],
      },
      {
        id: 'q2',
        prompt: 'EXEMPLE — Question à plusieurs bonnes réponses ?',
        choices: [
          { id: 'a', label: 'EXEMPLE — Réponse A' },
          { id: 'b', label: 'EXEMPLE — Réponse B' },
          { id: 'c', label: 'EXEMPLE — Réponse C' },
        ],
        correctChoiceIds: ['a', 'c'],
        explanation: 'EXEMPLE — à remplacer.',
      },
    ],
  },
]
