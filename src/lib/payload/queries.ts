import 'server-only'
import { unstable_cache } from 'next/cache'
import { getCachedPayload } from './client'
import type { Locale } from '@/i18n/config'
import type { Media } from '../../../payload-types'

// Every query below is deliberately explicit about two options that
// Payload's Local API defaults the *other* way:
//   - overrideAccess: false — the Local API defaults overrideAccess to
//     true (full access, bypassing every access-control function), which
//     exists for admin/server-internal use. Passing false here means
//     these calls go through the exact same publishedOnlyAccess /
//     published-only-for-anonymous boundary hardened in Milestone F —
//     the frontend never gets a backdoor around it.
//   - fallbackLocale: false — mirrors the project's localization config
//     (`fallback: false`): a locale with no translation must never
//     silently serve Arabic content instead.
// None of these ever pass `draft: true` — the public site must never be
// able to request draft/unpublished content, by construction.
//
// Caching: each exported function is wrapped in unstable_cache, not left
// to the route segment's `revalidate` export alone. Verified this the
// hard way — an earlier version relied on `export const revalidate = 60`
// in layout.tsx/page.tsx with no generateStaticParams, and a real
// production-server test showed it cached nothing at all: a request
// immediately after a Payload publish already reflected the new value,
// with zero delay. Per Next.js's own docs (Caching and Revalidating,
// Previous Model), the route-level `revalidate` config governs `fetch()`
// caching and ISR for routes prerendered via generateStaticParams —
// neither applies here, since Payload's Local API isn't `fetch()` and
// this route has no generateStaticParams. `unstable_cache` is the
// documented mechanism "for non-fetch functions" and is what actually
// produces cached, revalidate-on-an-interval behavior for a database
// query — confirmed by re-running the same production-server test after
// adding it (see docs/IMPLEMENTATION_PLAN.md for the full before/after).

const REVALIDATE_SECONDS = 60

export interface ImageRef {
  src: string | null
  alt: string
}

function mediaToImageRef(media: Media | number | null | undefined, fallbackAlt: string): ImageRef {
  if (media && typeof media === 'object') {
    return { src: media.url ?? null, alt: media.alt || fallbackAlt }
  }
  return { src: null, alt: fallbackAlt }
}

export interface HomepageContent {
  hero: { eyebrow: string; heading: string; lead: string; image: ImageRef }
  manifesto: { eyebrow: string; heading: string; body: string }
  whySHE: { eyebrow: string; heading: string; pillars: { title: string; body: string }[] }
  coursesIntro: { eyebrow: string; heading: string; intro: string }
  insideAcademy: { eyebrow: string; heading: string; body: string; images: ImageRef[] }
  whatYouLeaveWith: { eyebrow: string; heading: string; points: string[] }
  instructor: { eyebrow: string; heading: string; role: string; bio: string[]; image: ImageRef }
  faqIntro: { eyebrow: string; heading: string }
  apply: { eyebrow: string; heading: string; body: string }
}

async function fetchHomepage(locale: Locale): Promise<HomepageContent> {
  const payload = await getCachedPayload()
  const doc = await payload.findGlobal({
    slug: 'homepage',
    locale,
    fallbackLocale: false,
    overrideAccess: false,
    depth: 1,
  })

  if (!doc?.hero?.heading || !doc?.manifesto?.heading || !doc?.instructor?.heading) {
    throw new Error(
      `Homepage content is missing or incomplete for locale "${locale}". Has it been seeded and published in Payload? Run the seed script (see src/seed/).`,
    )
  }

  return {
    hero: {
      eyebrow: doc.hero.eyebrow,
      heading: doc.hero.heading,
      lead: doc.hero.lead,
      image: mediaToImageRef(doc.hero.image, doc.hero.eyebrow),
    },
    manifesto: { eyebrow: doc.manifesto.eyebrow, heading: doc.manifesto.heading, body: doc.manifesto.body },
    whySHE: {
      eyebrow: doc.whySHE.eyebrow,
      heading: doc.whySHE.heading,
      pillars: (doc.whySHE.pillars ?? []).map((p) => ({ title: p.title, body: p.body })),
    },
    coursesIntro: {
      eyebrow: doc.coursesIntro.eyebrow,
      heading: doc.coursesIntro.heading,
      intro: doc.coursesIntro.intro,
    },
    insideAcademy: {
      eyebrow: doc.insideAcademy.eyebrow,
      heading: doc.insideAcademy.heading,
      body: doc.insideAcademy.body,
      images: (doc.insideAcademy.images ?? []).map((row) => mediaToImageRef(row.image, row.placeholderLabel)),
    },
    whatYouLeaveWith: {
      eyebrow: doc.whatYouLeaveWith.eyebrow,
      heading: doc.whatYouLeaveWith.heading,
      points: (doc.whatYouLeaveWith.points ?? []).map((p) => p.text),
    },
    instructor: {
      eyebrow: doc.instructor.eyebrow,
      heading: doc.instructor.heading,
      role: doc.instructor.role,
      bio: (doc.instructor.bio ?? []).map((b) => b.paragraph),
      image: mediaToImageRef(doc.instructor.photo, doc.instructor.photoAlt),
    },
    faqIntro: { eyebrow: doc.faqIntro.eyebrow, heading: doc.faqIntro.heading },
    apply: { eyebrow: doc.apply.eyebrow, heading: doc.apply.heading, body: doc.apply.body },
  }
}

