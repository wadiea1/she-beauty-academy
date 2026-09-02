import { NextResponse } from 'next/server'

// Liveness probe. Deliberately the cheapest possible answer to one
// question: "is this process running and able to serve HTTP?" It never
// touches the database, so a database outage does not make an
// orchestrator kill and restart an otherwise-healthy process (that is
// what /api/ready is for).
//
// A literal `api/health` segment takes precedence over Payload's
// generated catch-all at `src/app/(payload)/api/[...slug]/route.ts` —
// Next resolves a static route before a dynamic one at the same depth
// (established and verified for /api/apply in Milestone I).
//
// The response is intentionally tiny and boring: no version numbers,
// no build ids, no environment values, no uptime, no dependency
// details. Health endpoints are unauthenticated, so anything reported
// here is public reconnaissance.
export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } })
}
