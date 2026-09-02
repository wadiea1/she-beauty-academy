/**
 * Phone normalization boundary (Milestone N0).
 *
 * Context that makes this stricter than it looks: the public form accepts
 * free-form local AND international numbers, and the business has NOT
 * confirmed a country policy. Milestone J removed a `wa.me` link built from
 * lead phone numbers for exactly this reason.
 *
 * The rule that follows from that, and the one this module exists to
 * enforce: NEVER GUESS A COUNTRY. Stripping a leading `0` and prepending
 * `+972` produces a *plausible* number, which is strictly worse than an
 * obviously missing one — a wrong-but-plausible number fails silently, and
 * it fails at a stranger's phone, with a message about someone else's
 * enrollment.
 *
 * `ambiguous` is therefore a correct, expected outcome rather than an error,
 * and is probably the common one for a local academy. The system saying "a
 * human must resolve this" is the feature.
 */

/**
 * NOTE ON `normalized`: this is a STRUCTURAL check, not carrier-grade
 * validation. It confirms the input is already in international form and
 * well-shaped per E.164 — it does not verify the country calling code
 * exists, that the national number length is right for that country, or
 * that the line is a mobile capable of receiving WhatsApp.
 *
 * Real validation needs `libphonenumber-js` (~145kB). That is a reasonable
 * dependency WHEN SENDING ACTUALLY STARTS (N1) and an unreasonable one for
 * types nobody calls yet, so this milestone adds zero dependencies and the
 * decision is deferred explicitly rather than quietly.
 */
export type PhoneNormalizationStatus =
  /** Already international and structurally valid E.164. */
  | 'normalized'
  /** Local or otherwise country-less. NO E.164 is produced. Needs a human,
   * or an explicitly configured default region (an owner decision). */
  | 'ambiguous'
  /** Cannot be a phone number at any country: too short, too long, junk. */
  | 'invalid'

export interface NormalizedPhone {
  /** EXACTLY as submitted. Never mutated, never trimmed away, never lost. */
  raw: string
  /** E.164 with leading `+`, present only when status is `normalized`. */
  e164?: string
  status: PhoneNormalizationStatus
  /**
   * ISO-3166 alpha-2, present only when legitimately known — i.e. derived
   * from a number that already carried its own country code. Never inferred
   * from the academy's location, the site locale, or the visitor's IP.
   *
   * Deriving the actual country from a calling code requires a real prefix
   * table (calling codes are not uniquely decodable — +1 covers 20+
   * countries), so this stays undefined until N1 brings in a library that
   * can answer it honestly.
   */
  countryContext?: string
}

/** E.164 allows at most 15 digits including the country code, and the first
 * digit of a country code is never 0. */
const E164_PATTERN = /^\+[1-9]\d{7,14}$/

/** Below this, no country's number is plausible; above it, E.164 is exceeded. */
const MIN_DIGITS = 8
const MAX_DIGITS = 15

/**
 * Classify a submitted phone number without ever inventing information.
 *
 * Pure: no I/O, no configuration, no environment. The same input always
 * produces the same output, which is what makes it safe to run over existing
 * lead data without touching it.
 */
export function normalizePhone(raw: string): NormalizedPhone {
  const result = (
    status: PhoneNormalizationStatus,
    e164?: string,
  ): NormalizedPhone => (e164 ? { raw, status, e164 } : { raw, status })

  // Strip only presentation characters humans type. Note this is used for
  // ANALYSIS; `raw` above is what gets stored.
  const cleaned = raw.replace(/[\s\-(). ]/g, '')

  if (cleaned.length === 0) return result('invalid')

  // `00` is the international access prefix in most of the world — the same
  // intent as `+`, so it is a conversion, not a guess.
  const international = cleaned.startsWith('00') ? `+${cleaned.slice(2)}` : cleaned

  if (international.startsWith('+')) {
    const digits = international.slice(1)
    if (!/^\d+$/.test(digits)) return result('invalid')
    if (digits.length < MIN_DIGITS || digits.length > MAX_DIGITS) return result('invalid')
    return E164_PATTERN.test(international)
      ? result('normalized', international)
      : result('invalid')
  }

  // No country information at all. This is the case the module exists for.
  if (!/^\d+$/.test(international)) return result('invalid')
  if (international.length < MIN_DIGITS || international.length > MAX_DIGITS) {
    return result('invalid')
  }

  // Structurally plausible as *some* country's national number — but which
  // country is genuinely unknown, so no E.164 is produced. Resolving this
  // requires either a person or a stated business policy; it must never be
  // resolved by inference.
  return result('ambiguous')
}

/** Only a `normalized` number may be used as a messaging destination.
 * Enforced as a function so no call site has to remember the rule. */
export function canBeMessaged(phone: NormalizedPhone): phone is NormalizedPhone & { e164: string } {
  return phone.status === 'normalized' && typeof phone.e164 === 'string'
}
