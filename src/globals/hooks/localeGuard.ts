import type { PayloadRequest } from 'payload'
import type { GlobalSlug } from 'payload'

export function isEmptyValue(value: unknown): boolean {
  return value === undefined || value === null || (typeof value === 'string' && value.trim() === '')
}

/**
 * Fetches the last-committed (all-locale) state of a global. Deliberately
 * does NOT thread the current request's `req` — sharing `req` with a
 * nested read inside a beforeChange hook on the same document corrupted
 * the outer write when this was tried on a collection hook (see
 * src/collections/hooks/requireAllLocalesToPublish.ts). Omitting `req`
 * gives this read its own context, which is what we want anyway: we're
 * checking already-saved locale completeness, not in-flight state.
 *
 * `draft: true` reads the latest version regardless of status, so a
 * locale saved as a draft still counts toward completeness — otherwise
 * publishing the final locale would see the other two as "missing" even
 * though they're saved, just not yet published.
 */
export async function fetchExistingGlobal(req: PayloadRequest, slug: GlobalSlug) {
  return req.payload
    .findGlobal({ slug, locale: 'all', depth: 0, draft: true, overrideAccess: true })
    .catch(() => null)
}

export function activeLocaleOf(req: PayloadRequest): string | undefined {
  return req.locale && req.locale !== 'all' ? req.locale : undefined
}

export function publishBlockedError(missing: string[]): Error {
  return new Error(
    `Cannot publish — missing content: ${missing.join(', ')}. Fill in Arabic, Hebrew, and English before publishing.`,
  )
}
