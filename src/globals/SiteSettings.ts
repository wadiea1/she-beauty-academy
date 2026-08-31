import type { GlobalConfig } from 'payload'

/**
 * Business/contact info, editable by staff without a code deploy. This is
 * the CMS-backed successor to the dev placeholders in src/config/site.ts
 * — Milestone G wires the frontend to read from here instead. Deliberately
 * does not duplicate UI chrome strings (nav labels, button microcopy):
 * those stay in the static i18n dictionaries as interface vocabulary, not
 * business content.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'whatsappNumber',
      type: 'text',
      admin: { description: 'E.164 format without the leading "+", e.g. "9725XXXXXXXX".' },
    },
    { name: 'instagramHandle', type: 'text', admin: { description: 'Without the "@".' } },
    { name: 'email', type: 'email' },
    { name: 'phone', type: 'text' },
    {
      name: 'address',
      type: 'textarea',
      localized: true,
      admin: { description: 'Physical academy address, as it should be displayed per language.' },
    },
    {
      type: 'group',
      name: 'defaultSeo',
      label: 'Default SEO',
      admin: { description: 'Fallback metadata for pages that do not set their own.' },
      fields: [
        { name: 'metaTitle', type: 'text', localized: true },
        { name: 'metaDescription', type: 'textarea', localized: true },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
