import { z } from 'zod'
import { locales } from '@/i18n/config'
import type { AssistantDecision } from './types'

/**
 * Validation for AI output (Milestone N0).
 *
 * Model output is untrusted input. It is shaped by a customer's message,
 * which means anything a customer can influence can end up here — so this is
 * a security boundary, not a type-safety nicety.
 *
 * Uses `zod`, already a dependency for lead-form validation. No new package.
 *
 * Three properties matter:
 *  1. Unknown keys are STRIPPED (zod's default for `.parse`), so a model that
 *     invents `{ status: "enrolled" }` or `{ recipient: "+9725…" }` has that
 *     field silently discarded rather than reaching application code. This is
 *     the same defence `submitApplication` already relies on for request
 *     bodies.
 *  2. Every enum is closed. A hallucinated handoff reason or language code
 *     fails validation instead of propagating.
 *  3. Failure is not recoverable by guessing. A malformed response becomes a
 *     handoff to a person (`validation_failed`), never a partial decision.
 */

const HANDOFF_REASONS = [
  'customer_requested_human',
  'pricing_or_discount',
  'certification_or_legal',
  'complaint',
  'outside_approved_knowledge',
  'low_confidence',
  'repeated_misunderstanding',
  'safety_sensitive',
  'enrollment_commitment',
  'validation_failed',
] as const

/** Long enough for a real answer, short enough that a runaway generation is
 * rejected rather than sent to a customer. */
const MAX_REPLY_CHARS = 2000

export const assistantDecisionSchema = z.object({
  reply: z.string().trim().min(1).max(MAX_REPLY_CHARS),
  detectedLanguage: z.enum(locales),
  signals: z
    .object({
      // Shape only. Whether the slug names a real PUBLISHED course cannot be
      // decided here — that needs a database read, and this module stays
      // pure. `resolveDecision` below is where it gets dropped if unknown.
      courseSlug: z
        .string()
        .trim()
        .regex(/^[a-z0-9-]+$/)
        .max(120)
        .optional(),
      wantsConsultation: z.boolean().optional(),
      wantsHuman: z.boolean().optional(),
      qualification: z.enum(['unknown', 'exploring', 'interested', 'ready']).optional(),
    })
    .strict()
    .default({}),
  handoff: z
    .object({ reason: z.enum(HANDOFF_REASONS) })
    .strict()
    .nullable()
    .default(null),
  confidence: z.enum(['high', 'low']),
})

export type ParsedAssistantDecision = z.infer<typeof assistantDecisionSchema>

export type DecisionValidation =
  | { ok: true; decision: AssistantDecision }
  | { ok: false; decision: AssistantDecision; reason: 'schema' }

/**
 * Validate raw model output into a decision that is always safe to act on.
 *
 * On failure this does NOT throw and does NOT return nothing: it returns a
 * conservative decision that hands the conversation to a person with an
 * empty reply. The caller therefore has no error path that could tempt it
 * into sending something improvised, and a broken model response degrades
 * into "a human picks this up" — the correct failure mode for a system
 * talking to real customers.
 */
export function validateAssistantDecision(raw: unknown): DecisionValidation {
  const parsed = assistantDecisionSchema.safeParse(raw)

  if (!parsed.success) {
    return {
      ok: false,
      reason: 'schema',
      decision: {
        reply: '',
        detectedLanguage: 'ar',
        signals: {},
        handoff: { reason: 'validation_failed' },
        confidence: 'low',
      },
    }
  }

  return { ok: true, decision: parsed.data }
}

/**
 * Second stage: drop signals that reference things which do not exist.
 *
 * Separate from schema validation on purpose — this one needs to know which
 * courses are published, which is a database question. Keeping it separate
 * lets the schema stay pure and lets this be given the answer rather than
 * fetching it.
 *
 * A `courseSlug` naming an unpublished or nonexistent course is DROPPED
 * rather than rejected: the model may still have written a perfectly good
 * reply, and discarding one bad signal is proportionate. Storing it would
 * not be — it would attach a course interest the customer never expressed.
 *
 * Low confidence is promoted to a handoff here rather than left to each call
 * site to remember.
 */
export function resolveDecision(
  decision: AssistantDecision,
  publishedCourseSlugs: ReadonlySet<string>,
): AssistantDecision {
  const signals = { ...decision.signals }

  if (signals.courseSlug && !publishedCourseSlugs.has(signals.courseSlug)) {
    delete signals.courseSlug
  }

  const handoff =
    decision.handoff ??
    (signals.wantsHuman
      ? { reason: 'customer_requested_human' as const }
      : decision.confidence === 'low'
        ? { reason: 'low_confidence' as const }
        : null)

  return { ...decision, signals, handoff }
}
