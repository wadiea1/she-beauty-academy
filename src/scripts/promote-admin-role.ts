// One-time data migration for Milestone J's role field — not a schema
// migration (Payload's dev-mode Postgres auto-push already added the
// `role` column, defaulting every existing row to 'advisor', the safe
// least-privileged default). This script's only job is to explicitly,
// deliberately promote the one real pre-existing account to 'admin' —
// the codebase must never rely on a dangerous "new user = admin"
// default, so that promotion has to happen as its own visible step,
// not as a side effect of the schema change.
//
// Run with:
//   pnpm exec payload run src/scripts/promote-admin-role.ts
// Optionally target one specific account by email when the automatic
// single-account case below doesn't apply:
//   pnpm exec payload run src/scripts/promote-admin-role.ts someone@example.com
//
// SAFE BY DEFAULT, and idempotent — re-running after the real account
// is already 'admin' does nothing and says so:
//   - If any account is already role: 'admin', the script assumes the
//     real migration already happened and makes NO changes (even if
//     an email argument is passed) — printing what's already admin
//     instead. Re-running this later (e.g. after new staff accounts
//     have been created) is deliberately a safe no-op, not a repeat
//     promotion.
//   - With no email argument: only promotes automatically when there
//     is EXACTLY ONE user account total and it isn't already admin —
//     the unambiguous "this is obviously the original account" case
//     this migration exists for.
//   - With more than one non-admin account and no email argument, or
//     an email that doesn't match any account: aborts with no changes
//     and prints the accounts found, so a human picks the right one
//     explicitly rather than this script guessing.
// Never touches Testimonials/Courses/FAQs/Homepage/Navigation/Site
// Settings, and never creates or deletes a user account — promotion
// only, of an account that already exists.

import { getPayload } from 'payload'
import config from '@payload-config'

async function main() {
  const targetEmail = process.argv[2]?.trim().toLowerCase()
  const payload = await getPayload({ config })

  const { docs: users } = await payload.find({
    collection: 'users',
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  })

  const existingAdmins = users.filter((u) => u.role === 'admin')
  if (existingAdmins.length > 0) {
    console.log(
      `No changes made — ${existingAdmins.length} account(s) already have role "admin":`,
    )
    for (const u of existingAdmins) console.log(`  - ${u.email} (id ${u.id})`)
    console.log('This migration is a one-time promotion; it never re-runs once an admin exists.')
    process.exit(0)
  }

  let target: (typeof users)[number] | undefined
  if (targetEmail) {
    target = users.find((u) => u.email.toLowerCase() === targetEmail)
    if (!target) {
      console.error(`No account found with email "${targetEmail}". No changes made.`)
      console.error('Accounts found:')
      for (const u of users) console.error(`  - ${u.email} (id ${u.id}, role ${u.role})`)
      process.exit(1)
    }
  } else if (users.length === 1) {
    target = users[0]
  } else {
    console.error(
      `Found ${users.length} accounts and none is an admin yet — refusing to guess which one is the real one.`,
    )
    console.error('Re-run with the correct email, e.g.:')
    console.error('  pnpm exec payload run src/scripts/promote-admin-role.ts someone@example.com')
    console.error('Accounts found:')
    for (const u of users) console.error(`  - ${u.email} (id ${u.id}, role ${u.role})`)
    process.exit(1)
  }

  if (!target) {
    // Unreachable — satisfies TypeScript's control-flow narrowing above.
    process.exit(1)
  }

  await payload.update({
    collection: 'users',
    id: target.id,
    overrideAccess: true,
    data: { role: 'admin' },
  })

  console.log(`Promoted ${target.email} (id ${target.id}) to role "admin".`)
  console.log('Verify by logging in as this account and confirming Admin now shows Applications/Users.')
  process.exit(0)
}

await main().catch((err) => {
  console.error(err)
  process.exit(1)
})
