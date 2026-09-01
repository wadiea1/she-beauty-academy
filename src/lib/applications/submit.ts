import 'server-only'
import { getPayload } from 'payload'
import config from '@payload-config'
import { applicationInputSchema } from './schema'
import { PRIVACY_POLICY_VERSION } from '@/lib/legal'

export type SubmitApplicationResult =
  | { ok: true }
  | { ok: false; reason: 'validation'; fieldErrors: Record<string, string> }
  | { ok: false; reason: 'server_error' }

/**
 * The actual business logic for a lead submission — a Data Access
 * Layer function, not a Route Handler: only runs on the server, does
 * its own validation and authorization (there is none to check here
 * beyond "this is a public write, always allowed, but only through
 * this exact path"), and returns a minimal safe result, never a raw
 * Payload document. HTTP-shaped concerns (origin/rate-limit/content-
 * type checks) stay in the Route Handler that calls this; this
 * function doesn't know or care that it was invoked over HTTP at all.
 *
 * `rawInput` is genuinely untrusted — parsed JSON from the request
 * body, nothing more. Every field the server must control itself
 * (status, source, privacyConsentAt, privacyPolicyVersion) is set
 * here unconditionally; none of them are read from `rawInput` even if
 * present, because `applicationInputSchema` doesn't define them at
 * all — Zod's `.parse()` strips unknown keys by default, so a forged
 * `status: "enrolled"` in the body simply never reaches this function
 * as a recognized field.
 */
export async function submitApplication(rawInput: unknown): Promise<SubmitApplicationResult> {
  const parsed = applicationInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (typeof key === 'string' && !(key in fieldErrors)) {
        fieldErrors[key] = issue.message
      }
    }
    return { ok: false, reason: 'validation', fieldErrors }
  }

  const input = parsed.data

  // Honeypot filled in => treat as a bot. Report the same success a
  // genuine visitor gets, without creating a record — gives an
  // automated submitter no signal that it was detected.
  if (input.honeypot) {
    return { ok: true }
  }

  try {
    const payload = await getPayload({ config })

    // Resolve + validate the course server-side — never trust a
    // client-submitted id. overrideAccess: false runs this through
    // the exact published-only boundary the public site itself uses,
    // so a slug for an unpublished/nonexistent course can't be
    // resolved into a relationship either. It doesn't fail the
    // submission — an invalid/stale slug just falls back to
    // "general", the same outcome as not selecting a course at all.
    let courseId: number | undefined
    if (input.courseSlug) {
      const found = await payload.find({
        collection: 'courses',
        where: { slug: { equals: input.courseSlug } },
        limit: 1,
        overrideAccess: false,
        depth: 0,
      })
      courseId = found.docs[0]?.id
    }
    const source: 'homepage' | 'course_page' = courseId ? 'course_page' : 'homepage'

    // Duplicate protection: same normalized phone + same resolved
    // course (or both "general") within the last 10 minutes doesn't
    // create a second row, but a genuine returning visitor still
    // sees success, never an error — this is spam-noise reduction,
    // not a lockout.
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    const recentDuplicate = await payload.find({
      collection: 'applications',
      where: {
        and: [
          { phone: { equals: input.phone } },
          { createdAt: { greater_than: tenMinutesAgo } },
          courseId ? { interestedCourse: { equals: courseId } } : { interestedCourse: { exists: false } },
        ],
      },
      limit: 1,
      overrideAccess: true,
      depth: 0,
    })
    if (recentDuplicate.docs.length > 0) {
      return { ok: true }
    }

    const now = new Date().toISOString()
    await payload.create({
      collection: 'applications',
      overrideAccess: true,
      data: {
        status: 'new',
        source,
        name: input.name,
        phone: input.phone,
        email: input.email,
        preferredLanguage: input.locale,
        interestedCourse: courseId,
        message: input.message,
        privacyConsentAt: now,
        privacyPolicyVersion: PRIVACY_POLICY_VERSION,
        marketingConsent: input.marketingConsent,
        marketingConsentAt: input.marketingConsent ? now : undefined,
      },
    })

    return { ok: true }
  } catch (err) {
    // Log enough to debug without the lead's own private content —
    // no phone/email/message body in the log line.
    console.error('[applications] submission failed:', err instanceof Error ? err.message : err)
    return { ok: false, reason: 'server_error' }
  }
}
