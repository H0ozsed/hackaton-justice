// Site-wide info: single source for the navbar, the footer, page titles
// and (later) the home page cards. Labels are site content: in French.

export const SITE_NAME = 'Hackaton Justice'

export type NavItem = {
  href: string
  label: string
}

// Main journeys (docs/PARCOURS_UTILISATEURS.md).
export const MAIN_NAV: NavItem[] = [
  { href: '/', label: 'Accueil' },
  { href: '/simulation', label: 'Simulation' },
  { href: '/mise-en-situation', label: 'Mise en situation' },
  { href: '/apprendre', label: 'Apprendre' },
]

// Legal links of the footer (content: GDPR / RGAA issues).
export const FOOTER_NAV: NavItem[] = [
  { href: '/mentions-legales', label: 'Mentions légales' },
  { href: '/confidentialite', label: 'Données personnelles' },
  { href: '/accessibilite', label: 'Accessibilité : non conforme' },
]
