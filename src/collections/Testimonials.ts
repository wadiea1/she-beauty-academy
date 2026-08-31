import type { CollectionConfig } from 'payload'
import { requireAllLocalesToPublish } from './hooks/requireAllLocalesToPublish'

/**
 * Architecture only — do NOT seed fake testimonials here. SHE is too new
 * to have legitimate graduate testimonials yet (AGENTS.md §11). The
 * frontend should hide the testimonials section entirely while this
 * collection has no published entries, rather than show a placeholder.
 */
export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: { singular: 'Testimonial', plural: 'Testimonials' },
  admin: {
    useAsTitle: 'authorName',
    defaultColumns: ['authorName', 'relatedCourse', 'status', 'consentObtained'],
    description:
      'Real testimonials only, with explicit consent. Leave this collection empty rather than publish anything unverified.',
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true
      return { status: { equals: 'published' } }
    },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeChange: [requireAllLocalesToPublish(['quote'])],
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
      name: 'consentObtained',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Required before publishing: confirm the person agreed to have their words used publicly.',
      },
    },
    {
      name: 'consentNote',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'How/when consent was obtained, e.g. "Written consent via email, 2026-01-14".',
      },
    },
    {
      name: 'relatedCourse',
      type: 'relationship',
      relationTo: 'courses',
      admin: { position: 'sidebar' },
    },
    {
      name: 'authorName',
      type: 'text',
      required: true,
      admin: { description: 'A real name — never invented. Not localized (it is a proper noun).' },
    },
    {
      name: 'authorRole',
      type: 'text',
      localized: true,
      admin: { description: 'e.g. "Cosmetics 1 graduate" — optional.' },
    },
    { name: 'quote', type: 'textarea', required: true, localized: true },
    { name: 'photo', type: 'upload', relationTo: 'media' },
  ],
}
