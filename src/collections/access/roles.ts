import type { Access, FieldAccess } from 'payload'
import type { User } from '../../../payload-types'

type Role = User['role']

function hasRole(user: User | null | undefined, allowed: Role[]): boolean {
  return Boolean(user && allowed.includes(user.role))
}

/**
 * Central, typed access helpers — every collection/global's access
 * control calls these rather than repeating `user.role === 'admin'`
 * inline in dozens of places. Two flavors per check because Payload's
 * collection-level `Access` and field-level `FieldAccess` are
 * different function types (different arg shapes), even though both
 * only need `req.user` here.
 */
export const isAdmin: Access = ({ req }) => hasRole(req.user, ['admin'])
export const isAdminOrEditor: Access = ({ req }) => hasRole(req.user, ['admin', 'editor'])
export const isAdminOrAdvisor: Access = ({ req }) => hasRole(req.user, ['admin', 'advisor'])
/** Any signed-in staff member, any role — the same boundary every
 * collection used before this milestone, kept for the few places that
 * genuinely don't need to differentiate by role (e.g. reading the
 * staff directory for the assignedTo picker). */
export const isAuthenticated: Access = ({ req }) => Boolean(req.user)

export const isAdminField: FieldAccess = ({ req }) => hasRole(req.user, ['admin'])

/**
 * Users collection only: an admin can update anyone; anyone else can
 * only update their own account (e.g. their own password), never
 * another user's — and, critically, never their own `role` field,
 * which is separately locked to admin-only via that field's own
 * `access.update: isAdminField`. Returning a Where clause (rather than
 * a boolean) when `id` isn't present handles the list/query case the
 * same way a boolean-only check couldn't.
 */
export const isAdminOrSelf: Access = ({ req, id }) => {
  if (!req.user) return false
  if (hasRole(req.user, ['admin'])) return true
  if (id) return req.user.id === id
  return { id: { equals: req.user.id } }
}
