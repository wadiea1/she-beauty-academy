import type { GlobalConfig } from 'payload'

/**
 * Business/contact info, editable by staff without a code deploy. This is
 * the CMS-backed successor to the dev placeholders in src/config/site.ts
 * — Milestone G wires the frontend to read from here instead. Deliberately
 * does not duplicate UI chrome strings (nav labels, button microcopy):
 * those stay in the static i18n dictionaries as interface vocabulary, not
 * business content.
 *
 * Native drafts for the same "don't leak a half-finished edit" safety as
 * Homepage/Navigation, but deliberately no locale-completeness publish
 * gate: every field here (WhatsApp, phone, address, default SEO, …) is
 * legitimately optional, so there is nothing that would leave the public
 * site "visibly broken" if a locale is blank — nothing meets the bar for
 * gating, per the same principle applied to Homepage/Navigation.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  versions: { drafts: true },
  access: {
    read: () => true,
    readVersions: ({ req }) => Boolean(req.user),
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
