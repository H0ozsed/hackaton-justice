import Link from 'next/link'

import { FOOTER_NAV, SITE_NAME } from '@/lib/site'

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t-2 border-france-blue">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
        <p className="font-bold">{SITE_NAME}</p>
        <nav aria-label="Liens réglementaires">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {FOOTER_NAV.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="underline underline-offset-4 hover:text-france-blue">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
