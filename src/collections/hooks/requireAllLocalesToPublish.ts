import type { CollectionBeforeChangeHook } from 'payload'
import { locales } from '@/i18n/config'

/**
 * Blocks publishing (`status` -> `'published'`) unless every locale
 * (ar/he/en) has a non-empty value for each of the given localized
 * fields. Content can still be saved as a draft with only some locales
 * filled in — this only gates the transition to published.
 *
 * Payload's localization UI edits one locale per request (a locale
 * selector, not per-field tabs), so `data` only carries the locale
 * currently being saved; the other locales' values are fetched via the
 * Local API to check completeness.
 *
 * See AGENTS.md §5: "Critical Hebrew/English content should NOT
 * silently fall back to Arabic... implement validation/publication
 * safeguards so important public content cannot accidentally be
 * published with missing translations."
 */
export function requireAllLocalesToPublish(fieldNames: string[]): CollectionBeforeChangeHook {
  return async ({ data, originalDoc, req, collection }) => {
    if (data?.status !== 'published') return data

    const id = (originalDoc as { id?: number | string } | undefined)?.id
    const activeLocale = req.locale && req.locale !== 'all' ? req.locale : undefined

    // Deliberately NOT threading the current `req` through this nested
    // read: sharing `req` with an in-flight beforeChange hook on the same
    // document corrupts the outer update — verified by reproducing it
    // (the outer operation's own locale field silently failed to persist
    // when this nested call shared `req`). Omitting `req` gives this read
    // its own request context and reads last-committed data instead,
    // which is what we want here anyway (checking already-saved locale
    // completeness, not speculative in-flight state).
    const existing = id
      ? await req.payload
          .findByID({
            collection: collection.slug,
            id,
            locale: 'all',
            depth: 0,
            overrideAccess: true,
          })
          .catch(() => null)
      : null

    const missing: string[] = []
    for (const field of fieldNames) {
      const existingField = (existing as Record<string, unknown> | null)?.[field] as
        | Record<string, unknown>
        | undefined

      for (const locale of locales) {
        const incoming = activeLocale === locale ? (data as Record<string, unknown>)[field] : undefined
        const value = incoming ?? existingField?.[locale]
        const isEmpty = value === undefined || value === null || (typeof value === 'string' && value.trim() === '')
        if (isEmpty) missing.push(`${field} (${locale})`)
      }
    }

    if (missing.length > 0) {
      throw new Error(
        `Cannot publish — missing content: ${missing.join(', ')}. Fill in Arabic, Hebrew, and English before publishing.`,
      )
    }

    return data
  }
}
