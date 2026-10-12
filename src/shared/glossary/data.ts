import type { GlossaryTermInput } from './schema'

// EXAMPLES to be replaced by the content team (see src/shared/README.md).
// Field names in English, content in French (shown to users).
export const glossaryData: GlossaryTermInput[] = [
  {
    slug: 'conciliation',
    term: 'Conciliation',
    definition: 'EXEMPLE — à remplacer. Démarche pour trouver un accord avec l’aide d’un tiers.',
    related: ['mediation'],
  },
  {
    slug: 'mediation',
    term: 'Médiation',
    definition:
      'EXEMPLE — à remplacer. Démarche accompagnée par un médiateur pour renouer le dialogue.',
    aliases: ['médiateur', 'médiatrice'],
    related: ['conciliation'],
  },
  {
    slug: 'mise-en-demeure',
    term: 'Mise en demeure',
    definition: 'EXEMPLE — à remplacer. Courrier demandant formellement d’exécuter une obligation.',
  },
]
