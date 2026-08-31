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
- [ ] **G — Connect public site to Payload**. Branch
      `feat/cms-homepage-integration`.

      **Content mapping** (audited before implementation):
      - → `Homepage` global: hero/manifesto/whySHE/coursesIntro/
        insideAcademy/whatYouLeaveWith/instructor/faqIntro/apply — all
        migrated verbatim from `src/content/homepage.ts`'s existing
        `homepageCopy`, not rewritten. Images stay unset (no real
        photography yet — `ImageFrame` placeholder continues to handle
        that, unchanged).
      - → `Courses` collection: the 3 real courses, from
        `homepageCopy[locale].courses.items`. `pricingType: 'onRequest'`
        (no real pricing exists). `status: 'published'`.
      - → `FAQs` collection: the 5 items from
        `homepageCopy[locale].faq.items`. `status: 'published'`.
      - → `Navigation` global: nav items with **locale-agnostic** paths
        (`''`, `'#courses'`, `'#academy'`, `'#faq'`) — the frontend
        still prepends `/${locale}`, exactly as today. No locale baked
        into a stored path.
      - → `SiteSettings` global: whatsApp/Instagram/email/phone/address
        all stay unset — none were ever provided, so none are invented.
        `src/config/site.ts`'s two pure URL-builder functions
        (`whatsappHref`/`instagramHref`) move to `src/lib/links.ts` as
        input-taking functions instead of reading a static singleton;
        the data-holding object itself is retired once parity is
        confirmed.
      - **Stays in the static i18n dictionaries, not CMS**: `nav.apply`
        ("Book a Consultation") and all interaction/accessibility
        vocabulary (open/close menu, skip-to-content, language switcher
        labels, footer section labels like "Explore"/"Connect"). These
        are recurring interface conventions applied identically across
        components, not per-context editorial content — moving them to
        Payload would make the CMS a presentation-configuration store,
        which AGENTS.md explicitly rules out.

      **Rendering strategy**: time-based caching of the CMS data itself
      (60s), not build-time SSG and not uncached per-request rendering.
      Chosen because this is a CMS-driven marketing site where staff
      expect a publish to go live without a redeploy — build-time-only
      SSG fails that expectation, while an uncached fetch on every
      request pays a DB round-trip per visitor for content that changes
      at a human editing pace. `generateStaticParams` is removed from
      the locale segment so nothing is prerendered at build time —
      `next build` needs no live database access as a result, a side
      effect of the architecture being right for this site, not the
      reason it was chosen.
      **Correction, found by testing the real production server rather
      than trusting the design**: the first implementation relied on
      `export const revalidate = 60` in `layout.tsx` alone, with no
      `generateStaticParams`. A production-server test (publish a
      distinguishable value, request immediately) showed this cached
      *nothing* — the very next request already reflected the new
      value. Per Next.js's own docs (Caching and Revalidating, Previous
      Model — the model this project is on, not the newer opt-in Cache
      Components), route-segment `revalidate` governs `fetch()` caching
      and ISR for routes prerendered via `generateStaticParams`; this
      project has neither (Payload's Local API isn't `fetch()`, and
      there's no `generateStaticParams`). Fixed by wrapping every query
      in `src/lib/payload/queries.ts` with `unstable_cache` (the
      documented mechanism "for non-fetch functions"), `revalidate: 60`
      each. Re-tested the same way and confirmed real stale-while-
      revalidate behavior this time: immediate requests after a publish
      stay stale, the first request after the window may still return
      stale content while regenerating in the background (confirmed via
      a fast response time), and a follow-up request afterward reflects
      the new value — exactly the documented semantics. The
      `revalidate = 60` export stays in `layout.tsx` as a harmless
      declaration of intent; the actual caching lives in the query
      layer.
      **Query architecture**: `src/lib/payload/` — a memoized
      (`react cache()`) Payload client plus one `unstable_cache`-wrapped
      function per content need (`getHomepage`, `getPublishedCourses`,
      `getPublishedFAQs`, `getNavigation`, `getSiteSettings`), each
      mapping raw Payload shapes onto the existing `HomepageCopy`-
      compatible types so the section components built in Milestone D
      need no changes. No `overrideAccess`, no `draft: true` — these
      exercise the exact published-only access boundary hardened in
      Milestone F/PR #3. Missing *required* Homepage content (e.g. an
      unseeded database) throws a clear error rather than silently
      rendering wrong-language or blank content; missing Courses/FAQs
      render their section with no items rather than failing the page,
      since a genuinely empty list is a valid state for a list, not for
      the homepage's narrative spine.
      **Seed non-destructiveness**: `pnpm seed` is a bootstrap
      mechanism, not a sync engine — Courses/FAQs are created only if
      their stable key doesn't exist yet (otherwise skipped untouched);
      Homepage/Navigation are only (re)seeded when they look
      uninitialized (never published, or still showing the literal
      `[[PLACEHOLDER` marker from Milestone F) — real content, seeded or
      editor-written, is left alone. `pnpm seed -- force` (positional
      `force`, not a `--force` flag — Payload's CLI parses args with
      minimist before forwarding anything to the script, and a
      dash-flag never reaches it; verified by testing both forms
      directly) explicitly overwrites. Testimonials and Users/admin are
      never touched either way.
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
