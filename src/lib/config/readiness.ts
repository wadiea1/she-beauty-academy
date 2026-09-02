/**
 * The single source of truth for "is this configuration deployable"
 * and "is this configuration launchable".
 *
 * Deliberately pure and dependency-free — no `server-only`, no
 * `process.env` reads of its own, no side effects. It takes a plain
 * snapshot of environment values and returns findings. That lets the
 * exact same rules run in two very different places without drifting
 * apart: the Next.js runtime (via the thin server-only wrappers in
 * this directory) and the standalone `pnpm verify:production` script,
 * which runs as plain Node outside the Next build.
 *
 * It never reads, returns, or logs a secret's *value* — only whether
 * one is present and whether it looks like an obvious placeholder.
 */

/** The placeholder recorded against leads collected before any real,
 * legally-approved privacy policy exists. Never a valid production
 * consent version — see `src/lib/legal.ts`. */
export const UNPUBLISHED_PRIVACY_POLICY_VERSION = 'unpublished-v0'

/** Rate-limit drivers this codebase actually implements. `memory` is
 * correct for a single local process only; see src/lib/rateLimit.ts. */
export const RATE_LIMIT_DRIVERS = ['memory'] as const
export type RateLimitDriver = (typeof RATE_LIMIT_DRIVERS)[number]

/** Drivers that survive a process restart and are shared across
 * instances. Nothing qualifies yet — this is a real, documented
 * deployment blocker, not an oversight. Adding a durable driver means
 * implementing it in rateLimit.ts and listing it here. */
export const DURABLE_RATE_LIMIT_DRIVERS: readonly string[] = []

export interface EnvSnapshot {
  NODE_ENV?: string | undefined
  DATABASE_URI?: string | undefined
  PAYLOAD_SECRET?: string | undefined
  NEXT_PUBLIC_SERVER_URL?: string | undefined
  ALLOW_SEARCH_INDEXING?: string | undefined
  ENABLE_PUBLIC_LEAD_INTAKE?: string | undefined
  PRIVACY_POLICY_VERSION?: string | undefined
  RATE_LIMIT_DRIVER?: string | undefined
}

export type Severity = 'error' | 'warn' | 'info'

export interface Finding {
  severity: Severity
  /** Stable machine-readable identifier, safe to log. */
  code: string
  message: string
}

/** Obvious non-secrets. Matching one is proof a value is a placeholder;
 * NOT matching is not proof a value is strong. Real strength is the
 * operator's responsibility — see the runbook's generation command. */
const PLACEHOLDER_SECRET_PATTERNS = [
  /^ci-placeholder/i,
  /^generate-a-long-random-string$/i,
  /^migration-test/i,
  /^changeme$/i,
  /^secret$/i,
  /^test$/i,
  /^placeholder/i,
]

const MIN_SECRET_LENGTH = 32

export function isProduction(env: EnvSnapshot): boolean {
  return env.NODE_ENV === 'production'
}

export function isPlaceholderSecret(secret: string): boolean {
  return PLACEHOLDER_SECRET_PATTERNS.some((pattern) => pattern.test(secret.trim()))
}

export function isPrivacyPolicyPublished(env: EnvSnapshot): boolean {
  const version = env.PRIVACY_POLICY_VERSION?.trim()
  return Boolean(version) && version !== UNPUBLISHED_PRIVACY_POLICY_VERSION
}

export function resolveRateLimitDriver(env: EnvSnapshot): string {
  return env.RATE_LIMIT_DRIVER?.trim() || 'memory'
}

export function isDurableRateLimiter(env: EnvSnapshot): boolean {
  return DURABLE_RATE_LIMIT_DRIVERS.includes(resolveRateLimitDriver(env))
}

/**
 * Whether the public lead form may accept real submissions.
 *
 * Production is fail-closed and requires *all* of:
 *   1. an explicit `ENABLE_PUBLIC_LEAD_INTAKE=true` opt-in,
 *   2. a real (non-placeholder) privacy policy version — collecting
 *      PII against an admittedly unpublished policy is the thing this
 *      gate exists to prevent, and
 *   3. a durable rate limiter, so the abuse protection on a public
 *      form is actually real rather than per-process.
 *
 * Outside production it is enabled unless explicitly switched off,
 * so local QA (and this project's own end-to-end testing) keeps
 * working against a local database. The asymmetry is deliberate and
 * documented: convenience never leaks into the production default.
 */
export function isPublicLeadIntakeEnabled(env: EnvSnapshot): boolean {
  if (!isProduction(env)) {
    return env.ENABLE_PUBLIC_LEAD_INTAKE?.trim().toLowerCase() !== 'false'
  }
  return (
    env.ENABLE_PUBLIC_LEAD_INTAKE?.trim().toLowerCase() === 'true' &&
    isPrivacyPolicyPublished(env) &&
    isDurableRateLimiter(env)
  )
}

