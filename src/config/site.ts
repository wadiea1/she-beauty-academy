/**
 * Centralized placeholder business/contact info.
 *
 * TODO(business-info): replace with real values before launch. Everything
 * here is deliberately `null` rather than a fake value — null-checked
 * consumers (Navigation, Footer, future lead form) simply omit the
 * corresponding CTA until it's filled in, so a placeholder can never be
 * mistaken for a real contact channel in production.
 *
 * Longer-term this moves into a Payload "Site Settings" global (see
 * docs/IMPLEMENTATION_PLAN.md — Milestone F) so staff can edit it without
 * a code change.
 */
export const siteConfig = {
  name: 'SHE Beauty Academy',
  /** E.164 without the leading '+', e.g. '9725XXXXXXXX'. */
  whatsappNumber: null as string | null,
  instagramHandle: null as string | null,
  email: null as string | null,
  phone: null as string | null,
  address: null as string | null,
}

export function whatsappHref(message?: string): string | null {
  if (!siteConfig.whatsappNumber) return null
  const base = `https://wa.me/${siteConfig.whatsappNumber}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

export function instagramHref(): string | null {
  if (!siteConfig.instagramHandle) return null
  return `https://instagram.com/${siteConfig.instagramHandle}`
}
