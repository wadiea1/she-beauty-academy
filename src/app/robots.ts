import type { MetadataRoute } from 'next'
import { absoluteUrl, isSearchIndexingAllowed } from '@/lib/seo/baseUrl'

// robots.js/ts is a special Route Handler that Next caches by default
// (see the file-convention docs) — this `revalidate` export is the
// documented way to opt out of that, and unlike the page-rendering
// case (see [locale]/layout.tsx's own comment on its own, ineffective
// `revalidate` export), it genuinely applies here: Route Handler
// caching is a materially different mechanism from page/fetch
// caching.
export const revalidate = 60

/**
 * Never a hardcoded `Disallow: /` guess, and never a blanket `Allow`
 * either — gated on `isSearchIndexingAllowed()` (env-driven, safe by
 * default; see src/lib/seo/baseUrl.ts). Until Milestone M explicitly
 * turns this on for the real production deployment, every environment
 * (including this one) truthfully disallows everything, so a
 * dev/staging URL can never accidentally get indexed.
 *
 * This is a crawler-cooperation signal, not a security boundary —
 * /admin and /api are listed here for well-behaved crawlers, but the
 * actual protection for both is Payload's own access control
 * (native drafts, publishedOnlyAccess, the Milestone J RBAC system),
 * completely unaffected by what this file says.
 */
export default function robots(): MetadataRoute.Robots {
  if (!isSearchIndexingAllowed()) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }

  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
