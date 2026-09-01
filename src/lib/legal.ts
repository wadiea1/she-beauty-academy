/**
 * Central constant for the privacy policy version recorded against
 * every lead — one place, not a magic string scattered across the
 * form/route/collection.
 *
 * No real privacy policy exists yet (verified: no policy page/content
 * anywhere in this repo). This is an honest placeholder, not a
 * fabricated legal document — 'unpublished-v0' signals "collected
 * before any real policy was published," not "policy version zero."
 * The consent checkbox itself doesn't reference or link to a policy
 * document that doesn't exist; it's a minimal, true statement instead
 * (see the ApplicationForm's consent label). Bump this to a real
 * version string (e.g. 'v1') once actual legal content is written and
 * published — that's a legal-content dependency, not an engineering
 * one, and blocks calling this submission flow genuinely launch-ready.
 */
export const PRIVACY_POLICY_VERSION = 'unpublished-v0'