/**
 * Throws when required narrative content is missing for `locale` (e.g. an
 * unseeded database) rather than silently rendering blank sections or
 * falling back to another language — deliberate per AGENTS.md §5 and the
 * Milestone G brief: a controlled failure during development beats a
 * silent wrong-language homepage. In practice this can only happen before
 * the Homepage global has ever been published for this locale: once
 * published, requireHomepageLocalesToPublish already guarantees every
 * required field is filled for all three locales. (unstable_cache does
 * not cache a thrown rejection, so an unseeded state never gets "stuck"
 * cached as broken.)
 */
export const getHomepage = unstable_cache(fetchHomepage, ['payload-homepage'], {
  revalidate: REVALIDATE_SECONDS,
  tags: ['homepage'],
})

export interface CourseContent {
  slug: string
  title: string
  description: string
  ctaLabel: string | null
}

async function fetchPublishedCourses(locale: Locale): Promise<CourseContent[]> {
  const payload = await getCachedPayload()
  const result = await payload.find({
    collection: 'courses',
    locale,
    fallbackLocale: false,
    overrideAccess: false,
    sort: 'order',
    limit: 50,
    depth: 0,
  })
  return result.docs.map((doc) => ({
    slug: doc.slug,
    title: doc.title,
    description: doc.shortDescription,
    ctaLabel: doc.ctaLabel ?? null,
  }))
}

/** Empty is a valid state for a list (unseeded DB, or genuinely zero
 * published courses) — renders the section with no cards rather than
 * failing the whole page, unlike getHomepage's required narrative copy. */
export const getPublishedCourses = unstable_cache(fetchPublishedCourses, ['payload-courses'], {
  revalidate: REVALIDATE_SECONDS,
  tags: ['courses'],
})

export interface FaqContent {
  question: string
  answer: string
}

async function fetchPublishedFAQs(locale: Locale): Promise<FaqContent[]> {
  const payload = await getCachedPayload()
  const result = await payload.find({
    collection: 'faqs',
    locale,
    fallbackLocale: false,
    overrideAccess: false,
    where: { relatedCourse: { exists: false } },
    sort: 'order',
    limit: 50,
    depth: 0,
  })
  return result.docs.map((doc) => ({ question: doc.question, answer: doc.answer }))
}

/** General FAQs only (no relatedCourse) — matches the field's documented
 * intent ("leave blank for a general FAQ shown on the homepage"); course
 * detail pages (Milestone H) would additionally query by relatedCourse. */
export const getPublishedFAQs = unstable_cache(fetchPublishedFAQs, ['payload-faqs'], {
  revalidate: REVALIDATE_SECONDS,
  tags: ['faqs'],
})

export interface NavItem {
  label: string
  path: string
  openInNewTab: boolean
}

async function fetchNavigation(locale: Locale): Promise<NavItem[]> {
  const payload = await getCachedPayload()
  const doc = await payload.findGlobal({
    slug: 'navigation',
    locale,
    fallbackLocale: false,
    overrideAccess: false,
    depth: 0,
  })
  return (doc.items ?? []).map((item) => ({
    label: item.label,
    path: item.path,
    openInNewTab: Boolean(item.openInNewTab),
  }))
}

/** `path` is locale-agnostic by design (e.g. "#courses", not
 * "/ar#courses") — the frontend prepends `/${locale}` itself, so the
 * same stored nav works under any locale prefix. */
export const getNavigation = unstable_cache(fetchNavigation, ['payload-navigation'], {
  revalidate: REVALIDATE_SECONDS,
  tags: ['navigation'],
})

export interface SiteSettingsContent {
  whatsappNumber: string | null
  instagramHandle: string | null
  email: string | null
  phone: string | null
  address: string | null
}

async function fetchSiteSettings(locale: Locale): Promise<SiteSettingsContent> {
  const payload = await getCachedPayload()
  const doc = await payload.findGlobal({
    slug: 'site-settings',
    locale,
    fallbackLocale: false,
    overrideAccess: false,
    depth: 0,
  })
  return {
    whatsappNumber: doc.whatsappNumber ?? null,
    instagramHandle: doc.instagramHandle ?? null,
    email: doc.email ?? null,
    phone: doc.phone ?? null,
    address: doc.address ?? null,
  }
}

/** Every field is optional and none are gated — degrades gracefully by
 * design: consumers omit the corresponding CTA when a value is null,
 * exactly as the old src/config/site.ts always did. */
export const getSiteSettings = unstable_cache(fetchSiteSettings, ['payload-site-settings'], {
  revalidate: REVALIDATE_SECONDS,
  tags: ['site-settings'],
})
