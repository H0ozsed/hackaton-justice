import type { GlossaryTermInput } from './schema'

// EXEMPLES à remplacer par l'équipe contenu (voir src/shared/README.md).
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
