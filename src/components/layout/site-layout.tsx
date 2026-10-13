import type { ReactNode } from 'react'

import { SiteFooter } from './site-footer'
import { SiteHeader } from './site-header'
import { SkipLink } from './skip-link'

// Structure shared by every page: header / main / footer regions
// that screen readers can jump to (RGAA 12.6).
export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <SiteHeader />
      {/* tabIndex={-1}: lets the skip link move the focus here. pb-24: the floating IRIS button
          never hides the end of the content (WCAG 2.4.11). */}
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 px-4 pt-8 pb-24 outline-none"
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
