import 'server-only'

const DEV_FALLBACK_URL = 'http://localhost:3000'

let warnedMissingBaseUrl = false

/**
 * The site's own absolute base URL — the single source of truth every
 * other SEO piece (metadataBase, canonical/hreflang, sitemap, JSON-LD
 * `url` fields) builds on. Reads `NEXT_PUBLIC_SERVER_URL`, already
 * present in `.env`/`.env.example` since before this milestone but
 * unused anywhere in the codebase until now.
 *
 * Deliberately never guesses a production domain
 * (`shebeautyacademy.com`, `example.com`, …) — that would be exactly
 * the kind of fabricated business fact this project's rules forbid.
 * When unset, falls back to `http://localhost:3000` (correct for
 * local dev, since that genuinely is the site's own address there)
 * and logs a warning once so a misconfigured non-dev environment is
 * loud, not silently wrong. Setting the real production URL here is
 * Milestone M's job — see docs/IMPLEMENTATION_PLAN.md.
 */
export function getBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SERVER_URL?.trim()
  if (configured) return configured.replace(/\/+$/, '')

  if (!warnedMissingBaseUrl) {
    warnedMissingBaseUrl = true
    console.warn(
      `[seo] NEXT_PUBLIC_SERVER_URL is not set — falling back to "${DEV_FALLBACK_URL}". ` +
        'This is expected in local development only; a real deployment must set this to its actual domain (see docs/IMPLEMENTATION_PLAN.md, Milestone K).',
    )
  }
  return DEV_FALLBACK_URL
}

/** `new URL(getBaseUrl())`, for `metadataBase` and similar APIs that
 * want a `URL` instance rather than a string. */
export function getMetadataBaseUrl(): URL {
  return new URL(getBaseUrl())
}

/** Resolves `path` (relative or already-absolute) against the site's
 * own base URL. Safe to call with an already-absolute URL (e.g. a
 * value straight from Payload's Media.url, whose exact shape isn't
 * guaranteed) — `URL`'s own resolution leaves an absolute input
 * untouched. */
export function absoluteUrl(path: string): string {
  return new URL(path, getBaseUrl()).toString()
}

/**
 * Whether this deployment is allowed to invite search-engine
 * indexing — gated on an explicit, deliberate opt-in
 * (`ALLOW_SEARCH_INDEXING=true`), not on `NODE_ENV`. `NODE_ENV`
 * alone can't distinguish a real production deploy from a staging/
 * preview one: most hosting providers run production builds for
 * preview deployments too, so `NODE_ENV === 'production'` is true in
 * both. Safe by default: unset (every environment today, including
 * local dev) means disallowed. Only Milestone M, configuring the
 * real production environment, should ever set this to `"true"`.
 *
 * Server-only and deliberately not prefixed `NEXT_PUBLIC_` — it's
 * read exclusively inside robots.ts/sitemap.ts (Route Handlers that
 * only ever run on the server), never in browser code, so exposing
 * it to the client bundle would be pointless.
 */
export function isSearchIndexingAllowed(): boolean {
  return process.env.ALLOW_SEARCH_INDEXING === 'true'
}

/**
 * The `robots` metadata value every real, indexable page should set
 * explicitly — gated on `isSearchIndexingAllowed()`. Deliberately
 * NOT set as a blanket default in the shared `[locale]/layout.tsx`:
 * that was tried and produced a real, verified bug — Next's
 * `not-found.tsx` boundary doesn't inherit the failing route's own
 * `page.tsx` `generateMetadata` (only its ancestor layouts'), so a
 * layout-level "index, follow" default leaked onto an invalid course
 * slug's 404 page as a second, conflicting meta tag alongside Next's
 * own auto-injected `noindex`. Each real page (`[locale]/page.tsx`,
 * `courses/[slug]/page.tsx`'s found-course branch) calls this itself
 * instead, so a route with no explicit robots value — like a 404 —
 * has nothing positive to inherit.
 */
export function getRobotsMetadata(): { index: boolean; follow: boolean } {
  const allowed = isSearchIndexingAllowed()
  return { index: allowed, follow: allowed }
}
