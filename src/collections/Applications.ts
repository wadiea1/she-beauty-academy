import type { CollectionConfig } from 'payload'
import { locales, localeMeta } from '@/i18n/config'

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
 * Leads collected from the future public application form (Milestone I).
 * No public write path exists yet on purpose: the form will call the
 * Local API from a server Route Handler (with Zod validation and spam
 * protection) using `overrideAccess: true`, rather than writing through
 * this collection's own access control — so `create` staying staff-only
 * here is a real security boundary, not a placeholder to loosen later.
 */
export const Applications: CollectionConfig = {
  slug: 'applications',
  labels: { singular: 'Application', plural: 'Applications' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'status', 'interestedCourse', 'createdAt'],
    description: 'Leads from the website. Never publicly readable.',
    group: 'Leads',
  },
  access: {
    // Never public — leads must not be exposed via the read API.
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
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
      type: 'text',
      admin: { position: 'sidebar', description: 'e.g. "homepage", "instagram", "referral".' },
    },
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
    },
    { name: 'interestedCourse', type: 'relationship', relationTo: 'courses' },
    {
      name: 'message',
      type: 'textarea',
      admin: { description: "The lead's own message, as submitted." },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      admin: { description: 'Staff-only notes — never shown to the lead.' },
    },
    {
      type: 'collapsible',
      label: 'UTM / campaign tracking',
      admin: { initCollapsed: true },
      fields: [
        { name: 'utmSource', type: 'text' },
        { name: 'utmMedium', type: 'text' },
        { name: 'utmCampaign', type: 'text' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Consent',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'privacyConsentAt',
          type: 'date',
          required: true,
          defaultValue: () => new Date().toISOString(),
          admin: { description: 'When the lead agreed to the privacy policy.' },
        },
        {
          name: 'privacyPolicyVersion',
          type: 'text',
          admin: { description: 'Which privacy policy version was in effect, e.g. "v1".' },
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
          admin: {
            condition: (_data, siblingData) => Boolean(siblingData?.marketingConsent),
          },
        },
      ],
    },
  ],
}
