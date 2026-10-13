import type { PracticalInfoInput } from './schema'

// Field names in English, content in French (shown to users). See src/shared/README.md.
// Facts checked against justice.fr and the DGCCRF (October 2026); to be proofread (#120).
// Points-justice and CDAD: #94.
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
    body: 'Les points-justice offrent une information juridique gratuite et vous orientent vers la bonne démarche ; on peut y rencontrer un conciliateur de justice, gratuit, ou un médiateur. À La Réunion, ils sont coordonnés par le CDAD (conseil départemental de l’accès au droit).',
    links: [
      {
        label: 'L’accès au droit et les points-justice à La Réunion',
        href: 'https://www.cours-appel.justice.fr/saint-denis/acces-au-droit-la-reunion',
      },
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
