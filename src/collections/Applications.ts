import type { CollectionConfig } from 'payload'
import { locales, localeMeta } from '@/i18n/config'
import { isAdmin, isAdminField, isAdminOrAdvisor } from './access/roles'

const statusOptions = [
  // Main lifecycle
  { label: 'New', value: 'new' },
  { label: 'Automatic follow-up', value: 'automatic_followup' },
  { label: 'Engaged', value: 'engaged' },
  { label: 'Qualified', value: 'qualified' },
  { label: 'Consultation booked', value: 'consultation_booked' },
  { label: 'Visited', value: 'visited' },
  { label: 'Enrolled', value: 'enrolled' },
  // Side outcomes
  { label: 'No answer', value: 'no_answer' },
  { label: 'Follow up later', value: 'follow_up' },
  { label: 'Not now', value: 'not_now' },
  { label: 'Not interested', value: 'not_interested' },
  { label: 'Invalid', value: 'invalid' },
  { label: 'Spam', value: 'spam' },
]

/**
 * Leads collected from the public application form (Milestone I),
 * managed here by staff (Milestone J). No public write path exists on
 * this collection itself on purpose: the form calls the Local API
 * from a server Route Handler (Zod validation, spam protection) using
 * `overrideAccess: true` — `create` staying staff-only here is a real
 * security boundary, not a placeholder to loosen later.
 *
 * Access is admin/advisor only — editors get no access at all to
 * leads, which is personal contact data outside their editorial
 * remit. Advisors can read and update (work leads, change status,
 * assign, add notes) but never delete — only an admin can permanently
 * remove a lead.
 *
 * Field integrity: a handful of fields record facts about how/when a
 * lead was captured (source, preferredLanguage, and the consent
 * audit trail) rather than the ongoing work of handling it. Those are
 * marked `admin.readOnly` (so the normal UI doesn't invite editing
 * them) AND locked with `access.update: isAdminField` (so the
 * boundary is real, not just hidden — Payload Admin `readOnly` is a
 * UX affordance, not a security control, so a direct API write must
 * be blocked server-side too). An admin can still correct a genuine
 * data-entry mistake through the API if truly needed; advisors
 * cannot.
 */
export const Applications: CollectionConfig = {
  slug: 'applications',
  labels: { singular: 'Application', plural: 'Applications' },
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'name',
    defaultColumns: [
      'createdAt',
      'name',
      'phone',
      'interestedCourse',
      'preferredLanguage',
      'source',
      'status',
      'assignedTo',
    ],
    description: 'Leads from the website. Never publicly readable.',
    group: 'Leads',
  },
  access: {
    // Never public — leads must not be exposed via the read API.
    read: isAdminOrAdvisor,
    create: isAdminOrAdvisor,
    update: isAdminOrAdvisor,
    // Deleting a lead is more consequential than working one — admin
    // only.
    delete: isAdmin,
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: statusOptions,
      admin: { position: 'sidebar' },
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      filterOptions: {
        // UI convenience, not a security boundary on its own — the
        // relationship still ultimately points at any user id via
        // the API, but Applications access control itself already
        // gates who can write here at all (isAdminOrAdvisor above).
        // This just keeps editors (who have no reason to work leads)
        // out of the picker.
        role: { in: ['admin', 'advisor'] },
      },
      admin: { position: 'sidebar', description: 'Staff member handling this lead.' },
    },
    {
      name: 'consultationAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Scheduled consultation or visit, once booked.',
      },
    },
    {
      name: 'source',
      type: 'select',
      // A controlled set, not freeform text (Milestone I): the public
      // submission endpoint derives this value itself from whether a
      // real course was resolved server-side — it's never accepted as
      // client input, so an attacker can't pollute this field with an
      // arbitrary string. Protected post-creation (below) to keep
      // that provenance trustworthy in Admin too.
      options: [
        { label: 'Homepage', value: 'homepage' },
        { label: 'Course page', value: 'course_page' },
      ],
      access: { update: isAdminField },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Where on the site this lead submitted the form. Set automatically — not editable.',
      },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      admin: { description: 'Staff-only notes — never shown to the lead. The main working field for this lead.' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contact',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'phone', type: 'text', required: true },
              ],
            },
            { name: 'email', type: 'email' },
            {
              name: 'preferredLanguage',
              type: 'select',
              required: true,
              defaultValue: 'ar',
              options: locales.map((code) => ({ label: localeMeta[code].label, value: code })),
              access: { update: isAdminField },
              admin: {
                readOnly: true,
                description: 'The language the lead used to submit the form. Set automatically — not editable.',
              },
            },
          ],
        },
        {
          label: 'Interest',
          fields: [
            { name: 'interestedCourse', type: 'relationship', relationTo: 'courses' },
            {
              name: 'message',
              type: 'textarea',
              admin: { description: "The lead's own message, as submitted." },
            },
          ],
        },
        {
          label: 'Consent & Audit',
          fields: [
            {
              name: 'privacyConsentAt',
              type: 'date',
              required: true,
              defaultValue: () => new Date().toISOString(),
              access: { update: isAdminField },
              admin: {
                readOnly: true,
                description: 'When the lead agreed to the privacy policy. Set automatically — not editable.',
              },
            },
            {
              name: 'privacyPolicyVersion',
              type: 'text',
              access: { update: isAdminField },
              admin: {
                readOnly: true,
                description: 'Which privacy policy version was in effect. Set automatically — not editable.',
              },
            },
            {
              name: 'marketingConsent',
              type: 'checkbox',
              defaultValue: false,
              admin: { description: 'Separate, optional opt-in — never bundled with the privacy consent above.' },
            },
            {
              name: 'marketingConsentAt',
              type: 'date',
              access: { update: isAdminField },
              admin: {
                readOnly: true,
                description: 'Set automatically — not editable.',
                condition: (_data, siblingData) => Boolean(siblingData?.marketingConsent),
              },
            },
          ],
        },
        {
          label: 'Campaign tracking',
          fields: [
            { name: 'utmSource', type: 'text' },
            { name: 'utmMedium', type: 'text' },
            { name: 'utmCampaign', type: 'text' },
          ],
        },
      ],
    },
  ],
}
