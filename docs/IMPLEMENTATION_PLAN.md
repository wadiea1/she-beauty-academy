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
- **No web payment — ever, by design, not a missing feature.** Confirmed
  business decision: SHE Beauty Academy will not accept payments through
  this website. The intended commercial flow is entirely off-platform:
  website (lead/consultation form) → WhatsApp conversation with the
  academy → staff discusses course, price, dates, questions → enrollment
  and payment are handled manually/off-site by admin staff. Concretely,
  this means the codebase must never grow: online checkout, Stripe,
  PayPal, or any other payment-provider integration; credit-card
  handling of any kind; cart/order/payment API routes; a payment/order
  Payload collection or database model; a "Pay now" button; or storage of
  any payment/card information. `Applications` (Milestone I) is the
  entire commercial-conversion data model this site owns — a lead
  record, nothing past it. The (not-yet-built) future flow is: lead
  submitted → confirmation → WhatsApp handoff/follow-up → staff/AI
  conversation (Milestone N) → consultation/visit → admin manually
  confirms enrollment, all outside this codebase. If a future milestone
  brief ever asks for checkout/payment on this site, that contradicts
  this recorded decision and should be confirmed explicitly before
  building anything, not assumed to supersede it silently.

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
      `prefers-reduced-motion` respected throughout. Branch
      `feat/motion-system`.

      **Audit** (before writing any implementation code): confirmed
      zero existing motion handling anywhere in `src/` (`grep` for
      `prefers-reduced-motion`, `framer-motion`, `motion`, `gsap` — no
      matches). Confirmed the Milestone G query/rendering architecture
      (`src/lib/payload/queries.ts`, `src/app/(frontend)/[locale]/
      page.tsx`) is a plain Server Component tree with typed props —
      motion is added purely as small Client Component wrappers around
      that output; no content moves back out of Payload, no section is
      reordered or redesigned. Package chosen: `motion` (npm package
      `motion`, the rebranded Framer Motion, import path
      `"motion/react"`) — verified compatible before installing
      (registry: latest `13.1.1`, peer deps `react`/`react-dom`
      `"^18.0.0 || ^19.0.0"`, satisfied by this project's React
      `19.2.8`). No GSAP: Motion's `useScroll`/`useTransform` combined
      with SVG's native `pathLength` normalization (see Thread notes
      below) fully cover The Thread's scroll-linked line-drawing
      without a second animation library.

      **Motion map** (per section — all reveals are `whileInView`,
      `viewport={{ once: true }}`, transform+opacity only, premium
      "expo-out"-style easing `[0.16, 1, 0.3, 1]`; distances are along
      the block axis, direction-agnostic under RTL/LTR by construction
      since they translate on Y, not X):

      | Section | What enters | Trigger | Distance/duration | Stagger |
      |---|---|---|---|---|
      | Hero | eyebrow → heading → lead → CTA → image, in sequence | Mount (already in viewport on load) | y 16px / 0.6s | 0.1s offset per element |
      | Manifesto | eyebrow (fade only) → heading → body | Scroll into view | y 12–16px / 0.6s | none |
      | WhySHE | eyebrow/heading, then 3 pillars | Scroll into view | y 16px / 0.5s | 0.09s between pillars |
      | Courses | intro, then course cards | Scroll into view | y 16px / 0.5s | 0.09s between cards |
      | InsideAcademy | intro, then image mosaic | Scroll into view | y 16px / 0.5s | 0.09s between images |
      | WhatYouLeaveWith | list points | Scroll into view | y 12px / 0.5s | 0.07s between points |
      | InstructorCredibility | image, eyebrow/heading/role/bio | Scroll into view | y 16px / 0.6s | none |
      | FAQSection | eyebrow/heading, then each `<details>` row (entrance only — open/close stays native, unanimated) | Scroll into view | y 12px / 0.5s | 0.06s between rows |
      | ApplyCTA | eyebrow/heading/body/CTAs | Scroll into view | y 16px / 0.6s | none |
      | SocialProof | unchanged (renders `null` today; no images to animate yet) | — | — | — |

      Every reveal is skipped (content renders at its final, static
      position with full opacity, no transform) when
      `useReducedMotion()` reports a preference for reduced motion —
      checked per-component, not just once globally, so no path can
      accidentally ship a transform under `prefers-reduced-motion:
      reduce`. `ImageFrame` gets a single built-in opacity+subtle-scale
      reveal (from `scale: 1.04, opacity: 0` to `scale: 1, opacity: 1`)
      applied uniformly everywhere it's used, so the same treatment
      covers today's placeholders and tomorrow's real Payload photos
      with no per-callsite work.

      **The Thread**: one continuous SVG line spanning Hero through
      ApplyCTA (excluding SocialProof/Footer — the CTA is the intended
      resolution point), positioned decoratively at the `inset-inline-
      start` gutter of the content column, `aria-hidden="true"`,
      `pointer-events-none`. Two path variants (desktop: richer 4–5-
      wave S-curve; mobile ≤ lg: a narrower, simpler version of the
      same curve), swapped via CSS breakpoint, both defined in
      normalized SVG `viewBox` units (not document pixels) so the path
      scales automatically to whatever the actual rendered height is —
      resilient to Arabic/Hebrew/English copy-length differences by
      construction, no hardcoded pixel geometry anywhere. Line-drawing
      uses the path's `pathLength={1}` normalization attribute (not
      `getTotalLength()` measurement) so `stroke-dasharray`/
      `strokeDashoffset` are simple 0–1 values regardless of the path's
      actual geometric length; `vector-effect: non-scaling-stroke`
      keeps the stroke a true ~1px regardless of the non-uniform
      viewBox stretching. Progress is driven by Motion's
      `useScroll({ target, offset: ['start start', 'end end'] })` →
      `useTransform` → bound via the `style` prop on a `motion.path`,
      which updates outside React's render cycle (no per-scroll-event
      `setState`). Under reduced motion, the line renders fully drawn
      and static (a quiet decorative element, not an animation).

      **Client boundaries**: `ImageFrame` and the new `src/components/
      motion/` primitives (`Reveal`, `StaggerGroup`/`StaggerItem`,
      `ThreadContainer`/`Thread`) are the only new Client Components.
      Section components stay Server Components; they import the
      motion wrappers the same way they already import `Heading`/
      `Text`/etc. and pass CMS-sourced children through — the homepage
      itself is not converted to a Client Component. No motion
      component imports Payload.

      **Bundle impact, measured (and re-measured after a bad first
      attempt)**: the first attempt used `git stash` to get a "before"
      build to diff against, but `git stash` doesn't touch *untracked*
      files by default — `src/components/motion/` stayed on disk, so
      the "baseline" build actually failed at the TypeScript step
      (`Cannot find module 'motion/react'`) rather than producing a
      real pre-motion build; the chunk-size number taken from it was
      invalid and should never have been reported as a measurement.
      Redone properly with a temporary `git worktree` checked out at
      `main` (a genuinely separate, clean directory — no risk of
      cross-contamination from untracked files), `pnpm install
      --frozen-lockfile`, and a `next build` required to exit 0 before
      any measurement was taken, on both sides:
      - `main` baseline: **3,038,297 bytes** across `.next/static/chunks`.
      - `feat/motion-system`: **3,194,401 bytes**.
      - Delta: **+156,104 bytes (~152 KiB) raw/pre-gzip, +5.14%** —
        app-wide, since `.next/static/chunks` includes every route
        (including the Payload admin panel), not just the homepage.
      - A more targeted figure: reading `/[locale]`'s own RSC
        client-reference-manifest (the set of chunks Next actually
        associates with that route) and summing only those files gives
        70,608 bytes on `main` vs. 223,950 bytes on
        `feat/motion-system` — a delta of **153,342 bytes**, closely
        matching the app-wide figure. This is still an approximation
        (some referenced chunks are shared Next.js runtime code, not
        exclusive to this route) rather than a guaranteed clean
        isolation, but it corroborates that the growth is concentrated
        in this route's own code, not spread elsewhere. Not a route-
        specific number to treat as exact.
      - This is a modest, expected cost for a motion library used
        across most of the homepage's animated elements — not treated
        as a performance problem requiring architecture changes.
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
- [x] **G — Connect public site to Payload**. Branch
      `feat/cms-homepage-integration`, merged (PR #4).

      **Terminology note**: the `/[locale]` route itself is still
      dynamically rendered (no `generateStaticParams`, no full-page
      ISR). What this milestone actually built is 60-second revalidated
      *Payload data* caching via `unstable_cache` at the query layer —
      not classic static ISR. The two are easy to conflate; precise
      wording matters when discussing this architecture going forward.

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
- [ ] **H — Course detail pages**. Branch `feat/course-pages`.

      **Audit** (before writing any code): the `Courses` collection
      (Milestone F) already models nearly everything a detail page
      needs — `title`, `shortDescription`, `description`, `heroImage`,
      `gallery`, `audience`, `ctaLabel`, `curriculum[]`, `outcomes[]`,
      `pricingType`/`price`/`priceRangeMin`/`priceRangeMax`/`currency`,
      `duration`, `scheduleInfo`, `enrollmentState`,
      `metaTitle`/`metaDescription`, non-localized `slug`. **No schema
      changes made** — everything genuinely needed already exists;
      adding fields "because a detail page needs content" would be
      over-modeling. The 3 real courses (`cosmetics-1`, `cosmetics-2`,
      `branding-ai-beauty`) currently have only `title`/
      `shortDescription` seeded (from `src/seed/content.json`) plus
      `pricingType: 'onRequest'`/`enrollmentState: 'open'` defaults —
      every other field (description, curriculum, outcomes, audience,
      duration, schedule, media, SEO) is empty. The detail page design
      must render correctly with almost everything absent, today.

      **Content mapping**:
      - `title` → H1. `shortDescription` → hero lead.
      - `description` → an "Overview" block, only when non-empty.
      - `heroImage` → hero `ImageFrame` (its existing placeholder
        handles absence — unchanged).
      - `gallery` → an image grid, only when the array is non-empty.
      - `audience` → a "Who this is for" block, only when non-empty.
      - `curriculum[]` → a "Curriculum" list, only when non-empty.
      - `outcomes[]` → a "What you'll learn" list, only when non-empty.
      - `pricingType` + price fields → a Pricing block: `onRequest`
        (the default for all 3 today) shows a neutral CTA-oriented
        message, never a placeholder number; `exact`/`startingFrom`/
        `range` format the real value when present; `hidden` omits the
        block entirely.
      - `duration`/`scheduleInfo` → a "Practical information" block,
        each line only when its field is non-empty; the whole block
        omitted if both are empty.
      - `enrollmentState` → a small status indicator next to the CTA
        (open/closed/comingSoon/full — new dictionary strings, since
        this is fixed interface vocabulary, not per-course editorial
        content).
      - `ctaLabel` → overrides the site-wide "Book a Consultation"
        label when set, exactly like the homepage `CourseCard` already
        does.
      - `metaTitle`/`metaDescription` → `generateMetadata`, falling
        back to `SiteSettings.defaultSeo` and finally to a computed
        `title`/`shortDescription`-based default — never invented.
      - `certificationType` (new field, see **Correction** below) →
        the Certification row, only when explicitly set to
        `professionalDiploma`.

      **Correction**: an earlier version of this milestone treated
      certification wording as fixed policy language that applies
      identically to all 3 courses, and had `CoursePracticalInfo`
      always render it. That conflated two different things — the
      *safe wording to use if a course awards a diploma* (approved)
      and *whether a given course actually does* (never established
      for any of the 3 real courses). Corrected: `Courses.ts` gained a
      non-localized `certificationType` select
      (`none`/`professionalDiploma`, default `none`) — a fact about
      the course, decided per-course in Payload, not inferred from the
      existence of approved wording for it. The *localized wording*
      for `professionalDiploma` still lives in the i18n dictionaries
      (like `nav.apply`) — identical for every course that has one, so
      it isn't duplicated as a translated field per course — but
      *whether it applies at all* is CMS data, not an assumption. All
      3 real courses are `none` today (the schema default); the
      Certification row is correctly absent from every current course
      page until academy staff explicitly confirm one. Verified live:
      all 3 real courses show no certification claim; a temporary
      `professionalDiploma` set on `cosmetics-1` (restored exactly
      afterward) rendered the correct approved wording in all 3
      locales; a disposable draft course with `professionalDiploma`
      set still produced a 404 with no leak.

      **FAQs**: a new locale+course-scoped query
      (`getPublishedFAQsForCourse`) fetches only FAQs whose
      `relatedCourse` matches this course, published-only. If none
      exist for a course, the section is omitted entirely — the
      homepage's general FAQs (no `relatedCourse`) are deliberately
      *not* re-rendered on course pages, to avoid duplicating content
      the visitor may have already seen.

      **Breadcrumbs**: Home → Courses → [title]. "Courses" links to
      `/${locale}#courses` (the homepage's existing courses section) —
      no new `/courses` listing route. A listing route wasn't built:
      with only 3 courses, all 3 already appear together on the
      homepage's Courses section, which *is* the listing; a second,
      separate listing page would duplicate that without adding
      information architecture value at this content volume.

      **Routing**: `src/app/(frontend)/[locale]/courses/[slug]/
      page.tsx`, nested under the existing `[locale]` layout (Nav/
      Footer/skip-link inherited for free). No `generateStaticParams` —
      same reasoning as the homepage (Milestone G): CMS-driven content,
      staff expect a publish to go live without a redeploy. Same
      60-second `unstable_cache` data-caching model, not full-page ISR.

      **Cache-key correctness, verified against source (not assumed)**:
      confirmed in `node_modules/next/dist/server/web/spec-extension/
      unstable-cache.js` — `unstable_cache` builds its cache key as
      `` `${fixedKey}-${JSON.stringify(args)}` ``, i.e. the *runtime
      arguments* passed to the wrapped function at call time are
      automatically part of the cache key, not just the static
      `keyParts` array. Calling `getPublishedCourseBySlug('en',
      'cosmetics-1')` and `getPublishedCourseBySlug('ar',
      'cosmetics-2')` therefore land in genuinely different cache
      entries with no extra work — re-verified live (see PR) rather
      than trusting the source read alone.

      **404 / draft privacy**: an unknown slug or a slug whose course
      is not `published` calls `notFound()` — same pattern already
      used for an invalid `locale` segment. The query never passes
      `draft: true` and always `overrideAccess: false`, so this is the
      same published-only boundary hardened in Milestone F, not a new
      access path.

      **JSON-LD**: `Course` schema.org data is emitted only from facts
      that are actually known and true today — `name`, `description`,
      `provider` (`{ "@type": "Organization", "name": "SHE Beauty
      Academy" }`), `inLanguage`, and `image` when a `heroImage` is
      set. No `offers`/pricing, `hasCourseInstance`/duration or dates,
      or `aggregateRating` — none of that is confirmed for any course
      yet, and schema.org permits omitting unsupported properties
      rather than inventing them.

      **No production domain exists yet** (verified: no
      `NEXT_PUBLIC_SITE_URL`/`metadataBase` or equivalent anywhere in
      the codebase) — canonical/hreflang alternates use relative paths
      rather than a fabricated absolute domain; revisit once a real
      domain is set (Milestone M).
- [ ] **I — Lead/application flow** (Zod validation, spam protection,
      privacy/marketing consent kept separate). Branch
      `feat/lead-engine`. This milestone is the secure intake only:
      visitor → validated submission → stored lead, visible to staff
      in Payload. No WhatsApp/email sending, no AI, no scheduling —
      those are later milestones. No payment — that's never coming to
      this website at all; see the no-web-payment decision below.

      **Audit**: `Applications` (Milestone F) already anticipated this
      exact architecture — its own comment says the public form "will
      call the Local API from a server Route Handler (with Zod
      validation and spam protection) using `overrideAccess: true`,
      rather than writing through this collection's own access
      control." `access.create` is staff-only
      (`Boolean(req.user)`) — confirmed this already blocks anonymous
      `POST /api/applications` (Payload's own generated REST route),
      so the *only* intended public write path is the new controlled
      endpoint, not a loosened collection permission. The lead
      lifecycle (`status`, `new` default, side outcomes) already
      matches what's needed — not touched. `preferredLanguage`
      already defaults from the 3 real locales.  `interestedCourse`
      (relationship, optional — "general" is a valid unset state),
      `email` (optional), `message` (optional), `privacyConsentAt`
      (required date), `privacyPolicyVersion`, `marketingConsent`/
      `marketingConsentAt` (separate, conditional) all already exist
      and already match the required shape. **One deliberate schema
      change**: `source` was a freeform `text` field — changed to a
      `select` (`homepage` | `course_page`) so an attacker can't
      submit an arbitrary string into it; the server derives which
      value applies (never trusts a client-submitted source), so this
      also isn't part of the public input schema at all.

      **Route Handler, not a Server Action** — chosen after reading
      this Next version's own security docs
      (`node_modules/next/dist/docs/01-app/02-guides/data-security.md`).
      Server Actions get a genuinely useful *built-in* protection
      (Origin-vs-Host header comparison, aborting the request on
      mismatch) that a Route Handler doesn't get for free — a real
      point in their favor. But Server Actions are invoked via an
      internal, encrypted-action-ID wire protocol, not a plain JSON
      POST — much harder to drive with the kind of direct,
      reproducible malicious-input testing this milestone explicitly
      requires (malformed JSON, wrong content-type, oversized bodies,
      forged fields sent as raw HTTP). A Route Handler
      (`POST /api/apply`) gives a conventional, curl-testable REST
      endpoint; the Origin-vs-Host check Server Actions get for free
      is reimplemented explicitly here instead (see **CSRF/Origin**
      below) — not a gap, a deliberate trade for testability.

      **Route precedence, verified**: `/api/apply` (this new literal
      route) and Payload's generated catch-all
      (`src/app/(payload)/api/[...slug]/route.ts`) both resolve under
      `/api/*`. Next.js resolves a static segment before a dynamic
      catch-all at the same path, so `/api/apply` reaches this route,
      not Payload's — confirmed live once the route existed (see
      commit), not assumed from routing rules alone.

      **Zod input schema** (`src/lib/applications/schema.ts`) — only
      what a visitor actually supplies:
      `name` (trimmed, 2–100 chars), `phone` (trimmed, 6–30 chars,
      light whitespace/separator normalization — no aggressive
      international phone-parsing library, so a legitimate Israeli/
      Palestinian/international number is never rejected for not
      matching an assumed format), `email` (optional, trimmed,
      lower-cased, real email shape), `message` (optional, ≤2000
      chars), `courseSlug` (optional string — validated server-side
      against real *published* courses via the existing course query
      layer, never trusted as an ID), `locale` (one of the 3 real
      locales), `marketingConsent` (optional boolean, default false),
      `privacyConsentGiven` (must literally be `true` — the required
      checkbox), `honeypot` (must be empty). No `status`, no
      `privacyConsentAt`, no `privacyPolicyVersion`, no `source` in
      the input shape at all — those are server-set, never accepted
      from the client even if present in the request body.

      **Server-trusted fields**: `status: 'new'` always;
      `privacyConsentAt: new Date()` (server clock, never the
      browser's); `privacyPolicyVersion` from one central constant
      (`src/lib/legal.ts`); `source` derived from whether a validated
      course was resolved (`course_page` / `homepage`), never read
      from the request; `marketingConsentAt` set only when
      `marketingConsent === true`, left unset otherwise.

      **No real privacy policy exists yet** — verified (no policy
      page/content anywhere in the repo). Per explicit instruction,
      no legal document is fabricated. `PRIVACY_POLICY_VERSION` in
      `src/lib/legal.ts` is set to an explicit, honestly-named
      placeholder (`'unpublished-v0'`), documented as blocking a
      genuinely launch-ready public submission until real legal
      content and a real policy version exist. The consent checkbox
      itself doesn't link to or reference a nonexistent formal
      document — its label is a minimal, true statement ("I agree
      that SHE Beauty Academy may contact me about this inquiry"),
      not a claim about a policy that doesn't exist.

      **Spam/abuse (MVP, documented limits)**:
      - Honeypot field, hidden from sighted/keyboard users
        (`aria-hidden`, off-screen, `tabIndex={-1}`, `autoComplete`
        set to something a form-filling bot tends to populate) — a
        filled honeypot returns the *same* success response without
        creating a record, so an automated submitter gets no signal
        its submission was detected.
      - Rate limiting: a small `RateLimiter` interface
        (`src/lib/rateLimit.ts`) with an in-memory implementation for
        this deployment stage — **explicitly not durable across
        multiple server instances**; each process gets its own
        independent counter, so it's trivially bypassed the moment
        this app runs on more than one instance (most serverless
        deployments). No Redis/Upstash was wired in — there's no
        provisioned account/credentials for one yet, and hardcoding a
        fake provider would be worse than an honestly-documented
        single-instance limitation. A durable store is required before
        a real multi-instance deployment (Milestone M territory).
      - Duplicate protection: before creating a record, checks for an
        existing Application with the same normalized phone *and* the
        same resolved course (or both general) created within the
        last 10 minutes; if found, still returns success (a genuine
        returning visitor shouldn't see an error) but skips the
        duplicate write. Not a CRM-grade dedup system — a person is
        never permanently blocked from submitting again.
      - Request-size guard: rejects bodies over a small fixed ceiling
        (this form's real payload is well under 1KB) and non-JSON
        content types before attempting to parse anything.

      **CSRF/Origin**: this is a public write endpoint, so the Route
      Handler manually compares the request's `Origin` header against
      its own `Host` (falling back to `X-Forwarded-Host`) and rejects
      a mismatch — the same check Next.js's Server Actions perform
      automatically, reimplemented here since a Route Handler doesn't
      get it for free. No separate CSRF-token machinery was added on
      top of that — origin/host comparison plus same-site cookies
      (the browser default) is the documented, standard mitigation for
      this shape of endpoint, and anything more would be complexity
      without a matching threat this architecture actually has (no
      session cookies, no state-changing GETs).

      **Cache invalidation**: submitting a lead never touches
      `unstable_cache`/`revalidateTag` for homepage/course/navigation
      data — it's a plain Payload Local API write
      (`overrideAccess: true`) on a collection none of the cached
      *read* functions in `src/lib/payload/queries.ts` ever touch, so
      there's no invalidation risk to guard against by construction,
      not by a rule that has to be remembered.

      **Course preselection**: the reusable form shows a course select
      (the 3 real courses + "General / not sure yet"), preselected to
      the current course on a course page and to "General" on the
      homepage — editable either way, since a visitor might have
      landed on one course's page but actually want another. The
      *submitted* value is always re-validated server-side against
      real published courses regardless of what the client sends.

      **CTA integration**: `ApplyCTA`'s own former primary button (a
      self-referencing `#apply` placeholder, since no real flow
      existed) is replaced by the actual form — the section's intro
      copy stays, the WhatsApp button stays as an independent, always-
      available alternative contact method. Hero/Nav/CourseCard CTAs
      still say "Book a Consultation" and still scroll to `#apply`;
      arriving there now shows a real form instead of another button.
      **Navigation's own CTA had the same bug already found and fixed
      in `ApplyCTA` during Milestone H** — it hardcoded
      `/${locale}#apply`, which only worked by coincidence on the
      homepage; from a course page it would navigate away instead of
      scrolling to that page's own form. Fixed to a plain `#apply`
      anchor, same precedent.

      **Verified live** (every claim above proven, not assumed — real
      HTTP requests against a production build, disposable QA data
      deleted afterward, real course/testimonial counts reconfirmed
      untouched):
      - Route precedence: `POST /api/apply` reaches this handler, not
        Payload's catch-all (confirmed by its distinct `{"ok":true}`
        response shape vs. Payload's own error shape).
      - 3 valid submissions (`en`/`ar`/`he`, one per locale, one with
        a resolved course, one general, one with marketing consent) —
        every stored field correct: `status: 'new'`, derived `source`,
        resolved `interestedCourse`, real server `privacyConsentAt`,
        `privacyPolicyVersion: 'unpublished-v0'`, `marketingConsentAt`
        set only when consent was true.
      - Forged operational fields in the request body
        (`status: 'enrolled'`, a 2020 `privacyConsentAt`, a fake
        `source`, `internalNotes`, `assignedTo`) — all silently
        ignored; the stored record has the server's own values in
        every case, not the attacker's.
      - **Correction**: an earlier version of this milestone let a
        non-empty but unresolvable `courseSlug` silently downgrade to
        a general inquiry (submission succeeds, `interestedCourse`
        left unset) — that conflated "no course was requested" with
        "a course was requested but isn't available," which a stale
        page, changed CMS content, or a forged request could trigger
        for real. Fixed: `courseSlug` omitted/empty is still a valid
        general inquiry, but a non-empty `courseSlug` that doesn't
        resolve to a real published course now rejects the whole
        submission (`400`, a `courseSlug` field error, no record
        created) rather than silently proceeding as general. `source`
        is only ever `homepage`/`course_page` after this resolution
        succeeds — an invalid slug can no longer quietly relabel
        itself as a `homepage` submission. The response is
        deliberately identical whether the slug never existed or
        matches a real-but-unpublished course (both queries return
        zero docs from the same published-only boundary), so the API
        never reveals which case it was. Verified live: general
        inquiry (`courseSlug` omitted) → `200`, 1 record,
        `interestedCourse` unset; a real published slug → `200`,
        correctly resolved; a completely fake slug → `400`, **zero**
        records created; a disposable draft/unpublished course's own
        slug → `400`, **zero** records created, response
        byte-for-byte identical to the fake-slug case — then deleted.
      - Honeypot filled — same `{"ok":true}` response as a real
        submission, but confirmed via document count that **no
        record was created**.
      - Missing name/phone, invalid email, missing privacy consent —
        each a distinct `400` with a field-scoped error, nothing else
        accepted.
      - Malformed JSON body — `400`. Wrong/missing `Content-Type`
        (`application/x-www-form-urlencoded`, `text/plain`, absent)
        — `415`. Oversized body (>10KB) — `413`. An in-range body
        with one field over its own max (2000-char message) — `400`
        field validation, proving the two size checks are independent
        layers, not one substituting for the other.
      - Origin header matching the request's own host — succeeds.
        Origin set to an unrelated domain — `403`, before the body is
        even parsed.
      - Direct `POST /api/applications` (Payload's own generated REST
        route, bypassing `/api/apply` entirely) — `403`, same as
        anonymous `GET`. Confirms the collection's own access control
        is still the real backstop, not just this route's checks.
      - Rate limit: 5 rapid submissions succeed, the 6th gets a real
        `429` — proven with the actual configured value (5/10min),
        not a raised test value. (The malicious-input battery above
        needed more than 5 requests, so the limiter was temporarily
        raised for that stretch and reverted — see the git history —
        rather than fighting the real limit mid-test.)
      - Duplicate protection: the same phone + same course submitted
        3 times rapidly — all 3 report success, but only 1 record
        exists. The same phone with a *different* course submitted
        immediately after — a genuine 2nd record is created,
        confirming the dedup key is phone+course, not phone alone.
      - Form UI (real browser, not just the API): empty submit shows
        the localized field error, sets `aria-invalid`, and moves
        focus to the first invalid field; a valid submit replaces the
        form with the localized success message and moves focus into
        it. Course select is preselected correctly on a course page
        and defaults to "general" on the homepage, in all 3 locales,
        at 1440px and 390px, both with normal and forced reduced
        motion — 12 + 12 combinations, zero console errors, zero
        overflow.
- [ ] **J — Admin-friendly lead management + RBAC** in Payload. Branch
      `feat/admin-lead-management`. What happens *after* a lead reaches
      Payload — staff review, contact, status, notes, eventual
      outcome — not a new intake path (Milestone I already built that).
      No payment functionality; the confirmed business flow stays
      website → lead → WhatsApp/staff conversation → manual off-site
      enrollment (see the no-web-payment decision above).

      **Audit**: `Users` is `auth: true` with zero custom fields —
      every collection/global's access control today is the same
      pattern, `Boolean(req.user)` for create/update/delete: *any*
      authenticated user has full access to everything. There is no
      role differentiation anywhere yet — this milestone builds it
      from scratch, not extends an existing one. Confirmed exactly one
      real user exists (id 1, created before this milestone) — the
      account this migration must preserve.

      **RBAC model**: `Users` gains a required `role` select
      (`admin`/`editor`/`advisor`), **default `advisor`** (least
      privilege — never `admin`, so a newly created staff account
      never accidentally gets full access). Central, typed helpers in
      `src/collections/access/roles.ts` (`isAdmin`,
      `isAdminOrEditor`, `isAdminOrAdvisor`, `isAuthenticated`, plus
      field-level variants) — every collection/global's access
      control calls these, not an inline `user.role === 'admin'`
      scattered per file.

      | | admin | editor | advisor |
      |---|---|---|---|
      | Applications read/update | ✓ | ✗ | ✓ |
      | Applications create | ✓ | ✗ | ✓ (manually logging a lead) |
      | Applications delete | ✓ | ✗ | ✗ |
      | Courses/FAQs/Testimonials/Media/Homepage/Navigation/SiteSettings edit | ✓ | ✓ | ✗ (read-only) |
      | Media delete | ✓ | ✗ | ✗ (more consequential — could break a live page still referencing it) |
      | Users create/delete/change-role | ✓ | ✗ | ✗ |
      | Users read, update own profile | ✓ | ✓ | ✓ |

      **Role-escalation prevention**: the `role` field itself has
      `field.access.update: isAdmin` — a non-admin updating their own
      user document (self-service profile edits are otherwise
      allowed) cannot change that one field even via a direct API
      call with a forged `role` in the body, not just a hidden UI
      control. Only `isAdmin` can `create` a `Users` document at all,
      so a non-admin can't create a fresh admin account either.

      **Existing admin preserved, explicitly, not by default**: the
      schema push gives the existing user the field's `advisor`
      default like any other row — a deliberate one-time migration
      script (matching this project's established no-formal-migration
      convention) then explicitly sets that specific account to
      `admin` immediately after, verified by a real login test
      afterward. Never relies on the default coinciding with the
      right outcome.

      **Field-integrity**: fields that are audit truth from the
      original public submission — `source`, `privacyConsentAt`,
      `privacyPolicyVersion`, `marketingConsentAt`, `preferredLanguage`
      — get both `admin.readOnly: true` (so the UI doesn't casually
      invite editing them, for every role including admin) *and*
      `field.access.update: isAdmin` (so `readOnly` isn't the only
      thing stopping a non-admin from changing them via a direct API
      call — UI `readOnly` is presentation, not security). Genuine
      workflow fields (`status`, `assignedTo`, `consultationAt`,
      `internalNotes`, and the lead's own contact/interest details,
      which staff may legitimately need to correct) stay fully
      editable at the collection's normal `isAdminOrAdvisor` level.

      **Applications admin layout**: `status`/`assignedTo`/
      `consultationAt`/`source` (read-only) stay in the sidebar
      (already there, and always visible regardless of which tab is
      open — better for the fields staff checks most). `internalNotes`
      moves to a prominent, always-visible position above the tabs
      (used daily, shouldn't be one click away). The rest is grouped
      into unnamed tabs — Contact (name/phone/email/preferredLanguage),
      Interest (interestedCourse/message), Consent & Audit
      (privacyConsentAt/privacyPolicyVersion/marketingConsent/
      marketingConsentAt), Campaign tracking (the existing UTM fields,
      now a tab instead of a collapsible). `defaultColumns`:
      `createdAt`, `name`, `phone`, `interestedCourse`,
      `preferredLanguage`, `source`, `status`, `assignedTo` — no
      consent timestamps or technical IDs cluttering the list.
      `assignedTo`'s relationship field gets `filterOptions: { role:
      { in: ['admin', 'advisor'] } }` so the picker doesn't offer
      assigning a lead to an editor — a UX guardrail, not the real
      security boundary (that's still the collection's own access
      control on `Applications`, unaffected by who's a valid
      `assignedTo` value).

      **Manual WhatsApp convenience — deferred**: a clickable "Open
      WhatsApp" affordance next to a lead's phone number would need a
      custom Payload admin `Cell` component (a real `'use client'`
      component registered through the generated `importMap.js`, not
      a plain field option) to render as a link rather than a text
      input. Disproportionate scope for what this milestone is
      actually about, and a broken custom component risks breaking
      the entire Applications list view — a worse outcome than not
      having the convenience. Deferred, not attempted; `wa.me/<phone>`
      remains constructible by staff manually in the meantime. No
      WhatsApp API, no automation, regardless.
- [ ] **K — SEO**: per-locale metadata, hreflang, sitemap, robots,
      structured data.
- [ ] **L — Accessibility / responsive / performance pass**.
- [ ] **M — Production build + deployment readiness**.
- [ ] **N — Architecture prep for WhatsApp Cloud API + AI enrollment
      agent** (no implementation required now, just clean seams). The
      conversion path this prepares for is lead → WhatsApp handoff/
      follow-up → staff/AI conversation → consultation/visit → admin
      manually confirms enrollment — payment stays off-platform the
      whole way through (see the no-web-payment decision above); this
      milestone is about conversation handoff, not a checkout flow.

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
