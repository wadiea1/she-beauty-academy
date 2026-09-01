import type { CollectionConfig } from 'payload'
import { requireAllLocalesToPublish } from './hooks/requireAllLocalesToPublish'
import { isAdminOrEditor } from './access/roles'

export const FAQs: CollectionConfig = {
  slug: 'faqs',
  labels: { singular: 'FAQ', plural: 'FAQs' },
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'relatedCourse', 'status', 'order'],
    description: 'Frequently asked questions shown on the homepage (and, later, course pages).',
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true
      return { status: { equals: 'published' } }
    },
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    beforeChange: [requireAllLocalesToPublish(['question', 'answer'])],
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Lower numbers show first.' },
    },
    {
      name: 'relatedCourse',
      type: 'relationship',
      relationTo: 'courses',
      admin: {
        position: 'sidebar',
        description: 'Optional — leave blank for a general FAQ shown on the homepage.',
      },
    },
    { name: 'question', type: 'text', required: true, localized: true },
    { name: 'answer', type: 'textarea', required: true, localized: true },
  ],
}
