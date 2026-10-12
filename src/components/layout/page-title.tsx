import Head from 'next/head'

import { SITE_NAME } from '@/lib/site'

// Unique tab title per page (RGAA 8.6): "Page | Site name".
// Without `title`, only the site name is shown (home page).
export function PageTitle({ title }: { title?: string }) {
  return (
    <Head>
      <title>{title ? `${title} | ${SITE_NAME}` : SITE_NAME}</title>
    </Head>
  )
}
