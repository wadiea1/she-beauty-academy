import {
  IBM_Plex_Sans,
  IBM_Plex_Sans_Arabic,
  IBM_Plex_Sans_Hebrew,
  Reem_Kufi,
  Frank_Ruhl_Libre,
  Bodoni_Moda,
} from 'next/font/google'

// Body / UI
export const plexLatin = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body-latin',
  display: 'swap',
})

export const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body-arabic',
  display: 'swap',
})

export const plexHebrew = IBM_Plex_Sans_Hebrew({
  subsets: ['hebrew'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body-hebrew',
  display: 'swap',
})

// Display
export const reemKufi = Reem_Kufi({
  subsets: ['arabic'],
  variable: '--font-display-arabic',
  display: 'swap',
})

export const frankRuhl = Frank_Ruhl_Libre({
  subsets: ['hebrew'],
  weight: ['400', '500', '700'],
  variable: '--font-display-hebrew',
  display: 'swap',
})

export const bodoniModa = Bodoni_Moda({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-display-latin',
  display: 'swap',
})