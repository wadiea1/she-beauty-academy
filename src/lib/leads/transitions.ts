/**
 * Who is allowed to move a lead to which status (Milestone N0).
 *
 * This exists because the alternative is a convention, and a convention is
 * not a control. Once an AI assistant is in the loop, "automation shouldn't
 * mark people enrolled" has to be something the code can answer, in one
 * place, the same way every time.
 *
 * The status values themselves already exist on the Applications collection
 * and are NOT changed by this milestone — the audit found the lifecycle
 * already matching the target workflow exactly. This module only describes
 * authority over transitions.
 *
 * Pure: no I/O, no Payload, no environment.
 */

/** Mirrors the `status` options in src/collections/Applications.ts. */
export type LeadStatus =
  | 'new'
  | 'automatic_followup'
  | 'engaged'
  | 'qualified'
  | 'consultation_booked'
  | 'visited'
  | 'enrolled'
  | 'no_answer'
  | 'follow_up'
  | 'not_now'
  | 'not_interested'
  | 'invalid'
  | 'spam'

/** Who is attempting the change. `automation` covers both scheduled
 * follow-ups and anything derived from an AI decision — the AI is not a
 * separate, more-trusted actor. */
export type StatusActor = 'staff' | 'automation'

/**
 * Statuses automation may set on its own.
 *
 * These are all *observations about the conversation* — it followed up, they
 * replied, they seem ready, they went quiet. Automation can legitimately
 * know these because it is the thing having the conversation.
 */
const AUTOMATION_PERMITTED: ReadonlySet<LeadStatus> = new Set<LeadStatus>([
  'automatic_followup',
  'engaged',
  'qualified',
  'no_answer',
  'follow_up',
  'not_now',
  'not_interested',
  'spam',
])

/**
 * Statuses only a person may set, each for its own reason:
 *
 *  - `enrolled` — the commercial outcome. Permanently human. Enrollment is
 *    completed off-platform by staff (there are no web payments, by standing
 *    business rule), so automation could only ever be guessing.
 *  - `visited` — only a person knows someone physically walked in.
 *  - `consultation_booked` — requires a real, authoritative availability
 *    source, which does not exist yet. Until it does, automation naming a
 *    time would be inventing availability. Revisit at N7.
 *  - `invalid` — a judgment call about a real person's data.
 */
const STAFF_ONLY: ReadonlySet<LeadStatus> = new Set<LeadStatus>([
  'enrolled',
  'visited',
  'consultation_booked',
  'invalid',
])

/** Nobody sets this after creation; it is the initial state. */
const INITIAL_ONLY: ReadonlySet<LeadStatus> = new Set<LeadStatus>(['new'])

export type TransitionRefusal =
  | 'staff_only_status'
  | 'initial_status_only'
  | 'automation_may_not_override_staff'
  | 'conversation_not_automatable'
  | 'unchanged'

export type TransitionDecision =
  | { allowed: true }
  | { allowed: false; reason: TransitionRefusal }

export interface TransitionContext {
  from: LeadStatus
  to: LeadStatus
  actor: StatusActor
  /** True if the current status was last set by a person. Automation must
   * not undo staff decisions — a human working a lead always wins. */
  currentSetByStaff: boolean
  /** False when the conversation is handed off, paused, or automation has
   * been switched off for it. Automation must then do nothing at all. */
  automationActive: boolean
}

/**
 * The single authority on whether a status change may proceed.
 *
 * Staff are trusted with every status; the restrictions exist to constrain
 * automation, not to second-guess people.
 */
export function canTransition(ctx: TransitionContext): TransitionDecision {
  if (ctx.from === ctx.to) return { allowed: false, reason: 'unchanged' }

  if (INITIAL_ONLY.has(ctx.to)) {
    return { allowed: false, reason: 'initial_status_only' }
  }

  if (ctx.actor === 'staff') return { allowed: true }

  // Everything below is automation.

  if (!ctx.automationActive) {
    return { allowed: false, reason: 'conversation_not_automatable' }
  }

  if (ctx.currentSetByStaff) {
    return { allowed: false, reason: 'automation_may_not_override_staff' }
  }

  if (STAFF_ONLY.has(ctx.to) || !AUTOMATION_PERMITTED.has(ctx.to)) {
    return { allowed: false, reason: 'staff_only_status' }
  }

  return { allowed: true }
}

/** Convenience predicate for UI and documentation. */
export function isStaffOnlyStatus(status: LeadStatus): boolean {
  return STAFF_ONLY.has(status)
}
