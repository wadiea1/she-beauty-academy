import 'server-only'
import {
  isPublicLeadIntakeEnabled as isPublicLeadIntakeEnabledFor,
  isPrivacyPolicyPublished as isPrivacyPolicyPublishedFor,
  resolveRateLimitDriver as resolveRateLimitDriverFor,
  type EnvSnapshot,
} from './readiness'

/**
 * Server-only bridge between `process.env` and the pure policy rules
 * in `readiness.ts`. Everything the running app asks about
 * configuration goes through here, so the runtime and
 * `pnpm verify:production` can never disagree about what "enabled"
 * means — they evaluate the same functions over the same inputs.
 */
function snapshot(): EnvSnapshot {
  return {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URI: process.env.DATABASE_URI,
    PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
    ALLOW_SEARCH_INDEXING: process.env.ALLOW_SEARCH_INDEXING,
    ENABLE_PUBLIC_LEAD_INTAKE: process.env.ENABLE_PUBLIC_LEAD_INTAKE,
    PRIVACY_POLICY_VERSION: process.env.PRIVACY_POLICY_VERSION,
    RATE_LIMIT_DRIVER: process.env.RATE_LIMIT_DRIVER,
  }
}

/**
 * Whether the public consultation form may accept real submissions.
 * Fail-closed in production; see `isPublicLeadIntakeEnabled` in
 * readiness.ts for the exact conditions and why local development
 * behaves differently.
 */
export function isPublicLeadIntakeEnabled(): boolean {
  return isPublicLeadIntakeEnabledFor(snapshot())
}

export function isPrivacyPolicyPublished(): boolean {
  return isPrivacyPolicyPublishedFor(snapshot())
}

export function getRateLimitDriver(): string {
  return resolveRateLimitDriverFor(snapshot())
}
