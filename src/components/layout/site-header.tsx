import { MenuIcon, XIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { MAIN_NAV, SITE_NAME } from '@/lib/site'
import { cn } from '@/lib/utils'

export function SiteHeader() {
  const { pathname } = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold text-bleu-france">
          {SITE_NAME}
        </Link>

        {/* Bouton du menu mobile : aria-expanded annonce l'état ouvert/fermé,
            aria-controls relie le bouton à la liste qu'il affiche. */}
        <Button
          variant="ghost"
          size="icon-lg"
          className="md:hidden"
          aria-expanded={menuOpen}
          aria-controls="menu-principal"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <XIcon aria-hidden /> : <MenuIcon aria-hidden />}
          <span className="sr-only">{menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}</span>
        </Button>

        <nav aria-label="Menu principal" className="hidden md:block">
          <NavList pathname={pathname} />
        </nav>
      </div>

      {menuOpen && (
        <nav id="menu-principal" aria-label="Menu principal" className="border-t md:hidden">
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
        const current = pathname === href
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              // Page courante annoncée aux lecteurs d'écran, pas seulement par la couleur.
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
