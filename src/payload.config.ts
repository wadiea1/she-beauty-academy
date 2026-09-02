import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig } from 'payload'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Courses } from './collections/Courses'
import { FAQs } from './collections/FAQs'
import { Testimonials } from './collections/Testimonials'
import { Applications } from './collections/Applications'
import { SiteSettings } from './globals/SiteSettings'
import { Navigation } from './globals/Navigation'
import { Homepage } from './globals/Homepage'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  admin: {
    user: Users.slug,
  },

  collections: [Users, Media, Courses, FAQs, Testimonials, Applications],

  globals: [SiteSettings, Navigation, Homepage],

  localization: {
    locales: [
      {
        label: 'العربية',
        code: 'ar',
        rtl: true,
      },
      {
        label: 'עברית',
        code: 'he',
        rtl: true,
      },
      {
        label: 'English',
        code: 'en',
      },
    ],
    defaultLocale: 'ar',
    fallback: false,
  },

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },

    // Explicit rather than inferred. `findMigrationDir` would resolve
    // to this same path by default, but stating it means a future
    // `src/` reshuffle can't silently relocate the migration history
    // (and it documents that this directory is Payload's, not a
    // general scripts folder — every .ts file in here is treated as a
    // migration with up/down exports, which is why one-off scripts
    // live in src/scripts/ instead).
    migrationDir: path.resolve(dirname, 'migrations'),

    // Dev-mode schema push is already disabled whenever NODE_ENV is
    // 'production' (see @payloadcms/db-postgres/dist/connect.js — it
    // requires NODE_ENV !== 'production' && PAYLOAD_MIGRATING !==
    // 'true' && push !== false). This makes it explicit rather than
    // relying on NODE_ENV alone being set correctly by whatever
    // platform runs the app: production schema changes come from
    // committed migrations, never from an implicit push.
    push: process.env.NODE_ENV !== 'production',

    // Never silently conjure a missing production database — that
    // turns "you pointed at the wrong DATABASE_URI" into "a brand-new
    // empty database appeared and the site looks wiped". In
    // development the adapter's create-on-demand behaviour is
    // convenient and harmless.
    disableCreateDatabase: process.env.NODE_ENV === 'production',

    // `prodMigrations` is deliberately NOT set. It would run
    // migrations inside connect() on every production boot, which
    // means every replica racing the same migration and schema
    // changes hiding inside ordinary restarts. Migrations are an
    // explicit deployment step here — see docs/RUNBOOK.md.
  }),

  secret: process.env.PAYLOAD_SECRET || '',
})