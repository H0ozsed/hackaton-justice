import localFont from 'next/font/local'

// Fonts of the French State design charter (docs/CHARTE_GRAPHIQUE.pdf, p. 41-44).
// Files taken from the DSFR (@gouvfr/dsfr): Marianne is restricted to French
// State bodies, do not reuse it outside this context.

// Main typeface: the 4 weights shipped by the DSFR.
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

// Secondary typeface: use sparingly (quotes, secondary content).
export const spectral = localFont({
  src: [
    { path: '../fonts/Spectral-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/Spectral-ExtraBold.woff2', weight: '800', style: 'normal' },
  ],
  display: 'swap',
  fallback: ['georgia', 'serif'],
})
