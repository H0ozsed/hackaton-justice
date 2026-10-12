import '@/styles/globals.css'
import type { AppProps } from 'next/app'

import { SiteLayout } from '@/components/layout/site-layout'
import { marianne, spectral } from '@/lib/fonts'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Posé sur :root (et pas sur un wrapper) pour que les portails Radix
          (dialog, popover...) rendus hors de l'arbre héritent aussi des polices. */}
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
