// Site-wide info: single source for the navbar, the footer, page titles
// and the home page cards. Labels are site content: in French.

import { BookOpenIcon, ClipboardListIcon, Gamepad2Icon, type LucideIcon } from 'lucide-react'

export const SITE_NAME = 'Hackaton Justice'

export type NavItem = {
  href: string
  label: string
}

// Main journeys (docs/PARCOURS_UTILISATEURS.md).
export const MAIN_NAV: NavItem[] = [
  { href: '/', label: 'Accueil' },
  { href: '/simulation', label: 'Ma situation ?' },
  { href: '/mise-en-situation', label: 'Mise en situation' },
  { href: '/apprendre', label: 'Apprendre' },
  { href: '/demarches', label: 'Démarches' },
]

export type Journey = NavItem & {
  /** One sentence: what the user will do in this journey. */
  description: string
  /** Button text, explicit out of context (RGAA 6.1). */
  cta: string
  icon: LucideIcon
}

// The 3 journeys, in MAIN_NAV order: linked from « Par où commencer ? » on the home page.
export const JOURNEYS: Journey[] = [
  {
    href: '/simulation',
    label: 'Ma situation ?',
    description:
      'Répondez à quelques questions sur votre conflit et découvrez la solution amiable la plus adaptée.',
    cta: 'Faire le point sur ma situation',
    icon: ClipboardListIcon,
  },
  {
    href: '/mise-en-situation',
    label: 'Mise en situation',
    description:
      'Vivez un conflit fictif, faites vos choix et obtenez un bilan pour savoir comment réagir.',
    cta: 'Lancer la mise en situation',
    icon: Gamepad2Icon,
  },
  {
    href: '/apprendre',
    label: 'Apprendre',
    description:
      'Comprenez la conciliation, la médiation et les mots clés grâce aux quiz et au lexique.',
    cta: 'Découvrir les notions clés',
    icon: BookOpenIcon,
  },
]

// Legal links of the footer (content: GDPR / RGAA issues).
export const FOOTER_NAV: NavItem[] = [
  { href: '/mentions-legales', label: 'Mentions légales' },
  { href: '/confidentialite', label: 'Données personnelles' },
  { href: '/accessibilite', label: 'Accessibilité : non conforme' },
]
