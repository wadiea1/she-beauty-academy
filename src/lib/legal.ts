import { UNPUBLISHED_PRIVACY_POLICY_VERSION } from '@/lib/config/readiness'

export { UNPUBLISHED_PRIVACY_POLICY_VERSION }

/**
 * The privacy policy version recorded against every lead, resolved
 * from configuration rather than hardcoded.
 *
 * Milestone I hardcoded `'unpublished-v0'` here as an honest
 * placeholder: no real privacy policy existed, and pretending
 * otherwise would have been worse than admitting it. That is still
 * true — no approved policy text exists — but a hardcoded constant
 * carried a real risk into production: the placeholder could silently
 * become the consent version recorded against real people's data
 * simply because nobody remembered to change a source file.
 *
 * So the value now comes from `PRIVACY_POLICY_VERSION`, and the
 * placeholder is only the fallback. The runtime lead-intake gate
 * (src/lib/config/readiness.ts) refuses to accept public submissions
 * in production while the resolved value is still the placeholder, so
 * the unpublished state can no longer be attached to real consent
 * records by accident.
 *
 * The real value must be a business/legal decision — a date or
 * semantic version agreed alongside the approved policy text. It is
 * deliberately not chosen here.
 */
export function getPrivacyPolicyVersion(): string {
  return process.env.PRIVACY_POLICY_VERSION?.trim() || UNPUBLISHED_PRIVACY_POLICY_VERSION
}
