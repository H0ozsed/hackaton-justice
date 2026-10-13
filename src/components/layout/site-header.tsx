import { MenuIcon, XIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { MAIN_NAV, SITE_NAME } from '@/lib/site'
import { cn } from '@/lib/utils'

const BLOC_MARQUE_ALT = 'Ministère de la Justice. Liberté, Égalité, Fraternité'
import { ThemeToggle } from './theme-toggle'

export function SiteHeader() {
  const { pathname } = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Bloc-marque of the Ministère de la Justice (#143): the State identity, in its
              light version or its white-text version for the dark theme (#132). Small PNGs,
              served as they are. */}
          <Image
            src="/images/bloc-marque-justice.png"
            alt={BLOC_MARQUE_ALT}
            width={309}
            height={240}
            unoptimized
            priority
            className="h-12 w-auto sm:h-14 dark:hidden"
          />
          <Image
            src="/images/bloc-marque-justice-sombre.png"
            alt={BLOC_MARQUE_ALT}
            width={309}
            height={240}
            unoptimized
            className="hidden h-12 w-auto sm:h-14 dark:block"
          />
          <span aria-hidden className="h-10 border-l border-border" />
          <Link href="/" className="text-lg font-bold text-france-blue">
            {SITE_NAME}
          </Link>
        </div>

        <div className="flex items-center gap-1">
          <nav aria-label="Menu principal" className="hidden md:block">
            <NavList pathname={pathname} />
          </nav>

          <ThemeToggle />

          {/* Mobile menu button: aria-expanded announces the open/closed state,
              aria-controls links the button to the list it shows. */}
          <Button
            variant="ghost"
            size="icon-lg"
            className="md:hidden"
            aria-expanded={menuOpen}
            aria-controls="main-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <XIcon aria-hidden /> : <MenuIcon aria-hidden />}
            <span className="sr-only">{menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}</span>
          </Button>
        </div>
      </div>

      {menuOpen && (
        <nav id="main-menu" aria-label="Menu principal" className="border-t md:hidden">
          <NavList pathname={pathname} vertical onNavigate={() => setMenuOpen(false)} />
        </nav>
      )}
    </header>
  )
}

function NavList({
  pathname,
  vertical = false,
  onNavigate,
}: {
  pathname: string
  vertical?: boolean
  onNavigate?: () => void
}) {
  return (
    <ul className={cn('flex gap-1', vertical ? 'flex-col px-4 py-2' : 'items-center')}>
      {MAIN_NAV.map(({ href, label }) => {
        // A journey stays current on its sub-pages (/apprendre/lexique → Apprendre).
        const current =
          href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              // Current page announced to screen readers, not only shown by color.
              aria-current={current ? 'page' : undefined}
              className={cn(
                'block rounded-md px-3 py-2 font-medium hover:bg-accent hover:text-accent-foreground',
                current && 'bg-secondary text-secondary-foreground underline underline-offset-4',
              )}
            >
              {label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
