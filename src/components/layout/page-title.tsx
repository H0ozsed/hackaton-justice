import Head from 'next/head'

import { SITE_NAME } from '@/lib/site'

// Titre d'onglet unique par page (RGAA 8.6) : "Page | Nom du site".
// Sans `title`, seul le nom du site est affiché (page d'accueil).
export function PageTitle({ title }: { title?: string }) {
  return (
    <Head>
      <title>{title ? `${title} | ${SITE_NAME}` : SITE_NAME}</title>
    </Head>
  )
}
