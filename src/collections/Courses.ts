import type { CollectionConfig } from 'payload'
import { requireAllLocalesToPublish } from './hooks/requireAllLocalesToPublish'

const pricingOptions = [
  { label: 'Exact price', value: 'exact' },
  { label: 'Starting from', value: 'startingFrom' },
  { label: 'Range', value: 'range' },
  { label: 'On request', value: 'onRequest' },
  { label: 'Hidden', value: 'hidden' },
]

/**
 * Only real, confirmed courses belong here: Cosmetics 1, Cosmetics 2,
 * Branding & AI for Beauty Businesses. Do not add placeholder courses.
 *
 * Tabs are visual grouping only (unnamed), so the saved document stays
 * flat (`course.title`, `course.pricingType`, …) rather than nested —
 * simpler for the frontend and for requireAllLocalesToPublish below.
 */
export const Courses: CollectionConfig = {
  slug: 'courses',
  labels: { singular: 'Course', plural: 'Courses' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'pricingType', 'enrollmentState', 'order'],
    description: "The academy's current courses.",
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
    beforeChange: [requireAllLocalesToPublish(['title', 'shortDescription'])],
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
      admin: {
        position: 'sidebar',
        description: 'Published courses appear on the public site. All three languages are required to publish.',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers show first.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'URL-friendly identifier, e.g. "cosmetics-1". Shared across all locales — not translated.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'title', type: 'text', required: true, localized: true },
            {
              name: 'shortDescription',
              type: 'textarea',
              required: true,
              localized: true,
              admin: { description: 'Used on course cards and listings.' },
            },
            {
              name: 'description',
              type: 'textarea',
              localized: true,
              admin: { description: 'Full description for the course detail page.' },
            },
            { name: 'heroImage', type: 'upload', relationTo: 'media' },
            {
              name: 'gallery',
              type: 'array',
              admin: { description: 'Additional photos for the course detail page.' },
              fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
            },
            {
              name: 'audience',
              type: 'textarea',
              localized: true,
              admin: { description: 'Who this course is for.' },
            },
            {
              name: 'ctaLabel',
              type: 'text',
              localized: true,
              admin: { description: 'Optional override for the course card button. Leave blank for the site default.' },
            },
          ],
        },
        {
          label: 'Curriculum & Outcomes',
          fields: [
            {
              name: 'curriculum',
              type: 'array',
              admin: { description: 'Modules or stages of the course.' },
              fields: [
                { name: 'title', type: 'text', required: true, localized: true },
                { name: 'description', type: 'textarea', localized: true },
              ],
            },
            {
              name: 'outcomes',
              type: 'array',
              admin: { description: 'What a student leaves with.' },
              fields: [{ name: 'text', type: 'text', required: true, localized: true }],
            },
          ],
        },
        {
          label: 'Pricing & Enrollment',
          fields: [
            {
              name: 'pricingType',
              type: 'select',
              required: true,
              defaultValue: 'onRequest',
              options: pricingOptions,
              admin: { description: 'Pricing is not finalized — "On request" is the safe default.' },
            },
            {
              name: 'price',
              type: 'number',
              min: 0,
              admin: {
                condition: (_data, siblingData) =>
                  siblingData?.pricingType === 'exact' || siblingData?.pricingType === 'startingFrom',
                description: 'The exact price, or the "starting from" amount.',
              },
            },
            {
              name: 'priceRangeMin',
              type: 'number',
              min: 0,
              admin: { condition: (_data, siblingData) => siblingData?.pricingType === 'range' },
            },
            {
              name: 'priceRangeMax',
              type: 'number',
              min: 0,
              admin: { condition: (_data, siblingData) => siblingData?.pricingType === 'range' },
            },
            {
              name: 'currency',
              type: 'select',
              defaultValue: 'ILS',
              options: [
                { label: 'ILS (₪)', value: 'ILS' },
                { label: 'USD ($)', value: 'USD' },
              ],
              admin: {
                condition: (_data, siblingData) =>
                  !['hidden', 'onRequest'].includes(siblingData?.pricingType),
              },
            },
            {
              name: 'duration',
              type: 'text',
              localized: true,
              admin: { description: 'Freeform, e.g. "6 weeks". Leave blank if not finalized.' },
            },
            {
              name: 'scheduleInfo',
              type: 'textarea',
              localized: true,
              admin: { description: 'Freeform schedule details, once finalized.' },
            },
            {
              name: 'enrollmentState',
              type: 'select',
              required: true,
              defaultValue: 'open',
              options: [
                { label: 'Open', value: 'open' },
                { label: 'Closed', value: 'closed' },
                { label: 'Coming soon', value: 'comingSoon' },
                { label: 'Full', value: 'full' },
              ],
            },
            {
              name: 'certificationType',
              type: 'select',
              // Not localized: this is a fact about the course (does it
              // award a diploma at all?), not editorial copy — the
              // localized wording for 'professionalDiploma' lives in the
              // i18n dictionaries (course.certificationText), identical
              // for every course that has one, so it isn't duplicated
              // as a translated field per course.
              defaultValue: 'none',
              options: [
                { label: 'No certification information', value: 'none' },
                { label: 'Professional diploma', value: 'professionalDiploma' },
              ],
              admin: {
                description:
                  'Select a certification only when it is confirmed for this course. "No certification information" is the safe default — it hides the certification line on the course page rather than showing an unconfirmed claim.',
              },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'metaTitle', type: 'text', localized: true },
            { name: 'metaDescription', type: 'textarea', localized: true },
          ],
        },
      ],
    },
  ],
}
