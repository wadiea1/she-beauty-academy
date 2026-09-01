import type { MetadataRoute } from 'next'
import { defaultLocale, locales } from '@/i18n/config'
import { getHomepage, getPublishedCourses } from '@/lib/payload/queries'
import { absoluteUrl } from '@/lib/seo/baseUrl'

// Forces this route to render at request time, never during `next
// build` — matching the same invariant every page in this app
// already relies on (no generateStaticParams anywhere; see
// [locale]/layout.tsx's own comment on why: this is a CMS-driven site
// where a Payload publish must go live without a redeploy). A real,
// verified failure: an earlier `export const revalidate = 60` here
// (the documented way to opt a cached Route Handler out of Next's
// default indefinite caching) still let Next attempt to prerender
// this route DURING the build — which needs a live Postgres
// connection this app's CI build deliberately doesn't have (same
// principle as every page), and broke CI. `force-dynamic` defers
// entirely to request time, so the actual database call only ever
// happens when a real request arrives; freshness is still bounded by
// the 60s unstable_cache TTL already inside getPublishedCourses/
// getHomepage, exactly like every page in this app already relies on
// — this route needs no caching of its own on top of that.
export const dynamic = 'force-dynamic'

function languageAlternates(pathFor: (locale: (typeof locales)[number]) => string) {
  return {
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, absoluteUrl(pathFor(l))])),
      'x-default': absoluteUrl(pathFor(defaultLocale)),
    },
  }
}

/**
 * Built entirely from the existing cached, access-controlled query
 * layer (getPublishedCourses / getHomepage — both already
 * overrideAccess: false, fallbackLocale: false) rather than a new
 * parallel path to the database, so a draft or unpublished course can
 * no more end up here than it can on the public pages themselves.
 *
 * `status` isn't a localized field on Courses (see Courses.ts), so
 * one locale's query already reflects the true published set for
 * every locale — no need to query 3 times. The URL count here is
 * never hardcoded: 3 homepage entries + (published courses × 3
 * locales), computed from whatever's actually published right now.
 * No changeFrequency/priority on any entry — no real basis to assign
 * either.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courses, homepage] = await Promise.all([
    getPublishedCourses(defaultLocale),
    getHomepage(defaultLocale),
  ])

  const homepageEntries: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: absoluteUrl(`/${locale}`),
    lastModified: homepage.updatedAt,
    alternates: languageAlternates((l) => `/${l}`),
  }))

  const courseEntries: MetadataRoute.Sitemap = courses.flatMap((course) =>
    locales.map((locale) => ({
      url: absoluteUrl(`/${locale}/courses/${course.slug}`),
      lastModified: course.updatedAt,
      alternates: languageAlternates((l) => `/${l}/courses/${course.slug}`),
    })),
  )

  return [...homepageEntries, ...courseEntries]
}
