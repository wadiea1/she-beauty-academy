# SHE Beauty Academy — Implementation Plan

Living document. Updated as milestones complete. Source of truth for scope
and status is this file plus `git log`.

## Audit summary (2026-08-31)

- Next.js 16.3.2 (App Router, Turbopack by default), React 19.2.8, TS 6,
  Tailwind 4.3, Payload 3.88 + `@payloadcms/db-postgres`, already wired to
  PostgreSQL (`she_academy`). `pnpm lint` and `pnpm build` both pass clean
  on the pre-existing code.
- Payload: only the `Users` auth collection exists. Localization
  (`ar`/`he`/`en`, default `ar`, `fallback: false`) is configured correctly
  in `src/payload.config.ts` and left untouched.
- Design system (`src/components/ui`): `Container`, `Section`, `Heading`,
  `Text`, `cn()` exist and are sound — kept as-is. `Eyebrow`, `Rule`,
  `Button` were missing.
- Frontend: `src/app/(frontend)/layout.tsx` was a hardcoded
  `lang="en" dir="ltr"` placeholder explicitly marked temporary. No
  `/ar` `/he` `/en` routing existed. `src/styles/fonts.ts` defines all 6
  required `next/font/google` fonts but nothing consumed them.
- **Next.js 16 breaking change relevant here**: `middleware.ts` is
  deprecated, renamed to `proxy.ts` (function export named `proxy`, runs on
  the Node.js runtime only — no edge runtime). Locale routing is built on
  `proxy.ts`, not `middleware.ts`.
- `.env` has `DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`
  present (existence only checked, values never read).

## Key technical decisions

- **Locale routing**: `src/app/(frontend)/[locale]/layout.tsx` is the root
  layout for the public site (owns `<html lang dir>`), matching the Next 16
  docs pattern for i18n where the dynamic segment folder *is* the root
  layout. `src/proxy.ts` redirects unprefixed paths to the default locale
  (`ar`) and leaves `/admin`, `/api`, and static assets untouched. The
  `(payload)` route group keeps its own independent root layout — two root
  layouts via route groups, as already set up.
- **Fonts**: all 6 `next/font/google` fonts are declared with
  `preload: false` and exposed as CSS variables at all times; which one
  actually paints text is resolved per-locale in CSS via `:lang()`
  selectors mapping to `--font-body` / `--font-display`. This avoids
  forcing 6 font files to preload on every page load while still keeping a
  single static `<html>` className (no locale branching in JS, no
  hydration risk).
- **UI dictionaries**: small, typed, per-locale `.ts` modules (not JSON) in
  `src/i18n/dictionaries/*`, each `satisfies` a shared `Dictionary` type so
  a missing key in any locale is a compile error. This is for chrome
  (nav/footer/CTAs/microcopy) only — real content (courses, FAQs,
  instructor bio, homepage copy) lives in Payload, not in these
  dictionaries, per the CMS-first content rule.
- **Business-contact placeholders**: `src/config/site.ts` centralizes
  WhatsApp number / Instagram handle / email / phone / address as
  `null`-by-default fields with helpers that return `null` when unset, so
  navigation/footer conditionally omit CTAs rather than ever rendering a
  fabricated phone number. Flagged as an open item below.
- **Button**: kept in the same `Record<Variant, string>` pattern as the
  other primitives (no CVA — not enough variant complexity to justify the
  dependency).
- **Payload content model (Milestone F)**: no rich-text editor installed
  (`@payloadcms/richtext-lexical` isn't a dependency) — long-form fields
  use plain `textarea`. Deliberate scope decision for a data-model-only
  milestone, not an oversight; revisit if editorial needs demand inline
  formatting once Milestone G wires content into the frontend. Tabs are
  unnamed (visual grouping, flat data) on Courses/FAQs/Testimonials/
  Applications, but named (nested data) on the `Homepage` global, to
  mirror `HomepageCopy`'s per-section shape. Publish gating
  (`requireAllLocalesToPublish`) is real, tested end-to-end via the Local
  API (not just admin eyeballing) — a genuine bug was found and fixed in
  it during that verification (see the "add media and course content
  models" commit for details): never thread the current request's `req`
  into a hook's own nested `findByID` call on the same document, it
  corrupts the outer write.

## Milestones

- [x] **A — Design primitives**: `Eyebrow`, `Rule`, `Button` added,
      completing Phase 3.
- [x] **B — Frontend i18n**: `/ar` `/he` `/en` routing, `proxy.ts`,
      locale-aware `<html lang dir>`, locale-aware fonts, typed
      dictionaries, `/` → `/ar` redirect.
- [x] **C — Navigation / footer**: accessible header with mobile drawer,
      language switcher, skip-to-content link, brand wordmark; footer with
      conditional contact/social CTAs.
- [x] **D — Homepage architecture**: full narrative homepage per the
      section order in the brief (hero → manifesto → why SHE → courses →
      inside the academy → what you leave with → instructor credibility →
      FAQ → apply CTA → social → footer), with placeholder photography
      slots (`ImageFrame`, see `PHOTOGRAPHY_BRIEF.md`) and honest,
      non-fabricated copy (`src/content/homepage.ts`). Branch
      `feat/homepage-editorial`.
- [ ] **E — Motion system incl. "The Thread"**: Motion/Framer for standard
      component animation, restrained scroll-linked SVG thread signature,
      `prefers-reduced-motion` respected throughout.
- [x] **F — Payload collections/globals**: `Media`, `Courses`, `FAQs`,
      `Testimonials` (architecture only, no seeded records), `Applications`
      (leads, staff-only access); globals `SiteSettings`, `Navigation`,
      `Homepage`. Branch `feat/payload-content-model`. Course/FAQ/
      Testimonial `status` publishing is gated by a shared
      `requireAllLocalesToPublish` hook (`src/collections/hooks/`) — can't
      publish with a missing ar/he/en translation, per AGENTS.md §5. Real
      course records (Cosmetics 1, Cosmetics 2, Branding & AI for Beauty
      Businesses) are not yet seeded — that's Milestone G, once the
      frontend is ready to read them.
- [ ] **G — Connect public site to Payload** content instead of hardcoded
      placeholders. Seed the 3 real courses at that point. Watch for CI
      impact: once pages statically generate from Payload data, the CI
      workflow's fake DB credentials (`.github/workflows/ci.yml`) will
      need either a real `postgres:` service container or those routes
      moving to on-demand rendering.
- [ ] **H — Course listing/detail pages**.
- [ ] **I — Lead/application flow** (Zod validation, spam protection,
      privacy/marketing consent kept separate).
- [ ] **J — Admin-friendly lead management** in Payload.
- [ ] **K — SEO**: per-locale metadata, hreflang, sitemap, robots,
      structured data.
- [ ] **L — Accessibility / responsive / performance pass**.
- [ ] **M — Production build + deployment readiness**.
- [ ] **N — Architecture prep for WhatsApp Cloud API + AI enrollment
      agent** (no implementation required now, just clean seams).

## Open business-info items (not blocking engineering work)

Tracked here rather than asked one-by-one; needed before real launch, not
before continuing to build:

- Real WhatsApp Business number, Instagram handle, email, phone, address.
- Final instructor biography copy (long-form, for the credibility section).
- Final course pricing model per course (exact / starting-from / on
  request / hidden).
- Real photography (see `PHOTOGRAPHY_BRIEF.md`, to be added alongside
  Milestone D).
- Domain + deployment target/credentials.
- Verified Israeli certification/diploma legal wording, if any claim
  beyond "professional diploma upon successful completion" is desired.
