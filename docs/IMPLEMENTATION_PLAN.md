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
      - **Certification wording is deliberately *not* a new Payload
        field.** It's fixed, legally-considered policy language
        ("Professional diploma upon successful completion") identical
        across all 3 courses, not per-course editorial content — it
        lives in the i18n dictionaries (like `nav.apply`), not the CMS,
        matching AGENTS.md's existing "recurring interface convention
        vs. per-context editorial content" distinction.

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
