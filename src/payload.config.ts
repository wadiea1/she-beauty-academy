import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig } from 'payload'

import { Users } from './collections/Users'

export default buildConfig({
  admin: {
    user: Users.slug,
  },

  collections: [Users],

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
  }),

  secret: process.env.PAYLOAD_SECRET || '',
})