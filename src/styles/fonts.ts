import {
  IBM_Plex_Sans,
  IBM_Plex_Sans_Arabic,
  IBM_Plex_Sans_Hebrew,
  Reem_Kufi,
  Frank_Ruhl_Libre,
  Bodoni_Moda,
} from 'next/font/google'

// All six fonts are declared unconditionally (next/font requires this —
// the loader calls must live at module scope). `preload: false` on every
// one means none of them is force-fetched on page load; globals.css maps
// --font-body/--font-display to the right family per `:lang()`, so the
// browser only ever fetches the font actually needed to paint text for
// the active locale.

// Body / UI
export const plexLatin = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body-latin',
  display: 'swap',
  preload: false,
})

export const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body-arabic',
  display: 'swap',
  preload: false,
})

export const plexHebrew = IBM_Plex_Sans_Hebrew({
  subsets: ['hebrew'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body-hebrew',
  display: 'swap',
  preload: false,
})

// Display
export const reemKufi = Reem_Kufi({
  subsets: ['arabic'],
  variable: '--font-display-arabic',
  display: 'swap',
  preload: false,
})

export const frankRuhl = Frank_Ruhl_Libre({
  subsets: ['hebrew'],
  weight: ['400', '500', '700'],
  variable: '--font-display-hebrew',
  display: 'swap',
  preload: false,
})

export const bodoniModa = Bodoni_Moda({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-display-latin',
  display: 'swap',
  preload: false,
})

/** Applied once on <html> — every variable is always present; only the
 * ones referenced by the active `:lang()` rule in globals.css are ever
 * fetched. */
export const allFontVariables = [
  plexLatin.variable,
  plexArabic.variable,
  plexHebrew.variable,
  reemKufi.variable,
  frankRuhl.variable,
  bodoniModa.variable,
].join(' ')