function checkUrl(env: EnvSnapshot, findings: Finding[]): void {
  const raw = env.NEXT_PUBLIC_SERVER_URL?.trim()
  if (!raw) {
    findings.push({
      severity: isProduction(env) ? 'error' : 'warn',
      code: 'server_url_missing',
      message:
        'NEXT_PUBLIC_SERVER_URL is not set. Canonical URLs, hreflang, the sitemap and JSON-LD all resolve against it.',
    })
    return
  }

  let url: URL
  try {
    url = new URL(raw)
  } catch {
    findings.push({
      severity: 'error',
      code: 'server_url_invalid',
      message: `NEXT_PUBLIC_SERVER_URL is not a valid absolute URL: ${raw}`,
    })
    return
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    findings.push({
      severity: 'error',
      code: 'server_url_scheme',
      message: `NEXT_PUBLIC_SERVER_URL must be http or https, got ${url.protocol}`,
    })
    return
  }

  const isLocal = ['localhost', '127.0.0.1', '::1'].includes(url.hostname)

  if (isProduction(env) && isLocal) {
    findings.push({
      severity: 'error',
      code: 'server_url_localhost_in_production',
      message: `NEXT_PUBLIC_SERVER_URL still points at ${url.hostname} in a production build.`,
    })
    return
  }

  if (isProduction(env) && url.protocol !== 'https:') {
    findings.push({
      severity: 'error',
      code: 'server_url_not_https',
      message: 'NEXT_PUBLIC_SERVER_URL must use https in production.',
    })
  }
}

/**
 * Can this configuration be deployed at all? A preview/staging
 * deployment with indexing off and public lead intake disabled is a
 * perfectly valid answer here — those are launch concerns, not
 * deployment ones.
 */
export function checkDeploymentReadiness(env: EnvSnapshot): Finding[] {
  const findings: Finding[] = []
  const production = isProduction(env)

  if (!env.DATABASE_URI?.trim()) {
    findings.push({
      severity: 'error',
      code: 'database_uri_missing',
      message: 'DATABASE_URI is not set.',
    })
  } else if (production && /sslmode=disable/i.test(env.DATABASE_URI)) {
    findings.push({
      severity: 'warn',
      code: 'database_ssl_disabled',
      message:
        'DATABASE_URI explicitly disables SSL. Confirm the database connection is otherwise on a trusted private network.',
    })
  }

  const secret = env.PAYLOAD_SECRET?.trim()
  if (!secret) {
    findings.push({ severity: 'error', code: 'payload_secret_missing', message: 'PAYLOAD_SECRET is not set.' })
  } else if (isPlaceholderSecret(secret)) {
    findings.push({
      severity: production ? 'error' : 'warn',
      code: 'payload_secret_placeholder',
      message: 'PAYLOAD_SECRET is an obvious placeholder value.',
    })
  } else if (secret.length < MIN_SECRET_LENGTH) {
    findings.push({
      severity: production ? 'error' : 'warn',
      code: 'payload_secret_weak',
      message: `PAYLOAD_SECRET is shorter than ${MIN_SECRET_LENGTH} characters.`,
    })
  }

  checkUrl(env, findings)

  const driver = resolveRateLimitDriver(env)
  if (!RATE_LIMIT_DRIVERS.includes(driver as RateLimitDriver)) {
    findings.push({
      severity: 'error',
      code: 'rate_limit_driver_unknown',
      message: `RATE_LIMIT_DRIVER="${driver}" is not implemented. Known drivers: ${RATE_LIMIT_DRIVERS.join(', ')}.`,
    })
  }

  return findings
}

/**
 * Can this configuration be exposed to the public as the real site?
 * Stricter than deployment readiness: this is the gate for collecting
 * real leads and for inviting search engines in.
 */
export function checkPublicLaunchReadiness(env: EnvSnapshot): Finding[] {
  const findings: Finding[] = []

  if (!isPrivacyPolicyPublished(env)) {
    findings.push({
      severity: 'error',
      code: 'privacy_policy_unpublished',
      message:
        'PRIVACY_POLICY_VERSION is unset or still the unpublished placeholder. A real, legally-approved policy and version are required before collecting personal data.',
    })
  }

  if (!isDurableRateLimiter(env)) {
    findings.push({
      severity: 'error',
      code: 'rate_limiter_not_durable',
      message: `Rate-limit driver "${resolveRateLimitDriver(env)}" is per-process and resets on restart. A durable, shared limiter is required before exposing the public form.`,
    })
  }

  if (!isPublicLeadIntakeEnabled(env)) {
    findings.push({
      severity: 'error',
      code: 'lead_intake_disabled',
      message:
        'Public lead intake is disabled, so the consultation form will not accept submissions. This is correct for preview/staging.',
    })
  }

  if (env.ALLOW_SEARCH_INDEXING?.trim().toLowerCase() !== 'true') {
    findings.push({
      severity: 'warn',
      code: 'search_indexing_disabled',
      message:
        'ALLOW_SEARCH_INDEXING is not "true", so crawlers are disallowed. Correct for preview/staging; enable it last for the real launch.',
    })
  }

  return findings
}
