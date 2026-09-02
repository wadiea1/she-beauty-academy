import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

/**
 * Security headers applied to every response.
 *
 * Deliberately limited to headers that are unambiguously safe for this
 * stack — a Next.js public site and a Payload Admin panel served from
 * the same origin. Each one below was verified against both surfaces,
 * not copied from a generic list.
 *
 * Two notable omissions, both deliberate:
 *
 * - **Content-Security-Policy.** Not shipped. A meaningful CSP here
 *   needs directives covering Next's inline bootstrap/RSC scripts
 *   (nonce plumbing, or an `unsafe-inline` that gives most of the
 *   protection back), Payload Admin's bundled Monaco editor and its
 *   blob workers, and the Google Fonts stylesheet/font origins used by
 *   next/font. A policy that is wrong in production breaks the admin
 *   panel for staff with no obvious cause, and there is no production
 *   environment to test against yet. Tracked as an explicit hardening
 *   item in docs/DEPLOYMENT.md rather than shipped broken.
 *
 * - **Strict-Transport-Security.** Not set here. HSTS is a commitment
 *   about a *domain*, and no domain exists yet; `includeSubDomains` or
 *   `preload` on a domain whose subdomains aren't all HTTPS is
 *   actively harmful and slow to undo. It belongs to the TLS/edge
 *   layer at deploy time — see the runbook.
 */
const securityHeaders = [
  // Stops browsers from MIME-sniffing a response into something
  // executable. No downside for either surface.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Send the full URL only to same-origin destinations; cross-origin
  // gets the origin alone. Keeps lead-form URLs and admin paths out of
  // third-party referer logs.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Clickjacking protection. SAMEORIGIN rather than DENY: Payload's
  // admin uses same-origin framing for preview surfaces, and DENY
  // would break those while adding nothing against cross-origin
  // framing, which is what actually matters here.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // This site asks for none of these. Denying them explicitly means a
  // future dependency can't quietly start prompting visitors.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
]

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default withPayload(nextConfig)
