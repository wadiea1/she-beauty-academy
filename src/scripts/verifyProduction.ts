/**
 * `pnpm verify:production`
 *
 * Validates a deployment's configuration against the same rules the
 * running application uses (src/lib/config/readiness.ts — imported,
 * not reimplemented, so the two can never drift apart).
 *
 * Runs as plain Node outside Next: it never connects to the database,
 * never starts Payload, and never needs a build. That means it can be
 * run as a pre-deploy gate against a candidate environment.
 *
 * It NEVER prints a secret's value. Secrets are only ever reported as
 * present/absent or "looks like a placeholder".
 *
 * Two distinct verdicts, because they are genuinely different
 * questions:
 *   READY FOR DEPLOYMENT   — the app can boot and serve.
 *   READY FOR PUBLIC LAUNCH — it can also collect real leads and be
 *                             indexed.
 * A preview/staging environment that is deployable but deliberately
 * not launchable is a valid, expected outcome — not a failure.
 *
 * Exit codes: 0 when deployment readiness passes (launch findings are
 * reported but do not fail the command), 1 when it does not.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  checkDeploymentReadiness,
  checkPublicLaunchReadiness,
  isProduction,
  isPublicLeadIntakeEnabled,
  isPrivacyPolicyPublished,
  resolveRateLimitDriver,
  type EnvSnapshot,
  type Finding,
} from '../lib/config/readiness.ts'

/** Minimal .env loader — no dependency, and deliberately does NOT
 * override anything already in the real environment, so CI/platform
 * variables always win over a stray local file. */
function loadDotEnv(): void {
  for (const file of ['.env.local', '.env']) {
    let contents: string
    try {
      contents = readFileSync(resolve(process.cwd(), file), 'utf8')
    } catch {
      continue
    }
    for (const line of contents.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (!(key in process.env)) process.env[key] = value
    }
  }
}

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

const ICON: Record<Finding['severity'], string> = { error: 'FAIL', warn: 'WARN', info: 'INFO' }

function report(title: string, findings: Finding[]): number {
  console.log(`\n${title}`)
  console.log('-'.repeat(title.length))
  if (findings.length === 0) {
    console.log('  OK   no findings')
    return 0
  }
  for (const finding of findings) {
    console.log(`  ${ICON[finding.severity]} [${finding.code}] ${finding.message}`)
  }
  return findings.filter((f) => f.severity === 'error').length
}

function main(): void {
  loadDotEnv()
  const env = snapshot()

  console.log('SHE Beauty Academy — production configuration check')
  console.log('==================================================')
  // Presence and shape only. Never values.
  console.log(`  NODE_ENV                  : ${env.NODE_ENV ?? '(unset)'}`)
  console.log(`  DATABASE_URI              : ${env.DATABASE_URI ? '(set)' : '(unset)'}`)
  console.log(`  PAYLOAD_SECRET            : ${env.PAYLOAD_SECRET ? '(set)' : '(unset)'}`)
  console.log(`  NEXT_PUBLIC_SERVER_URL    : ${env.NEXT_PUBLIC_SERVER_URL ?? '(unset)'}`)
  console.log(`  ALLOW_SEARCH_INDEXING     : ${env.ALLOW_SEARCH_INDEXING ?? '(unset → crawlers disallowed)'}`)
  console.log(`  ENABLE_PUBLIC_LEAD_INTAKE : ${env.ENABLE_PUBLIC_LEAD_INTAKE ?? '(unset)'}`)
  console.log(`  PRIVACY_POLICY_VERSION    : ${env.PRIVACY_POLICY_VERSION ?? '(unset → unpublished placeholder)'}`)
  console.log(`  RATE_LIMIT_DRIVER         : ${resolveRateLimitDriver(env)}`)
  console.log('')
  console.log('Resolved behaviour')
  console.log('------------------')
  console.log(`  Treated as production     : ${isProduction(env) ? 'yes' : 'no'}`)
  console.log(`  Privacy policy published  : ${isPrivacyPolicyPublished(env) ? 'yes' : 'no'}`)
  console.log(`  Public lead intake        : ${isPublicLeadIntakeEnabled(env) ? 'ENABLED' : 'disabled'}`)
  console.log(
    `  Search indexing           : ${env.ALLOW_SEARCH_INDEXING?.trim().toLowerCase() === 'true' ? 'ALLOWED' : 'disallowed'}`,
  )

  const deploymentErrors = report('Deployment readiness', checkDeploymentReadiness(env))
  const launchErrors = report('Public launch readiness', checkPublicLaunchReadiness(env))

  console.log('')
  console.log('==================================================')
  console.log(`  READY FOR DEPLOYMENT    : ${deploymentErrors === 0 ? 'YES' : 'NO'}`)
  console.log(`  READY FOR PUBLIC LAUNCH : ${deploymentErrors === 0 && launchErrors === 0 ? 'YES' : 'NO'}`)
  console.log('==================================================')

  if (deploymentErrors === 0 && launchErrors > 0) {
    console.log(
      '\nNote: deployable but not launchable is a valid preview/staging state.\n' +
        'See docs/DEPLOYMENT.md for the remaining launch blockers.',
    )
  }

  process.exit(deploymentErrors === 0 ? 0 : 1)
}

main()
