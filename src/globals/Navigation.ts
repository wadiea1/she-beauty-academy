import type { GlobalConfig } from 'payload'
import { requireNavigationLocalesToPublish } from './hooks/requireNavigationLocalesToPublish'
import { publishedOnlyAccess } from './publishedOnlyAccess'

/**
 * The site's navigation structure — which links exist and in what order.
 * Interaction/accessibility labels (menu open/close, skip-to-content)
 * stay in the static i18n dictionaries; this manages actual link content,
 * which genuinely changes as pages are added (Milestone H course pages,
 * etc.).
 *
 * Native drafts, same rationale as Homepage: public reads always get the
 * last-published version, and requireNavigationLocalesToPublish blocks
 * publishing while any item is missing a label in ar/he/en.
 */
export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation',
  versions: { drafts: true },
  access: {
    read: publishedOnlyAccess,
    readVersions: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeChange: [requireNavigationLocalesToPublish],
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      admin: {
        description:
          'Reorder by dragging. Use "/" for the homepage link itself; otherwise an in-page anchor ("#courses"), a site path ("/courses"), or a full external URL.',
      },
      fields: [
        { name: 'label', type: 'text', required: true, localized: true },
        { name: 'path', type: 'text', required: true },
        { name: 'openInNewTab', type: 'checkbox', defaultValue: false },
      ],
    },
  ],
}
