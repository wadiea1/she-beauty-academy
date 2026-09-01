import type { MetadataRoute } from 'next'
import { absoluteUrl, isSearchIndexingAllowed } from '@/lib/seo/baseUrl'

// robots.js/ts is a special Route Handler that Next caches by
// default (see the file-convention docs), which would otherwise bake
// in whatever ALLOW_SEARCH_INDEXING/NEXT_PUBLIC_SERVER_URL happen to
// be set at `next build` time — wrong if a deployment platform lets
// either change without a full rebuild. force-dynamic (not a
// `revalidate` export — see sitemap.ts's comment for why that
// alternative caused a real CI failure on that file) defers this to
// request time instead, matching every other route in this app; no
// database access here either way, so no build-time cost either way.
export const dynamic = 'force-dynamic'

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
