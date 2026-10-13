import type { PracticalInfoInput } from './schema'

// Field names in English, content in French (shown to users). See src/shared/README.md.
// Facts checked against justice.fr and the DGCCRF (October 2026); to be proofread.
export const practicalInfoData: PracticalInfoInput[] = [
  {
    slug: 'preparer-ses-documents',
    title: 'Préparer ses documents',
    body: 'Avant un rendez-vous, rassemblez ce qui prouve vos dires : contrat, bail ou facture, courriers et courriels échangés, photos datées, attestations de témoins. Classez-les par date et notez en quelques lignes ce qui s’est passé.\n\nGardez toujours une copie de ce que vous envoyez.',
    links: [{ label: 'Trouver la solution adaptée à mon litige', href: '/simulation' }],
  },
  {
    slug: 'trouver-de-l-aide',
    title: 'Trouver de l’aide près de chez soi',
    body: 'Le conciliateur de justice tient des permanences gratuites en mairie, au tribunal ou dans une maison de justice. Les points-justice proposent aussi des informations juridiques gratuites.',
    links: [
      { label: 'Trouver un conciliateur de justice', href: 'https://www.conciliateurs.fr' },
      {
        label: 'Le conciliateur de justice sur justice.fr',
        href: 'https://www.justice.fr/fiche/conciliateur-justice',
      },
    ],
  },
  {
    slug: 'litige-professionnel',
    title: 'Un litige avec un professionnel ?',
    body: 'Écrivez d’abord au service client et gardez une copie. Sans réponse satisfaisante, saisissez le médiateur de la consommation indiqué dans les conditions générales de vente : c’est gratuit pour vous, dans l’année qui suit votre réclamation.',
    links: [
      {
        label: 'La médiation de la consommation (DGCCRF)',
        href: 'https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques-et-les-faq/la-mediation-de-la-consommation-ce-que-vous-devez-savoir',
      },
    ],
  },
  {
    slug: 'agir-a-temps',
    title: 'Agir à temps',
    body: 'Pour un litige civil, vous avez en général 5 ans pour agir en justice. Une conciliation ou une médiation suspend ce délai pendant sa durée : tenter l’amiable ne vous fait pas perdre vos droits.',
  },
]
