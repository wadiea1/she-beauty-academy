import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig } from 'payload'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Courses } from './collections/Courses'
import { FAQs } from './collections/FAQs'
import { Testimonials } from './collections/Testimonials'

export default buildConfig({
  admin: {
    user: Users.slug,
  },

  collections: [Users, Media, Courses, FAQs, Testimonials],

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