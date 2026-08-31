import path from 'node:path'
import type { CollectionConfig } from 'payload'

/**
 * Real photography drops in here once the shoot from
 * docs/PHOTOGRAPHY_BRIEF.md happens — the frontend's ImageFrame
 * component already renders whatever's uploaded. No `sharp` dependency:
 * pnpm-workspace.yaml deliberately has its build script disabled, so
 * uploads work without automatic resized variants for now.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['thumbnail', 'alt', 'updatedAt'],
    description: 'Photos and other files used across the site.',
  },
  upload: {
    staticDir: path.resolve(process.cwd(), 'media'),
    mimeTypes: ['image/*'],
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Describes the image for screen readers and SEO — required in every language.',
      },
    },
    {
      name: 'caption',
      type: 'text',
      localized: true,
      admin: {
        description: 'Optional visible caption, if the image needs one.',
      },
    },
  ],
}
