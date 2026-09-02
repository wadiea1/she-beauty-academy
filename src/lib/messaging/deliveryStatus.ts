import type { DeliveryStatus } from './types'

/**
 * Monotonic merging of provider delivery receipts.
 *
 * WhatsApp-style delivery webhooks arrive OUT OF ORDER and MORE THAN ONCE.
 * A `sent` receipt delayed behind a `delivered` one is normal, not
 * exceptional. Last-write-wins therefore corrupts state in the ordinary
 * case: the record would regress to `sent` and the admin UI would tell staff
 * a message had not arrived when it demonstrably had.
 *
 * This function is the single place that decision is made, so that every
 * webhook path and every retry converges on the same answer.
 */

/** Forward-only progression. Higher wins; equal or lower is ignored. */
const RANK: Record<Exclude<DeliveryStatus, 'failed'>, number> = {
  queued: 0,
  sent: 1,
  delivered: 2,
  read: 3,
}

/** The point past which a message is known to have arrived. */
const DELIVERED_RANK = RANK.delivered

/**
 * Returns the status that should be stored, given what is already recorded
 * and what just arrived.
 *
 * Rules:
 *  - Normal statuses only ever move forward: queued → sent → delivered → read.
 *    A lower-or-equal incoming rank is ignored, which makes duplicate
 *    receipts no-ops by construction rather than by a separate dedupe check.
 *  - `failed` may only be applied while the message has NOT yet reached
 *    `delivered`. A message the provider confirmed as delivered cannot
 *    retroactively become undelivered, so a late or duplicated failure
 *    webhook must not be allowed to overwrite a known-good outcome. The
 *    asymmetry is deliberate: wrongly showing "failed" for a message the
 *    customer actually received would send staff chasing a non-problem and,
 *    worse, invite a duplicate send.
 *  - Once `failed`, a genuine later success (a retry that worked) still wins,
 *    because it carries a normal rank and `failed` is not itself ranked.
 *
 * Pure: no I/O, no clock, no state.
 */
export function mergeDeliveryStatus(
  current: DeliveryStatus,
  incoming: DeliveryStatus,
): DeliveryStatus {
  if (incoming === 'failed') {
    if (current === 'failed') return 'failed'
    return RANK[current] >= DELIVERED_RANK ? current : 'failed'
  }

  // A success report after a failure is meaningful — a retry that landed.
  if (current === 'failed') return incoming

  return RANK[incoming] > RANK[current] ? incoming : current
}

/** True once the provider has confirmed the customer's device received it. */
export function hasReachedDevice(status: DeliveryStatus): boolean {
  return status !== 'failed' && RANK[status] >= DELIVERED_RANK
}
