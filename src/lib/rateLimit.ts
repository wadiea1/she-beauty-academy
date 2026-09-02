import 'server-only'
import { getRateLimitDriver } from '@/lib/config/runtime'

export interface RateLimiter {
  /** Records one attempt for `key` and returns whether it's still
   * within the allowed limit for the current window. */
  check(key: string): { allowed: boolean }
}

interface Bucket {
  count: number
  windowStart: number
}

/**
 * Fixed-window in-memory rate limiter. Correct only within a single
 * Node.js process — module-level state means every server instance
 * gets its own independent counters, and every restart resets them.
 *
 * This is NOT a production-grade limiter and is no longer described as
 * one anywhere: on any deployment running more than one instance, an
 * attacker whose requests land across different instances bypasses it
 * entirely. Milestone M turned that from a comment into an enforced
 * boundary — `isPublicLeadIntakeEnabled` (src/lib/config/readiness.ts)
 * refuses to enable public lead intake in production unless the
 * configured driver is one of `DURABLE_RATE_LIMIT_DRIVERS`, and this
 * one deliberately is not.
 *
 * Suitable for local development and for QA against a single process.
 */
export class InMemoryRateLimiter implements RateLimiter {
  private buckets = new Map<string, Bucket>()

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  check(key: string): { allowed: boolean } {
    const now = Date.now()
    const existing = this.buckets.get(key)

    if (!existing || now - existing.windowStart >= this.windowMs) {
      this.buckets.set(key, { count: 1, windowStart: now })
      return { allowed: true }
    }

    existing.count += 1
    return { allowed: existing.count <= this.limit }
  }
}

/**
 * The policy itself, independent of which store enforces it: 5
 * submissions per client per 10 minutes. Deliberately generous rather
 * than aggressive — this exists to blunt automated abuse, not to
 * second-guess a genuine visitor who submits, spots a typo, and
 * submits again. Genuinely verified, not just trusted: this exact
 * limit blocked this project's own repeated QA testing mid-session
 * with a real 429 before being temporarily raised for the rest of a
 * test battery and reverted (see docs/IMPLEMENTATION_PLAN.md,
 * Milestone I).
 */
export const RATE_LIMIT_MAX_REQUESTS = 5
export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000

/**
 * Resolves the limiter for the configured driver.
 *
 * The abstraction is the point: adding a durable backend (a shared
 * store, or a Postgres table using a single atomic
 * `INSERT ... ON CONFLICT DO UPDATE ... RETURNING count` upsert so
 * there is no race-prone read-then-increment) means implementing
 * `RateLimiter` here, adding the driver name to `RATE_LIMIT_DRIVERS`
 * and `DURABLE_RATE_LIMIT_DRIVERS` in readiness.ts, and nothing else —
 * the route and the launch gate both pick it up automatically.
 *
 * No durable driver is implemented yet, and none was invented: doing
 * so would have meant assuming a provider, credentials, or
 * infrastructure that has not been approved. It is tracked as an
 * explicit deployment blocker in docs/DEPLOYMENT.md.
 */
function createRateLimiter(): RateLimiter {
  const driver = getRateLimitDriver()

  switch (driver) {
    case 'memory':
      return new InMemoryRateLimiter(RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS)
    default:
      // Unknown driver: fail closed rather than silently falling back
      // to a weaker limiter than the operator asked for.
      // `verify:production` reports this as a configuration error too.
      return {
        check: () => ({ allowed: false }),
      }
  }
}

let cached: RateLimiter | undefined

/** One limiter per process, created lazily so configuration is read
 * at first use rather than at module-import time. */
export function getRateLimiter(): RateLimiter {
  cached ??= createRateLimiter()
  return cached
}
