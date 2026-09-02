/**
 * Proves a database built purely from committed migrations is one
 * Payload can actually run against.
 *
 * Run with NODE_ENV=production (the CI migration job does), which is
 * what makes this meaningful: the Postgres adapter only performs its
 * dev-mode schema push when NODE_ENV !== 'production' (verified in
 * @payloadcms/db-postgres/dist/connect.js). So under production mode a
 * successful query here cannot have been silently repaired by a push —
 * the migrations alone must have produced a working schema.
 *
 *   pnpm payload run src/scripts/verifyMigratedSchema.ts
 *
 * Intended for an empty, disposable database. It only reads.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

const COLLECTIONS = ['users', 'media', 'courses', 'faqs', 'testimonials', 'applications'] as const
const GLOBALS = ['homepage', 'navigation', 'site-settings'] as const

async function main() {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      '[verifyMigratedSchema] NODE_ENV is not "production", so Payload may repair the schema with a dev push. ' +
        'Run with NODE_ENV=production for this check to actually prove anything.',
    )
  }

  const payload = await getPayload({ config })

  for (const collection of COLLECTIONS) {
    const { totalDocs } = await payload.count({ collection, overrideAccess: true })
    console.log(`  collection ${collection}: queryable (${totalDocs} docs)`)
  }

  for (const slug of GLOBALS) {
    await payload.findGlobal({ slug, overrideAccess: true })
    console.log(`  global ${slug}: queryable`)
  }

  console.log('Payload initialized and queried every collection and global on a migrations-only schema.')
  process.exit(0)
}

await main().catch((error) => {
  console.error('[verifyMigratedSchema] FAILED:', error instanceof Error ? error.message : error)
  process.exit(1)
})
