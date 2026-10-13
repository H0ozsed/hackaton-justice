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
  { href: '/simulation', label: 'J’ai un conflit ?' },
  { href: '/mise-en-situation', label: 'Mise en situation' },
  { href: '/apprendre', label: 'Apprendre' },
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
    label: 'J’ai un conflit ?',
    description:
      'Répondez à quelques questions sur votre conflit et découvrez la solution amiable la plus adaptée.',
    cta: 'Trouver une solution à mon conflit',
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

// Publisher and host, shown on /mentions-legales, /confidentialite and /accessibilite (#25).
// Taken from justice.gouv.fr (mentions légales, données personnelles), checked 2026-10-13.
export const PUBLISHER = {
  name: 'Ministère de la Justice, Secrétariat général',
  address: '13 place Vendôme, 75042 Paris Cedex 01',
  /** A role, not a name: it stays right when the person changes. */
  publicationDirector:
    'Le délégué à l’information et à la communication du ministère de la Justice',
  contact: {
    label: 'formulaire « Question au ministère de la Justice »',
    href: 'https://www.demarches-simplifiees.fr/commencer/questions-au-ministere-de-la-justice',
  },
  /** Data protection officer (délégué à la protection des données). */
  dpo: {
    email: 'dpd@justice.gouv.fr',
    address: 'Ministère de la Justice, DPD, 13 place Vendôme, 75001 Paris',
  },
  host: {
    name: 'Service du numérique du ministère de la Justice',
    address: '13 place Vendôme, 75042 Paris Cedex 01',
    location: 'France',
  },
}

// Legal links of the footer (content: GDPR / RGAA issues).
export const FOOTER_NAV: NavItem[] = [
  { href: '/mentions-legales', label: 'Mentions légales' },
  { href: '/confidentialite', label: 'Données personnelles' },
  { href: '/cookies', label: 'Cookies' },
  { href: '/accessibilite', label: 'Accessibilité' },
]
