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
    definition:
      'Courrier officiel, souvent envoyé en recommandé avec accusé de réception, qui demande à une personne de respecter ses obligations dans un délai précis. Il prouve que vous l’avez prévenue avant d’aller plus loin.',
  },

  // ---- Neighbourhood conflict (role-play scenario "voisin-du-dessus") ----
  {
    slug: 'tapage-nocturne',
    term: 'Tapage nocturne',
    definition:
      'Bruit qui trouble le voisinage la nuit, en général entre 22 h et 7 h. C’est une infraction : la police ou la gendarmerie peut infliger une amende forfaitaire de 68 €.',
    related: ['trouble-anormal-de-voisinage'],
  },
  {
    slug: 'trouble-anormal-de-voisinage',
    term: 'Trouble anormal de voisinage',
    definition:
      'Gêne qui dépasse ce que l’on doit normalement supporter entre voisins : bruit répété, odeurs, lumière… La personne qui la cause doit réparer le préjudice, même sans avoir commis de faute (article 1253 du code civil).',
    aliases: ['troubles anormaux de voisinage'],
    related: ['tapage-nocturne', 'conciliateur-de-justice'],
  },
  {
    slug: 'conciliateur-de-justice',
    term: 'Conciliateur de justice',
    definition:
      'Bénévole nommé par la justice qui aide gratuitement deux personnes en conflit à trouver un accord. On le rencontre sur rendez-vous, souvent en mairie. Pour un conflit de voisinage, tenter une solution amiable est en principe obligatoire avant de saisir le juge.',
    aliases: ['conciliatrice de justice', 'conciliatrice', 'conciliateur'],
    related: ['conciliation', 'constat-d-accord'],
  },
  {
    slug: 'constat-d-accord',
    term: 'Constat d’accord',
    definition:
      'Document signé par les deux parties à la fin d’une conciliation réussie. Il écrit noir sur blanc ce que chacun s’engage à faire. Un juge peut lui donner la même force qu’un jugement (homologation).',
    related: ['conciliateur-de-justice'],
  },
  {
    slug: 'commissaire-de-justice',
    term: 'Commissaire de justice',
    definition:
      'Professionnel du droit (anciennement huissier de justice). Il peut notamment constater des faits par écrit, avec une forte valeur de preuve. Ses constats sont payants.',
    aliases: ['huissier', 'huissier de justice'],
  },
  {
    slug: 'tribunal-judiciaire',
    term: 'Tribunal judiciaire',
    definition:
      'Tribunal qui juge la plupart des litiges entre particuliers, dont les conflits de voisinage.',
    related: ['irrecevable'],
  },
  {
    slug: 'irrecevable',
    term: 'Irrecevable',
    definition:
      'Se dit d’une demande que le juge refuse d’examiner parce qu’une condition n’est pas remplie, par exemple l’absence de tentative de solution amiable avant de saisir le tribunal.',
    related: ['tribunal-judiciaire', 'conciliateur-de-justice'],
  },
]
