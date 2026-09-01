import type { Locale } from '@/i18n/config'
import type { ImageRef } from '@/lib/payload/queries'
import { absoluteUrl } from './baseUrl'

// Real, documented Open Graph / Facebook locale codes — not invented.
// 'ar_AR' is Facebook's own generic Arabic entry (Arabic doesn't map
// to one specific country the way most other og:locale values do).
const OG_LOCALE: Record<Locale, string> = { ar: 'ar_AR', he: 'he_IL', en: 'en_US' }

export function ogLocaleFor(locale: Locale): string {
  return OG_LOCALE[locale]
}

/**
 * Picks the first real image out of `candidates` (in priority order),
 * converts it to an absolute URL (required for og:image/twitter:image),
 * and returns the `openGraph.images` shape — or `undefined` if none
 * of the candidates have one, so the field is omitted entirely rather
 * than pointing at a fabricated image. Typical call:
 * `resolveOgImage(course.heroImage, siteSettings.defaultSeo.ogImage)`
 * — the course's own real photo first, the site's configured default
 * second, nothing invented either way.
 */
export function resolveOgImage(
  ...candidates: (ImageRef | null | undefined)[]
): { url: string; alt: string }[] | undefined {
  for (const candidate of candidates) {
    if (candidate?.src) {
      return [{ url: absoluteUrl(candidate.src), alt: candidate.alt }]
    }
  }
  return undefined
}
