import type { ReactNode } from 'react'

import { SiteFooter } from './site-footer'
import { SiteHeader } from './site-header'
import { SkipLink } from './skip-link'

// Structure commune à toutes les pages : régions header / main / footer
// repérables par les lecteurs d'écran (RGAA 12.6).
export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <SiteHeader />
      {/* tabIndex={-1} : le lien d'évitement peut y déplacer le focus. */}
      <main
        id="contenu"
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 outline-none"
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
