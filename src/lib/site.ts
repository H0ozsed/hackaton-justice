// Infos globales du site : une seule source pour la navbar, le footer,
// les titres de page et (plus tard) les cartes de l'accueil.

export const SITE_NAME = 'Hackaton Justice'

export type NavItem = {
  href: string
  label: string
}

// Parcours principaux (docs/PARCOURS_UTILISATEURS.md).
export const MAIN_NAV: NavItem[] = [
  { href: '/', label: 'Accueil' },
  { href: '/simulation', label: 'Simulation' },
  { href: '/mise-en-situation', label: 'Mise en situation' },
  { href: '/apprendre', label: 'Apprendre' },
]

// Liens réglementaires du pied de page (contenu : issue RGPD / RGAA).
export const FOOTER_NAV: NavItem[] = [
  { href: '/mentions-legales', label: 'Mentions légales' },
  { href: '/confidentialite', label: 'Données personnelles' },
  { href: '/accessibilite', label: 'Accessibilité : non conforme' },
]
