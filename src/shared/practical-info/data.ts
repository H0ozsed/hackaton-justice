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
    body: 'Les points-justice offrent une information juridique gratuite et vous orientent vers la bonne démarche ; c’est souvent là que le conciliateur de justice, gratuit, tient ses permanences. À La Réunion, ils sont coordonnés par le CDAD (conseil départemental de l’accès au droit).',
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
    // Mediators are reached through mediation centres, not individually nor through a
    // point-justice, which is mostly where conciliators hold their sessions (#124, feedback of
    // 13 Oct 2026). TO VALIDATE (#120).
    slug: 'trouver-un-mediateur',
    title: 'Trouver un médiateur',
    body: 'Un médiateur se trouve rarement seul : adressez-vous directement à un centre ou une association de médiation, qui vous mettra en relation avec l’un de ses médiateurs. Chaque cour d’appel publie aussi une liste de médiateurs. Pour un conflit familial, contactez un service de médiation familiale (Caf, association conventionnée). Pour un litige avec un professionnel, c’est son médiateur de la consommation.',
    links: [
      {
        label: 'Le médiateur civil sur justice.fr',
        href: 'https://www.justice.fr/fiche/mediateur-civil',
      },
      {
        label: 'La médiation familiale (Caf)',
        href: 'https://caf.fr/professionnels/offres-et-services/dispositifs-partenaires/mediation-familiale',
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
