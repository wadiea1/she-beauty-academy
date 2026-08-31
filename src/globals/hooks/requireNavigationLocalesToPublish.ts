import type { GlobalBeforeChangeHook } from 'payload'
import { locales } from '@/i18n/config'
import { activeLocaleOf, fetchExistingGlobal, isEmptyValue, publishBlockedError } from './localeGuard'

interface NavItemRow {
  id?: string
  label?: unknown
}

/**
 * Every nav item's label must exist in all 3 locales before publishing —
 * a menu item with a blank label in one language is a broken menu, not
 * just an incomplete one. Rows are matched by their stable array-item
 * `id` across the incoming (active-locale) array and the existing
 * (all-locale) array, since the row list itself isn't localized — only
 * each row's `label` field is.
 */
export const requireNavigationLocalesToPublish: GlobalBeforeChangeHook = async ({ data, req }) => {
  if (data?._status !== 'published') return data

  const activeLocale = activeLocaleOf(req)
  const existing = (await fetchExistingGlobal(req, 'navigation')) as { items?: NavItemRow[] } | null
  const existingItems = existing?.items ?? []

  const incomingItems = (data as { items?: NavItemRow[] } | undefined)?.items
  // The authoritative row list for this check: whichever array reflects
  // this save (incoming, for the locale being saved) falling back to the
  // last-known set of rows so unrelated-locale publishes still see them.
  const rows = incomingItems ?? existingItems

  const missing: string[] = []
  rows.forEach((row, index) => {
    const existingRow = row.id ? existingItems.find((r) => r.id === row.id) : undefined
    const existingLabel = existingRow?.label as Record<string, unknown> | undefined

    for (const locale of locales) {
      const incomingLabel = activeLocale === locale ? row.label : undefined
      const value = incomingLabel ?? existingLabel?.[locale]
      if (isEmptyValue(value)) missing.push(`items[${index}].label (${locale})`)
    }
  })

  if (missing.length > 0) throw publishBlockedError(missing)
  return data
}
