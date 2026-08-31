import type { Access } from 'payload'

/**
 * Full access for authenticated staff, published-only for everyone else
 * — critically, this is what actually gates an anonymous `draft: true`
 * read, not `access.readVersions`.
 *
 * Payload's global findOne operation resolves `draft: true` by taking
 * whatever `access.read` returned and, if it's a Where clause (not a
 * bare `true`), applying that SAME clause to the draft-version lookup
 * too (see replaceWithDraftIfAvailable). A bare `read: () => true`
 * therefore leaves the draft-version query completely unconstrained —
 * anyone passing `draft: true` gets the draft, authenticated or not.
 * `readVersions` only governs the separate version-history endpoints
 * (the admin's "Version History" panel), not this shorthand — verified
 * both by reading Payload 3.88's source and by reproducing the leak
 * live (an anonymous draft:true request returned unpublished content)
 * before adding this.
 *
 * Returning `{ _status: { equals: 'published' } }` here means: the main
 * (published) read is constrained to published docs, AND the nested
 * draft-version query gets that same constraint appended — which
 * contradicts the version query's own `_status: 'draft'` requirement,
 * so it can never match, and replaceWithDraftIfAvailable silently falls
 * back to the (published-only) doc instead of exposing the draft.
 */
export const publishedOnlyAccess: Access = ({ req }) => {
  if (req.user) return true
  return { _status: { equals: 'published' } }
}
