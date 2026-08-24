import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig } from 'payload'

import { Users } from './collections/Users'

export default buildConfig({
  admin: {
    user: Users.slug,
  },

  collections: [Users],

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),

  secret: process.env.PAYLOAD_SECRET || '',
})