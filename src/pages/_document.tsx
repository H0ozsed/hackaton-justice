import { Html, Head, Main, NextScript } from 'next/document'

import { THEME_SCRIPT } from '@/lib/theme'

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        {/* Sets the light / dark theme before the first paint: no white flash (#132). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
