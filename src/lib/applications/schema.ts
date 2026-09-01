import { z } from 'zod'
import { locales } from '@/i18n/config'

// At least one Unicode letter somewhere — rejects a name that's only
// whitespace, punctuation, or digits, without imposing a Latin-only
// pattern (names here are legitimately Arabic, Hebrew, or English).
const hasLetter = /\p{L}/u

// Permissive on purpose: digits, spaces, +, -, (), . — enough to catch
// obvious garbage without an aggressive international phone-parsing
// library that could reject a legitimate Israeli/Palestinian/
// international number for not matching an assumed format. At least 6
// digit characters somewhere in the string.
const phonePattern = /^[\d\s+\-().]+$/
const hasEnoughDigits = (value: string) => (value.match(/\d/g)?.length ?? 0) >= 6

/** Normalizes and runs each field's own trim/case logic *before* Zod's
 * type validation sees it, then collapses an empty result to
 * `undefined` for genuinely optional fields — simpler and less prone
 * to subtle mistakes than chaining .transform()/.pipe()/.or() to
 * achieve the same thing, and doesn't depend on exactly which string
 * convenience methods a given Zod version happens to expose. */
function normalized(fn: (v: string) => string) {
  return (raw: unknown) => {
    if (typeof raw !== 'string') return raw
    const value = fn(raw)
    return value === '' ? undefined : value
  }
}

/**
 * What a visitor can actually submit — deliberately excludes every
 * server-trusted field (status, source, privacyConsentAt,
 * privacyPolicyVersion). Those are never read from the request body
 * even if present; see src/lib/applications/submit.ts.
 */
export const applicationInputSchema = z.object({
  name: z.preprocess(
    normalized((v) => v.trim()),
    z
      .string({ error: 'Name is required' })
      .min(2, 'Too short')
      .max(100, 'Too long')
      .refine((v) => hasLetter.test(v), 'Must contain a name'),
  ),
  phone: z.preprocess(
    normalized((v) => v.trim().replace(/\s+/g, ' ')),
    z
      .string({ error: 'Phone is required' })
      .min(6, 'Too short')
      .max(30, 'Too long')
      .regex(phonePattern, 'Invalid characters')
      .refine(hasEnoughDigits, 'Not enough digits'),
  ),
  email: z.preprocess(
    normalized((v) => v.trim().toLowerCase()),
    z.email('Invalid email').max(200).optional(),
  ),
  message: z.preprocess(
    normalized((v) => v.trim()),
    z.string().max(2000, 'Too long').optional(),
  ),
  /** Not trusted as an id — resolved and re-validated against real
   * published courses server-side. Absent/empty means "general /
   * not sure yet". */
  courseSlug: z.preprocess(normalized((v) => v.trim()), z.string().max(100).optional()),
  locale: z.enum(locales),
  marketingConsent: z.boolean().optional().default(false),
  /** The required privacy-consent checkbox — must be explicitly true,
   * never inferred or defaulted. */
  privacyConsentGiven: z.literal(true, { error: 'Privacy consent is required' }),
  /** Honeypot: a real visitor never fills this in (hidden from
   * sighted and keyboard users). Deliberately *not* constrained to
   * empty here — a filled honeypot isn't a validation error, it's a
   * silent-success branch (see submit.ts), so it must reach that code
   * rather than being rejected by Zod with a different response shape
   * that could tip off a bot inspecting status codes. */
  honeypot: z.string().max(500).optional(),
})

export type ApplicationInput = z.infer<typeof applicationInputSchema>
