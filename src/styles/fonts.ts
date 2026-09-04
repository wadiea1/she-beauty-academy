import {
  IBM_Plex_Sans,
  IBM_Plex_Sans_Arabic,
  IBM_Plex_Sans_Hebrew,
  Amiri,
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

// Kept deliberately for Arabic BODY copy. Amiri (below) is a display
// face: beautiful at headline sizes, markedly less comfortable for
// paragraphs, forms and UI labels at 14–18px. The luxury pairing here is
// calligraphic serif display + clean humanist sans body, which is also
// what makes long Arabic paragraphs stay readable.
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

/**
 * Arabic display face. Replaces Reem Kufi, which was the single biggest
 * visual problem on the site.
 *
 * Reem Kufi is a *Kufi* face: geometric, monolinear, architectural. At
 * headline sizes its kashida connectors stretch into long flat
 * horizontal bars, so words lose their silhouette and become harder to
 * parse — and with no stroke modulation it reads as signage rather than
 * luxury. It also left Arabic, the default and most important locale,
 * with a visibly *less* premium page than `/en`, which gets the
 * high-contrast Bodoni Moda below.
 *
 * Amiri is a Naskh revival with real calligraphic stroke contrast — the
 * closest Arabic analogue to what a didone does for Latin, and the
 * reason the two now sit together coherently.
 *
 * Loaded with the Arabic subset only, which keeps the download small.
 *
 * Note this does NOT stop Amiri claiming Latin characters, and two
 * separate attempts to make it stop were abandoned as unsound:
 *
 *  - Subsetting does not gate it. next/font self-hosts the subset as a
 *    single @font-face and emits no `unicode-range` at all (verified:
 *    zero occurrences in the built CSS), so the family matches every
 *    glyph its file happens to contain — and Amiri ships a Latin design.
 *  - Putting Bodoni ahead of Amiri in the chain to claim Latin first
 *    breaks Arabic outright. `adjustFontFallback: false` is not honoured
 *    here — "Bodoni Moda Fallback" stays in the chain regardless, it is
 *    a local Times-metric family with no unicode-range, and Times New
 *    Roman ships Arabic on Windows. CDP confirmed it painting every
 *    Arabic heading while Amiri never loaded at all.
 *
 * So Latin inside Arabic headings renders in Amiri's own Latin. That is
 * also the typographically better outcome: a companion Latin drawn for
 * the same family matches the Arabic's weight, contrast and rhythm,
 * where a didone dropped into an Arabic line does not.
 */
export const amiri = Amiri({
  subsets: ['arabic'],
  // 400 only. Nothing on the site sets a bold display weight — Heading
  // is `font-normal` everywhere and no call site overrides it. Measured
  // before and after: this does not change the /ar payload, because a
  // weight nothing references was never fetched in the first place. It
  // is kept because declaring a weight the design does not use is dead
  // configuration that would start costing bytes the moment someone
  // added a `font-bold` to a heading without thinking about it.
  //
  // The real cost of this typeface is the Arabic subset itself: 106.6KB
  // against Reem Kufi's ~33KB, measured on a cold /ar load. That is
  // inherent to Amiri's glyph coverage and contextual forms — the thing
  // that makes it beautiful is the thing that makes it big. It loads
  // with `display: 'swap'` so text is never invisible, and it is cached
  // after the first visit.
  weight: ['400'],
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

/**
 * Latin display face. Used for the whole page on `/en`, and for the
 * "SHE" logotype nowhere else — see the note on locale self-consistency
 * in globals.css.
 */
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
  amiri.variable,
  frankRuhl.variable,
  bodoniModa.variable,
].join(' ')
