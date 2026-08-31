import type { GlobalConfig } from 'payload'

/**
 * The site's navigation structure — which links exist and in what order.
 * Interaction/accessibility labels (menu open/close, skip-to-content)
 * stay in the static i18n dictionaries; this manages actual link content,
 * which genuinely changes as pages are added (Milestone H course pages,
 * etc.).
 */
export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      admin: {
        description:
          'Reorder by dragging. Path can be an in-page anchor ("#courses"), a site path ("/courses"), or a full external URL.',
      },
      fields: [
        { name: 'label', type: 'text', required: true, localized: true },
        { name: 'path', type: 'text', required: true },
        { name: 'openInNewTab', type: 'checkbox', defaultValue: false },
      ],
    },
  ],
}
