import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { submitApplication } from '@/lib/applications/submit'
import { getRateLimiter } from '@/lib/rateLimit'
import { isPublicLeadIntakeEnabled } from '@/lib/config/runtime'

// A literal segment (`api/apply`) takes precedence over Payload's
// generated catch-all (`src/app/(payload)/api/[...slug]/route.ts`) for
// this exact path — Next resolves a static route before a dynamic one
// at the same URL depth. Confirmed live, not just assumed: see
// docs/IMPLEMENTATION_PLAN.md, Milestone I.
//
// This is the *only* intended public write path into Applications —
// the collection's own `access.create` stays staff-only (see
// Applications.ts), so `getPayload()` here always calls
// `overrideAccess: true` deliberately, inside a boundary that does its
// own validation, spam checks, and field trust decisions before ever
// touching Payload.

const MAX_BODY_BYTES = 10_000 // this form's real payload is well under 1KB

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  // No Origin header at all (some non-browser or same-tab navigations
  // omit it) — not something a spoofed cross-site POST can fake in a
  // browser, so absence isn't itself suspicious; only a *mismatched*
  // Origin is rejected.
  if (!origin) return true

  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  if (!host) return false

  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

function clientKey(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0]!.trim()
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp
  // No IP-identifying header available (e.g. direct local access) —
  // every such request shares one bucket. Acceptable degradation for
  // this deployment stage; see rateLimit.ts for the broader
  // single-instance limitation.
  return 'unknown'
}

export async function POST(request: NextRequest) {
  // Launch gate, checked before anything else touches the request
  // body: while public lead intake is disabled, this endpoint accepts
  // nothing and creates nothing. Server-controlled — a browser cannot
  // opt back in, because the decision never leaves the server (see
  // src/lib/config/readiness.ts for the exact conditions).
  //
  // 503 with a stable, generic shape: no mention of privacy-policy
  // versions, rate-limit drivers, or any other internal reason. The
  // form renders a neutral "temporarily unavailable" message from it.
  if (!isPublicLeadIntakeEnabled()) {
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 })
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
  }

  const contentType = request.headers.get('content-type') ?? ''
  if (!contentType.toLowerCase().includes('application/json')) {
    return NextResponse.json({ ok: false, error: 'unsupported_media_type' }, { status: 415 })
  }

  const contentLength = Number(request.headers.get('content-length') ?? '0')
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: 'payload_too_large' }, { status: 413 })
  }

  const { allowed } = getRateLimiter().check(clientKey(request))
  if (!allowed) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })
  }

  let body: unknown
  try {
    const text = await request.text()
    if (text.length > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, error: 'payload_too_large' }, { status: 413 })
    }
    body = JSON.parse(text)
  } catch {
    return NextResponse.json({ ok: false, error: 'malformed_json' }, { status: 400 })
  }

  const result = await submitApplication(body)

  if (result.ok) {
    return NextResponse.json({ ok: true })
  }

  if (result.reason === 'validation') {
    return NextResponse.json({ ok: false, error: 'validation', fieldErrors: result.fieldErrors }, { status: 400 })
  }

  // Never leak raw Payload/Postgres errors, stack traces, or
  // environment values to the client — a stable, generic shape only.
  // submitApplication already logged the real detail server-side.
  return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
}
