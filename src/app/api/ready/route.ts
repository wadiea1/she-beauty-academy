import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// Readiness probe: "can this instance actually serve requests?" —
// which for this app means the process is up *and* the database is
// reachable. Used to gate traffic (load-balancer membership, deploy
// promotion), not to decide whether to restart the process; that is
// /api/health's job.
//
// The database check is deliberately the cheapest real query
// available: a count against a small collection. It proves the pool
// connects and the schema is queryable without scanning anything.
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const payload = await getPayload({ config })
    await payload.count({ collection: 'users', overrideAccess: true })
    return NextResponse.json(
      { status: 'ready' },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    // Log the real detail server-side for operators; return none of it.
    // An unauthenticated endpoint must never expose the connection
    // string, host, driver, stack trace, or Payload internals — a
    // failing readiness check is exactly when that information is most
    // sensitive and most tempting to include.
    console.error(
      '[ready] database check failed:',
      error instanceof Error ? error.message : 'unknown error',
    )
    return NextResponse.json(
      { status: 'not_ready' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
