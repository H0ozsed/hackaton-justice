import localFont from 'next/font/local'

// Polices de la charte graphique de l'État (docs/CHARTE_GRAPHIQUE.pdf, p. 41-44).
// Fichiers issus du DSFR (@gouvfr/dsfr) : la Marianne est réservée aux acteurs
// de la sphère étatique, ne pas la réutiliser hors de ce cadre.

// Typographie principale : 4 graisses fournies par le DSFR.
export const marianne = localFont({
  src: [
    { path: '../fonts/Marianne-Light.woff2', weight: '300', style: 'normal' },
    { path: '../fonts/Marianne-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/Marianne-Regular_Italic.woff2', weight: '400', style: 'italic' },
    { path: '../fonts/Marianne-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/Marianne-Bold.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  fallback: ['arial', 'sans-serif'],
})

// Typographie de complément : avec parcimonie (citations, contenus secondaires).
export const spectral = localFont({
  src: [
    { path: '../fonts/Spectral-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/Spectral-ExtraBold.woff2', weight: '800', style: 'normal' },
  ],
  display: 'swap',
  fallback: ['georgia', 'serif'],
})
