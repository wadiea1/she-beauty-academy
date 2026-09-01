import type { CourseDetail } from './payload/queries'

/**
 * Formats a course's price for display, or returns `null` when there's
 * nothing to show (`onRequest`/`hidden`, or a type whose required
 * amount fields aren't set yet). Never invents a number — `null` here
 * means the caller should render the neutral "pricing on request"
 * message instead, not a placeholder value.
 *
 * Numerals are forced to `en-US` formatting regardless of page locale,
 * matching the plain Western-numeral style already used elsewhere on
 * the site (e.g. CourseCard's "01"/"02"/"03" index badges) rather than
 * switching to Eastern Arabic-Indic digits for `ar`.
 */
export function formatCoursePrice(
  pricing: CourseDetail['pricing'],
  startingFromLabel: string,
): string | null {
  const symbol = pricing.currency === 'USD' ? '$' : '₪'
  const format = (value: number) => `${symbol}${value.toLocaleString('en-US')}`

  switch (pricing.type) {
    case 'exact':
      return pricing.price != null ? format(pricing.price) : null
    case 'startingFrom':
      return pricing.price != null ? `${startingFromLabel} ${format(pricing.price)}` : null
    case 'range':
      return pricing.priceRangeMin != null && pricing.priceRangeMax != null
        ? `${format(pricing.priceRangeMin)}–${format(pricing.priceRangeMax)}`
        : null
    case 'onRequest':
    case 'hidden':
      return null
  }
}
