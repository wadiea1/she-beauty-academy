# Deployment runbook

Ordered procedure for taking SHE Beauty Academy from this repository to
a running production service, plus the backup and rollback model.

Written to be followed by someone who has not read the project's
history. Read `docs/DEPLOYMENT.md` first for the topology and the
list of blockers.

> **Nothing in this repository has been deployed.** No provider
> account, domain, DNS record, credential, or legal document exists.
> Every step below is a human action.

---

## Before you start

You need decisions the repository deliberately does not make:

- a hosting platform providing the capabilities in `docs/DEPLOYMENT.md` §2
- a PostgreSQL instance with automated backups
- a domain and TLS certificate
- an object-storage provider (before anyone uploads real photography)
- **approved privacy policy text and its version identifier**

---

## 1. Provision infrastructure

1. Create the application host (long-running Node 24 process).
2. Create the PostgreSQL database. Prefer a TLS connection; do not add
   `sslmode=disable` unless the database is only reachable over a
   trusted private network.
3. Create a database user for the app. It needs DDL rights, because
   `pnpm payload:migrate` runs schema changes.

## 2. Verify backups **before** any real data exists

Do this now, while a mistake costs nothing.

1. Enable automated daily backups with a retention period the owner
   has agreed to.
2. Enable point-in-time recovery if the provider offers it.
3. **Perform a restore into a scratch database and confirm it
   succeeds.** A backup that has never been restored is not a backup.
4. Write down where backups live and who can access them.

## 3. Configure media storage

Payload currently writes uploads to the application's local disk
(`media/`). On any platform with an ephemeral filesystem those files
disappear on redeploy while their database rows survive — broken
images that a database restore cannot fix.

Until an object-storage provider is chosen and the matching Payload
storage adapter is configured, **treat uploads as local-development
only** and do not let staff upload real photography to production.

## 4. Configure rate limiting

The public form's limiter is currently in-memory: per-process, reset on
restart, not shared between instances. Production lead intake stays
disabled until a durable driver exists (see `src/lib/rateLimit.ts` for
the extension point — one `RateLimiter` implementation plus a name in
`DURABLE_RATE_LIMIT_DRIVERS`).

## 5. Set environment variables

Use `.env.example` as the contract. Set them in the platform's secret
storage — never in the repository.

| Variable | Value |
| --- | --- |
| `DATABASE_URI` | the production connection string |
| `PAYLOAD_SECRET` | a freshly generated strong secret (§6) |
| `NEXT_PUBLIC_SERVER_URL` | `https://` + the real domain |
| `ALLOW_SEARCH_INDEXING` | leave unset until the very last step |
| `ENABLE_PUBLIC_LEAD_INTAKE` | leave unset until step 15 |
| `PRIVACY_POLICY_VERSION` | leave unset until step 14 |
| `RATE_LIMIT_DRIVER` | leave unset until a durable driver exists |

Never set `PAYLOAD_DROP_DATABASE` in production. It drops every table.

## 6. Generate `PAYLOAD_SECRET`

Generate it on your own machine, paste it straight into the platform's
secret store, and do not save it anywhere else:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Use a different secret per environment. Rotating it invalidates every
existing admin session, which is the desired effect if one leaks.

## 7. Check the configuration before deploying

```bash
pnpm verify:production
```

It never prints secret values. Expect `READY FOR DEPLOYMENT: YES` and
`READY FOR PUBLIC LAUNCH: NO` at this stage — the launch blockers are
still open, and that is correct.

## 8. Run migrations

```bash
pnpm install --frozen-lockfile
pnpm payload:migrate
pnpm payload:migrate:status
```

Run this **as an explicit step, before the new version starts serving**
— not automatically on boot. Take a fresh database backup first if the
database already holds real data.

Never run `migrate:fresh`, `migrate:reset`, or `migrate:refresh`
against production; they are destructive and deliberately not wired to
any `pnpm` script.

## 9. Build and start

```bash
pnpm build
pnpm start
```

`pnpm build` never connects to the database — CI enforces this.
`pnpm start` runs as `NODE_ENV=production`, which disables Payload's
dev schema push.

## 10. Verify health

