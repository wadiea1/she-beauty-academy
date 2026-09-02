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
- [x] **J — Admin-friendly lead management + RBAC** in Payload. Branch
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
      | Applications create | ✓ | ✗ | ✗ |
      | Applications delete | ✓ | ✗ | ✗ |
      | Courses/FAQs/Testimonials/Media/Homepage/Navigation/SiteSettings edit | ✓ | ✓ | ✗ (read-only) |
      | Media delete | ✓ | ✗ | ✗ (more consequential — could break a live page still referencing it) |
      | Users create/delete/change-role | ✓ | ✗ | ✗ |
      | Users read, update own profile | ✓ | ✓ | ✓ |

      **Applications `create` is admin-only, not admin/advisor**
      (corrected during PR review — an earlier draft of this milestone
      gave advisor `create` too). The one legitimate write path into
      this collection is the public `/api/apply` route: it validates
      the submission server-side and writes via the Local API with
      `overrideAccess: true`, which never touches this collection's
      own access control at all — so advisor doesn't need `create`
      for the real intake flow to keep working. Advisor `create` would
      also have been able to set the audit-truth fields below (source,
      privacyConsentAt, …) to arbitrary values at creation time even
      though those same fields are locked against advisor on update —
      field-level `access.update` has no say over a document's initial
      values, so `create` access is what actually has to be
      restrictive for those fields to mean anything. Verified: advisor
      `POST /api/applications` now returns 403; admin `POST
      /api/applications` still succeeds (used for manually logging a
      lead who called in, say); `/api/apply` still returns 200 and
      creates a correctly-populated record.

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

      **Manual WhatsApp convenience — attempted, then reverted and
      deferred** (corrected during PR review). A first pass built a
      `'use client'` custom field component that stripped `phone` down
      to digits and linked to `wa.me/<digits>`. That's unsafe: `phone`
      is freeform text with no confirmed country-code convention (the
      lead form intentionally doesn't rewrite what a visitor enters),
      so a lead saved in local format (e.g. "050…") produces a wrong
      or nonexistent wa.me destination — the earlier browser test only
      proved the link was present in the DOM, not that it pointed
      anywhere real. Removed entirely rather than shipped half-safe:
      `src/components/admin/WhatsAppLink.tsx` deleted, its
      registration on the `phone` field removed, `@payloadcms/ui`
      dropped again as a direct dependency (nothing else in the
      codebase used it), and the admin import map regenerated back to
      its pre-Milestone-J state. A deliberate phone-number
      normalization/country-code strategy is deferred to the later
      WhatsApp architecture milestone (N) — no `libphonenumber`, no
      hardcoded `+972` assumption, no Meta Cloud API/Twilio, just to
      preserve a small convenience button. Business flow is
      unaffected either way: staff see the lead's phone number in
      Admin and open WhatsApp themselves.

      **Verification — real Local/REST APIs, disposable QA accounts**
      (never the real admin; all QA users/leads/test course deleted
      afterward, confirmed by a final DB read showing only the one
      real admin account and zero applications): 53 REST-API checks
      covering the full admin/editor/advisor matrix on Applications,
      Users, Courses, and the Homepage global — anonymous access
      denied everywhere it must be; editor has zero Applications
      access (403 on read/create); advisor can read/update
      Applications but not create or delete (403 on both); the five
      protected fields (`source`, `privacyConsentAt`,
      `privacyPolicyVersion`, `marketingConsentAt`,
      `preferredLanguage`) provably survive a same-request tamper
      attempt from an advisor while `status` in the same request does
      change — proving the protection is per-field, not a
      whole-request rejection; a non-admin's attempt to set their own
      `role` to `admin` returns 200 (self-update is otherwise allowed)
      but the role demonstrably does not change; only an admin can
      create Users or change another account's role; Courses read is
      open to any staff role but write is admin/editor only, delete
      admin-only for Media. All passed. Confirmed along the way (not
      assumed): global updates in this Payload version go through
      `POST /api/globals/:slug`, not `PATCH` — a `PATCH` returns
      Payload's own 404, unrelated to access control; verified from
      `node_modules/payload/dist/globals/endpoints/index.js`.

      **Correction re-verification (Applications `create` fix)**: a
      second, focused round of 29 REST-API checks against fresh
      disposable QA accounts confirmed — anonymous, editor, *and now
      advisor* `POST /api/applications` all return 403; admin `POST
      /api/applications` still succeeds; `POST /api/apply` (the real
      public path) still returns 200 and creates a record with
      server-controlled `status`/`source`/`preferredLanguage`/
      `privacyConsentAt`/`privacyPolicyVersion` all correct; an
      invalid `courseSlug` still 400s with a field error; advisor can
      still read Applications and update `status`/`internalNotes`/
      `consultationAt`/`assignedTo` (assigning to a valid admin/
      advisor account) while the same protected fields still silently
      resist a same-request tamper attempt; advisor delete is still
      403; role escalation is still blocked; the public site still
      loads in all 3 locales. All 29 passed; every QA fixture
      (accounts and applications created during the run) was deleted
      immediately afterward.

      Also verified in the real Payload Admin browser UI (headless
      Edge via CDP, same methodology as prior milestones) as QA
      editor and QA advisor accounts: the editor's sidebar has no
      Applications/Leads entry at all, and visiting its URL directly
      renders Payload's own 404 with no lead data in the DOM; the
      advisor's sidebar does show Applications, the list/detail views
      render correctly, a status-filtered list view surfaces the
      right lead, the `assignedTo` field is present, and — genuinely
      confirmed in the rendered DOM, not just via the REST API — the
      protected `source` field renders as a disabled
      `react-select--is-disabled` control for a non-admin.

      Full public-site regression re-run after all of the above:
      all 3 locales load, all 3 course detail pages load, an invalid
      `courseSlug` on `/api/apply` still returns 400 with a
      `fieldErrors.courseSlug`, and an anonymous `POST
      /api/applications` (bypassing `/api/apply` entirely) still
      returns 403 — the public lead-intake and draft-privacy
      boundaries from Milestones H/I are unaffected by this
      milestone's access-control changes. No web-payment
      functionality was touched or added.
- [x] **K — Production SEO + discoverability**. Branch `feat/seo`.
      Technical SEO layer for the existing site — no new marketing
      content or invented business claims.

      **Audit**: no `robots.ts`/`sitemap.ts` exist yet, but
      `src/proxy.ts`'s matcher already excludes `robots.txt` and
      `sitemap.xml` from the locale-redirect proxy — the file-based
      routes this milestone adds were anticipated. `NEXT_PUBLIC_SERVER_URL`
      already exists in `.env`/`.env.example` (`http://localhost:3000`
      locally) but is unused anywhere in `src/` — this milestone is
      what wires it in. The course detail page already has a working
      `generateMetadata` (title, description, `alternates.canonical`
      + `languages`, deliberately relative paths with a comment
      explaining no production domain is configured) and a Course
      JSON-LD block (name/description/provider/inLanguage, image only
      if `heroImage.src` is truthy) — both correct in shape, extended
      rather than replaced. The homepage (`[locale]/page.tsx`) has no
      `generateMetadata` of its own; it inherits the root
      `[locale]/layout.tsx`'s `title.default`/`template`/`description`
      entirely. `SiteSettingsContent` (query layer) deliberately omits
      `ogImage` today with a comment ("none is set today, and none
      should be invented") even though the schema field exists.
      Confirmed via a live query: zero `Media` documents exist at all
      in the database right now — every course's `heroImage` is
      `null` — so any OG-image code path is exercised as "correctly
      omits image" today, not tested with a real image; it will start
      resolving automatically once real photography is uploaded, no
      code change needed then. `favicon.ico` is still Next's default
      starter icon, not real brand iconography — left alone;
      fabricating a "SHE" logo isn't this milestone's job. No
      `/courses` listing route exists — `CourseBreadcrumb`'s middle
      "Courses" crumb deliberately links to the homepage's `#courses`
      section, not a separate page (see that component's own
      comment).

      **Base URL — never a guessed production domain**:
      `src/lib/seo/baseUrl.ts` reads `NEXT_PUBLIC_SERVER_URL` and
      falls back to `http://localhost:3000` only when unset (logged
      once via `console.warn`, never silently). No
      `shebeautyacademy.com`/`example.com` guess anywhere in the
      codebase. `metadataBase` is set once, in the root
      `[locale]/layout.tsx`'s `generateMetadata`, from this same
      helper — every relative URL-based metadata field in every
      route below it (course pages included) resolves against it
      automatically. Milestone M's one required action for this
      layer: set `NEXT_PUBLIC_SERVER_URL` to the real production
      domain in that environment. Until then, a local/dev deployment
      truthfully advertises its own local URL — which is correct for
      that environment, not a bug to hide.

      **Indexing — environment-gated, safe by default**: a second env
      var, `ALLOW_SEARCH_INDEXING` (server-only, no `NEXT_PUBLIC_`
      prefix needed — only read inside `robots.ts`/`sitemap.ts`,
      never in browser code), defaults to "not allowed" whenever
      unset or not exactly `"true"`. `NODE_ENV=production` alone
      can't distinguish a real production deploy from a staging/
      preview one (most providers run production builds for
      previews too), so indexing is gated on this explicit,
      deliberate opt-in instead — nothing this milestone can detect
      on its own decides that; it's Milestone M's second required
      action, set only on the real production environment. Local
      `.env`/`.env.example` leave it unset (disallowed) — correct for
      every environment before a real deploy exists.

      **Source-of-truth hierarchy** (documented once, not re-decided
      per page): title — CMS override (`Course.metaTitle` /
      `SiteSettings.defaultSeo.metaTitle`) → page-appropriate default
      (course title / the existing brand title) → never a bare
      brand-suffix duplicate (the Milestone H title-template bug is
      the reason `title.absolute` is used wherever a CMS override is
      set, so it can't recur here). Description — CMS override
      (`Course.metaDescription` / `SiteSettings.defaultSeo.metaDescription`)
      → `Course.shortDescription` / `dict.common.tagline`. Canonical —
      always the current locale's own URL, never another locale's.
      OG/Twitter image — `Course.heroImage` (that specific course's
      real photo) → `SiteSettings.defaultSeo.ogImage` → omitted.
      `SiteSettingsContent.defaultSeo` now exposes `ogImage` (still
      typed nullable, still never fabricated — just no longer
      hidden from the one caller that has a legitimate use for it).

      **hreflang / alternates**: every indexable page declares
      `alternates.languages` for all 3 locales plus `x-default`
      pointing at the same URL as the `ar` entry — a truthful
      statement of this site's actual routing (`/` redirects to
      `/ar`), not an invented landing page. Each locale canonicalizes
      to itself, never to Arabic — Milestone H's existing course-page
      implementation already did this correctly; the homepage now
      matches it.

      **Structured data** — `src/lib/seo/structuredData.ts` centralizes
      the safe JSON-LD `<script>` serialization (the `<` → `<`
      escaping already used for Course, now shared) plus typed
      builders. Implemented, using only currently-true facts:
      `EducationalOrganization` + `WebSite` (via one `@graph`, emitted
      site-wide from the layout) — `name`/`url`/`inLanguage` always;
      `sameAs` only with a real Instagram URL built from
      `SiteSettings.instagramHandle` (omitted otherwise); `telephone`/
      `email`/`address` only if those `SiteSettings` fields are set
      (none are, today — so these properties are absent from the
      live output right now, not fabricated placeholders); no `logo`
      (no real brand asset exists yet, and pointing schema.org at
      Next's default favicon would misrepresent it as SHE's actual
      logo). `Course` (existing, extended with an absolute `url` and
      the same conditional `image`). `BreadcrumbList` on course pages
      — 2 levels only (Home → course), deliberately omitting a
      "Courses" middle item since it doesn't correspond to a real,
      distinct page (`CourseBreadcrumb`'s own link goes to
      `/{locale}#courses`, the homepage itself) — pretending a
      `/courses` page exists would misrepresent the site's real
      structure. No `Offer`/`AggregateRating`/`Review`/
      `CourseInstance`/duration/certification claim anywhere — none
      of that is truthfully known, and all 3 real courses currently
      have `certificationType: 'none'`.

      **Sitemap** (`src/app/sitemap.ts`) — reuses the existing cached
      query layer (`getPublishedCourses`, `getHomepage`, both already
      `overrideAccess: false` / `fallbackLocale: false`), not a new
      parallel data path. `status` isn't a localized field on
      `Courses`, so one locale's query already reflects the true
      published set for all locales — no need to query 3×. Generates
      3 homepage URLs + (published courses × 3 locales) — currently
      3×3=9 — entirely from that real data, never a hardcoded count;
      it scales automatically if a 4th course is published. Each
      entry gets the same `alternates.languages` (+`x-default`) as
      the HTML `<head>` output, and a real `lastModified` sourced from
      that document's own `updatedAt` (extended `CourseContent` /
      `HomepageContent` to expose it — additive, not a breaking
      change to either type). No `changeFrequency`/`priority` — no
      real basis to assign either. `export const dynamic =
      'force-dynamic'` on both `sitemap.ts` and `robots.ts` — corrected
      from an initial `revalidate = 60`, which broke CI. Next's own
      docs are explicit that these two are cached *Route Handlers* by
      default, materially different from the page-rendering case
      documented above; `revalidate` is the *documented* way to opt a
      cached Route Handler out of indefinite caching, but verified live
      that it wasn't sufficient here — Next still attempted to
      **prerender `/sitemap.xml` during `next build`**, which calls
      `getPublishedCourses`/`getHomepage` and needs a live Postgres
      connection; this app's CI build deliberately has none (the same
      "no live database access at build time" invariant every page in
      this app already relies on — see `[locale]/layout.tsx`'s own
      comment on why `generateStaticParams` is never used here), so
      the build failed with `ECONNREFUSED`. `force-dynamic` defers the
      route to request time entirely, so the database call only ever
      happens on a real request — freshness stays bounded by the
      existing 60s `unstable_cache` TTL inside the query layer, exactly
      as every page already relies on; the route itself needs no
      caching on top of that.

      **Robots** (`src/app/robots.ts`) — indexing gated on
      `ALLOW_SEARCH_INDEXING` as above: disallowed everywhere by
      default (`disallow: '/'`), and only when explicitly allowed
      does it emit `allow: '/'` with `disallow: ['/admin', '/api']`
      plus a `sitemap` pointer. Documented plainly, including in the
      file's own comment: this is a crawler-cooperation signal, not
      an access boundary — Payload's own access control (native
      drafts, `publishedOnlyAccess`, RBAC) is what actually protects
      anything, unchanged by this milestone. `/admin`'s own generated
      Next.js route files (`(payload)/layout.tsx`,
      `admin/[[...segments]]/page.tsx`) are marked
      "DO NOT MODIFY — regenerated by Payload" and don't set their
      own `noindex`; left alone rather than risking a rewrite
      overwriting a hand-added meta tag — the `robots.txt` disallow
      plus the real login-gated auth boundary are the intentional,
      sufficient signal here.

      **Verification**: multilingual `<head>` output inspected
      directly (title/description/canonical/hreflang/og:*/lang+dir/
      JSON-LD) for the homepage in all 3 locales and one real course
      in all 3 locales — no cross-locale fallback found anywhere. All
      9 real course URLs confirmed self-canonical; an invalid slug
      confirmed 404 (unchanged from Milestone H), absent from the
      sitemap, and emits no canonical. Sitemap output inspected
      directly: exactly the expected 12 URLs today, no `/admin`,
      no `/api`, no draft/unpublished record. Robots output inspected
      with indexing both disallowed (the honest default) and allowed
      (simulating Milestone M's opt-in) to prove the gate is real, not
      cosmetic. Full public-lead and RBAC regression re-run
      unchanged: `POST /api/apply` valid → 200, invalid `courseSlug`
      → 400, anonymous `POST /api/applications` → 403, advisor/editor/
      admin Applications boundaries from Milestone J untouched, real
      admin still `role: admin`. No web-payment functionality
      introduced. `PAYLOAD_SECRET`/`DATABASE_URI` confirmed absent
      from every metadata/sitemap/JSON-LD output. All of the above
      became one 75-check automated regression suite run against the
      real dev server before opening the PR (robots.txt in both
      states, sitemap URL count/contents, all 3 homepage locales'
      full `<head>`, all 9 course URLs' self-canonical + JSON-LD, the
      invalid-slug 404's exact head output, the public lead/RBAC
      regression, and the secret-leakage checks) — 0 failures on the
      final run.

      **Two real implementation bugs, found by that same testing and
      fixed before opening the PR** — this section originally
      described the intended design; both are corrected here to match
      what's actually in the code:

      1. The original plan put the homepage's own
         canonical/alternates/robots default directly in
         `[locale]/layout.tsx`, reasoning that the homepage's
         `page.tsx` had no metadata of its own to inherit them.
         Verified live that this was wrong: Next's `not-found.tsx`
         boundary does **not** inherit the failing route's own
         `page.tsx` `generateMetadata` — only its ancestor layouts'.
         An invalid course slug's 404 page therefore emitted `<link
         rel="canonical" href=".../ar">` (the Arabic homepage) plus a
         duplicate `<meta name="robots" content="index, follow">`
         sitting alongside Next's own auto-injected `noindex` for the
         404 response. Fixed by moving everything route-specific
         (canonical, alternates, openGraph, twitter, robots) out of
         the layout entirely and into each real page's own
         `generateMetadata` (`[locale]/page.tsx` for the homepage,
         `courses/[slug]/page.tsx` for course pages) — a 404 boundary
         now has nothing positive to inherit from any ancestor.
      2. While fixing the above, the homepage's `generateMetadata`
         conditionally set `title: siteSettings.defaultSeo.metaTitle
         ? {...} : undefined`. `title: undefined` is not the same as
         omitting the `title` key — the key's mere presence (even
         with an `undefined` value) suppressed the layout's
         `title.default` inheritance entirely, producing a homepage
         with no `<title>` element at all. Fixed by conditionally
         spreading the key in (`...(condition ? { title: {...} } :
         {})`) so it's genuinely absent, not present-but-empty, when
         there's no CMS override.
- [x] **L — Accessibility / responsive / performance pass**. Branch
      `feat/accessibility-performance`. First commit on this branch was
      a business-content integrity audit (see that commit's own full
      message) — required by the milestone brief before the
      accessibility/performance work itself; not part of this section.

      **Audit-first, as instructed**: read through Navigation
      (desktop + mobile drawer), the application form, every motion
      primitive (Reveal/StaggerGroup/StaggerItem/Thread/ThreadContainer),
      every `src/components/ui/` primitive, the icon components, every
      homepage section, fonts.ts, and globals.css before touching
      anything. Most of it was already careful — Thread already
      `aria-hidden` + `pointer-events-none`; FAQSection already native
      `<details>/<summary>` (no clickable-div anti-pattern); icons
      already `aria-hidden`; Reveal/ImageFrame already document their
      own SSR-hydration-mismatch rule (never branch element type or
      baked-in style on `useReducedMotion()`, only `transition.duration`)
      from Milestone E; fonts already `preload:false` + `:lang()`-scoped
      so only the active locale's font is ever fetched. Then verified
      the rest for real rather than trusting the reading — a 90-plus
      check automated harness (headless Edge/CDP: structure/landmark
      checks, image-alt completeness, a refined clickable-div-anti-
      pattern heuristic, horizontal-overflow checks, `lang`/`dir`
      checks, console-error capture, and a WCAG contrast checker using
      real computed styles read back via a canvas pixel round-trip —
      needed because Tailwind v4 emits `oklab()` for some opacity-
      modifier colors in this browser, which neither a naive string
      parser nor `fillStyle` serialization alone could resolve to real
      sRGB bytes) — plus a dedicated keyboard test for the mobile
      drawer specifically.

      **One real, confirmed bug found and fixed**: the mobile
      navigation drawer (`role="dialog"`, `aria-modal="true"`, focus
      moved to its close button on open, Escape closed it, body
      scroll locked — all already correct) had no actual focus trap.
      Verified live: Tab-ing through every one of the drawer's 9
      focusable elements continued straight into the Hero section's
      own "Book a Consultation" button underneath it, fully escaping
      the open modal into content that was only *visually* covered,
      not actually inert. Fixed in `Navigation.tsx` by marking
      `<header>`, `<main>`, and `<footer>` `inert` for the duration the
      drawer is open (removed on close, alongside the existing scroll-
      lock/focus-restore cleanup) — `inert` removes a subtree from the
      tab order and assistive-tech navigation entirely, a stronger and
      simpler guarantee than manually intercepting Tab. Added full
      Tab/Shift+Tab cycling within the dialog on top of that (wraps
      last→first and first→last, matching the WAI-ARIA APG dialog
      pattern) as further polish once the real hazard was closed.
      Re-verified against the actual production build (not dev, to
      rule out dev-only artifacts like Next's dev-overlay portal
      showing up in the tab order) — the drawer's focus now
      demonstrably never leaves it, in either direction.

      **Contrast**: every real rendered text/background combination
      checked (Hero heading, Hero eyebrow, header nav links, FAQ
      question/answer, the Apply section's heading/body/form
      labels/submit button on its dark background, footer text/links)
      passed WCAG AA with real measured ratios — the tightest was FAQ
      answer text at 4.76:1 (needs 4.5), the loosest well over 10:1.
      No palette changes were needed; the existing rosewood/champagne/
      cocoa/ink system already has real, comfortable margin. (Two
      apparent early "failures" during this check were the contrast
      script itself choking on `oklab()` color strings, not real
      issues — fixed in the test tooling before trusting any result
      from it.)

      **Responsive**: **corrected during PR review.** The original
      pass here reported a ~492px floor on headless Edge's
      `--window-size` launch flag and treated that as a stand-in for
      320/360px, reasoning that no breakpoint exists below `sm:`
      (640px) in this design so the two would behave identically.
      That reasoning doesn't hold in general — a narrower viewport can
      still surface intrinsic/min-content overflow, long localized
      words, or flex/grid sizing pressure even within the same media-
      query bucket — and it also turned out to rest on a false
      premise: the ~492px "floor" was never a real platform limit.
      Re-investigated and found the actual cause: this session's
      earlier screenshot scripts constructed the tab-creation URL from
      a CLI argument, and Git Bash's MSYS path-conversion silently
      mangled a leading `/` argument into a bogus Windows path before
      node ever saw it — so the *navigation itself* was failing
      silently, not `Emulation.setDeviceMetricsOverride`. That API
      works correctly once the URL bug is out of the picture.

      Redone with genuine `Emulation.setDeviceMetricsOverride`
      (`width`/`height`, `deviceScaleFactor: 1`, `mobile: false`) on a
      normally-launched browser (no fixed `--window-size`), with
      `window.innerWidth` read back and confirmed equal to the
      requested value before trusting any other measurement — 320 and
      360px both verified genuine (`innerWidth: 320`/`360`,
      `clientWidth: 305`/`345` after the scrollbar). 30 checks across
      the full requested matrix: `/ar`, `/he`, `/en` homepage at both
      320 and 360px, plus a representative course page (`cosmetics-1`)
      in all 3 locales at 320px — `documentElement.scrollWidth <=
      clientWidth` on every one, **and** a stricter per-element check
      (every element's own bounding rect against the viewport edge,
      not just the document root) found zero real offenders. The
      element-level check's first run did flag the application form's
      intentionally off-screen honeypot field (positioned at
      `left: -9999px` on purpose — see `ApplicationForm.tsx`) as a
      false positive; excluded via its own `aria-hidden="true"`
      wrapper once recognized, not a real defect. Visually inspected
      via real screenshots at true 320px (hero, nav, course cards,
      the full application form and consent checkboxes, FAQ, footer,
      and the Arabic course page's breadcrumb/RTL layout end to end)
      — everything wraps and stacks cleanly, nothing clipped.

      The mobile drawer was also re-tested at a genuinely emulated
      320px specifically (the milestone's own real accessibility bug
      was here, so this was worth re-confirming at the actual target
      width, not inferred from a wider one): opens correctly, zero
      overflow while open, first focus lands on the close button,
      `header`/`main`/`footer` all `inert`, Tab-cycling through all 9
      focusable elements never escapes the dialog, Shift+Tab from the
      first element wraps backward and stays inside, Escape closes it,
      and focus returns to the toggle button afterward — all confirmed
      at true 320px, not assumed from the 1440px result.

      No responsive defect was found at true 320/360px — no code
      change was necessary, only this corrected verification record.

      **`enrollmentState: 'unspecified'` public-behavior sanity
      check** (re-confirmed while doing this correction, precisely):
      `CourseHero.tsx` only renders a status-badge `<Text>` as a
      sibling of the "#apply" CTA link when `statusBadge` is non-null,
      and the course page's `statusBadge` computation treats
      `'unspecified'` exactly like `'open'` — null either way. Checked
      structurally (not fuzzy text matching, which would also catch
      the header's own unrelated "Open menu" button): on all 3 real
      courses' pages, the CTA's sibling group contains exactly the one
      link and nothing else — no "Open"/"Enrollment open"/"Enroll
      now" badge, message, or state is ever derived from
      `'unspecified'`. The consultation CTA itself is of course still
      present and available, as intended — that's a lead action, not
      an enrollment-open claim. No schema or component change was
      needed; this already behaved correctly.

      **Reduced motion**: reconfirmed via CDP `prefers-reduced-motion:
      reduce` emulation (the same forced-preference methodology as
      Milestone E) — content renders immediately with no invisible
      states, the mobile drawer remains fully usable, and Motion's own
      library-level console notice ("You have Reduced Motion enabled…")
      fires as expected — a benign, third-party diagnostic message,
      not an application defect, and not something a real visitor
      without reduced motion enabled would ever see.

      **Motion/Thread performance**: re-read Thread.tsx/ThreadContainer.tsx
      confirms `useScroll`/`useTransform` bind the SVG path via Motion's
      `style` prop outside React's render cycle — scrolling was already
      verified to trigger no `setState`/re-render in Milestone E, and
      nothing in this milestone's changes touches that code, so it
      wasn't re-litigated without new evidence.

      **Client bundle** (freshly measured this milestone, not reused
      from Milestone E's stale figure): via CDP `Network.getResponseBody`
      summed per request for a real page load — the only reliable
      method found; this Edge build's `Content-Length` headers and
      `Network.dataReceived` events were both unusable for local
      requests (documented in the measurement script). Homepage:
      ~657 KB decoded/uncompressed JS, ~58 KB CSS, ~882 KB total
      across 16 requests. Course page: ~650 KB JS, near-identical
      profile — confirms the same chunks are shared across routes,
      no route-specific duplication. These are decoded (parsed) sizes,
      not gzip/brotli wire bytes — real transfer is smaller in
      production (compression is Next's default), but this session's
      tooling couldn't independently confirm the compressed figure, so
      only the decoded number is reported. No duplicated dependencies
      or obviously-avoidable bloat found in the chunk breakdown; no
      dependency changes made — no evidence to act on, matching the
      brief's "don't chase arbitrary bundle-size numbers" instruction.

      **Server/client boundaries**: unchanged and reconfirmed —
      homepage and course pages remain Server Components; Payload
      queries, metadata generation, and the application service all
      stay `server-only`; `Navigation`, `ApplicationForm`, and the
      motion primitives remain the only client islands, unchanged in
      scope by this milestone (the drawer fix only added `useRef`/DOM
      calls inside `Navigation`'s existing client boundary, not a new
      one).

      **Images/fonts**: `ImageFrame`'s placeholder already uses
      `role="img"` + real `aria-label` with stable aspect-ratio sizing
      (no CLS) and no stock imagery — confirmed unchanged, no photography
      exists yet. Font config confirmed already minimal/correct
      (`preload:false`, per-locale `:lang()` scoping, `display:swap`) —
      no changes made.

      **Full regression** (SEO/Milestone K, lead intake/Milestone I,
      RBAC/Milestone J — all re-run against this milestone's changes,
      not assumed unaffected): sitemap still exactly 12 URLs, robots
      still disallows by default, canonical/JSON-LD still present on
      homepage and course pages, invalid course slug still 404s with
      no canonical leak and stays out of the sitemap; `POST /api/apply`
      still 200 for a valid submission and 400 for an invalid
      `courseSlug`; anonymous `GET`/`POST /api/applications` still 403;
      no web-payment language anywhere on the public site. No
      production indexing was enabled. `unpublished-v0` privacy state
      and the in-memory rate limiter were both left untouched, as
      instructed — both remain documented Milestone M blockers, along
      with the still-missing real production domain
      (`NEXT_PUBLIC_SERVER_URL`)/indexing opt-in
      (`ALLOW_SEARCH_INDEXING`) from Milestone K.
- [ ] **M — Production build + deployment readiness**. Branch
      `feat/deployment-readiness`. Full detail lives in
      `docs/DEPLOYMENT.md` (topology, audit, blockers) and
      `docs/RUNBOOK.md` (ordered deployment + rollback procedure) —
      not duplicated here. Summary of what this milestone establishes:
      formal committed Payload migrations replacing dev-mode schema
      push, an authoritative environment contract with a
      `verify:production` check, a fail-closed public lead-intake
      launch gate tied to the unresolved privacy-policy blocker, a
      rate-limit store abstraction, production security headers,
      health/readiness endpoints, and CI migration verification.
      **Nothing is launched**: no provider, domain, credentials,
      legal text, or indexing.

      **Migrations proved, twice, from empty.** The baseline (52
      tables) was applied to a disposable `she_academy_migration_test`
      in 418ms and again to a `she_academy_ci_sim` standing in for the
      CI job (413ms); both recorded as batch 1, and in both cases
      Payload then initialized and queried all 6 collections and all 3
      globals with `NODE_ENV=production` — which is what makes it a
      proof rather than a demo, since the Postgres adapter only
      performs its dev-mode schema push when `NODE_ENV !==
      'production'`, so a passing query cannot have been silently
      repaired. Both disposable databases were dropped afterwards and
      the real `she_academy` was re-checked intact each time (1 admin
      user, 3 courses, 5 FAQs, 0 applications). The real dev DB itself
      reports `Ran: No` and always will — it predates migrations and
      was built by schema push, so its tables exist while its ledger is
      empty. That distinction is written down in `docs/DEPLOYMENT.md`
      §4 so nobody "fixes" it by forcing the baseline onto it.

      **Lead-intake gate, both directions.** Disabled: `POST
      /api/apply` returned `{"ok":false,"error":"unavailable"}` 503,
      **0 Applications created**, and the page rendered 0 `<form>` and
      0 `name="phone"` elements — the gate is enforced twice
      server-side, so a crafted request that skips the UI still writes
      nothing, and the visitor-facing copy names no internal reason
      and promises no response time. Enabled (dev): valid submission
      200, invalid course slug 400, anonymous Payload Applications
      GET/POST 403, rate limit exactly 5 per window then 429.

      **Production-mode smoke test** against a real `pnpm build` +
      `pnpm start`: `/` → 307 `/ar`; all 3 locales and all 9 course
      URLs 200; invalid slug 404 **with no canonical**; `/admin` 200;
      `/api/health` ok; `/api/ready` ready — and with the database
      unreachable, health stayed 200 while ready returned 503
      `not_ready` **with no credentials, host, or stack trace in the
      response or the log**. All four security headers present on the
      public site, on `/admin`, and on API error responses. CSP and
      HSTS deliberately absent, reasoning in `next.config.ts`.

      **SEO verified in both indexing states** using the RFC 2606
      reserved `example.com` as the origin, so no real domain was
      invented: indexing off → `robots.txt` `Disallow: /` and every
      page `noindex, nofollow`; indexing on → `Allow: /` with `/admin`
      and `/api` disallowed and pages `index, follow`. Canonicals,
      full hreflang including `x-default` → `/ar`, and all 12 sitemap
      URLs resolved to the configured origin with **zero localhost
      leaks** on any page.

      **RBAC re-confirmed against the production build** with
      disposable accounts (deleted afterwards; the real admin was
      never used or altered). Editor cannot read Applications (403);
      advisor can read but cannot create (403) — the Milestone J
      correction holds — and cannot delete or edit content (403);
      neither non-admin can create or delete users (403). Role
      escalation is genuinely blocked, including the case worth
      checking: self-promotion returns **200** because Payload's
      field-level access strips the field rather than erroring, and
      the role is unchanged afterwards. Promoting someone else is a
      flat 403, and an advisor changing their own password succeeds
      without touching their role.

      **Session cookie fixed.** The review found the admin cookie
      shipping without `Secure` — Payload's `auth: true` default is
      `secure: false`. Now derived from the configured origin (see
      `docs/DEPLOYMENT.md` finding 9) and re-verified carrying
      `Secure=true` under an https origin.

      **Accessibility/responsive spot regression** re-run with genuine
      CDP viewport emulation (`innerWidth` read back and confirmed):
      15 checks across 320/360/1440px × 5 pages × RTL and LTR — zero
      horizontal overflow anywhere, correct `dir`/`lang` per locale,
      exactly one `h1`, zero images without `alt`. The drawer focus
      trap still holds at **true 320px**: focus moves to Close on
      open, Tab cycles the 9 drawer controls and wraps without ever
      escaping, Escape closes it and returns focus to the toggle.
      Reduced motion works and — the failure mode that matters —
      leaves no content stranded at opacity 0: 33 transitioning
      elements normally, 0 under `reduce`, invisible content 0 in
      both. The smallest interactive targets (18px footer links) were
      measured rather than assumed: 18px gaps put 36px between
      centres, which clears WCAG 2.2 SC 2.5.8's spacing exception
      (24px). The other small elements are the visually-hidden skip
      link and the collapsed drawer's contents.

      **Final gate clean**: `generate:types` and `generate:importmap`
      produced no changes, lint clean, `tsc --noEmit` clean, `pnpm
      build` succeeded with every route dynamic, and
      `verify:production` reported **READY FOR DEPLOYMENT: YES /
      READY FOR PUBLIC LAUNCH: NO** — the correct verdict, with the
      privacy policy and the non-durable rate limiter named as the two
      remaining blockers.
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
