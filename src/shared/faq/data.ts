import type { FaqEntryInput } from './schema'

// EXEMPLES à remplacer par l'équipe contenu (voir src/shared/README.md).
export const faqData: FaqEntryInput[] = [
  {
    slug: 'a-qui-sert-le-site',
    question: 'EXEMPLE — À qui s’adresse ce site ?',
    answer: 'EXEMPLE — à remplacer.',
    pages: ['home', 'learn'],
  },
  {
    slug: 'est-ce-gratuit',
    question: 'EXEMPLE — Est-ce gratuit ?',
    answer: 'EXEMPLE — à remplacer.',
    pages: ['home'],
  },
  {
    slug: 'difference-conciliation-mediation',
    question: 'EXEMPLE — Quelle différence entre conciliation et médiation ?',
    answer: 'EXEMPLE — à remplacer.',
    pages: ['learn'],
  },
]
