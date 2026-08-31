/** Pure URL builders — take the value as a parameter rather than reading
 * a static singleton, so they work equally well with CMS-sourced data
 * (src/lib/payload/queries.ts's getSiteSettings) as they did with the
 * old src/config/site.ts placeholder object. */

export function whatsappHref(whatsappNumber: string | null, message?: string): string | null {
  if (!whatsappNumber) return null
  const base = `https://wa.me/${whatsappNumber}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

export function instagramHref(instagramHandle: string | null): string | null {
  if (!instagramHandle) return null
  return `https://instagram.com/${instagramHandle}`
}
