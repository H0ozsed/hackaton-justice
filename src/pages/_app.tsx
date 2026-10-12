import '@/styles/globals.css'
import type { AppProps } from 'next/app'

import { SiteLayout } from '@/components/layout/site-layout'
import { marianne, spectral } from '@/lib/fonts'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Set on :root (not on a wrapper) so that Radix portals (dialog, popover...)
          rendered outside the tree inherit the fonts too. */}
      <style jsx global>{`
        :root {
          --font-marianne: ${marianne.style.fontFamily};
          --font-spectral: ${spectral.style.fontFamily};
        }
      `}</style>
      <SiteLayout>
        <Component {...pageProps} />
      </SiteLayout>
    </>
  )
}
