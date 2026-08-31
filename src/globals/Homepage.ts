import type { GlobalConfig } from 'payload'

/**
 * Homepage editorial content, one named tab per section — matching
 * src/content/homepage.ts's HomepageCopy shape closely so Milestone G's
 * mapping from Payload data to the existing section components
 * (Hero, Manifesto, WhySHE, …) is close to 1:1. Named tabs nest each
 * section's fields under that name (e.g. `homepage.hero.eyebrow`) rather
 * than flattening everything onto one object.
 *
 * The course list itself is NOT duplicated here — it comes from the
 * Courses collection. Same for FAQ items (FAQs collection); this only
 * holds each section's short intro copy.
 */
export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Homepage',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          name: 'hero',
          label: 'Hero',
          fields: [
            { name: 'eyebrow', type: 'text', required: true, localized: true },
            { name: 'heading', type: 'text', required: true, localized: true },
            { name: 'lead', type: 'textarea', required: true, localized: true },
            { name: 'image', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          name: 'manifesto',
          label: 'Manifesto',
          fields: [
            { name: 'eyebrow', type: 'text', required: true, localized: true },
            { name: 'heading', type: 'text', required: true, localized: true },
            { name: 'body', type: 'textarea', required: true, localized: true },
          ],
        },
        {
          name: 'whySHE',
          label: 'Why SHE',
          fields: [
            { name: 'eyebrow', type: 'text', required: true, localized: true },
            { name: 'heading', type: 'text', required: true, localized: true },
            {
              name: 'pillars',
              type: 'array',
              minRows: 1,
              fields: [
                { name: 'title', type: 'text', required: true, localized: true },
                { name: 'body', type: 'textarea', required: true, localized: true },
              ],
            },
          ],
        },
        {
          name: 'coursesIntro',
          label: 'Courses Intro',
          fields: [
            { name: 'eyebrow', type: 'text', required: true, localized: true },
            { name: 'heading', type: 'text', required: true, localized: true },
            {
              name: 'intro',
              type: 'textarea',
              required: true,
              localized: true,
              admin: { description: 'The course cards themselves come from the Courses collection.' },
            },
          ],
        },
        {
          name: 'insideAcademy',
          label: 'Inside the Academy',
          fields: [
            { name: 'eyebrow', type: 'text', required: true, localized: true },
            { name: 'heading', type: 'text', required: true, localized: true },
            { name: 'body', type: 'textarea', required: true, localized: true },
            {
              name: 'images',
              type: 'array',
              admin: { description: 'Aim for 4, for the mosaic grid layout.' },
              fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
            },
          ],
        },
        {
          name: 'whatYouLeaveWith',
          label: 'What You Leave With',
          fields: [
            { name: 'eyebrow', type: 'text', required: true, localized: true },
            { name: 'heading', type: 'text', required: true, localized: true },
            {
              name: 'points',
              type: 'array',
              minRows: 1,
              fields: [{ name: 'text', type: 'text', required: true, localized: true }],
            },
          ],
        },
        {
          name: 'instructor',
          label: 'Instructor Credibility',
          fields: [
            { name: 'eyebrow', type: 'text', required: true, localized: true },
            { name: 'heading', type: 'text', required: true, localized: true },
            { name: 'role', type: 'text', required: true, localized: true },
            {
              name: 'bio',
              type: 'array',
              minRows: 1,
              admin: {
                description:
                  'Keep the distinction from AGENTS.md §11 explicit: this experience belongs to the instructor\'s prior career, not to SHE itself.',
              },
              fields: [{ name: 'paragraph', type: 'textarea', required: true, localized: true }],
            },
            { name: 'photo', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          name: 'faqIntro',
          label: 'FAQ Intro',
          fields: [
            { name: 'eyebrow', type: 'text', required: true, localized: true },
            { name: 'heading', type: 'text', required: true, localized: true },
          ],
        },
        {
          name: 'apply',
          label: 'Apply CTA',
          fields: [
            { name: 'eyebrow', type: 'text', required: true, localized: true },
            { name: 'heading', type: 'text', required: true, localized: true },
            { name: 'body', type: 'textarea', required: true, localized: true },
          ],
        },
      ],
    },
  ],
}
