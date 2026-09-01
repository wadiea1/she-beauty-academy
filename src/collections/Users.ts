import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminField, isAdminOrSelf, isAuthenticated } from './access/roles'

/**
 * Staff accounts. Three roles (Milestone J):
 *  - admin:   full access, including managing other users and roles.
 *  - editor:  content/editorial (Courses, FAQs, Testimonials, Media,
 *             Homepage/Navigation/Site Settings) — no Applications
 *             (leads) access, no Users management.
 *  - advisor: Applications (leads) read/update only, plus read-only
 *             access to published content for context — no delete on
 *             leads, no content editing, no Users management.
 *
 * `role` deliberately defaults to 'advisor' — the least-privileged
 * role — rather than 'admin'. A brand-new account granted no
 * elevated access by default is the safe failure mode; every admin
 * account must be a deliberate, explicit grant (see the one-time
 * migration script that promoted the existing real account,
 * scripts/migrate-admin-role.ts).
 *
 * Role escalation is blocked server-side, not just hidden in the UI:
 * `role`'s own field-level access restricts changing it to admins
 * only (isAdminField), and the collection-level `create`/`update`
 * access below is isAdmin / isAdminOrSelf — a non-admin can update
 * their own document (e.g. change their password) but that update
 * still passes through the `role` field's own access check, so it
 * can never carry a role change through.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'createdAt'],
    description: 'Staff accounts. Only an admin can create accounts or change roles.',
  },
  access: {
    // Any signed-in staff member can see the staff directory — needed
    // e.g. to pick a colleague in Applications' assignedTo field.
    // Never public.
    read: isAuthenticated,
    // Only an admin can create new accounts — otherwise anyone with
    // any staff account could mint more accounts at will.
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'advisor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Advisor', value: 'advisor' },
      ],
      access: {
        // The escalation boundary itself: even a user permitted to
        // update their own document (isAdminOrSelf above) cannot
        // change this specific field unless they are already an
        // admin.
        update: isAdminField,
      },
      admin: {
        description: 'Controls what this account can access in Admin. Only an admin can change this.',
      },
    },
  ],
}
