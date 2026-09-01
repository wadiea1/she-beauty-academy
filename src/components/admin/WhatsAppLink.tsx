'use client'

import { useField } from '@payloadcms/ui'

/**
 * Manual WhatsApp handoff (Milestone J) — explicitly NOT automation.
 * Renders a plain wa.me deep link next to the phone field so staff can
 * open a WhatsApp conversation with this lead in one click and
 * continue entirely by hand from there. No Meta Cloud API, no
 * message pre-fill, no background job, no send of any kind, and no
 * claim that a message was sent — functionally identical to a staff
 * member retyping the number into WhatsApp themselves, just without
 * the retyping.
 *
 * Deliberately doesn't assume or prepend a country code: `phone` is
 * freeform text (Milestone I), so a lead saved in local format
 * (e.g. "050...") would produce a wrong wa.me link if this guessed at
 * one — that's a business fact (which country) this component has no
 * business inventing. It passes through exactly the digits a staff
 * member already sees in the field above.
 */
export function WhatsAppLink() {
  const { value } = useField<string>({ path: 'phone' })
  const digits = typeof value === 'string' ? value.replace(/\D/g, '') : ''

  if (!digits) return null

  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-block',
        marginTop: 'calc(var(--base) * 0.4)',
        fontSize: '0.8rem',
      }}
    >
      Open WhatsApp ↗
    </a>
  )
}
