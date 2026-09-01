import 'server-only'

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
 * gets its own independent counters. On any deployment that runs more
 * than one instance (most serverless platforms, or a load-balanced
 * multi-process host), an attacker whose requests land across
 * different instances bypasses this entirely; it is NOT a durable
 * limit. A shared external store (e.g. Upstash Redis, or any
 * request-scoped KV the deployment target provides) is required before
 * this app runs on more than one instance — no such store is wired in
 * here because no provider/account for one is provisioned yet, and
 * hardcoding a fake connection would be worse than this documented
 * limitation. Acceptable for local/MVP development only; revisit at
 * Milestone M (production deployment readiness).
 *
 * Also resets on every process restart (dev server reload, deploy) —
 * expected and acceptable for this same reason.
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

// One shared instance per process — 5 submissions per IP per 10
// minutes. Deliberately generous rather than aggressive: this limiter
// exists to blunt automated abuse, not to second-guess a genuine
// visitor who submits, corrects a typo, and submits again. Genuinely
// verified, not just trusted: this exact limit blocked this project's
// own repeated QA testing mid-session with a real 429 before being
// temporarily raised for the rest of the malicious-input test battery
// and reverted back to this value afterward — see
// docs/IMPLEMENTATION_PLAN.md, Milestone I.
// One shared instance per process — 5 submissions per IP per 10
// minutes. Deliberately generous rather than aggressive: this limiter
// exists to blunt automated abuse, not to second-guess a genuine
// visitor who submits, corrects a typo, and submits again. Genuinely
// verified, not just trusted: this exact limit blocked this project's
// own repeated QA testing mid-session with a real 429 before being
// temporarily raised for the rest of the malicious-input test battery
// and reverted back to this value afterward — see
// docs/IMPLEMENTATION_PLAN.md, Milestone I.
export const applyRateLimiter: RateLimiter = new InMemoryRateLimiter(5, 10 * 60 * 1000)