- `GET /api/health` → `{"status":"ok"}` — process is alive.
- `GET /api/ready` → `{"status":"ready"}` — database reachable.

Point the platform's liveness probe at `/api/health` and its readiness
probe at `/api/ready`. Do not use readiness for restarts: a database
blip should remove an instance from rotation, not kill it.

## 11. Verify Payload Admin and RBAC

Log in at `/admin` as the real admin and confirm:

- the admin account still has `role: admin`
- an editor cannot see Applications at all
- an advisor can read and update Applications but cannot create or
  delete them
- no non-admin can change a role or create a user

Do not create staff accounts via scripts or seeds. Create them
deliberately in the admin UI, and remember the safe default for a new
account is `advisor`.

## 12. Domain and HTTPS

Point the domain at the app, issue the certificate, confirm HTTPS
works, and confirm `NEXT_PUBLIC_SERVER_URL` matches exactly. Then
re-check canonical URLs, `sitemap.xml`, and `robots.txt` reflect the
real domain.

Consider adding HSTS at the TLS/edge layer at this point — deliberately
not set by the application, since it is a commitment about a domain
that did not exist when this was written.

## 13. Seed content (only if needed)

`pnpm seed` is non-destructive: it creates content only where it does
not already exist and never touches Users, Testimonials, or Site
Settings. It is never run automatically by build, start, migration, or
deployment. **Never run `pnpm seed -- force` against production** — it
overwrites editor content.

## 14. Add the real privacy policy

1. Publish the approved, legally-reviewed policy text. Do not use
   AI-generated text and do not write it yourself.
2. Set `PRIVACY_POLICY_VERSION` to the agreed identifier (a date or
   semantic version). It must not be `unpublished-v0`.
3. Make sure the consent checkbox on the form links to the published
   policy.

Until this is done the application refuses to record consent against
real leads — by design.

## 15. Enable public lead intake

Only once step 14 is done **and** a durable rate limiter is configured:

```
ENABLE_PUBLIC_LEAD_INTAKE=true
```

Redeploy and confirm `pnpm verify:production` now reports
`READY FOR PUBLIC LAUNCH: YES`.

## 16. Test a real submission end to end

Submit the form yourself, confirm the lead appears in Payload Admin
with the correct `privacyPolicyVersion`, and then **delete that test
lead**.

## 17. Verify logging and monitoring

Confirm logs reach the aggregator and that they do **not** contain
phone numbers, email addresses, message bodies, consent contents,
connection strings, or secrets. Useful log lines are failure
categories, rate-limit events, migration results, and readiness
transitions.

## 18. Verify SEO output

With the real domain configured, confirm canonical URLs, hreflang
(including `x-default` → `/ar`), `sitemap.xml` (12 URLs today: 3
locale homepages + 3 courses × 3 locales), an invalid course slug
returning 404 with no canonical, and that nothing references
`localhost`.

## 19. Enable search indexing — **last**

```
ALLOW_SEARCH_INDEXING=true
```

Redeploy and confirm `robots.txt` now allows crawling and disallows
`/admin` and `/api`. Doing this earlier risks Google indexing an
unfinished site or a staging copy.

---

## Rollback model

**Code and schema roll back differently. `git revert` does not undo a
database migration.** Treat them as two separate decisions.

### Rolling back the application

Redeploy the previous build. Safe as long as the older code still
understands the current schema — which is true for additive migrations
(new tables/columns) and false for destructive ones.

### Rolling back the schema

1. **Preferred: roll forward.** Write a new migration that corrects the
   problem and deploy it. This keeps history linear and works with the
   backups you already have.
2. `pnpm exec payload migrate:down` reverts the most recent migration
   using its `down` statements. Take a backup first, and be aware
   that a `down` which drops a column destroys the data in it.
3. **Restore from backup** when data was lost or corrupted. This
   reverts *all* data to the backup timestamp — including leads
   submitted since. Media files are not in the database backup; if
   uploads changed too, restore object storage to a matching point.

### Before any risky migration

1. Take and verify a fresh backup.
2. Note the current migration name (`pnpm payload:migrate:status`).
3. Have the previous application build ready to redeploy.
4. Prefer a maintenance window over racing live traffic.
