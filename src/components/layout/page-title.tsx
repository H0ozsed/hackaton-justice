import Head from 'next/head'

import { SITE_NAME } from '@/lib/site'

// Unique tab title per page (RGAA 8.6): "Page | Site name".
// Without `title`, only the site name is shown (home page).
// `description` fills the meta description (search results, link previews).
export function PageTitle({ title, description }: { title?: string; description?: string }) {
  return (
    <Head>
      <title>{title ? `${title} | ${SITE_NAME}` : SITE_NAME}</title>
      {description && <meta name="description" content={description} />}
    </Head>
  )
}
