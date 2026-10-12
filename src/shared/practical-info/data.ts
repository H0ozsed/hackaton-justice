import type { PracticalInfoInput } from './schema'

// EXEMPLES à remplacer par l'équipe contenu (voir src/shared/README.md).
export const practicalInfoData: PracticalInfoInput[] = [
  {
    slug: 'preparer-ses-documents',
    title: 'EXEMPLE — Préparer ses documents',
    body: 'EXEMPLE — à remplacer.',
  },
  {
    slug: 'trouver-de-l-aide',
    title: 'EXEMPLE — Trouver de l’aide près de chez soi',
    body: 'EXEMPLE — à remplacer.',
    links: [{ label: 'EXEMPLE — lien interne', href: '/apprendre' }],
  },
]
